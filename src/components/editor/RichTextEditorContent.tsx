import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import { CodeBlockLowlight } from '@tiptap/extension-code-block-lowlight';
import { common, createLowlight } from 'lowlight';
import { Copy, Check } from 'lucide-react';
import TextAlign from '@tiptap/extension-text-align';
import Placeholder from '@tiptap/extension-placeholder';
import Typography from '@tiptap/extension-typography';
import Highlight from '@tiptap/extension-highlight';
import Color from '@tiptap/extension-color';
import TextStyle from '@tiptap/extension-text-style';
import Underline from '@tiptap/extension-underline';
import Superscript from '@tiptap/extension-superscript';
import Subscript from '@tiptap/extension-subscript';
import Table from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';

import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Quote,
  Link as LinkIcon,
  Image as ImageIcon,
  Code,
  Undo,
  Redo,
  Sparkles,
  Loader2,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Underline as UnderlineIcon,
  Table as TableIcon,
} from 'lucide-react';
import {
  useState, useEffect, useCallback
} from 'react';

interface RichTextEditorProps {
  value: string;
  onChange: (content: string) => void;
}

const AI_MODELS = [
  { id: 'codellama:latest', name: 'Code Llama (Latest)' },
  { id: 'codellama:13b', name: 'Code Llama (13B)' },
  { id: 'qwen2.5-coder:14b', name: 'Qwen 2.5 Coder (14B)' },
  { id: 'mixtral:8x7b', name: 'Mixtral 8x7B' },
  { id: 'qwen2.5:7b', name: 'Qwen 2.5 (7B)' },
  { id: 'llama3:latest', name: 'LLaMA 3 (Latest)' },
  { id: 'llama3.2:latest', name: 'LLaMA 3.2 (Latest)' },
  { id: 'llava:34b', name: 'LLaVA 34B' },
  { id: 'deepseek-r1:14b', name: 'DeepSeek R1 (14B)' },
  { id: 'nomic-embed-text:latest', name: 'Nomic Embed Text' }
];

const TONES = [
  { id: 'professional', name: 'Professionnel' },
  { id: 'friendly', name: 'Amical' },
  { id: 'informative', name: 'Informatif' },
  { id: 'humorous', name: 'Humoristique' },
  { id: 'motivational', name: 'Motivant' },
  { id: 'empathetic', name: 'Empathique' },
  { id: 'direct', name: 'Direct' },
  { id: 'creative', name: 'Créatif' },
  { id: 'serious', name: 'Sérieux' },
  { id: 'optimistic', name: 'Optimiste' },
  { id: 'enthusiastic', name: 'Enthousiaste' },
  { id: 'persuasive', name: 'Persuasif' },
  { id: 'neutral', name: 'Neutre' },
  { id: 'strict', name: 'Sévère' },
  { id: 'sincere', name: 'Sincère' },
  { id: 'romantic', name: 'Romantique' },
  { id: 'poetic', name: 'Poétique' },
  { id: 'playful', name: 'Ludique' },
  { id: 'inspiring', name: 'Inspirant' },
  { id: 'ironic', name: 'Ironique' },
  { id: 'sarcastic', name: 'Sarcastique' },
  { id: 'mysterious', name: 'Mystérieux' },
  { id: 'nostalgic', name: 'Nostalgique' },
  { id: 'authoritative', name: 'Autoritaire' },
  { id: 'benevolent', name: 'Bienveillant' },
  { id: 'academic', name: 'Académique' },
  { id: 'technical', name: 'Technique' },
  { id: 'exaggerated', name: 'Exagéré' },
  { id: 'provocative', name: 'Provocateur' },
  { id: 'thoughtful', name: 'Réfléchi' },
];

// Liste des langages supportés par Prism
const SUPPORTED_LANGUAGES = {
  markup: 'HTML',
  html: 'HTML',
  xml: 'XML',
  svg: 'SVG',
  mathml: 'MathML',
  ssml: 'SSML',
  atom: 'ATOM',
  rss: 'RSS',
  css: 'CSS',
  clike: 'C-like',
  javascript: 'JavaScript',
  js: 'JavaScript',
  jsx: 'JSX',
  typescript: 'TypeScript',
  ts: 'TypeScript',
  tsx: 'TSX',
  php: 'PHP',
  python: 'Python',
  py: 'Python',
  ruby: 'Ruby',
  rb: 'Ruby',
  go: 'Go',
  rust: 'Rust',
  sql: 'SQL',
  bash: 'Bash',
  shell: 'Shell',
  json: 'JSON',
  yaml: 'YAML',
  yml: 'YAML',
  markdown: 'Markdown',
  md: 'Markdown',
} as const;

// Fonction pour normaliser le langage
function normalizeLanguage(lang: string): string {
  // Enlever le préfixe 'language-' s'il existe
  const cleanLang = lang.replace(/^language-/, '').toLowerCase();
  
  // Correspondances spécifiques
  const languageMap: { [key: string]: string } = {
    js: 'javascript',
    py: 'python',
    rb: 'ruby',
    ts: 'typescript',
    yml: 'yaml',
    md: 'markdown',
    html: 'markup',
    xml: 'markup',
    svg: 'markup',
    mathml: 'markup',
    ssml: 'markup',
    atom: 'markup',
    rss: 'markup'
  };

  return languageMap[cleanLang] || cleanLang;
}

// Extension personnalisée pour les blocs de code
const lowlight = createLowlight(common);

const CustomCodeBlock = CodeBlockLowlight.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      language: {
        default: 'text',
        parseHTML: element => {
          // Essayer de détecter le langage à partir de la classe
          const codeElement = element.querySelector('code');
          if (codeElement) {
            const classes = codeElement.className.split(' ');
            for (const cls of classes) {
              if (cls.startsWith('language-')) {
                const lang = cls.replace('language-', '');
                const normalizedLang = normalizeLanguage(lang);
                return normalizedLang;
              }
            }
          }
          
          // Si aucun langage n'est spécifié, essayer de détecter à partir du contenu
          const content = element.textContent || '';
          
          // Détection basée sur le contenu
          if (content.includes('def ') || content.includes('import ') || content.match(/:\s*$/m)) {
            return 'python';
          }
          if (content.includes('function ') || content.includes('const ') || content.includes('let ') || content.match(/=>/)) {
            return 'javascript';
          }
          if (content.includes('interface ') || content.includes('type ') || content.includes(': ')) {
            return 'typescript';
          }
          if (content.match(/<\/?[a-z][\s\S]*>/i)) {
            return 'html';
          }
          if (content.includes('SELECT ') || content.includes('FROM ') || content.includes('WHERE ')) {
            return 'sql';
          }
          if (content.match(/^[\s\S]*\{[\s\S]*\}[\s\S]*$/)) {
            return 'json';
          }
          if (content.startsWith('<?php')) {
            return 'php';
          }
          
          return 'text';
        },
        renderHTML: attributes => {
          return {
            'data-language': attributes.language,
          };
        },
      },
    };
  },
  addNodeView() {
    return ({ node, editor }) => {
      const container = document.createElement('div');
      container.className = 'not-prose my-8 overflow-hidden rounded-lg border border-gray-700 dark:bg-gray-900';

      // En-tête avec le nom du langage et le bouton copier
      const header = document.createElement('div');
      header.className = 'flex items-center justify-between px-4 py-2 text-xs text-gray-400 border-b border-gray-700';
      
      const lang = node.attrs.language || 'text';
      const normalizedLang = normalizeLanguage(lang);
      const displayLang = SUPPORTED_LANGUAGES[normalizedLang as keyof typeof SUPPORTED_LANGUAGES] || lang.toUpperCase();
      
      // Affichage du langage
      const langDisplay = document.createElement('span');
      langDisplay.className = 'font-mono';
      langDisplay.textContent = displayLang;
      header.appendChild(langDisplay);

      // Bouton de copie
      const copyButton = document.createElement('button');
      copyButton.className = 'flex items-center gap-1 px-2 py-1 rounded hover:bg-gray-700 dark:hover:bg-gray-800 transition-colors';
      copyButton.title = 'Copier le code';
      copyButton.innerHTML = '<svg class="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M8 4H6a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2v-2M8 4v12a2 2 0 002 2h8a2 2 0 002-2V8l-6-4H8z"/></svg><span>Copier</span>';
      
      copyButton.addEventListener('click', () => {
        const code = node.textContent;
        navigator.clipboard.writeText(code).then(() => {
          copyButton.innerHTML = '<svg class="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 6L9 17l-5-5"/></svg><span>Copié!</span>';
          setTimeout(() => {
            copyButton.innerHTML = '<svg class="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M8 4H6a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2v-2M8 4v12a2 2 0 002 2h8a2 2 0 002-2V8l-6-4H8z"/></svg><span>Copier</span>';
          }, 2000);
        });
      });
      
      header.appendChild(copyButton);
      container.appendChild(header);

      // Bloc de code
      const pre = document.createElement('pre');
      pre.className = 'p-4 text-sm overflow-x-auto';
      pre.style.margin = '0';
      container.appendChild(pre);

      return {
        dom: container,
        contentDOM: pre,
        update: (updatedNode) => {
          if (updatedNode.type !== node.type) return false;
          
          // Mettre à jour le langage affiché si nécessaire
          const updatedLang = updatedNode.attrs.language || 'text';
          const updatedNormalizedLang = normalizeLanguage(updatedLang);
          const updatedDisplayLang = SUPPORTED_LANGUAGES[updatedNormalizedLang as keyof typeof SUPPORTED_LANGUAGES] || updatedLang.toUpperCase();
          langDisplay.textContent = updatedDisplayLang;
          
          return true;
        },
      };
    };
  },
});

export default function RichTextEditorContent({ value, onChange }: RichTextEditorProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [selectedModel, setSelectedModel] = useState('mistral');
  const [selectedTone, setSelectedTone] = useState('professional');
  const [showAIOptions, setShowAIOptions] = useState(false);
  const [showFormatOptions, setShowFormatOptions] = useState(false);
  const [selectedTextSize, setSelectedTextSize] = useState('normal');
  const [selectedAlignment, setSelectedAlignment] = useState('left');
  const [selectedSpacing, setSelectedSpacing] = useState('normal');

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3]
        },
        codeBlock: false
      }),
      Image.configure({
        allowBase64: true,
        HTMLAttributes: {
          class: 'rounded-lg max-w-full h-auto'
        }
      }),
      Link.configure({
        HTMLAttributes: {
          class: 'text-blue-500 hover:text-blue-700 underline',
          target: '_blank'
        },
        openOnClick: false
      }),
      CustomCodeBlock.configure({
        lowlight,
        HTMLAttributes: {
          class: 'not-prose'
        }
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
        alignments: ['left', 'center', 'right', 'justify'],
      }),
      Placeholder.configure({
        placeholder: 'Commencez à écrire...',
      }),
      Typography,
      Highlight.configure({
        multicolor: true,
      }),
      Color.configure({
        types: ['textStyle'],
      }),
      TextStyle,
      Underline,
      Superscript,
      Subscript,
      Table.configure({
        resizable: true,
        HTMLAttributes: {
          class: 'border-collapse table-auto w-full',
        },
      }),
      TableRow,
      TableCell,
      TableHeader,
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-xl dark:prose-invert focus:outline-none max-w-none min-h-[200px] p-4'
      }
    },
  });

  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value);
    }
  }, [editor, value]);

  const setLink = () => {
    const previousUrl = editor?.getAttributes('link').href;
    const url = window.prompt('URL', previousUrl);

    if (url === null) {
      return;
    }

    if (url === '') {
      editor?.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }

    editor?.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  };

  const addImage = () => {
    const url = window.prompt('URL');
    if (url) {
      editor?.chain().focus().setImage({ src: url }).run();
    }
  };

  const addTable = () => {
    editor?.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
  };

  const addCodeBlock = () => {
    const language = window.prompt('Langage (javascript, python, etc...)', 'javascript');
    if (language) {
      editor?.chain().focus().toggleCodeBlock({ language }).run();
    }
  };

  const sizeStyles = {
    small: { fontSize: '14px' },
    normal: { fontSize: '16px' },
    large: { fontSize: '18px' },
    xlarge: { fontSize: '20px' }
  };

  const spacingStyles = {
    tight: { lineHeight: '1.25' },
    normal: { lineHeight: '1.5' },
    relaxed: { lineHeight: '1.75' },
    loose: { lineHeight: '2' }
  };

  const applyFormatting = (type: string, value: string) => {
    if (!editor) return;

    switch (type) {
      case 'size':
        const fontSize = sizeStyles[value as keyof typeof sizeStyles].fontSize;
        editor.chain().focus()
          .unsetMark('textStyle')
          .run();
        editor.chain().focus()
          .setMark('textStyle', { fontSize })
          .run();
        setSelectedTextSize(value);
        break;

      case 'alignment':
        editor.chain().focus().setTextAlign(value as 'left' | 'center' | 'right' | 'justify').run();
        setSelectedAlignment(value);
        break;

      case 'spacing':
        const lineHeight = spacingStyles[value as keyof typeof spacingStyles].lineHeight;
        editor.chain().focus()
          .unsetMark('textStyle')
          .run();
        editor.chain().focus()
          .setMark('textStyle', { lineHeight })
          .run();
        setSelectedSpacing(value);
        break;
    }
  };

  const handleAISuggestion = async () => {
    if (!prompt.trim() || !editor) return;

    setIsLoading(true);
    try {
      const response = await fetch('/api/ollama', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: selectedModel,
          prompt: prompt,
          tone: selectedTone,
          context: editor.getHTML(),
        }),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la génération');
      }

      const data = await response.json();
      
      if (data.content) {
        // Créer une transaction pour l'insertion
        editor.chain()
          .focus()
          .insertContent(data.content)
          .run();
        
        // Afficher les options de mise en page
        setShowFormatOptions(true);
      }
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setIsLoading(false);
      setPrompt('');
      setShowAIOptions(false);
    }
  };

  const renderFormatOptions = () => {
    if (!showFormatOptions) return null;

    return (
      <div className="flex flex-wrap gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-md shadow-sm">
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Taille du texte
          </label>
          <select
            value={selectedTextSize}
            onChange={(e) => applyFormatting('size', e.target.value)}
            className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white sm:text-sm"
          >
            <option value="small">Petit</option>
            <option value="normal">Normal</option>
            <option value="large">Grand</option>
            <option value="xlarge">Très grand</option>
          </select>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Alignement
          </label>
          <select
            value={selectedAlignment}
            onChange={(e) => applyFormatting('alignment', e.target.value)}
            className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white sm:text-sm"
          >
            <option value="left">Gauche</option>
            <option value="center">Centre</option>
            <option value="right">Droite</option>
            <option value="justify">Justifié</option>
          </select>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Espacement
          </label>
          <select
            value={selectedSpacing}
            onChange={(e) => applyFormatting('spacing', e.target.value)}
            className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white sm:text-sm"
          >
            <option value="tight">Serré</option>
            <option value="normal">Normal</option>
            <option value="relaxed">Détendu</option>
            <option value="loose">Large</option>
          </select>
        </div>
      </div>
    );
  };

  if (!editor) {
    return null;
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Que souhaitez-vous générer ?"
            className="flex-1 px-4 py-3 text-base border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white transition-colors duration-200"
          />
          <button
            type="button"
            onClick={() => setShowAIOptions(!showAIOptions)}
            className="inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-md text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-800 transition-colors duration-200"
          >
            {showAIOptions ? 'Masquer les options' : 'Afficher les options'}
          </button>
          <button
            type="button"
            onClick={handleAISuggestion}
            disabled={isLoading || !prompt.trim()}
            className={`inline-flex items-center px-6 py-3 text-base font-medium rounded-md text-white ${
              isLoading || !prompt.trim()
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
            } transition-colors duration-200`}
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeWidth="2"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                Génération en cours...
              </>
            ) : (
              'Générer'
            )}
          </button>
        </div>

        {showAIOptions && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50/50 dark:bg-gray-800/50 rounded-md border border-gray-100 dark:border-gray-700/50 backdrop-blur-sm">
            <div>
              <label htmlFor="model" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Modèle
              </label>
              <select
                id="model"
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 sm:text-sm rounded-md transition-colors duration-200"
              >
                {AI_MODELS.map((model) => (
                  <option key={model.id} value={model.id} className="dark:bg-gray-700">
                    {model.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="tone" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Ton
              </label>
              <select
                id="tone"
                value={selectedTone}
                onChange={(e) => setSelectedTone(e.target.value)}
                className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 sm:text-sm rounded-md transition-colors duration-200"
              >
                {TONES.map((tone) => (
                  <option key={tone.id} value={tone.id} className="dark:bg-gray-700">
                    {tone.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {renderFormatOptions()}
      </div>

      <div className="border rounded-lg p-4">
        <div className="border-b border-gray-200 p-2 mb-4 flex flex-wrap gap-2">
          {/* Styles de texte basiques */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleBold().run()}
              className={`p-2 rounded hover:bg-gray-100 ${
                editor.isActive('bold') ? 'bg-gray-100' : ''
              }`}
              title="Gras (Ctrl+B)"
            >
              <Bold className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleItalic().run()}
              className={`p-2 rounded hover:bg-gray-100 ${
                editor.isActive('italic') ? 'bg-gray-100' : ''
              }`}
              title="Italique (Ctrl+I)"
            >
              <Italic className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleUnderline().run()}
              className={`p-2 rounded hover:bg-gray-100 ${
                editor.isActive('underline') ? 'bg-gray-100' : ''
              }`}
              title="Souligné (Ctrl+U)"
            >
              <UnderlineIcon className="w-5 h-5" />
            </button>
          </div>

          <div className="w-px h-6 bg-gray-200" />

          {/* Alignement */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => editor.chain().focus().setTextAlign('left').run()}
              className={`p-2 rounded hover:bg-gray-100 ${
                editor.isActive({ textAlign: 'left' }) ? 'bg-gray-100' : ''
              }`}
              title="Aligner à gauche"
            >
              <AlignLeft className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().setTextAlign('center').run()}
              className={`p-2 rounded hover:bg-gray-100 ${
                editor.isActive({ textAlign: 'center' }) ? 'bg-gray-100' : ''
              }`}
              title="Centrer"
            >
              <AlignCenter className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().setTextAlign('right').run()}
              className={`p-2 rounded hover:bg-gray-100 ${
                editor.isActive({ textAlign: 'right' }) ? 'bg-gray-100' : ''
              }`}
              title="Aligner à droite"
            >
              <AlignRight className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().setTextAlign('justify').run()}
              className={`p-2 rounded hover:bg-gray-100 ${
                editor.isActive({ textAlign: 'justify' }) ? 'bg-gray-100' : ''
              }`}
              title="Justifier"
            >
              <AlignJustify className="w-5 h-5" />
            </button>
          </div>

          <div className="w-px h-6 bg-gray-200" />

          {/* Listes */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              className={`p-2 rounded hover:bg-gray-100 ${
                editor.isActive('bulletList') ? 'bg-gray-100' : ''
              }`}
              title="Liste à puces"
            >
              <List className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
              className={`p-2 rounded hover:bg-gray-100 ${
                editor.isActive('orderedList') ? 'bg-gray-100' : ''
              }`}
              title="Liste numérotée"
            >
              <ListOrdered className="w-5 h-5" />
            </button>
          </div>

          <div className="w-px h-6 bg-gray-200" />

          {/* Éléments spéciaux */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleBlockquote().run()}
              className={`p-2 rounded hover:bg-gray-100 ${
                editor.isActive('blockquote') ? 'bg-gray-100' : ''
              }`}
              title="Citation"
            >
              <Quote className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={setLink}
              className={`p-2 rounded hover:bg-gray-100 ${
                editor.isActive('link') ? 'bg-gray-100' : ''
              }`}
              title="Lien"
            >
              <LinkIcon className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={addImage}
              className="p-2 rounded hover:bg-gray-100"
              title="Image"
            >
              <ImageIcon className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={addTable}
              className={`p-2 rounded hover:bg-gray-100 ${
                editor.isActive('table') ? 'bg-gray-100' : ''
              }`}
              title="Tableau"
            >
              <TableIcon className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={addCodeBlock}
              className={`p-2 rounded hover:bg-gray-100 ${
                editor.isActive('codeBlock') ? 'bg-gray-100' : ''
              }`}
              title="Bloc de code"
            >
              <Code className="w-5 h-5" />
            </button>
          </div>

          <div className="w-px h-6 bg-gray-200" />

          {/* Annuler/Rétablir */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => editor.chain().focus().undo().run()}
              disabled={!editor.can().undo()}
              className="p-2 rounded hover:bg-gray-100 disabled:opacity-50"
              title="Annuler (Ctrl+Z)"
            >
              <Undo className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().redo().run()}
              disabled={!editor.can().redo()}
              className="p-2 rounded hover:bg-gray-100 disabled:opacity-50"
              title="Rétablir (Ctrl+Y)"
            >
              <Redo className="w-5 h-5" />
            </button>
          </div>
        </div>

        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
