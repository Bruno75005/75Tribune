'use client';

import { 
  Users, 
  FileText, 
  TrendingUp, 
  DollarSign,
  FolderTree,
  Settings,
  Tag,
  UserPlus
} from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

interface DashboardStats {
  subscribers: { total: number; growth: string };
  articles: { total: number; growth: string };
  views: { total: number; growth: string };
  revenue: { total: string; growth: string };
}

export default function DashboardPage() {
  const [stats, setStats] = useState([
    {
      title: 'Total Abonnés',
      value: '0',
      icon: Users,
      trend: '+0%',
      trendUp: true
    },
    {
      title: 'Articles Publiés',
      value: '0',
      icon: FileText,
      trend: '+0%',
      trendUp: true
    },
    {
      title: 'Vues Totales',
      value: '0',
      icon: TrendingUp,
      trend: '+0%',
      trendUp: true
    },
    {
      title: 'Revenus Mensuels',
      value: '0€',
      icon: DollarSign,
      trend: '+0%',
      trendUp: true
    }
  ]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/dashboard/stats');
        if (!response.ok) throw new Error('Erreur lors de la récupération des statistiques');
        
        const data: DashboardStats = await response.json();
        
        setStats([
          {
            title: 'Total Abonnés',
            value: data.subscribers.total.toString(),
            icon: Users,
            trend: `${Number(data.subscribers.growth) >= 0 ? '+' : ''}${data.subscribers.growth}%`,
            trendUp: Number(data.subscribers.growth) >= 0
          },
          {
            title: 'Articles Publiés',
            value: data.articles.total.toString(),
            icon: FileText,
            trend: `${Number(data.articles.growth) >= 0 ? '+' : ''}${data.articles.growth}%`,
            trendUp: Number(data.articles.growth) >= 0
          },
          {
            title: 'Vues Totales',
            value: data.views.total.toString(),
            icon: TrendingUp,
            trend: `${Number(data.views.growth) >= 0 ? '+' : ''}${data.views.growth}%`,
            trendUp: Number(data.views.growth) >= 0
          },
          {
            title: 'Revenus Mensuels',
            value: `${data.revenue.total}€`,
            icon: DollarSign,
            trend: `${Number(data.revenue.growth) >= 0 ? '+' : ''}${data.revenue.growth}%`,
            trendUp: Number(data.revenue.growth) >= 0
          }
        ]);
      } catch (error) {
        console.error('Erreur lors de la récupération des statistiques:', error);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={index}
              className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm"
            >
              <div className="flex items-center">
                <div className="p-3 bg-primary-100 dark:bg-primary-900 rounded-full">
                  <Icon className="h-6 w-6 text-primary-600 dark:text-primary-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    {stat.title}
                  </p>
                  <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                    {stat.value}
                  </p>
                </div>
              </div>
              <div className="mt-4">
                <div className="flex items-center">
                  <div
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium ${
                      stat.trendUp
                        ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                        : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
                    }`}
                  >
                    {stat.trend}
                  </div>
                  <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">
                    vs mois dernier
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Actions rapides */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Actions rapides</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Link 
            href="/dashboard/categories"
            className="flex items-center p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-shadow"
          >
            <FolderTree className="w-6 h-6 mr-3 text-blue-500" />
            <div>
              <h3 className="font-semibold">Catégories</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Gérer les catégories</p>
            </div>
          </Link>

          <Link 
            href="/dashboard/tags"
            className="flex items-center p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-shadow"
          >
            <Tag className="w-6 h-6 mr-3 text-green-500" />
            <div>
              <h3 className="font-semibold">Tags</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Gérer les tags</p>
            </div>
          </Link>

          <Link 
            href="/dashboard/users"
            className="flex items-center p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-shadow"
          >
            <UserPlus className="w-6 h-6 mr-3 text-purple-500" />
            <div>
              <h3 className="font-semibold">Utilisateurs</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Gérer les utilisateurs</p>
            </div>
          </Link>

          <Link 
            href="/dashboard/settings"
            className="flex items-center p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-shadow"
          >
            <Settings className="w-6 h-6 mr-3 text-orange-500" />
            <div>
              <h3 className="font-semibold">Paramètres</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Configuration du site</p>
            </div>
          </Link>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          Activité Récente
        </h3>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          Aucune activité récente
        </div>
      </div>
    </div>
  );
}
