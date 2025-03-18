'use client';

import { useState, useCallback } from 'react';
import { Copy, Check } from 'lucide-react';
import { Highlight, themes } from 'prism-react-renderer';

interface CodeBlockProps {
  code: string;
  language?: string;
  className?: string; // Ajout de la prop className
}

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
    rss: 'markup',
  };

  return languageMap[cleanLang] || cleanLang;
}

export default function CodeBlock({ code, language = 'text', className = '' }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  }, [code]);

  const normalizedLang = normalizeLanguage(language);
  const displayLang = SUPPORTED_LANGUAGES[normalizedLang as keyof typeof SUPPORTED_LANGUAGES] || language.toUpperCase();

  return (
    <div className={`not-prose my-8 overflow-hidden rounded-lg border border-lightBorder dark:border-darkBorder bg-lightCard dark:bg-darkCard neumorphic-light dark:neumorphic ${className}`}>
      {/* En-tête avec le nom du langage et le bouton copier */}
      <div className="flex items-center justify-between px-4 py-2 text-xs text-mutedLight:foreground dark:text-muted:foreground border-b border-lightBorder dark:border-darkBorder">
        <span className="font-mono">{displayLang}</span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 px-2 py-1 rounded hover:bg-lightCard/50 dark:hover:bg-darkCard/50 transition-colors"
          title="Copier le code"
        >
          {copied ? (
            <>
              <Check className="w-3 h-3 text-primary" />
              <span>Copié!</span>
            </>
          ) : (
            <>
              <Copy className="w-3 h-3 text-primary" />
              <span>Copier</span>
            </>
          )}
        </button>
      </div>

      {/* Bloc de code avec coloration syntaxique */}
      <Highlight
        theme={themes.nightOwl} // Garde ce thème, mais tu peux en choisir un autre si tu veux
        code={code.trim()}
        language={normalizedLang}
      >
        {({ className, style, tokens, getLineProps, getTokenProps }) => (
          <pre
            className="p-4 text-sm overflow-x-auto text-lightText dark:text-darkText"
            style={{
              ...style,
              margin: 0, // Supprime la marge par défaut des <pre>
            }}
          >
            {tokens.map((line, i) => (
              <div key={i} {...getLineProps({ line })} style={{ minWidth: 'fit-content' }}>
                {line.map((token, key) => (
                  <span key={key} {...getTokenProps({ token })} />
                ))}
              </div>
            ))}
          </pre>
        )}
      </Highlight>
    </div>
  );
}