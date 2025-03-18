import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createNotification } from '../notifications/route';

// GET /api/comments?articleId=xxx
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const articleId = searchParams.get('articleId');

    if (!articleId) {
      return NextResponse.json({ error: 'Article ID requis' }, { status: 400 });
    }

    const comments = await prisma.comment.findMany({
      where: {
        articleId,
        isApproved: true,
        parent: null
      },
      include: {
        author: true,
        parent: true,
        replies: {
          where: {
            isApproved: true,
          },
          include: {
            author: true,
          },
          orderBy: {
            createdAt: 'asc',
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    console.log('Comments with authors:', JSON.stringify(comments, null, 2));

    return NextResponse.json(comments);
  } catch (error) {
    console.error('Erreur lors de la récupération des commentaires:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des commentaires' },
      { status: 500 }
    );
  }
}

// POST /api/comments
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { error: 'Vous devez être connecté' },
        { status: 401 }
      );
    }

    const { content, articleId, parentId } = await request.json();

    if (!content || !articleId) {
      return NextResponse.json(
        { error: 'Contenu et ID de l\'article requis' },
        { status: 400 }
      );
    }

    // Si c'est une réponse, vérifier que le commentaire parent existe
    if (parentId) {
      const parentComment = await prisma.comment.findUnique({
        where: { id: parentId },
      });

      if (!parentComment) {
        return NextResponse.json(
          { error: 'Commentaire parent non trouvé' },
          { status: 404 }
        );
      }
    }

    // Créer le commentaire
    const comment = await prisma.comment.create({
      data: {
        content,
        author: {
          connect: { id: session.user.id }
        },
        article: {
          connect: { id: articleId }
        },
        ...(parentId && {
          parent: {
            connect: { id: parentId }
          }
        }),
        isApproved: true
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            avatar: true,
          }
        },
        parent: true,
        replies: true
      }
    });

    // Si c'est une réponse, créer une notification
    if (parentId) {
      const parentComment = await prisma.comment.findUnique({
        where: { id: parentId },
        include: { author: true }
      });

      if (parentComment && parentComment.author.id !== session.user.id) {
        await createNotification({
          type: 'COMMENT_REPLY',
          content: `${session.user.name} a répondu à votre commentaire`,
          userId: parentComment.author.id,
          articleId,
          commentId: comment.id
        });
      }
    }

    return NextResponse.json(comment);
  } catch (error) {
    console.error('Erreur lors de la création du commentaire:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la création du commentaire' },
      { status: 500 }
    );
  }
}
