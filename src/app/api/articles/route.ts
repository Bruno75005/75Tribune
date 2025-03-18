import { NextRequest, NextResponse } from 'next/server';
import { ArticleService } from '@/services/article.service';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { z } from 'zod';
import { Role, ArticleStatus } from '@prisma/client';

// Schéma de validation Zod pour la création d'articles
const createArticleSchema = z.object({
  title: z.string().min(1, 'Le titre est requis'),
  content: z.string().min(1, 'Le contenu est requis'),
  excerpt: z.string().optional(),
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']).default('DRAFT'),
  accessLevel: z.enum(['FREE', 'BASIC', 'PRO']).default('FREE'),
  tags: z.array(z.string()).optional(),
  categories: z.array(z.string()).optional(),
  publishPlatforms: z.array(z.enum(['wordpress', 'youtube', 'twitter'])).optional(),
  featuredImage: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    if (session.user.role !== Role.ADMIN) {
      return NextResponse.json(
        { error: 'Seuls les administrateurs peuvent publier des articles' },
        { status: 403 }
      );
    }

    const data = await request.json();
    console.log('Données reçues pour création article:', data);

    // Valider les données avec Zod
    const validatedData = createArticleSchema.parse(data);

    const article = await ArticleService.create({
      title: validatedData.title,
      content: validatedData.content,
      excerpt: validatedData.excerpt,
      status: validatedData.status,
      accessLevel: validatedData.accessLevel,
      tags: validatedData.tags || [],
      categories: validatedData.categories || [],
      authorId: session.user.id,
      publishPlatforms: validatedData.publishPlatforms || [],
      featuredImage: validatedData.featuredImage,
    });

    console.log('Article créé avec succès:', article.id);
    return NextResponse.json({ success: true, article }, { status: 201 });
  } catch (error) {
    console.error('Erreur dans POST /api/articles:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Données invalides', details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erreur serveur' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status') as ArticleStatus | undefined;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    const articles = await ArticleService.list({
      status,
      page,
      limit,
    });

    return NextResponse.json(articles);
  } catch (error) {
    console.error('Erreur dans GET /api/articles:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des articles' },
      { status: 500 }
    );
  }
}