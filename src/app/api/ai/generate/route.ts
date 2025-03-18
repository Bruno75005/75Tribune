import { NextResponse } from 'next/server';

const PROMPT_TEMPLATES = {
  introduction: `En tant qu'expert en rédaction, génère une introduction captivante pour cet article. L'introduction doit :
1. Accrocher le lecteur dès les premières lignes
2. Présenter clairement le sujet et son importance
3. Donner un aperçu des points qui seront abordés
4. Utiliser le ton spécifié
5. Ne pas dépasser 3-4 phrases

Sujet de l'article : `,

  conclusion: `En tant qu'expert en rédaction, génère une conclusion efficace et mémorable pour cet article. La conclusion doit :
1. Résumer les points clés de manière concise
2. Offrir une réflexion finale pertinente
3. Se terminer par un appel à l'action ou une ouverture
4. Utiliser le ton spécifié
5. Ne pas dépasser 3-4 phrases

Points clés de l'article : `,

  title: `En tant qu'expert en rédaction, propose un TITRE percutant pour cet article. Le titre doit :
1. Être court, clair et accrocheur
2. Faire comprendre directement le thème
3. Employer le ton spécifié
4. Ne pas dépasser 80 caractères

Contenu de l'article ou sujet : `
};

const TONE_INSTRUCTIONS = {
  professional: "Adopte un ton professionnel, formel et expert.",
  friendly: "Utilise un ton amical, chaleureux et accessible.",
  informative: "Garde un ton informatif, clair et pédagogique.",
  humorous: "Ajoute une touche d'humour léger et approprié.",
  motivational: "Emploie un ton motivant et encourageant.",
  empathetic: "Montre de l'empathie et de la compréhension.",
  direct: "Va droit au but avec un ton direct et concis.",
  creative: "Sois créatif et original dans ton approche.",
  serious: "Maintiens un ton sérieux et posé.",
  optimistic: "Adopte un ton optimiste et positif.",
  enthusiastic: "Montre de l'enthousiasme et de la passion.",
  persuasive: "Utilise un ton persuasif et convaincant.",
  neutral: "Reste neutre et objectif.",
  strict: "Adopte un ton strict et rigoureux.",
  sincere: "Sois sincère et authentique.",
  technical: "Utilise un ton technique et précis.",
  academic: "Adopte un style académique et savant."
};

export async function POST(request: Request) {
  try {
    // On récupère le JSON envoyé par le client
    const { prompt, model = 'mistral', tone = 'professional' } = await request.json();

    if (!prompt) {
      return NextResponse.json(
        { error: 'Aucun prompt fourni' },
        { status: 400 }
      );
    }

    // 1) Choix du ton (ou fallback sur "professional" si invalide)
    const toneInstruction = TONE_INSTRUCTIONS[tone as keyof typeof TONE_INSTRUCTIONS]
      || TONE_INSTRUCTIONS.professional;

    // 2) Déterminer s’il s’agit d’une demande "introduction", "conclusion" ou "title"
    //    => On adapte le template en fonction des mots-clés détectés.
    let finalPrompt = prompt;
    const promptLower = prompt.toLowerCase();

    if (promptLower.includes('introduction')) {
      finalPrompt = PROMPT_TEMPLATES.introduction + prompt;
    } else if (promptLower.includes('conclusion')) {
      finalPrompt = PROMPT_TEMPLATES.conclusion + prompt;
    } else if (promptLower.includes('title') || promptLower.includes('titre')) {
      finalPrompt = PROMPT_TEMPLATES.title + prompt;
    }

    // 3) Ajouter l’instruction de ton en en-tête
    finalPrompt = `${toneInstruction}\n\n${finalPrompt}`;

    // 4) Appel Ollama
    const response = await fetch('http://localhost:11434/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: model,
        prompt: finalPrompt,
        stream: false,
        options: {
          temperature: 0.7,
          top_p: 0.9,
          top_k: 40,
          max_tokens: 300
        }
      })
    });

    if (!response.ok) {
      const error = await response.json();
      return NextResponse.json({ error: error.message }, { status: response.status });
    }

    // 5) Renvoyer la réponse d’Ollama (data.response)
    const data = await response.json();
    return NextResponse.json({ content: data.response });
  } catch (error) {
    console.error('Erreur de génération:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erreur lors de la génération' },
      { status: 500 }
    );
  }
}
