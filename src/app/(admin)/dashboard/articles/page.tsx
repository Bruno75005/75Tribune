'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  PlusCircle, 
  Search, 
  Filter,
  Eye,
  Lock,
  Pencil,
  Trash2,
  FileText,
  Globe,
  Youtube,
  Twitter
} from 'lucide-react';
import type { ArticleStatus, AccessLevel, Platform } from '@/types/article';
import { useArticles } from '@/hooks/useArticles';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { normalizeImagePath } from '@/lib/image';

const statusColors: Record<ArticleStatus, string> = {
  DRAFT: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
  PUBLISHED: 'bg-green-100 text-green-800 dark:bg-green-700 dark:text-green-300',
  ARCHIVED: 'bg-red-100 text-red-800 dark:bg-red-700 dark:text-red-300'
};

const accessLevelColors: Record<AccessLevel, string> = {
  FREE: 'bg-blue-100 text-blue-800 dark:bg-blue-700 dark:text-blue-300',
  BASIC: 'bg-purple-100 text-purple-800 dark:bg-purple-700 dark:text-purple-300',
  PRO: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-700 dark:text-yellow-300'
};

interface PlatformInfo {
  name: string;
  icon: any;
  color: string;
}

const platforms: Record<Platform, PlatformInfo> = {
  wordpress: { name: 'WordPress', icon: Globe, color: 'text-blue-500' },
  youtube: { name: 'YouTube', icon: Youtube, color: 'text-red-500' },
  twitter: { name: 'Twitter', icon: Twitter, color: 'text-sky-500' }
};

export default function ArticlesPage() {
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [selectedStatus, setSelectedStatus] = useState<ArticleStatus | undefined>();
  const [selectedAccessLevel, setSelectedAccessLevel] = useState<AccessLevel | undefined>();
  const [searchTerm, setSearchTerm] = useState('');

  const { articles, loading, error, total, totalPages, deleteArticle } = useArticles({
    page: currentPage,
    limit: itemsPerPage,
    status: selectedStatus,
    accessLevel: selectedAccessLevel,
  });

  const handleDelete = async (id: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet article ?')) {
      try {
        await deleteArticle(id);
        toast.success('Article supprimé avec succès');
      } catch (error) {
        toast.error('Erreur lors de la suppression de l\'article');
      }
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleStatusFilter = (status: ArticleStatus | undefined) => {
    setSelectedStatus(status);
    setCurrentPage(1); // Réinitialiser à la première page lors du filtrage
  };

  const handleAccessLevelFilter = (level: AccessLevel | undefined) => {
    setSelectedAccessLevel(level);
    setCurrentPage(1); // Réinitialiser à la première page lors du filtrage
  };

  const filteredArticles = articles.filter(article => {
    const matchesSearch = article.title.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  if (error) {
    return (
      <div className="p-4 text-red-500">
        Erreur lors de la récupération des articles: {error}
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Articles</h1>
        <Link 
          href="/dashboard/articles/new" 
          className="inline-flex items-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
        >
          <PlusCircle className="w-5 h-5 mr-2" />
          Nouvel Article
        </Link>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        {/* Filtres */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" />
                <input
                  type="text"
                  placeholder="Rechercher un article..."
                  className="w-full pl-10 pr-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="flex gap-4">
              <select
                value={selectedStatus}
                onChange={(e) => handleStatusFilter(e.target.value as ArticleStatus | undefined)}
                className="px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option value="">Tous les statuts</option>
                <option value="DRAFT">Brouillon</option>
                <option value="PUBLISHED">Publié</option>
                <option value="ARCHIVED">Archivé</option>
              </select>
              <select
                value={selectedAccessLevel}
                onChange={(e) => handleAccessLevelFilter(e.target.value as AccessLevel | undefined)}
                className="px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option value="">Tous les niveaux</option>
                <option value="FREE">Gratuit</option>
                <option value="BASIC">Basic</option>
                <option value="PRO">Pro</option>
              </select>
            </div>
          </div>
        </div>

        {/* Liste des articles */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Article
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Accès
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Plateformes
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center">
                    Chargement...
                  </td>
                </tr>
              ) : filteredArticles.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center">
                    Aucun article trouvé
                  </td>
                </tr>
              ) : (
                filteredArticles.map((article) => (
                  <tr key={article.id}>
                    <td className="px-6 py-4">
                      <div className="flex items-start space-x-4">
                        {article.featuredImage && (
                          <div className="flex-shrink-0 w-12 h-12 relative">
                            <Image
                              src={normalizeImagePath(article.featuredImage)}
                              alt={article.title}
                              fill
                              className="object-cover rounded"
                            />
                          </div>
                        )}
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {article.title}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {article.excerpt}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColors[article.status]}`}>
                        {article.status === 'DRAFT' ? 'Brouillon' : article.status === 'PUBLISHED' ? 'Publié' : 'Archivé'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${accessLevelColors[article.accessLevel]}`}>
                        {article.accessLevel}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex space-x-2">
                        {article.publishPlatforms?.map((platform: Platform) => {
                          const PlatformIcon = platforms[platform]?.icon;
                          return PlatformIcon ? (
                            <PlatformIcon
                              key={platform}
                              className={`w-5 h-5 ${platforms[platform].color}`}
                              title={platforms[platform].name}
                            />
                          ) : null;
                        })}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => router.push(`/articles/${article.slug}`)}
                          className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                        >
                          <Eye className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => router.push(`/dashboard/articles/edit/${article.id}`)}
                          className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-200"
                        >
                          <Pencil className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(article.id)}
                          className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-200"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          <div className="p-4">
            <nav aria-label="Page navigation">
              <ul className="inline-flex -space-x-px">
                {Array.from({ length: totalPages }, (_, i) => (
                  <li key={i}>
                    <button
                      onClick={() => handlePageChange(i + 1)}
                      className={`py-2 px-3 leading-tight text-gray-500 bg-white border border-gray-300 hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white ${currentPage === i + 1 ? 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-white' : ''}`}
                    >
                      {i + 1}
                    </button>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </div>
      </div>
    </div>
  );
}
