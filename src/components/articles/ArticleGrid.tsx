'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Clock, Tag } from 'lucide-react';
import { Article, Category, Tag as PrismaTag, User } from '@prisma/client';
import { normalizeImagePath } from '@/lib/image';

interface ArticleWithRelations extends Article {
  author: User | null;
  category: Category | null;
  tags: PrismaTag[];
  readingTime?: number;
  publishedAt?: Date | null;
}

interface ArticleGridProps {
  articles: ArticleWithRelations[];
}

export default function ArticleGrid({ articles }: ArticleGridProps) {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {articles.map((article) => (
        <article 
          key={article.id}
          className="bg-lightCard dark:bg-darkCard rounded-lg overflow-hidden neumorphic-light dark:neumorphic hover:shadow-md transition-shadow"
        >
          {/* Image de couverture */}
          <div className="relative aspect-video bg-mutedLight:DEFAULT dark:bg-muted:DEFAULT">
            {article.featuredImage && (
              <Image
                src={normalizeImagePath(article.featuredImage)}
                alt={article.title}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className="object-cover"
                priority={false}
              />
            )}
          </div>
          
          <div className="p-6">
            {/* Tags */}
            {article.tags && article.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {article.tags.map((tag) => (
                  <span 
                    key={tag.id}
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary"
                  >
                    <Tag className="w-3 h-3 mr-1" />
                    {tag.name}
                  </span>
                ))}
              </div>
            )}

            {/* Titre */}
            <h2 className="text-xl font-semibold mb-2 text-lightText dark:text-darkText">
              <Link href={`/articles/${article.slug}`} className="hover:text-primary transition-colors">
                {article.title}
              </Link>
            </h2>

            {/* Extrait */}
            <p className="text-mutedLight:foreground dark:text-muted:foreground mb-4">
              {article.excerpt}
            </p>

            {/* Métadonnées */}
            <div className="flex items-center text-sm text-mutedLight:foreground dark:text-muted:foreground">
              <Clock className="w-4 h-4 mr-1" />
              <time dateTime={new Date(article.createdAt).toISOString()}>
                {new Date(article.createdAt).toLocaleDateString()}
              </time>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}