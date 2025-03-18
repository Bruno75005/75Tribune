import { NextRequest, NextResponse } from 'next/server';
import { UserService } from '@/services/user.service';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    // Vérifier si l'utilisateur est admin
    const user = await UserService.getById(session.user.id);
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
    }

    const users = await UserService.list();
    return NextResponse.json(users);
  } catch (error) {
    console.error('Erreur liste utilisateurs:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des utilisateurs' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    // Vérifier si l'utilisateur est admin
    const user = await UserService.getById(session.user.id);
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
    }

    const data = await request.json();

    // Validation des données
    if (!data.email?.trim()) {
      return NextResponse.json({ error: 'Email requis' }, { status: 400 });
    }

    if (!data.password?.trim()) {
      return NextResponse.json({ error: 'Mot de passe requis' }, { status: 400 });
    }

    const newUser = await UserService.create({
      email: data.email.trim(),
      password: data.password.trim(),
      name: data.name?.trim(),
      role: data.role,
      subscriptionType: data.subscriptionType,
    });

    return NextResponse.json({
      success: true,
      user: newUser,
    });
  } catch (error: any) {
    console.error('Erreur création utilisateur:', error);
    return NextResponse.json(
      { error: error.message || 'Erreur lors de la création de l\'utilisateur' },
      { status: 500 }
    );
  }
}
