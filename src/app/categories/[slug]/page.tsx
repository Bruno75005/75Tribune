'use client';

import React, { useEffect, useState } from 'react';
import { Search } from 'lucide-react';
import Breadcrumb from '@/components/Breadcrumb';
import { Category } from '@prisma/client';
import ArticleCard from '@/components/articles/ArticleCard';

interface CategoryPageProps {
  params: {
    slug: string;
  };
}

export default function CategoryPage({ params }: CategoryPageProps) {
  const [category, setCategory] = useState<Category | null>(null);
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchCategoryAndArticles = async () => {
      try {
        // Fetch category
        const categoryResponse = await fetch(`/api/categories/by-slug/${params.slug}`);
        if (!categoryResponse.ok) {
          throw new Error('Catégorie non trouvée');
        }
        const categoryData = await categoryResponse.json();
        setCategory(categoryData);

        // Fetch articles for this category
        const articlesResponse = await fetch(`/api/articles/by-category/${categoryData.id}`);
        if (!articlesResponse.ok) {
          throw new Error('Erreur lors de la récupération des articles');
        }
        const articlesData = await articlesResponse.json();
        setArticles(articlesData);
      } catch (error) {
        console.error('Erreur:', error);
        setError(error instanceof Error ? error.message : 'Une erreur est survenue');
      } finally {
        setLoading(false);
      }
    };

    fetchCategoryAndArticles();
  }, [params.slug]);

  // Filtrer les articles en fonction de la recherche
  const filteredArticles = articles.filter(article =>
    article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    article.excerpt.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="container p-4 w-full">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
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
      <div className="px-4 sm:px-0 space-y-6">
        {category && (
          <Breadcrumb
            items={[
              { label: 'Catégories', href: '/categories' },
              { label: category.name }
            ]}
          />
        )}

        <div className="flex justify-between items-center flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              {category?.name}
            </h1>
            {category?.description && (
              <p className="text-gray-600 dark:text-gray-300 text-lg">
                {category.description}
              </p>
            )}
          </div>
          
          <div className="w-full md:w-72">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" />
              <input
                type="text"
                placeholder="Rechercher un article..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700 dark:text-white"
              />
            </div>
          </div>
        </div>

        {filteredArticles.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Aucun article trouvé dans cette catégorie.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredArticles.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
