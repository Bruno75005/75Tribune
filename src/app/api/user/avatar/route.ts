import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { join } from 'path';
import { writeFile, mkdir, unlink } from 'fs/promises';
import { existsSync } from 'fs';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export const config = {
  api: {
    bodyParser: false,
  },
};

export async function POST(request: Request) {
  try {
    console.log('Starting avatar upload process...');
    const session = await getServerSession(authOptions);
    console.log('Session:', session);
    
    if (!session?.user?.id) {
      console.log('No session found or no user ID');
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    // Créer le dossier uploads s'il n'existe pas
    const uploadDir = join(process.cwd(), 'public', 'uploads', 'avatars');
    console.log('Upload directory:', uploadDir);
    
    if (!existsSync(uploadDir)) {
      console.log('Creating upload directory...');
      await mkdir(uploadDir, { recursive: true });
    }

    const formData = await request.formData();
    const file = formData.get('avatar') as File;
    console.log('Received file:', { name: file?.name, type: file?.type, size: file?.size });
    
    if (!file) {
      console.log('No file provided');
      return NextResponse.json({ error: 'Aucun fichier fourni' }, { status: 400 });
    }

    // Vérifier le type de fichier
    if (!['image/jpeg', 'image/png', 'image/gif', 'image/webp'].includes(file.type)) {
      console.log('Invalid file type:', file.type);
      return NextResponse.json(
        { error: 'Le fichier doit être une image (JPG, PNG, GIF ou WEBP)' },
        { status: 400 }
      );
    }

    // Vérifier la taille du fichier (5MB)
    if (file.size > MAX_FILE_SIZE) {
      console.log('File too large:', file.size);
      return NextResponse.json(
        { error: 'Le fichier est trop volumineux (max 5MB)' },
        { status: 400 }
      );
    }

    try {
      // Générer un nom de fichier unique
      const extension = file.type.split('/')[1];
      const fileName = `${session.user.id}-${Date.now()}.${extension}`;
      const filePath = join(uploadDir, fileName);
      const avatarUrl = `/uploads/avatars/${fileName}`;
      
      console.log('Processing file upload:', {
        fileName,
        filePath,
        avatarUrl
      });

      // Convertir le File en Buffer et sauvegarder
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      await writeFile(filePath, buffer);
      console.log('File written successfully');

      // Mettre à jour l'URL de l'avatar dans la base de données
      const updatedUser = await prisma.user.update({
        where: { id: session.user.id },
        data: { avatar: avatarUrl },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          avatar: true,
          subscriptionType: true
        }
      });
      
      console.log('Database update result:', updatedUser);

      if (!updatedUser || !updatedUser.avatar) {
        throw new Error('Failed to update avatar in database');
      }

      // Supprimer l'ancien avatar si nécessaire
      const currentUser = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { avatar: true }
      });

      if (currentUser?.avatar && currentUser.avatar !== avatarUrl) {
        const oldAvatarPath = join(process.cwd(), 'public', currentUser.avatar);
        if (existsSync(oldAvatarPath)) {
          await unlink(oldAvatarPath);
          console.log('Old avatar deleted:', oldAvatarPath);
        }
      }

      return NextResponse.json({
        success: true,
        avatar: avatarUrl,
        user: updatedUser,
        message: 'Avatar mis à jour avec succès'
      });

    } catch (error) {
      console.error('Error processing avatar:', error);
      return NextResponse.json(
        { error: 'Erreur lors du traitement de l\'avatar' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Global error:', error);
    return NextResponse.json(
      { error: 'Erreur lors du traitement de la requête' },
      { status: 500 }
    );
  }
}

export async function OPTIONS(request: Request) {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Methods': 'POST',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
