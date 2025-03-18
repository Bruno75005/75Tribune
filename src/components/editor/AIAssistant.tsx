import { useState } from 'react';
import { Sparkles, Loader2, BookOpen, BookmarkCheck } from 'lucide-react';

interface AIAssistantProps {
  onSuggestion: (content: string) => void;
}

const AI_MODELS = [
  { value: 'codellama:latest', label: 'Code Llama (Latest)' },
  { value: 'codellama:13b', label: 'Code Llama (13B)' },
  { value: 'qwen2.5-coder:14b', label: 'Qwen 2.5 Coder (14B)' },
  { value: 'mixtral:8x7b', label: 'Mixtral 8x7B' },
  { value: 'qwen2.5:7b', label: 'Qwen 2.5 (7B)' },
  { value: 'llama3:latest', label: 'LLaMA 3 (Latest)' },
  { value: 'llama3.2:latest', label: 'LLaMA 3.2 (Latest)' },
  { value: 'llava:34b', label: 'LLaVA 34B' },
  { value: 'deepseek-r1:14b', label: 'DeepSeek R1 (14B)' },
  { value: 'nomic-embed-text:latest', label: 'Nomic Embed Text' }
];
const TONES = [
  { value: 'professional', label: 'Professionnel' },
  { value: 'friendly', label: 'Amical' },
  { value: 'informative', label: 'Informatif' },
  { value: 'humorous', label: 'Humoristique' },
  { value: 'motivational', label: 'Motivant' },
  { value: 'empathetic', label: 'Empathique' },
  { value: 'direct', label: 'Direct' },
  { value: 'creative', label: 'Créatif' },
  { value: 'serious', label: 'Sérieux' },
  { value: 'optimistic', label: 'Optimiste' },
  { value: 'enthusiastic', label: 'Enthousiaste' },
  { value: 'persuasive', label: 'Persuasif' },
  { value: 'neutral', label: 'Neutre' },
  { value: 'strict', label: 'Sévère' },
  { value: 'sincere', label: 'Sincère' },
  { value: 'technical', label: 'Technique' },
  { value: 'academic', label: 'Académique' },
];

export default function AIAssistant({ onSuggestion }: AIAssistantProps) {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState('llama3.1:8b');
  const [selectedTone, setSelectedTone] = useState('professional');

  const generateContent = async (customPrompt?: string) => {
    const finalPrompt = customPrompt || prompt;
    if (!finalPrompt.trim()) return;
    
    setLoading(true);
    try {
      const response = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          prompt: finalPrompt,
          model: selectedModel,
          tone: selectedTone,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        onSuggestion(data.content);
        setPrompt('');
      } else {
        console.error('Erreur de génération:', data.error);
      }
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const quickActions = [
    {
      icon: BookOpen,
      label: "Introduction",
      prompt: "Générer une introduction captivante pour cet article qui présente le sujet et donne envie de lire la suite.",
    },
    {
      icon: BookmarkCheck,
      label: "Conclusion",
      prompt: "Générer une conclusion qui résume les points clés de l'article et ouvre sur une réflexion ou une action.",
    },
  ];

  return (
    <div className="space-y-4 p-4 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border rounded-lg">
      <div className="flex gap-4 mb-4">
        <div className="flex-1">
          <label htmlFor="model" className="block text-sm font-medium text-foreground/60 mb-1">
            Modèle IA
          </label>
          <select
            id="model"
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value)}
            className="w-full px-3 py-2 bg-background border rounded-md text-sm"
          >
            {AI_MODELS.map((model) => (
              <option key={model.value} value={model.value}>
                {model.label}
              </option>
            ))}
          </select>
        </div>
        <div className="flex-1">
          <label htmlFor="tone" className="block text-sm font-medium text-foreground/60 mb-1">
            Ton
          </label>
          <select
            id="tone"
            value={selectedTone}
            onChange={(e) => setSelectedTone(e.target.value)}
            className="w-full px-3 py-2 bg-background border rounded-md text-sm"
          >
            {TONES.map((tone) => (
              <option key={tone.value} value={tone.value}>
                {tone.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex gap-2 flex-wrap">
        {quickActions.map((action) => (
          <button
            key={action.label}
            onClick={() => generateContent(action.prompt)}
            className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary/10 hover:bg-primary/20 text-primary text-sm rounded-md transition-colors"
            disabled={loading}
          >
            <action.icon className="w-4 h-4" />
            {action.label}
          </button>
        ))}
      </div>

      <div className="flex gap-2">
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Décrivez ce que vous souhaitez générer..."
          className="flex-1 min-h-[100px] px-3 py-2 bg-background border rounded-md text-sm resize-none"
          disabled={loading}
        />
        <button
          onClick={() => generateContent()}
          disabled={loading || !prompt.trim()}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Sparkles className="w-4 h-4" />
          )}
          Générer
        </button>
      </div>
    </div>
  );
}
