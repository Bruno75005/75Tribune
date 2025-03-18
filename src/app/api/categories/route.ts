import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { CategoryService } from '@/services/category.service';
import { Role } from '@prisma/client';
import { ZodError } from 'zod';
import { createCategorySchema, updateCategorySchema } from '@/lib/validations/category';

const categoryService = new CategoryService();

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const activeOnly = searchParams.get('activeOnly') === 'true';
    const tree = searchParams.get('tree') === 'true';

    const categories = tree 
      ? await categoryService.getTree(activeOnly)
      : await categoryService.findAll(activeOnly);
      
    return NextResponse.json(categories);
  } catch (error) {
    console.error('Erreur lors de la récupération des catégories:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des catégories' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || session.user.role !== Role.ADMIN) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 403 }
      );
    }

    const data = await request.json();
    
    try {
      const validatedData = createCategorySchema.parse(data);
      const category = await categoryService.create(validatedData);
      return NextResponse.json(category, { status: 201 });
    } catch (error) {
      if (error instanceof ZodError) {
        return NextResponse.json(
          { error: 'Données invalides', details: error.errors },
          { status: 400 }
        );
      }
      throw error;
    }
  } catch (error) {
    console.error('Erreur lors de la création de la catégorie:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la création de la catégorie' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || session.user.role !== Role.ADMIN) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 403 }
      );
    }

    const data = await request.json();
    
    try {
      const validatedData = updateCategorySchema.parse(data);
      const category = await categoryService.update(validatedData);
      return NextResponse.json(category);
    } catch (error) {
      if (error instanceof ZodError) {
        return NextResponse.json(
          { error: 'Données invalides', details: error.errors },
          { status: 400 }
        );
      }
      throw error;
    }
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la catégorie:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour de la catégorie' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || session.user.role !== Role.ADMIN) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 403 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'ID de catégorie manquant' },
        { status: 400 }
      );
    }

    await categoryService.delete(id);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Erreur lors de la suppression de la catégorie:', error);
    if (error instanceof Error && error.message === 'Cannot delete category with articles or subcategories') {
      return NextResponse.json(
        { error: 'Impossible de supprimer une catégorie contenant des articles ou des sous-catégories' },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Erreur lors de la suppression de la catégorie' },
      { status: 500 }
    );
  }
}
