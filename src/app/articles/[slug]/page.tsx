'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArticleService } from '@/services/article.service';
import { notFound, redirect } from 'next/navigation';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import ArticleContent from '@/components/ArticleContent';
import CommentSection from '@/components/comments/CommentSection';
import { AccessLevel, Tag, SubscriptionType } from '@prisma/client';
import { normalizeImagePath } from '@/lib/image';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Shield, Lock } from 'lucide-react';
import PremiumArticleView from '@/components/articles/PremiumArticleView';
import Breadcrumb from '@/components/Breadcrumb';

interface ArticlePageProps {
  params: {
    slug: string;
  };
}

export default function ArticlePage({ params }: ArticlePageProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [article, setArticle] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const canAccessPremiumContent = session?.user?.subscriptionType === SubscriptionType.PREMIUM || 
                                session?.user?.role === 'ADMIN';

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        const response = await fetch(`/api/articles/by-slug/${params.slug}`);
        if (!response.ok) {
          throw new Error('Article non trouvé');
        }
        const data = await response.json();
        setArticle(data);
      } catch (error) {
        console.error('Erreur lors de la récupération de l\'article:', error);
        setError('Article non trouvé');
      } finally {
        setLoading(false);
      }
    };

    fetchArticle();
  }, [params.slug]);

  useEffect(() => {
    if (article?.id) {
      const recordView = async () => {
        try {
          await fetch('/api/articles/views', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ articleId: article.id }),
          });
        } catch (error) {
          console.error('Erreur lors de l\'enregistrement de la vue:', error);
        }
      };

      recordView();
    }
  }, [article?.id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-nyt-white dark:bg-nyt-black">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-nyt-black dark:border-nyt-white"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 bg-nyt-white dark:bg-nyt-black">
        <div className="max-w-2xl mx-auto text-center">
          <div className="mb-4">
            <Shield className="mx-auto h-16 w-16 text-red-500" />
          </div>
          <h1 className="text-2xl font-headline mb-4 text-nyt-black dark:text-nyt-white">{error}</h1>
        </div>
      </div>
    );
  }

  if (!article) {
    return notFound();
  }

  if (article.accessLevel === AccessLevel.PRO && !canAccessPremiumContent) {
    return <PremiumArticleView article={article} session={session} />;
  }

  return (
    <div className="container mx-auto px-4 py-8 bg-nyt-white dark:bg-nyt-black">
      {article.categories && article.categories.length > 0 && (
        <Breadcrumb
          items={[
            { label: 'Catégories', href: '/categories' },
            ...article.categories.map((category: any) => ({
              label: category.name,
              href: `/categories/${category.slug}`
            })),
            { label: article.title }
          ]}
        />
      )}

      <article className="max-w-4xl mx-auto">
        {article.featuredImage && (
          <div className="relative aspect-video mb-8 rounded-lg overflow-hidden">
            <Image
              src={normalizeImagePath(article.featuredImage)}
              alt={article.title}
              fill
              className="object-cover"
              priority
            />
            {article.accessLevel === AccessLevel.PRO && (
              <div className="absolute top-4 right-4">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gradient-to-r from-nyt-blue to-nyt-blue/80 text-nyt-white">
                  Premium
                </span>
              </div>
            )}
          </div>
        )}

        <div className="mb-8">
          <h1 className="text-4xl font-headline mb-4 text-nyt-black dark:text-nyt-white">{article.title}</h1>
          <div className="flex items-center text-sm text-nyt-gray-500 dark:text-nyt-gray-200 mb-4 font-body">
            <time dateTime={article.publishedAt || article.updatedAt}>
              {format(new Date(article.publishedAt || article.updatedAt), 'dd MMMM yyyy', { locale: fr })}
            </time>
            <span className="mx-2">•</span>
            <span>{article.author?.name}</span>
          </div>
          <p className="text-xl text-nyt-gray-600 dark:text-nyt-gray-300 font-body">{article.excerpt}</p>
        </div>

        <div className="prose-nyt dark:prose-invert max-w-none font-body text-nyt-black dark:text-nyt-white">
          <ArticleContent content={article.content} />
        </div>

        {article.tags && article.tags.length > 0 && (
          <div className="mt-8 flex flex-wrap gap-2">
            {article.tags.map((tag: Tag) => (
              <span
                key={tag.id}
                className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-nyt-gray-100 dark:bg-nyt-gray-800 text-nyt-black dark:text-nyt-white font-body"
              >
                {tag.name}
              </span>
            ))}
          </div>
        )}

        {article.categories && article.categories.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {article.categories.map((category: any) => (
              <span
                key={category.id}
                className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-nyt-blue text-nyt-white font-body"
              >
                {category.name}
              </span>
            ))}
          </div>
        )}

        <CommentSection articleId={article.id} />
      </article>
    </div>
  );
}