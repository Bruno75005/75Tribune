import { ColumnDef } from '@tanstack/react-table';
import { Role, SubscriptionType } from '@prisma/client';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, Pencil, Trash } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export interface User {
  id: string;
  email: string;
  name: string | null;
  role: Role;
  subscriptionType: SubscriptionType;
  emailVerified: boolean;
  lastLogin: Date | null;
  createdAt: Date;
  updatedAt: Date;
  onEdit?: (user: User) => void;
  onDelete?: (user: User) => void;
}

export const columns: ColumnDef<User>[] = [
  {
    accessorKey: 'name',
    header: 'Nom',
    cell: ({ row }) => row.getValue('name') || 'Non défini',
  },
  {
    accessorKey: 'email',
    header: 'Email',
  },
  {
    accessorKey: 'role',
    header: 'Rôle',
    cell: ({ row }) => {
      const role = row.getValue('role') as Role;
      return (
        <Badge variant={role === 'ADMIN' ? 'destructive' : role === 'MODERATOR' ? 'default' : 'secondary'}>
          {role === 'ADMIN' ? 'Administrateur' : role === 'MODERATOR' ? 'Modérateur' : 'Utilisateur'}
        </Badge>
      );
    },
  },
  {
    accessorKey: 'subscriptionType',
    header: 'Abonnement',
    cell: ({ row }) => {
      const type = row.getValue('subscriptionType') as SubscriptionType;
      return (
        <Badge variant={type === 'PREMIUM' ? 'default' : 'secondary'}>
          {type === 'PREMIUM' ? 'Premium' : 'Gratuit'}
        </Badge>
      );
    },
  },
  {
    accessorKey: 'createdAt',
    header: 'Date création',
    cell: ({ row }) => {
      const date = row.getValue('createdAt') as Date;
      return format(new Date(date), 'Pp', { locale: fr });
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const user = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Ouvrir le menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(user.id)}
            >
              Copier l'ID utilisateur
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => row.original.onEdit?.(user)}>
              <Pencil className="mr-2 h-4 w-4" />
              Modifier
            </DropdownMenuItem>
            <DropdownMenuItem className="text-red-600" onClick={() => row.original.onDelete?.(user)}>
              <Trash className="mr-2 h-4 w-4" />
              Supprimer
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
