import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { comparePasswords, createToken, setAuthCookie } from '@/lib/auth.utils';
import { LoginCredentials } from '@/types/auth';
import { Role } from '@prisma/client';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as LoginCredentials;
    const { email, password } = body;

    console.log('Login attempt for:', email);

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email et mot de passe requis' },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        password: true,
        role: true,
        emailVerified: true,
        name: true
      }
    });

    console.log('User found:', {
      id: user?.id,
      email: user?.email,
      role: user?.role
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Email ou mot de passe incorrect' },
        { status: 401 }
      );
    }

    const isValidPassword = await comparePasswords(password, user.password);

    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Email ou mot de passe incorrect' },
        { status: 401 }
      );
    }

    if (!user.emailVerified) {
      return NextResponse.json(
        { error: 'Veuillez vérifier votre email avant de vous connecter' },
        { status: 403 }
      );
    }

    // Créer le token avec le rôle correct
    const userForToken = {
      id: user.id,
      email: user.email,
      role: user.role as Role,
      name: user.name
    };

    console.log('Creating token for user:', userForToken);
    const token = await createToken(userForToken);

    const response = NextResponse.json({ 
      success: true,
      user: userForToken
    });

    await setAuthCookie(response, token);
    
    // Mettre à jour lastLogin
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() }
    });

    return response;

  } catch (error) {
    console.error('Erreur login:', error);
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de la connexion' },
      { status: 500 }
    );
  }
}
