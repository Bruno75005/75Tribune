import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { prompt, model, tone } = await request.json();

    if (!prompt || !model || !tone) {
      return NextResponse.json(
        { error: 'Prompt, model et tone sont requis' },
        { status: 400 }
      );
    }

    // Construire le prompt avec le ton demandé
    const fullPrompt = `En utilisant un ton ${tone}, ${prompt}`;

    // Appeler l'API Ollama
    const response = await fetch('http://localhost:11434/api/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: model,
        prompt: fullPrompt,
        stream: false,
      }),
    });

    if (!response.ok) {
      throw new Error('Erreur lors de l\'appel à Ollama');
    }

    const data = await response.json();
    
    return NextResponse.json({
      suggestion: data.response,
    });
  } catch (error) {
    console.error('Erreur AI:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la génération de la suggestion' },
      { status: 500 }
    );
  }
}
