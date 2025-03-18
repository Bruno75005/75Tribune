import { NextResponse } from 'next/server';
import { ArticleService } from '@/services/article.service';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { UpdateArticleDTO, Platform } from '@/types/article';
import { ArticleStatus, AccessLevel, Role } from '@prisma/client';
// Importez votre WordPressPublisher
import { WordPressPublisher } from '@/services/publishers/WordPressPublisher';

export const GET = async (
  request: Request,
  { params }: { params: { id: string } }
) => {
  console.log('=== GET Article Start ===');
  console.log('Article ID:', params.id);
  
  try {
    const session = await getServerSession(authOptions);
    console.log('Session:', {
      user: session?.user,
      expires: session?.expires
    });

    if (!session?.user) {
      console.log('No session found, returning 401');
      return NextResponse.json(
        { error: 'Non autorisé - Authentification requise' },
        { status: 401 }
      );
    }

    const article = await ArticleService.getById(params.id);
    console.log('Article found:', {
      id: article?.id,
      title: article?.title,
      authorId: article?.authorId
    });

    if (!article) {
      console.log('Article not found, returning 404');
      return NextResponse.json({ error: 'Article non trouvé' }, { status: 404 });
    }

    // Vérifier si l'utilisateur est l'auteur ou a un rôle suffisant
    const isAdminOrModerator =
      session.user.role === Role.ADMIN || session.user.role === Role.MODERATOR;
    const isAuthor = article.authorId === session.user.id;
    
    console.log('Permission check:', {
      isAdminOrModerator,
      isAuthor,
      userRole: session.user.role,
      articleAuthorId: article.authorId,
      userId: session.user.id
    });

    if (!isAuthor && !isAdminOrModerator) {
      console.log('User not authorized, returning 403');
      return NextResponse.json(
        { error: 'Non autorisé - Vous n\'avez pas les permissions nécessaires' },
        { status: 403 }
      );
    }

    console.log('Access granted, returning article');
    return NextResponse.json(article);
  } catch (error) {
    console.error('Error in GET article:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération de l\'article' },
      { status: 500 }
    );
  } finally {
    console.log('=== GET Article End ===');
  }
};

export const PUT = async (
  request: Request,
  { params }: { params: { id: string } }
) => {
  console.log('=== PUT Article Start ===');
  console.log('Article ID:', params.id);
  
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      console.log('No session found, returning 401');
      return NextResponse.json({
        success: false,
        error: 'Non autorisé'
      }, { status: 401 });
    }

    const body = await request.json();
    console.log('Request body:', body);

    const article = await ArticleService.getById(params.id);
    if (!article) {
      console.log('Article not found, returning 404');
      return NextResponse.json({
        success: false,
        error: 'Article non trouvé'
      }, { status: 404 });
    }

    // Vérifier si l'utilisateur est l'auteur ou a un rôle suffisant
    const isAdminOrModerator =
      session.user.role === Role.ADMIN || session.user.role === Role.MODERATOR;
    const isAuthor = article.authorId === session.user.id;

    console.log('Permission check:', {
      isAdminOrModerator,
      isAuthor,
      userRole: session.user.role,
      articleAuthorId: article.authorId,
      userId: session.user.id
    });

    if (!isAuthor && !isAdminOrModerator) {
      console.log('User not authorized, returning 403');
      return NextResponse.json(
        {
          success: false,
          error: 'Non autorisé - Vous n\'avez pas les permissions nécessaires'
        },
        { status: 403 }
      );
    }

    console.log('Updating article with data:', {
      id: params.id,
      ...body
    });

    // 1) Mettre à jour l’article dans la BDD
    const updatedArticle = await ArticleService.update({
      id: params.id,
      ...body,
    });

    console.log('Article updated successfully:', {
      id: updatedArticle.id,
      title: updatedArticle.title,
      status: updatedArticle.status,
      publishPlatforms: updatedArticle.publishPlatforms,
    });

    // 2) Publication WordPress si la plateforme 'wordpress' est cochée
    //    ET que le statut de l'article est PUBLISHED
    if (
      updatedArticle.publishPlatforms?.includes('wordpress') &&
      updatedArticle.status === ArticleStatus.PUBLISHED
    ) {
      console.log('wordpress is in publishPlatforms; calling WordPressPublisher...');
      
      const publisher = new WordPressPublisher();
      const publishResult = await publisher.publish({
        title: updatedArticle.title,
        excerpt: updatedArticle.excerpt || '',
        content: updatedArticle.content || '',
        featuredImage: updatedArticle.featuredImage || undefined,
        categories: updatedArticle.categories?.map((cat: any) => cat.id) || [],
        tags: updatedArticle.tags?.map((tag: any) => tag.id) || [],
        slug: updatedArticle.slug || '', // <-- Ajouter la propriété slug ici
      });


      if (!publishResult.success) {
        console.error('Failed to publish to WordPress:', publishResult.error);
        // Vous pouvez soit ignorer l’erreur, soit le signaler.
      } else {
        console.log('Article published to WordPress:', publishResult.url);
        // Optionnel : stocker publishResult.url ou publishResult.platformId en BDD
      }
    }

    return NextResponse.json({
      success: true,
      article: updatedArticle
    });
  } catch (error: any) {
    console.error('Error in PUT article:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Erreur lors de la mise à jour de l\'article'
      },
      { status: 500 }
    );
  } finally {
    console.log('=== PUT Article End ===');
  }
};

export const DELETE = async (
  request: Request,
  { params }: { params: { id: string } }
) => {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    // Only admins can delete articles
    if (session.user.role !== Role.ADMIN) {
      return NextResponse.json(
        { error: 'Non autorisé - Action réservée aux administrateurs' },
        { status: 403 }
      );
    }

    await ArticleService.delete(params.id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in DELETE article:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la suppression de l\'article' },
      { status: 500 }
    );
  }
};
