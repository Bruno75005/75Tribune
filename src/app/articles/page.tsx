'use client';

import { useState } from 'react';
import { Search } from 'lucide-react';
import { useArticles } from '@/hooks/useArticles';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import Link from 'next/link';
import Image from 'next/image';
import { normalizeImagePath } from '@/lib/image';

export default function ArticlesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const { articles, loading, error } = useArticles({ status: 'PUBLISHED' });

  // Filtrer la liste selon la recherche
  const filteredArticles = articles.filter(article =>
    article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    article.excerpt.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    // Indicateur de chargement (squelette)
    return (
      <div className="container p-4 w-full">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-nyt-gray-200 rounded w-1/4"></div>
          <div className="h-4 bg-nyt-gray-200 rounded w-1/2"></div>
          <div className="h-4 bg-nyt-gray-200 rounded w-3/4"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container p-4 w-full text-red-500">
        Erreur: {error}
      </div>
    );
  }

  return (
    <div className="container p-4 w-full pt-20">
      {/* En-tête avec titre de page et champ de recherche */}
      <div className="px-4 sm:px-0 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-nyt-black dark:text-nyt-white">Articles</h1>
          <div className="w-72">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-nyt-gray-500 dark:text-nyt-gray-300" />
              <input
                type="text"
                placeholder="Rechercher un article..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg dark:bg-nyt-black dark:border-nyt-gray-500 dark:text-nyt-white"
              />
            </div>
          </div>
        </div>

        {/* Grille des articles filtrés */}
        {filteredArticles.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredArticles.map((article) => (
              <Link 
                href={`/articles/${article.slug}`}
                key={article.id}
                className="group relative bg-nyt-white dark:bg-nyt-black rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden"
              >
                {article.featuredImage && (
                  <div className="relative aspect-video">
                    <Image
                      src={normalizeImagePath(article.featuredImage)}
                      alt={article.title}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="object-cover"
                    />
                    {/* Indicateur "Premium" pour les articles PRO */}
                    {article.accessLevel === 'PRO' && (
                      <div className="absolute top-2 right-2">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gradient-to-r from-nyt-blue to-nyt-blue/80 text-nyt-white">
                          Premium
                        </span>
                      </div>
                    )}
                  </div>
                )}
                <div className="p-4">
                  <h2 className="text-xl font-headline mb-2 text-nyt-black dark:text-nyt-white group-hover:text-nyt-blue">
                    {article.title}
                  </h2>
                  <p className="text-nyt-gray-500 dark:text-nyt-gray-200 text-sm mb-4 font-body">
                    {article.excerpt}
                  </p>
                  <div className="flex items-center text-sm text-nyt-gray-500 dark:text-nyt-gray-300 space-x-4">
                    <time dateTime={article.publishedAt || article.updatedAt}>
                      {format(new Date(article.publishedAt || article.updatedAt), 'dd MMMM yyyy', { locale: fr })}
                    </time>
                    <span>•</span>
                    <span>5 min de lecture</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-nyt-gray-500 dark:text-nyt-gray-300">
              Aucun article ne correspond à votre recherche.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
