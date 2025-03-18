import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

// Solution pour les instances Prisma multiples avec Next.js
const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma || new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error']
});

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

// Interface TypeScript pour la validation des données
interface AssistantContentRequest {
  content: string;
}

export async function POST(request: Request) {
  try {
    const body: unknown = await request.json();
    
    // Validation basique du payload
    if (!body || typeof (body as AssistantContentRequest).content !== 'string') {
      return NextResponse.json(
        { error: 'Format de données invalide' }, 
        { status: 400 }
      );
    }

    const { content } = body as AssistantContentRequest;

    // Protection contre les données vides
    if (content.trim().length === 0) {
      return NextResponse.json(
        { error: 'Le contenu ne peut pas être vide' }, 
        { status: 422 }
      );
    }

    const assistantContent = await prisma.assistantContent.create({
      data: {
        content,
        createdAt: new Date(),
      },
    });

    // Log de succès (en développement)
    if (process.env.NODE_ENV === 'development') {
      console.log(`Nouveau contenu stocké - ID: ${assistantContent.id}`);
    }

    return NextResponse.json({ 
      success: true,
      data: {
        id: assistantContent.id,
        createdAt: assistantContent.createdAt.toISOString()
      }
    });

  } catch (error) {
    console.error('Erreur POST /api/assistant:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' }, 
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const latestContent = await prisma.assistantContent.findFirst({
      orderBy: { createdAt: 'desc' },
      select: {
        content: true,
        createdAt: true
      }
    });

    return NextResponse.json({
      success: true,
      data: latestContent || { content: '', createdAt: null }
    });

  } catch (error) {
    console.error('Erreur GET /api/assistant:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' }, 
      { status: 500 }
    );
  }
}

// Middleware de sécurité basique pour les headers
export function middleware() {
  const response = NextResponse.next();
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  return response;
}