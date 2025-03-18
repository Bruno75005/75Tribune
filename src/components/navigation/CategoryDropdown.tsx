'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ChevronDown } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface Category {
  id: string;
  name: string;
  slug: string;
}

export default function CategoryDropdown() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Appel API pour récupérer les catégories
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/categories');
        if (response.ok) {
          const data = await response.json();
          setCategories(data);
        }
      } catch (error) {
        console.error('Erreur lors de la récupération des catégories :', error);
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  if (loading) {
    // Bouton inactif "Catégories" pendant le chargement
    return (
      <div className="nav-link text-lightText dark:text-darkText">
        <span>Catégories</span>
      </div>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="nav-link inline-flex items-center text-lightText dark:text-darkText hover:text-primary transition-colors">
        <span>Catégories</span>
        <ChevronDown className="ml-1 h-4 w-4" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="bg-lightCard dark:bg-darkCard border border-lightBorder dark:border-darkBorder rounded-lg shadow-lg neumorphic-light dark:neumorphic">
        {categories.length > 0 ? (
          categories.map((category) => (
            <DropdownMenuItem key={category.id} asChild>
              <Link href={`/categories/${category.slug}`} className="text-lightText dark:text-darkText hover:bg-lightCard/50 dark:hover:bg-darkCard/50 w-full">
                {category.name}
              </Link>
            </DropdownMenuItem>
          ))
        ) : (
          <DropdownMenuItem disabled className="text-mutedLight:foreground dark:text-muted:foreground">
            Aucune catégorie
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}