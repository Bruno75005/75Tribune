import { NextResponse } from 'next/server';
import { UserService } from '@/services/user.service';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { Role, SubscriptionType } from '@prisma/client';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
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

    const targetUser = await UserService.getById(params.id);
    if (!targetUser) {
      return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 404 });
    }

    return NextResponse.json(targetUser);
  } catch (error) {
    console.error('Erreur récupération utilisateur:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération de l\'utilisateur' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
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
    
    // Validation de base
    if (data.email && !data.email.trim()) {
      return NextResponse.json({ error: 'Email invalide' }, { status: 400 });
    }

    // Validation du rôle
    if (data.role && !Object.values(Role).includes(data.role)) {
      return NextResponse.json({ error: 'Rôle invalide' }, { status: 400 });
    }

    // Validation du type d'abonnement
    if (data.subscriptionType && !Object.values(SubscriptionType).includes(data.subscriptionType)) {
      return NextResponse.json({ error: 'Type d\'abonnement invalide' }, { status: 400 });
    }

    const updatedUser = await UserService.update({
      id: params.id,
      email: data.email?.trim(),
      name: data.name?.trim(),
      role: data.role,
      subscriptionType: data.subscriptionType,
      password: data.password?.trim(),
    });

    return NextResponse.json({
      success: true,
      user: updatedUser,
    });
  } catch (error: any) {
    console.error('Erreur mise à jour utilisateur:', error);
    return NextResponse.json(
      { error: error.message || 'Erreur lors de la mise à jour de l\'utilisateur' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
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

    // Empêcher la suppression de son propre compte
    if (params.id === session.user.id) {
      return NextResponse.json(
        { error: 'Vous ne pouvez pas supprimer votre propre compte' },
        { status: 400 }
      );
    }

    await UserService.delete(params.id);

    return NextResponse.json({
      success: true,
      message: 'Utilisateur supprimé avec succès',
    });
  } catch (error) {
    console.error('Erreur suppression utilisateur:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la suppression de l\'utilisateur' },
      { status: 500 }
    );
  }
}
