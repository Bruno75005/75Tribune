import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth.utils';
import type { AuthUser } from '@/types/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser();
    
    if (!user) {
      return NextResponse.json({ user: null });
    }

    // Ne pas renvoyer d'informations sensibles
    const safeUser: AuthUser = {
      id: user.id,
      email: user.email,
      role: user.role,
    };

    // Ajouter le nom seulement s'il existe
    if (user.name) {
      safeUser.name = user.name;
    }

    return NextResponse.json({ user: safeUser });
  } catch (error) {
    console.error('Erreur vérification auth:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la vérification de l\'authentification' },
      { status: 500 }
    );
  }
}
