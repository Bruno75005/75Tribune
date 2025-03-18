import { NextResponse } from 'next/server';
import { removeAuthCookie } from '@/lib/auth.utils';

export async function POST() {
  try {
    removeAuthCookie();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erreur logout:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la déconnexion' },
      { status: 500 }
    );
  }
}
