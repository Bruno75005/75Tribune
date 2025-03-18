'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Article {
  id: string;
  title: string;
  author: {
    name: string;
  };
  status: string;
}

interface PublishDestination {
  platform: string;
  enabled: boolean;
}

export default function AdminArticlesPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [destinations, setDestinations] = useState<PublishDestination[]>([
    { platform: 'wordpress', enabled: false },
    { platform: 'youtube', enabled: false },
    { platform: 'twitter', enabled: false }
  ]);
  const router = useRouter();

  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    try {
      const response = await fetch('/api/articles');
      const data = await response.json();
      setArticles(data);
    } catch (error) {
      console.error('Error fetching articles:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet article ?')) {
      try {
        const response = await fetch(`/api/articles/${id}`, {
          method: 'DELETE',
        });
        if (response.ok) {
          fetchArticles(); // Refresh the list
        }
      } catch (error) {
        console.error('Error deleting article:', error);
      }
    }
  };

  const handlePublish = async (formData: any) => {
    try {
      const response = await fetch('/api/articles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          destinations: destinations.filter(d => d.enabled),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to publish article');
      }

      const result = await response.json();
      
      // Afficher les résultats de publication pour chaque plateforme
      if (result.results) {
        Object.entries(result.results).forEach(([platform, platformResult]: [string, any]) => {
          if (platformResult.success) {
            // toast.success(`Publication réussie sur ${platform}`);
          } else {
            // toast.error(`Échec de la publication sur ${platform}: ${platformResult.error}`);
          }
        });
      }

      router.push(result.localUrl || '/admin/articles');
    } catch (error) {
      console.error('Error publishing article:', error);
      // toast.error('Erreur lors de la publication');
    }
  };

  if (loading) {
    return <div className="text-center py-4">Chargement...</div>;
  }

  return (
    <div className="container p-4 w-full">
      <div className="px-4 py-6 sm:px-0">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Gestion des Articles</h1>
          <button 
            onClick={() => router.push('/admin/articles/new')}
            className="btn-primary"
          >
            Nouvel Article
          </button>
        </div>
        <div className="card">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Titre
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Auteur
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {articles.map((article) => (
                  <tr key={article.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-900 dark:text-white">
                      {article.title}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-900 dark:text-white">
                      {article.author.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        article.status === 'published' 
                          ? 'bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-100'
                          : 'bg-yellow-100 dark:bg-yellow-800 text-yellow-800 dark:text-yellow-100'
                      }`}>
                        {article.status === 'published' ? 'Publié' : 'Brouillon'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button 
                        onClick={() => router.push(`/admin/articles/${article.id}/edit`)}
                        className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-900 dark:hover:text-indigo-300 mr-4"
                      >
                        Éditer
                      </button>
                      <button 
                        onClick={() => handleDelete(article.id)}
                        className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300"
                      >
                        Supprimer
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
