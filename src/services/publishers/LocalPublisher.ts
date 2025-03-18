import { Publisher, PublishContent, PublishResult } from './types';
import { prisma } from '@/lib/prisma';

export class LocalPublisher implements Publisher {
  async publish(content: PublishContent): Promise<PublishResult> {
    try {
      // Logique de publication locale
      return {
        success: true,
        url: `/articles/${content.slug}`,
        platformId: 'local'
      };
    } catch (error) {
      console.error('Erreur publication locale:', error);
      return {
        success: false,
        error: 'Erreur lors de la publication locale'
      };
    }
  }

  isEnabled(): boolean {
    return true;
  }
}
