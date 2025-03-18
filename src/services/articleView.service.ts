import { prisma } from '@/lib/prisma';

export class ArticleViewService {
  static async addView(articleId: string, userId?: string, ip?: string) {
    try {
      await prisma.articleView.create({
        data: {
          articleId,
          viewedBy: userId,
          ip,
        },
      });
    } catch (error) {
      console.error('Erreur dans ArticleViewService.addView:', error);
      throw error;
    }
  }

  static async getViewsCount(articleId: string) {
    try {
      return await prisma.articleView.count({
        where: { articleId },
      });
    } catch (error) {
      console.error('Erreur dans ArticleViewService.getViewsCount:', error);
      throw error;
    }
  }

  static async getTotalViewsCount() {
    try {
      return await prisma.articleView.count();
    } catch (error) {
      console.error('Erreur dans ArticleViewService.getTotalViewsCount:', error);
      throw error;
    }
  }

  static async getViewsCountForPeriod(startDate: Date, endDate: Date) {
    try {
      return await prisma.articleView.count({
        where: {
          viewedAt: {
            gte: startDate,
            lte: endDate,
          },
        },
      });
    } catch (error) {
      console.error('Erreur dans ArticleViewService.getViewsCountForPeriod:', error);
      throw error;
    }
  }
}
