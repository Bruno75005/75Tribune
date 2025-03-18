import { NextResponse } from 'next/server';

function formatContent(content: string): string {
  // Nettoyer le contenu initial
  let formattedContent = content.trim();

  // Forcer les points à être suivis d'un double saut de ligne pour créer des paragraphes
  formattedContent = formattedContent.replace(/\.\s+/g, '.\n\n');
  formattedContent = formattedContent.replace(/!\s+/g, '!\n\n');
  formattedContent = formattedContent.replace(/\?\s+/g, '?\n\n');

  // Séparer en paragraphes
  const paragraphs = formattedContent
    .split(/\n\n+/)
    .map(p => p.trim())
    .filter(p => p.length > 0);

  // Traiter chaque paragraphe
  const processedParagraphs = paragraphs.map(paragraph => {
    // Vérifier si c'est une liste
    if (paragraph.includes('\n-') || paragraph.startsWith('-')) {
      const items = paragraph
        .split(/\n-/)
        .map(item => item.trim())
        .filter(item => item.length > 0)
        .map(item => `<li>${item}</li>`)
        .join('');
      return `<ul class="list-disc list-inside my-4">${items}</ul>`;
    }

    // Vérifier si c'est un titre
    if (paragraph.startsWith('#')) {
      const matches = paragraph.match(/^#+/);
      if (!matches) return `<p class="my-4">${paragraph}</p>`;
      const level = Math.min(matches[0].length, 6);
      const text = paragraph.replace(/^#+\s*/, '');
      const classes = level === 1 ? 'text-3xl font-bold my-6' :
                     level === 2 ? 'text-2xl font-bold my-5' :
                     'text-xl font-bold my-4';
      return `<h${level} class="${classes}">${text}</h${level}>`;
    }

    // Traiter le texte du paragraphe
    let processedText = paragraph
      // Gras
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      // Italique
      .replace(/\*(.*?)\*/g, '<em>$1</em>');

    // Retourner le paragraphe avec espacement
    return `<p class="my-4 leading-relaxed">${processedText}</p>`;
  });

  // Joindre tous les éléments avec des sauts de ligne
  return processedParagraphs.join('\n');
}

export async function POST(request: Request) {
  try {
    const { model, prompt, tone, context } = await request.json();

    const fullPrompt = `
      Ton: ${tone}
      Contexte: ${context}
      
      Instructions de formatage:
      - Termine chaque phrase par un point suivi d'un retour à la ligne
      - Utilise des paragraphes courts (2-3 phrases)
      - Commence les nouveaux paragraphes par un double retour à la ligne
      - Utilise des titres avec # pour les sections principales
      - Utilise des listes avec - pour énumérer des points
      - Mets en **gras** les points importants
      - Utilise l'*italique* pour l'emphase
      
      ${prompt}
    `;

    const ollamaResponse = await fetch('http://localhost:11434/api/generate', {
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

    if (!ollamaResponse.ok) {
      throw new Error('Erreur lors de la communication avec Ollama');
    }

    const data = await ollamaResponse.json();
    const formattedContent = formatContent(data.response);

    return NextResponse.json({
      content: formattedContent,
    });
  } catch (error) {
    console.error('Erreur API Ollama:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la génération du contenu' },
      { status: 500 }
    );
  }
}
