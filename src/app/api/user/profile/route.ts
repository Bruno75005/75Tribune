import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcrypt';

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      );
    }

    const { name, email, avatar, currentPassword, newPassword } = await request.json();

    // Vérifier si l'email est déjà utilisé par un autre utilisateur
    if (email !== session.user.email) {
      const existingUser = await prisma.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        return NextResponse.json(
          { error: 'Cet email est déjà utilisé' },
          { status: 400 }
        );
      }
    }

    // Mettre à jour l'utilisateur
    const updateData: any = {
      name: name || null,
      email,
    };

    // Ne pas toucher à l'avatar lors de la mise à jour du profil
    if (avatar !== undefined) {
      updateData.avatar = avatar;
    }

    if (newPassword && currentPassword) {
      // Vérifier l'ancien mot de passe
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { password: true },
      });

      const isValidPassword = await bcrypt.compare(
        currentPassword,
        user?.password || ''
      );

      if (!isValidPassword) {
        return NextResponse.json(
          { error: 'Mot de passe actuel incorrect' },
          { status: 400 }
        );
      }

      // Hasher le nouveau mot de passe
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      updateData.password = hashedPassword;
    }

    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        subscriptionType: true
      },
    });

    return NextResponse.json({
      ...updatedUser,
      avatar: updateData.avatar
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour du profil:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour du profil' },
      { status: 500 }
    );
  }
}
