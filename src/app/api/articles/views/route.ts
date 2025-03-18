import { NextResponse } from 'next/server';
import { ArticleService } from '@/services/article.service';
import { ArticleViewService } from '@/services/articleView.service';
import { headers } from 'next/headers';

export async function POST(request: Request) {
  try {
    const { articleId, userId } = await request.json();
    const headersList = headers();
    const ip = headersList.get('x-forwarded-for') || headersList.get('x-real-ip');

    if (!articleId) {
      return NextResponse.json({ error: 'Article ID requis' }, { status: 400 });
    }

    // Enregistrer la vue directement avec l'ID
    await ArticleViewService.addView(articleId, userId, ip || undefined);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erreur lors de l\'enregistrement de la vue:', error);
    return NextResponse.json(
      { error: 'Erreur lors de l\'enregistrement de la vue' },
      { status: 500 }
    );
  }
}
