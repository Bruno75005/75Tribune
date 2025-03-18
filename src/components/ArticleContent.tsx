'use client';

import React, { useState, useEffect } from 'react';
import CodeBlock from './CodeBlock';

interface CodeBlockData {
  placeholder: string;
  code: string;
  language: string;
}

// Fonction pour détecter le langage en fonction du contenu
function detectLanguage(code: string): string {
  // Nettoyage du code
  const cleanCode = code.trim();
  
  // Détection Python
  if (
    cleanCode.match(/^(import\s+[\w.]+|from\s+[\w.]+\s+import)/) || // import statements
    cleanCode.match(/^def\s+\w+\s*\(/) || // function definitions
    cleanCode.match(/print\s*\(/) || // print statements
    cleanCode.includes('self.') || // class methods
    cleanCode.match(/(True|False|None)(?![a-zA-Z])/) || // Python literals
    cleanCode.match(/\s{4}[\w]/) // Python indentation
  ) return 'python';

  // Détection PHP
  if (cleanCode.includes('<?php') || cleanCode.match(/^\s*<\?/)) return 'php';

  // Détection HTML
  if (
    cleanCode.match(/^<!DOCTYPE\s+html/i) ||
    cleanCode.match(/^<html/i) ||
    (cleanCode.match(/<[a-z]+.*>/) && cleanCode.match(/<\/[a-z]+>/))
  ) return 'html';

  // Détection CSS
  if (
    cleanCode.match(/^[\w-]+\s*{/) ||
    cleanCode.match(/@media\s+/) ||
    cleanCode.match(/^[.#][a-zA-Z][\w-]*\s*{/)
  ) return 'css';

  // Détection JavaScript
  if (
    cleanCode.match(/^(const|let|var|function|class|import|export)\s/) ||
    cleanCode.match(/=>\s*{/) ||
    cleanCode.match(/\$\(document\)/) ||
    cleanCode.includes('useState(') ||
    cleanCode.includes('useEffect(')
  ) return 'javascript';

  // Détection TypeScript
  if (
    cleanCode.match(/^(interface|type|namespace)\s/) ||
    cleanCode.match(/:\s*(string|number|boolean|any)\s*[,;=]/) ||
    cleanCode.match(/<[A-Z][a-zA-Z]+>/) // Generics
  ) return 'typescript';

  // Détection SQL
  if (
    cleanCode.match(/^(SELECT|INSERT|UPDATE|DELETE|CREATE|ALTER|DROP)\s/i) ||
    cleanCode.match(/\s(FROM|WHERE|JOIN|GROUP BY|ORDER BY|HAVING)\s/i)
  ) return 'sql';

  // Détection JSON
  if (
    cleanCode.match(/^[\s\n]*[{\[][\s\S]*[\}\]][\s\n]*$/) &&
    (cleanCode.includes('"') || cleanCode.includes(':'))
  ) return 'json';

  // Détection YAML
  if (
    cleanCode.match(/^[\s-]*[\w-]+:\s+.+$/m) &&
    !cleanCode.includes('{') &&
    !cleanCode.includes('}')
  ) return 'yaml';

  // Détection Shell/Bash
  if (
    cleanCode.match(/^[#!]\/bin\//) ||
    cleanCode.match(/^\s*\$\s+/) ||
    cleanCode.match(/^(sudo|apt|yum|dnf|brew|npm|yarn|pip)\s/)
  ) return 'bash';

  return 'text';
}

// Fonction pour extraire le langage de la classe CSS
function getLanguageFromClass(className: string, code: string): string {
  if (!className) {
    // Si pas de classe, on essaie de détecter le langage
    return detectLanguage(code);
  }
  const match = className.match(/language-(\w+)/);
  return match ? match[1] : detectLanguage(code);
}

interface ArticleContentProps {
  content: string;
}

export default function ArticleContent({ content }: ArticleContentProps) {
  const [processedContent, setProcessedContent] = useState<{
    html: string;
    codeBlocks: CodeBlockData[];
  }>({ html: content, codeBlocks: [] });

  useEffect(() => {
    const transformContent = (content: string) => {
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = content;
      
      // Traitement des blocs de code
      const codeBlocks = tempDiv.querySelectorAll('pre > code');
      const codeBlocksData: CodeBlockData[] = [];
      
      codeBlocks.forEach((codeBlock, index) => {
        const pre = codeBlock.parentElement;
        if (!pre) return;

        const code = codeBlock.textContent || '';
        const language = getLanguageFromClass(codeBlock.className, code);
        
        const placeholder = `___CODE_BLOCK_${index}___`;
        pre.outerHTML = placeholder;
        
        codeBlocksData.push({ placeholder, code, language });
      });

      // Appliquer les styles personnalisés
      const styledElements = tempDiv.querySelectorAll('[style]');
      styledElements.forEach(element => {
        const style = element.getAttribute('style');
        if (style) {
          // Conserver les styles existants
          element.setAttribute('style', style);
          
          // Ajouter des classes Tailwind équivalentes
          if (style.includes('font-size')) {
            if (style.includes('14px')) element.classList.add('text-sm');
            else if (style.includes('16px')) element.classList.add('text-base');
            else if (style.includes('18px')) element.classList.add('text-lg');
            else if (style.includes('20px')) element.classList.add('text-xl');
          }
          
          if (style.includes('line-height')) {
            if (style.includes('1.25')) element.classList.add('leading-tight');
            else if (style.includes('1.5')) element.classList.add('leading-normal');
            else if (style.includes('1.75')) element.classList.add('leading-relaxed');
            else if (style.includes('2')) element.classList.add('leading-loose');
          }
        }
      });

      // Préserver les espaces et les sauts de ligne
      const paragraphs = tempDiv.querySelectorAll('p');
      paragraphs.forEach(p => {
        // Ajouter des marges aux paragraphes
        p.classList.add('mb-6');
        
        // Préserver les espaces multiples
        if (p.innerHTML.includes(' ')) {
          p.style.whiteSpace = 'pre-wrap';
        }
      });

      // Traiter les sauts de ligne consécutifs
      const emptyParagraphs = tempDiv.querySelectorAll('p:empty');
      emptyParagraphs.forEach(p => {
        p.classList.add('h-6');
      });

      return {
        html: tempDiv.innerHTML,
        codeBlocks: codeBlocksData
      };
    };

    setProcessedContent(transformContent(content));
  }, [content]);

  return (
    <div className="prose prose-lg max-w-none [&_p]:my-6 [&_p:empty]:h-6 [&_p]:whitespace-pre-wrap text-lightText dark:text-darkText">
      {processedContent.html.split(/___CODE_BLOCK_\d+___/).map((text, index) => (
        <React.Fragment key={index}>
          {text && (
            <div 
              dangerouslySetInnerHTML={{ __html: text }}
              className="[&_span[style]]:inline-block"
            />
          )}
          {processedContent.codeBlocks[index] && (
            <CodeBlock
              code={processedContent.codeBlocks[index].code}
              language={processedContent.codeBlocks[index].language}
              className="bg-lightCard dark:bg-darkCard border border-lightBorder dark:border-darkBorder rounded-lg p-4 neumorphic-light dark:neumorphic"
            />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}