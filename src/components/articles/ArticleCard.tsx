import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { normalizeImagePath } from '@/lib/image';
import { AccessLevel, Tag } from '@prisma/client';
import { Badge } from '@/components/ui/badge';
import { Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

interface ArticleCardProps {
  article: {
    slug: string;
    title: string;
    excerpt: string;
    featuredImage: string | null;
    publishedAt: Date;
    updatedAt: Date;
    author?: {
      name: string;
    };
    tags?: Tag[];
    accessLevel: AccessLevel;
  };
}

export default function ArticleCard({ article }: ArticleCardProps) {
  return (
    <motion.article
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="flex flex-col bg-darkCard rounded-lg overflow-hidden border-1 border-darkBorder shadow-sm hover:shadow-md transition-shadow duration-300"
    >
      <Link href={`/articles/${article.slug}`} className="group">
        {article.featuredImage && (
          <div className="relative aspect-video">
            <Image
              src={normalizeImagePath(article.featuredImage)}
              alt={article.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
            {article.accessLevel === AccessLevel.PRO && (
              <div className="absolute top-3 right-3 z-10">
                <Badge
                  variant="premium"
                  className="flex items-center gap-1 bg-primary text-darkText border-1 border-darkBorder"
                >
                  <Sparkles className="h-3 w-3" />
                  Premium
                </Badge>
              </div>
            )}
          </div>
        )}

        <div className="p-5 space-y-3">
          <h2 className="text-xl font-bold text-darkText group-hover:text-primary transition-colors line-clamp-2">
            {article.title}
          </h2>
          <p className="text-sm text-muted:foreground line-clamp-3">
            {article.excerpt}
          </p>

          <div className="flex items-center justify-between text-xs text-muted:foreground">
            <div className="flex items-center space-x-2">
              <time dateTime={article.publishedAt?.toString() || article.updatedAt?.toString()}>
                {format(
                  new Date(article.publishedAt || article.updatedAt),
                  'dd MMMM yyyy',
                  { locale: fr }
                )}
              </time>
              {article.author && (
                <>
                  <span className="text-muted:foreground">•</span>
                  <span className="font-medium">{article.author.name}</span>
                </>
              )}
            </div>
          </div>

          {article.tags && article.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {article.tags.map((tag) => (
                <Badge
                  key={tag.id}
                  variant="outline"
                  className="text-xs text-muted:foreground border-1 border-darkBorder bg-transparent hover:bg-darkCard/50"
                >
                  {tag.name}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </Link>
    </motion.article>
  );
}