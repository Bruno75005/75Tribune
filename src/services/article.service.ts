import { PrismaClient, ArticleStatus, AccessLevel } from '@prisma/client';
import { Article, ArticleWithRelations, Platform } from '@/types/article';
import slugify from 'slugify';
import { normalizeImagePath } from '@/lib/image';
import { prisma } from '@/lib/prisma';

const extractFirstImage = (content: string): string | undefined => {
  const imgMatch = content.match(/<img[^>]+src="([^">]+)"/);
  return imgMatch ? imgMatch[1] : undefined;
};

export class ArticleService {
  static async getAll() {
    try {
      const articles = await prisma.article.findMany({
        include: {
          tags: true,
          categories: true,
          author: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: {
          updatedAt: 'desc',
        },
      });

      return articles.map(article => this.enrichArticle(article));
    } catch (error) {
      console.error('Erreur dans ArticleService.getAll:', error);
      throw error;
    }
  }

  static async getById(id: string) {
    try {
      const article = await prisma.article.findUnique({
        where: { id },
        include: {
          tags: true,
          categories: true,
          author: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      if (!article) {
        return null;
      }

      return this.enrichArticle(article);
    } catch (error) {
      console.error('Erreur dans ArticleService.getById:', error);
      throw error;
    }
  }

  static async getBySlug(slug: string) {
    try {
      const article = await prisma.article.findUnique({
        where: { slug },
        include: {
          tags: true,
          categories: true,
          author: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      if (!article) {
        return null;
      }

      return this.enrichArticle(article);
    } catch (error) {
      console.error('Erreur dans ArticleService.getBySlug:', error);
      throw error;
    }
  }

  static async create({
    title,
    content,
    excerpt = '',
    status,
    accessLevel,
    tags = [],
    categories = [],
    authorId,
    publishPlatforms = [],
    featuredImage,
  }: {
    title: string;
    content: string;
    excerpt?: string;
    status: ArticleStatus;
    accessLevel: AccessLevel;
    tags?: string[];
    categories?: string[];
    authorId: string;
    publishPlatforms?: Platform[];
    featuredImage?: string;
  }) {
    try {
      // Generate slug from title
      let slug = slugify(title, { lower: true, strict: true });
      let slugExists = true;
      let slugCounter = 1;

      // Keep checking until we find a unique slug
      while (slugExists) {
        const existingArticle = await prisma.article.findUnique({
          where: { slug },
        });
        if (!existingArticle) {
          slugExists = false;
        } else {
          slug = `${slugify(title, { lower: true, strict: true })}-${slugCounter}`;
          slugCounter++;
        }
      }

      // Gérer les tags
      const tagIds = await Promise.all(
        tags.map(async (tagName) => {
          const tag = await prisma.tag.upsert({
            where: { name: tagName },
            update: {},
            create: {
              name: tagName,
              slug: slugify(tagName, { lower: true, strict: true }),
            },
          });
          return tag.id;
        })
      );

      // Vérification des catégories par ID (et non par nom, comme dans votre version)
      const validCategories = await Promise.all(
        categories.map(async (categoryId) => {
          const category = await prisma.category.findUnique({
            where: { id: categoryId },
          });
          if (!category) {
            throw new Error(`Category not found: ${categoryId}`);
          }
          return category.id;
        })
      );
      const categoryIds = validCategories.filter((id): id is string => id !== null);

      const article = await prisma.article.create({
        data: {
          title,
          slug,
          content,
          excerpt,
          status,
          accessLevel,
          publishPlatforms: publishPlatforms as any,
          featuredImage,
          author: {
            connect: { id: authorId },
          },
          tags: {
            connect: tagIds.map((id) => ({ id })),
          },
          categories: {
            connect: categoryIds.map((id) => ({ id })),
          },
        },
        include: {
          tags: true,
          categories: true,
          author: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      return this.enrichArticle(article);
    } catch (error) {
      console.error('Erreur dans ArticleService.create:', error);
      throw error;
    }
  }

  static async update({
    id,
    title,
    content,
    excerpt,
    status,
    accessLevel,
    tags = [],
    categories = [],
    publishPlatforms = [],
    featuredImage,
  }: {
    id: string;
    title?: string;
    content?: string;
    excerpt?: string;
    status?: ArticleStatus;
    accessLevel?: AccessLevel;
    tags?: string[];
    categories?: string[];
    publishPlatforms?: Platform[];
    featuredImage?: string;
  }) {
    console.log('ArticleService.update - Starting update with data:', {
      id,
      title,
      excerpt,
      status,
      accessLevel,
      tags,
      categories,
      publishPlatforms,
      featuredImage: featuredImage ? '[Image présente]' : '[Pas d\'image]',
    });

    try {
      // 1. Vérifier si l'article existe
      const existingArticle = await prisma.article.findUnique({
        where: { id },
        include: {
          tags: true,
          categories: true,
        },
      });

      if (!existingArticle) {
        throw new Error('Article non trouvé');
      }

      let slug;
      if (title && title !== existingArticle.title) {
        // Generate new slug only if title is being updated
        slug = slugify(title, { lower: true, strict: true });
        let slugExists = true;
        let slugCounter = 1;

        // Keep checking until we find a unique slug
        while (slugExists) {
          const existingArticleWithSlug = await prisma.article.findFirst({
            where: {
              slug,
              NOT: { id },
            },
          });
          if (!existingArticleWithSlug) {
            slugExists = false;
          } else {
            slug = `${slugify(title, { lower: true, strict: true })}-${slugCounter}`;
            slugCounter++;
          }
        }
      }

      // Gérer les tags si fournis
      const tagIds = tags.length > 0
        ? await Promise.all(
            tags.map(async (tagName) => {
              const tag = await prisma.tag.upsert({
                where: { name: tagName },
                update: {},
                create: {
                  name: tagName,
                  slug: slugify(tagName, { lower: true, strict: true }),
                },
              });
              return tag.id;
            })
          )
        : undefined;

      // Vérifier les catégories par ID si elles sont fournies
      const validCategories = categories.length > 0
        ? await Promise.all(
            categories.map(async (categoryId) => {
              const category = await prisma.category.findUnique({
                where: { id: categoryId },
              });
              if (!category) {
                throw new Error(`Category not found: ${categoryId}`);
              }
              return category.id;
            })
          )
        : undefined;
      const validCategoryIds = validCategories?.filter((id): id is string => id !== null);

      const updateData: any = {
        ...(title && { title }),
        ...(slug && { slug }),
        ...(content && { content }),
        ...(excerpt !== undefined && { excerpt }),
        ...(status && { status }),
        ...(accessLevel && { accessLevel }),
        ...(publishPlatforms && { publishPlatforms }),
        ...(featuredImage !== undefined && { featuredImage }),
      };

      if (tagIds) {
        updateData.tags = {
          set: [],
          connect: tagIds.map((id) => ({ id })),
        };
      }

      if (validCategoryIds && validCategoryIds.length > 0) {
        updateData.categories = {
          set: [],
          connect: validCategoryIds.map((id) => ({ id })),
        };
      }

      console.log('ArticleService.update - Final update data:', {
        ...updateData,
        tags: updateData.tags ? '[Tags présents]' : '[Pas de tags]',
        categories: updateData.categories ? '[Categories présentes]' : '[Pas de categories]',
      });

      const article = await prisma.article.update({
        where: { id },
        data: updateData,
        include: {
          tags: true,
          categories: true,
          author: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      const enrichedArticle = this.enrichArticle(article);
      console.log('ArticleService.update - Update successful');

      return enrichedArticle;
    } catch (error) {
      console.error('Erreur dans ArticleService.update:', error);
      throw error;
    }
  }

  static async list({
    status,
    accessLevel,
    authorId,
    where = {},
    page = 1,
    limit = 10,
  }: {
    status?: ArticleStatus;
    accessLevel?: AccessLevel;
    authorId?: string;
    where?: any;
    page?: number;
    limit?: number;
  }) {
    try {
      const skip = (page - 1) * limit;

      console.log('ArticleService.list - Input parameters:', {
        status,
        accessLevel,
        authorId,
        where,
        page,
        limit,
      });

      // Fusionner les conditions de base avec les conditions personnalisées
      const whereConditions = {
        ...where,
        ...(status && { status }),
        ...(accessLevel && { accessLevel }),
        ...(authorId && { authorId }),
      };

      console.log('ArticleService.list - Final where conditions:', JSON.stringify(whereConditions, null, 2));

      // Récupérer le total d'articles
      const total = await prisma.article.count({ where: whereConditions });
      console.log('ArticleService.list - Total articles found:', total);

      // Récupérer les articles avec pagination
      const articles = await prisma.article.findMany({
        where: whereConditions,
        include: {
          tags: true,
          categories: true,
          author: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: {
          updatedAt: 'desc',
        },
        skip,
        take: limit,
      });

      console.log('ArticleService.list - Articles retrieved:', articles.length);

      // Enrichir les articles
      const enrichedArticles = articles.map(article => this.enrichArticle(article));

      return {
        articles: enrichedArticles,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      console.error('Erreur dans ArticleService.list:', error);
      throw error;
    }
  }

  static async delete(id: string) {
    try {
      await prisma.article.delete({
        where: { id },
      });
    } catch (error) {
      console.error('Erreur dans ArticleService.delete:', error);
      throw error;
    }
  }

  private static enrichArticle(article: any): ArticleWithRelations {
    // Calculer la date de publication
    const publishedAt = article.status === 'PUBLISHED' ? article.updatedAt : null;

    // Normaliser le chemin de l'image mise en avant
    const featuredImage = article.featuredImage ? normalizeImagePath(article.featuredImage) : undefined;

    // Extraire l'image principale si elle n'est pas définie
    if (!featuredImage && article.content) {
      const extractedImage = extractFirstImage(article.content);
      if (extractedImage) {
        article.featuredImage = extractedImage;
      }
    }

    return {
      ...article,
      publishedAt,
      featuredImage,
    };
  }
}