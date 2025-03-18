import { useState, useEffect } from 'react';
import { Role, SubscriptionType } from '@prisma/client';
import { toast } from 'react-hot-toast';

interface User {
  id: string;
  email: string;
  name: string | null;
  role: Role;
  subscriptionType: SubscriptionType;
  emailVerified: boolean;
  lastLogin: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export function useUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/users');
      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des utilisateurs');
      }
      const data = await response.json();
      setUsers(data);
    } catch (err) {
      console.error('Erreur:', err);
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  const createUser = async (userData: {
    email: string;
    password: string;
    name?: string;
    role?: Role;
    subscriptionType?: SubscriptionType;
  }) => {
    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erreur lors de la création');
      }

      const { user } = await response.json();
      setUsers(prev => [...prev, user]);
      toast.success('Utilisateur créé avec succès');
      return user;
    } catch (err) {
      console.error('Erreur création:', err);
      toast.error(err instanceof Error ? err.message : 'Erreur lors de la création');
      throw err;
    }
  };

  const updateUser = async (
    id: string,
    userData: {
      email?: string;
      name?: string;
      role?: Role;
      subscriptionType?: SubscriptionType;
      password?: string;
    }
  ) => {
    try {
      const response = await fetch(`/api/users/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erreur lors de la mise à jour');
      }

      const { user } = await response.json();
      setUsers(prev => prev.map(u => (u.id === id ? user : u)));
      toast.success('Utilisateur mis à jour avec succès');
      return user;
    } catch (err) {
      console.error('Erreur mise à jour:', err);
      toast.error(err instanceof Error ? err.message : 'Erreur lors de la mise à jour');
      throw err;
    }
  };

  const deleteUser = async (id: string) => {
    try {
      const response = await fetch(`/api/users/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erreur lors de la suppression');
      }

      setUsers(prev => prev.filter(user => user.id !== id));
      toast.success('Utilisateur supprimé avec succès');
    } catch (err) {
      console.error('Erreur suppression:', err);
      toast.error(err instanceof Error ? err.message : 'Erreur lors de la suppression');
      throw err;
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return {
    users,
    loading,
    error,
    createUser,
    updateUser,
    deleteUser,
    refetch: fetchUsers,
  };
}
