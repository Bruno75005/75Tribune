"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { CategoryForm } from "./category-form"
import { CategoryTree } from "@/services/category.service"

interface CategoryDialogProps {
  show: boolean
  onClose: () => void
  categories: CategoryTree[]
  category?: CategoryTree
  onSubmit: (data: any) => Promise<void>
}

export function CategoryDialog({
  show,
  onClose,
  categories,
  category,
  onSubmit,
}: CategoryDialogProps) {
  return (
    <Dialog open={show} onOpenChange={onClose}>
      <DialogContent className="dark:bg-gray-800">
        <DialogHeader>
          <DialogTitle className="dark:text-white">
            {category ? 'Modifier la catégorie' : 'Créer une catégorie'}
          </DialogTitle>
          <DialogDescription className="dark:text-gray-400">
            {category
              ? 'Modifiez les détails de la catégorie.'
              : 'Ajoutez une nouvelle catégorie à votre site.'}
          </DialogDescription>
        </DialogHeader>
        <CategoryForm
          categories={categories.filter(cat => cat.id !== category?.id)}
          initialData={category}
          onSubmit={onSubmit}
          onCancel={onClose}
        />
      </DialogContent>
    </Dialog>
  )
}
