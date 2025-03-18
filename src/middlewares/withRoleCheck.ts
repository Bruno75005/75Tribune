import { NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth.utils';
import { Role } from '@prisma/client';

type HandlerFunction = (
  request: Request,
  context: any
) => Promise<NextResponse>;

export function withRoleCheck(allowedRoles: Role[], handler: HandlerFunction) {
  return async (request: Request, context: any) => {
    try {
      console.log('=== withRoleCheck Start ===');
      
      // Vérifier l'authentification
      const user = await getAuthUser();
      console.log('User from getAuthUser:', user);

      if (!user) {
        console.log('No user found, returning 401');
        return NextResponse.json(
          { error: 'Non autorisé - Authentification requise' },
          { status: 401 }
        );
      }

      // Vérifier si le rôle de l'utilisateur est dans la liste des rôles autorisés
      const isAllowed = allowedRoles.includes(user.role);
      console.log('User role:', user.role);
      console.log('Allowed roles:', allowedRoles);
      console.log('Is role allowed:', isAllowed);

      if (!isAllowed) {
        console.log('User role not allowed');
        return NextResponse.json(
          { error: 'Non autorisé - Rôle insuffisant' },
          { status: 403 }
        );
      }

      console.log('Role check passed, proceeding with handler');
      return handler(request, context);
    } catch (error) {
      console.error('Error in withRoleCheck:', error);
      return NextResponse.json(
        { error: 'Erreur serveur' },
        { status: 500 }
      );
    } finally {
      console.log('=== withRoleCheck End ===');
    }
  };
}
