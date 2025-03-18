import { ArticleStatus, AccessLevel } from '@prisma/client';

export type Platform = 'wordpress' | 'youtube' | 'twitter';

export interface Article {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  slug: string;
  status: ArticleStatus;
  accessLevel: AccessLevel;
  featuredImage?: string;
  authorId: string;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
  publishPlatforms: Platform[];
  tags: {
    id: string;
    name: string;
    slug: string;
  }[];
  categories: {
    id: string;
    name: string;
    slug: string;
  }[];
}

export interface ArticleWithRelations extends Article {
  author?: {
    id: string;
    name: string;
    email: string;
  };
}

export interface CreateArticleDTO {
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
}

export interface UpdateArticleDTO {
  id: string;
  title: string;
  content: string;
  excerpt?: string;
  status: ArticleStatus;
  accessLevel: AccessLevel;
  tags: string[];
  categories: string[];
  publishPlatforms: Platform[];
  featuredImage?: string;
}

export type { ArticleStatus, AccessLevel };
