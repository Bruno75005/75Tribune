'use client';

import { useState } from 'react';
import { DataTable } from '@/components/ui/data-table';
import { columns, User } from './columns';
import { Button } from '@/components/ui/button';
import { Role, SubscriptionType } from '@prisma/client';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { useUsers } from '@/hooks/useUsers';

interface FormData {
  name: string;
  email: string;
  role: Role;
  subscriptionType: SubscriptionType;
  password: string;
}

export default function SubscribersPage() {
  const router = useRouter();
  const { users, loading: usersLoading, error, createUser, updateUser, deleteUser } = useUsers();
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    role: 'USER' as Role,
    subscriptionType: 'FREE' as SubscriptionType,
    password: '',
  });

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setFormData({
      name: user.name || '',
      email: user.email,
      role: user.role,
      subscriptionType: user.subscriptionType,
      password: '', // On ne récupère pas le mot de passe pour des raisons de sécurité
    });
    setIsOpen(true);
  };

  const handleDelete = async (user: User) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) {
      try {
        await deleteUser(user.id);
        toast.success('Utilisateur supprimé avec succès');
        router.refresh();
      } catch (error) {
        toast.error('Erreur lors de la suppression');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (editingUser) {
        await updateUser(editingUser.id, formData);
        toast.success('Utilisateur mis à jour avec succès');
      } else {
        await createUser(formData);
        toast.success('Utilisateur créé avec succès');
      }
      setIsOpen(false);
      router.refresh();
      resetForm();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      role: 'USER' as Role,
      subscriptionType: 'FREE' as SubscriptionType,
      password: '',
    });
    setEditingUser(null);
  };

  if (error) {
    return <div className="p-4 text-red-500">Erreur: {error}</div>;
  }

  const enrichedUsers = users?.map(user => ({
    ...user,
    onEdit: handleEdit,
    onDelete: handleDelete,
  }));

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Gestion des utilisateurs</h1>
        <Dialog open={isOpen} onOpenChange={(open) => {
          setIsOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button>Nouvel utilisateur</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>{editingUser ? 'Modifier' : 'Ajouter'} un utilisateur</DialogTitle>
              <DialogDescription>
                {editingUser ? 'Modifiez les informations de l\'utilisateur.' : 'Ajoutez un nouvel utilisateur au système.'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 py-4">
              <div className="grid w-full gap-4">
                <div className="flex flex-col space-y-2">
                  <label htmlFor="name" className="text-sm font-medium">
                    Nom
                  </label>
                  <Input
                    id="name"
                    placeholder="Nom de l'utilisateur"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full"
                  />
                </div>
                <div className="flex flex-col space-y-2">
                  <label htmlFor="email" className="text-sm font-medium">
                    Email
                  </label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="email@exemple.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full"
                  />
                </div>
                {!editingUser && (
                  <div className="flex flex-col space-y-2">
                    <label htmlFor="password" className="text-sm font-medium">
                      Mot de passe
                    </label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="Mot de passe"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="w-full"
                      autoComplete={editingUser ? "new-password" : "current-password"}
                    />
                  </div>
                )}
                <div className="flex flex-col space-y-2">
                  <label htmlFor="role" className="text-sm font-medium">
                    Rôle
                  </label>
                  <Select
                    value={formData.role}
                    onValueChange={(value: Role) => setFormData({ ...formData, role: value })}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Sélectionner un rôle" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USER">Utilisateur</SelectItem>
                      <SelectItem value="MODERATOR">Modérateur</SelectItem>
                      <SelectItem value="ADMIN">Administrateur</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-col space-y-2">
                  <label htmlFor="subscriptionType" className="text-sm font-medium">
                    Type d'abonnement
                  </label>
                  <Select
                    value={formData.subscriptionType}
                    onValueChange={(value: SubscriptionType) => setFormData({ ...formData, subscriptionType: value })}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Sélectionner un type d'abonnement" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="FREE">Gratuit</SelectItem>
                      <SelectItem value="PREMIUM">Premium</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsOpen(false);
                    resetForm();
                  }}
                >
                  Annuler
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    editingUser ? 'Mettre à jour' : 'Créer'
                  )}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      {usersLoading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : (
        <DataTable columns={columns} data={enrichedUsers || []} />
      )}
    </div>
  );
}
