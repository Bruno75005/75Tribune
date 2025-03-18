"use client"

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { CategoryTree } from '@/services/category.service'

const categorySchema = z.object({
  name: z.string().min(1, 'Le nom est requis'),
  slug: z.string().optional(),
  parentId: z.string().nullable().optional(),
  order: z.number().optional(),
  isActive: z.boolean().default(true),
})

type CategoryFormValues = z.infer<typeof categorySchema>

interface CategoryFormProps {
  categories: CategoryTree[]
  initialData?: CategoryTree
  onSubmit: (data: CategoryFormValues) => Promise<void>
  onCancel: () => void
}

export function CategoryForm({
  categories,
  initialData,
  onSubmit,
  onCancel,
}: CategoryFormProps) {
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: initialData?.name || '',
      slug: initialData?.slug || '',
      parentId: initialData?.parentId || undefined,
      order: initialData?.order || 0,
      isActive: initialData?.isActive ?? true,
    },
  })

// Modifiez la fonction handleSubmit comme ceci :
const handleSubmit = async (data: CategoryFormValues) => {
  try {
    setIsLoading(true);
    
    // Correction clé : Transformer parentId vide en null
    const formattedData = {
      ...data,
      parentId: data.parentId === '' ? null : data.parentId,
    };

    await onSubmit(formattedData); // Utilisez formattedData au lieu de data
    form.reset();
  } catch (error) {
    console.error('Erreur lors de la soumission:', error);
  } finally {
    setIsLoading(false);
  }
};

  const renderCategoryOptions = (cats: CategoryTree[], level = 0): JSX.Element[] => {
    return cats.flatMap((category) => [
      <option key={category.id} value={category.id}>
        {'  '.repeat(level)}
        {category.name}
      </option>,
      ...(category.children ? renderCategoryOptions(category.children, level + 1) : []),
    ])
  }

  return (
    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
      <div className="space-y-2">
        <label
          htmlFor="name"
          className="text-sm font-medium leading-none text-gray-900 dark:text-gray-100 peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
          Nom
        </label>
        <input
          {...form.register('name')}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
        />
        {form.formState.errors.name && (
          <p className="text-sm text-red-500 dark:text-red-400">{form.formState.errors.name.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <label
          htmlFor="parentId"
          className="text-sm font-medium leading-none text-gray-900 dark:text-gray-100 peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
          Catégorie parente
        </label>
        <select
          {...form.register('parentId')}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        >
          <option value="">Aucune</option>
          {renderCategoryOptions(categories)}
        </select>
      </div>

      <div className="space-y-2">
        <label
          htmlFor="order"
          className="text-sm font-medium leading-none text-gray-900 dark:text-gray-100 peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
          Ordre
        </label>
        <input
          type="number"
          {...form.register('order', { valueAsNumber: true })}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
        />
      </div>

      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          {...form.register('isActive')}
          className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary dark:border-gray-600 dark:bg-gray-700"
        />
        <label
          htmlFor="isActive"
          className="text-sm font-medium leading-none text-gray-900 dark:text-gray-100 peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
          Actif
        </label>
      </div>

      <div className="flex justify-end space-x-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary dark:focus:ring-offset-gray-800"
          disabled={isLoading}
        >
          Annuler
        </button>
        <button
          type="submit"
          className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary dark:focus:ring-offset-gray-800"
          disabled={isLoading}
        >
          {isLoading ? 'Chargement...' : initialData ? 'Modifier' : 'Créer'}
        </button>
      </div>
    </form>
  )
}
