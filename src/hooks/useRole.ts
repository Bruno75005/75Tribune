'use client';

import { useAuth } from './useAuth';
import type { Role } from '@/middlewares/withRoleCheck';

export function useRole() {
  const { user } = useAuth();

  const hasRole = (roles: Role | Role[]): boolean => {
    if (!user) return false;
    
    const userRole = user.role as Role;
    if (Array.isArray(roles)) {
      return roles.includes(userRole);
    }
    return roles === userRole;
  };

  const isAdmin = (): boolean => {
    return hasRole('ADMIN');
  };

  const isUser = (): boolean => {
    return hasRole('USER');
  };

  return {
    hasRole,
    isAdmin,
    isUser,
  };
}
