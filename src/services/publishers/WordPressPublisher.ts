import { Publisher, PublishContent, PublishResult } from './types';
import fs from 'fs';
import path from 'path';
import { PrismaClient } from '@prisma/client';

export class WordPressPublisher implements Publisher {
  private apiUrl: string;
  private apiUser: string;
  private apiKey: string;
  private prisma: PrismaClient;

  constructor() {
    this.apiUrl = process.env.WORDPRESS_API_URL || '';
    this.apiUser = process.env.WORDPRESS_API_USERNAME || '';
    this.apiKey = process.env.WORDPRESS_API_PASSWORD || '';
    this.prisma = new PrismaClient();
  }

  /** Vérifie si les identifiants WordPress sont correctement configurés */
  public isEnabled(): boolean {
    return !!(this.apiUrl && this.apiUser && this.apiKey);
  }

  async publish(content: PublishContent): Promise<PublishResult> {
    if (!this.isEnabled()) {
      return { success: false, error: 'WordPress credentials not configured' };
    }

    try {
      // Log pour vérifier les données reçues
      console.log('Données reçues dans publish :', content);

      // Convertir les IDs de catégories en noms de catégories
      const categoryNames = await this.getCategoryNames(content.categories || []);
      console.log('Noms de catégories résolus :', categoryNames);
      
      const categoryIds = await this.resolveCategoryIds(categoryNames);
      let tagIds: number[] = [];
      
      if (content.tags && content.tags.length > 0) {
        tagIds = await this.resolveTagIds(content.tags);
      }

      let featuredMediaId: number | undefined;
      if (typeof content.featuredImage === 'number') {
        featuredMediaId = content.featuredImage;
      } else if (typeof content.featuredImage === 'string' && content.featuredImage.trim() !== '') {
        featuredMediaId = await this.uploadMediaToWordPress(content.featuredImage);
      }

      const postData: Record<string, any> = {
        title: content.title,
        content: content.content,
        excerpt: content.excerpt || '',
        status: 'publish',
        categories: categoryIds,
        tags: tagIds,
        slug: content.slug,
      };

      if (featuredMediaId !== undefined) {
        postData.featured_media = featuredMediaId;
      }

      const response = await fetch(`${this.apiUrl}/wp-json/wp/v2/posts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Basic ' + Buffer.from(`${this.apiUser}:${this.apiKey}`).toString('base64'),
        },
        body: JSON.stringify(postData),
      });

      const responseText = await response.text();
      console.log('Réponse API WordPress :', responseText);

      if (!response.ok) {
        throw new Error(`WordPress API error: ${response.status} ${response.statusText} – ${responseText}`);
      }

      const data = JSON.parse(responseText);
      return { success: true, url: data.link, platformId: data.id.toString() };
    } catch (error) {
      console.error('Erreur lors de la publication sur WordPress :', error);
      return { success: false, error: error instanceof Error ? error.message : String(error) };
    }
  }

  /** Récupère les noms des catégories à partir de leurs IDs */
  private async getCategoryNames(categoryIds: string[]): Promise<string[]> {
    try {
      const categories = await this.prisma.category.findMany({
        where: {
          id: { in: categoryIds }
        },
        select: {
          name: true
        }
      });
      
      return categories.map(cat => cat.name);
    } catch (error) {
      console.error('Erreur lors de la récupération des noms de catégories :', error);
      throw error;
    }
  }

  /** Résout un tableau de noms de catégories en leurs IDs WordPress */
  private async resolveCategoryIds(categoryNames: string[]): Promise<number[]> {
    const ids: number[] = [];
    for (const catName of categoryNames) {
      const id = await this.getOrCreateCategory(catName);
      ids.push(id);
    }
    return ids;
  }

  /** Récupère ou crée une catégorie par son nom */
  private async getOrCreateCategory(catName: string): Promise<number> {
    const slug = this.slugify(catName);
    let res = await fetch(`${this.apiUrl}/wp-json/wp/v2/categories?slug=${slug}`, {
      headers: { 'Authorization': 'Basic ' + Buffer.from(`${this.apiUser}:${this.apiKey}`).toString('base64') },
    });

    if (!res.ok) {
      throw new Error(`Erreur lors de la vérification de la catégorie '${catName}' (${res.statusText})`);
    }

    const list = await res.json();
    if (Array.isArray(list) && list.length > 0) {
      return list[0].id;
    }

    res = await fetch(`${this.apiUrl}/wp-json/wp/v2/categories`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Basic ' + Buffer.from(`${this.apiUser}:${this.apiKey}`).toString('base64'),
      },
      body: JSON.stringify({ name: catName, slug: slug }),
    });

    if (!res.ok) {
      throw new Error(`Erreur lors de la création de la catégorie '${catName}' (${res.statusText})`);
    }

    const newCat = await res.json();
    return newCat.name;
  }

  /** Résout un tableau de noms de tags en leurs IDs WordPress */
  private async resolveTagIds(tagNames: string[]): Promise<number[]> {
    const ids: number[] = [];
    
    // Traiter correctement les tags qui peuvent être des chaînes ou un tableau
    const tagsArray: string[] = [];
    
    for (const tagItem of tagNames) {
      if (typeof tagItem === 'string') {
        // Si le tag contient des virgules, le diviser
        if (tagItem.includes(',')) {
          const splitTags = tagItem.split(',').map((t: string) => t.trim()).filter(Boolean);
          tagsArray.push(...splitTags);
        } else {
          tagsArray.push(tagItem.trim());
        }
      }
    }
    
    for (const tagName of tagsArray) {
      if (!tagName) continue;
      const slug = this.slugify(tagName);
      let res = await fetch(`${this.apiUrl}/wp-json/wp/v2/tags?slug=${slug}`, {
        headers: { 'Authorization': 'Basic ' + Buffer.from(`${this.apiUser}:${this.apiKey}`).toString('base64') },
      });

      if (!res.ok) {
        throw new Error(`Erreur lors de la vérification du tag '${tagName}' (${res.statusText})`);
      }

      const existingTags = await res.json();
      if (Array.isArray(existingTags) && existingTags.length > 0) {
        ids.push(existingTags[0].id);
      } else {
        res = await fetch(`${this.apiUrl}/wp-json/wp/v2/tags`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Basic ' + Buffer.from(`${this.apiUser}:${this.apiKey}`).toString('base64'),
          },
          body: JSON.stringify({ name: tagName, slug: slug }),
        });

        if (!res.ok) {
          throw new Error(`Erreur lors de la création du tag '${tagName}' (${res.statusText})`);
        }

        const createdTag = await res.json();
        ids.push(createdTag.id);
      }
    }
    return ids;
  }

  /** Télécharge une image vers WordPress et retourne son ID */
  private async uploadMediaToWordPress(imagePath: string): Promise<number> {
    const fullImagePath = path.resolve(process.cwd(), 'public', imagePath.startsWith('/') ? imagePath.substring(1) : imagePath);

    if (!fs.existsSync(fullImagePath)) {
      throw new Error(`Le fichier image est introuvable : ${fullImagePath}`);
    }

    const mediaUrl = `${this.apiUrl}/wp-json/wp/v2/media`;
    const fileName = path.basename(fullImagePath);
    const fileData = fs.readFileSync(fullImagePath);

    const res = await fetch(mediaUrl, {
      method: 'POST',
      headers: {
        'Authorization': 'Basic ' + Buffer.from(`${this.apiUser}:${this.apiKey}`).toString('base64'),
        'Content-Disposition': `attachment; filename="${fileName}"`,
        'Content-Type': this.getMimeType(fileName),
      },
      body: fileData,
    });

    if (!res.ok) {
      throw new Error(`Erreur lors de l'upload de l'image vers WordPress (${res.statusText})`);
    }

    const uploadedMedia = await res.json();
    return uploadedMedia.id;
  }

  /** Détecte le type MIME selon l'extension du fichier */
  private getMimeType(fileName: string): string {
    const ext = path.extname(fileName).toLowerCase();
    switch (ext) {
      case '.jpeg':
      case '.jpg':
        return 'image/jpeg';
      case '.png':
        return 'image/png';
      case '.gif':
        return 'image/gif';
      case '.webp':
        return 'image/webp';
      default:
        throw new Error(`Format d'image non pris en charge : ${ext}`);
    }
  }

  /** Génère un slug à partir d'un nom */
  private slugify(str: string): string {
    return str
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-_]/g, '');
  }
}
