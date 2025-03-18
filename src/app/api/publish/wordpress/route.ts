import { NextResponse } from 'next/server';
import { WordPressPublisher } from '@/services/publishers/WordPressPublisher';

export async function POST(request: Request) {
  try {
    const data = await request.json();
    console.log("📤 Publication sur WordPress avec les données :", data);

    // Publier l'article sur WordPress
    const publisher = new WordPressPublisher();
    const result = await publisher.publish(data);

    if (!result.success) {
      console.error("❌ Erreur WordPress :", result.error);
      throw new Error(result.error);
    }

    console.log(`✅ Article publié avec succès sur WordPress : ${result.url}`);
    return NextResponse.json({ url: result.url });

  } catch (error) {
    console.error('❌ Erreur lors de la publication sur WordPress:', error);
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Erreur serveur' }, { status: 500 });
  }
}
