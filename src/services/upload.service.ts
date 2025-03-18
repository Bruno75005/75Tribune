import fs from 'fs';
import path from 'path';
import { randomUUID } from 'crypto';

export class UploadService {
  private static UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads');
  private static ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  private static MAX_SIZE = 5 * 1024 * 1024; // 5MB

  static async initialize() {
    // Créer le dossier uploads s'il n'existe pas
    if (!fs.existsSync(this.UPLOAD_DIR)) {
      fs.mkdirSync(this.UPLOAD_DIR, { recursive: true });
    }
  }

  static async saveImage(file: File): Promise<string> {
    await this.initialize();

    // Vérifier le type de fichier
    if (!this.ALLOWED_TYPES.includes(file.type)) {
      throw new Error('Type de fichier non autorisé');
    }

    // Vérifier la taille du fichier
    if (file.size > this.MAX_SIZE) {
      throw new Error('Fichier trop volumineux (max 5MB)');
    }

    // Générer un nom de fichier unique
    const extension = path.extname(file.name);
    const fileName = `${randomUUID()}${extension}`;
    const filePath = path.join(this.UPLOAD_DIR, fileName);

    // Lire le buffer du fichier
    const buffer = Buffer.from(await file.arrayBuffer());

    // Sauvegarder le fichier
    fs.writeFileSync(filePath, buffer);

    // Retourner le chemin relatif pour l'accès via URL
    return `/uploads/${fileName}`;
  }

  static async deleteImage(fileName: string): Promise<void> {
    const filePath = path.join(this.UPLOAD_DIR, path.basename(fileName));
    
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }

  static getImagePath(fileName: string): string {
    return path.join(this.UPLOAD_DIR, path.basename(fileName));
  }
}
