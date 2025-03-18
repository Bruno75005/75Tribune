'use client';

import { useState, useEffect } from 'react';
import type { Article } from '@/types/article';

interface UseArticlesOptions {
  page?: number;
  limit?: number;
  status?: string;
  accessLevel?: string;
}

interface ArticlesResponse {
  articles: Article[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export function useArticles(options: UseArticlesOptions = {}) {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const fetchArticles = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams();
      if (options.page) queryParams.set('page', options.page.toString());
      if (options.limit) queryParams.set('limit', options.limit.toString());
      if (options.status) queryParams.set('status', options.status);

      // On ne filtre plus par accessLevel ici car c'est géré dans la page de détail
      console.log('Fetching articles with params:', queryParams.toString());

      const response = await fetch(`/api/articles?${queryParams.toString()}`);
      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des articles');
      }

      const data: ArticlesResponse = await response.json();
      console.log('Received articles:', data.articles.length);
      setArticles(data.articles || []);
      setTotal(data.total || 0);
      setTotalPages(data.totalPages || 0);
    } catch (err) {
      console.error('Erreur:', err);
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArticles();
  }, [options.page, options.limit, options.status]);

  const deleteArticle = async (id: string) => {
    try {
      const response = await fetch(`/api/articles/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la suppression de l\'article');
      }

      // Rafraîchir la liste après la suppression
      await fetchArticles();
      return true;
    } catch (err) {
      console.error('Erreur lors de la suppression:', err);
      throw err;
    }
  };

  return {
    articles,
    loading,
    error,
    total,
    totalPages,
    deleteArticle,
    refetch: fetchArticles
  };
}
