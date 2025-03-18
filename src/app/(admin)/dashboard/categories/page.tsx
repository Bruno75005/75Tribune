'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { CategoryTree } from '@/services/category.service';
import { useToast } from '@/components/ui/use-toast';
import { CategoryDialog } from '@/components/categories/category-dialog';
import { useSession } from 'next-auth/react';
import { Role } from '@prisma/client';
import { redirect } from 'next/navigation';

export default function CategoriesPage() {
  const { data: session } = useSession({
    required: true,
    onUnauthenticated() {
      redirect('/login');
    },
  });

  // Vérifier si l'utilisateur a le rôle admin
  if (session?.user?.role !== Role.ADMIN) {
    redirect('/');
  }

  const [categories, setCategories] = useState<CategoryTree[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryTree | undefined>(undefined);
  const { toast } = useToast();

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories');
      if (!response.ok) {
        throw new Error('Erreur lors du chargement des catégories');
      }
      const data = await response.json();
      setCategories(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
      toast({
        title: "Erreur",
        description: "Impossible de charger les catégories",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleAddCategory = async (data: CategoryTree) => {
    try {
      const response = await fetch('/api/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la création de la catégorie');
      }

      await fetchCategories();
      setShowDialog(false);
      toast({
        title: "Succès",
        description: "Catégorie créée avec succès",
      });
    } catch (err) {
      toast({
        title: "Erreur",
        description: err instanceof Error ? err.message : "Une erreur est survenue",
        variant: "destructive",
      });
    }
  };

  const handleEditCategory = async (data: CategoryTree) => {
    try {
      const response = await fetch('/api/categories', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...data, id: editingCategory?.id }),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la modification de la catégorie');
      }

      await fetchCategories();
      setShowDialog(false);
      setEditingCategory(undefined);
      toast({
        title: "Succès",
        description: "Catégorie modifiée avec succès",
      });
    } catch (err) {
      toast({
        title: "Erreur",
        description: err instanceof Error ? err.message : "Une erreur est survenue",
        variant: "destructive",
      });
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette catégorie ?')) {
      return;
    }

    try {
      const response = await fetch(`/api/categories?id=${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la suppression de la catégorie');
      }

      await fetchCategories();
      toast({
        title: "Succès",
        description: "Catégorie supprimée avec succès",
      });
    } catch (err) {
      toast({
        title: "Erreur",
        description: err instanceof Error ? err.message : "Une erreur est survenue",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-gray-100"></div>
      </div>
    );
  }

  return (
    <div className="container p-4 w-full">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Gestion des catégories</h1>
        <button
          onClick={() => {
            setEditingCategory(undefined);
            setShowDialog(true);
          }}
          className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nouvelle catégorie
        </button>
      </div>

      {error && (
        <div className="bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-800 text-red-700 dark:text-red-200 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div className="grid gap-4">
        {categories.map((category) => (
          <div
            key={category.id}
            className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-lg shadow"
          >
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 dark:text-white">{category.name}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">{category.description || 'Aucune description'}</p>
              <div className="flex items-center mt-2 space-x-4 text-sm text-gray-500 dark:text-gray-400">
                <span>
                  {category._count?.articles || 0} article{category._count?.articles !== 1 ? 's' : ''}
                </span>
                <span>•</span>
                <span>
                  {category._count?.children || 0} sous-catégorie{category._count?.children !== 1 ? 's' : ''}
                </span>
                <span>•</span>
                <span className={category.isActive ? 'text-green-500 dark:text-green-400' : 'text-red-500 dark:text-red-400'}>
                  {category.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => {
                  setEditingCategory(category);
                  setShowDialog(true);
                }}
                className="p-2 text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
              >
                <Edit2 className="w-5 h-5" />
              </button>
              <button
                onClick={() => handleDeleteCategory(category.id)}
                className="p-2 text-gray-600 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 transition-colors"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      <CategoryDialog
        show={showDialog}
        onClose={() => {
          setShowDialog(false);
          setEditingCategory(undefined);
        }}
        onSubmit={editingCategory ? handleEditCategory : handleAddCategory}
        category={editingCategory}
        categories={categories}
      />
    </div>
  );
}
