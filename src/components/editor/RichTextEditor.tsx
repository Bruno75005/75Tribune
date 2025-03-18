'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import { createLowlight } from 'lowlight';
import js from 'highlight.js/lib/languages/javascript';
import python from 'highlight.js/lib/languages/python';
import html from 'highlight.js/lib/languages/xml';
import css from 'highlight.js/lib/languages/css';
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Quote,
  Undo,
  Redo,
  Link as LinkIcon,
  Image as ImageIcon,
  Code,
} from 'lucide-react';

import AIAssistant from './AIAssistant';
import ImageUpload from './ImageUpload';

/* ------------------------------------------------------------------
   1) Configuration du lowlight (pour la coloration syntaxique)
------------------------------------------------------------------ */
const lowlight = createLowlight();
lowlight.register('javascript', js);
lowlight.register('python', python);
lowlight.register('html', html);
lowlight.register('css', css);

/* ------------------------------------------------------------------
   2) Props du composant "RichTextEditor"
------------------------------------------------------------------ */
interface RichTextEditorProps {
  /** Contenu HTML initial que vous passez depuis le parent */
  content: string;
  /** Fonction pour récupérer les mises à jour de contenu */
  onChange: (content: string) => void;
  /** Optionnel: fonction à appeler pour publier */
  onPublish?: (destinations: any[]) => void;
  /** Afficher ou non la partie publication */
  showPublishOptions?: boolean;
}

/* ------------------------------------------------------------------
   3) Composant "MenuBar" = barre d'outils
------------------------------------------------------------------ */
const MenuBar = ({ editor }: { editor: any }) => {
  if (!editor) {
    return null;
  }

  const addImage = () => {
    const url = window.prompt("URL de l'image:");
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  };

  const setLink = () => {
    const url = window.prompt('URL:');
    if (url) {
      editor.chain().focus().setLink({ href: url }).run();
    }
  };

  const addCodeBlock = () => {
    const language = window.prompt('Langage (ex: javascript, python):', 'javascript');
    if (language) {
      editor.chain().focus().toggleCodeBlock({ language }).run();
    }
  };

  return (
    <div className="border-b border-gray-200 p-2 mb-4 flex flex-wrap gap-2">
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={`p-2 rounded hover:bg-gray-100 ${
          editor.isActive('bold') ? 'bg-gray-100' : ''
        }`}
      >
        <Bold className="w-5 h-5" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={`p-2 rounded hover:bg-gray-100 ${
          editor.isActive('italic') ? 'bg-gray-100' : ''
        }`}
      >
        <Italic className="w-5 h-5" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={`p-2 rounded hover:bg-gray-100 ${
          editor.isActive('bulletList') ? 'bg-gray-100' : ''
        }`}
      >
        <List className="w-5 h-5" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={`p-2 rounded hover:bg-gray-100 ${
          editor.isActive('orderedList') ? 'bg-gray-100' : ''
        }`}
      >
        <ListOrdered className="w-5 h-5" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        className={`p-2 rounded hover:bg-gray-100 ${
          editor.isActive('blockquote') ? 'bg-gray-100' : ''
        }`}
      >
        <Quote className="w-5 h-5" />
      </button>
      <button
        type="button"
        onClick={setLink}
        className={`p-2 rounded hover:bg-gray-100 ${
          editor.isActive('link') ? 'bg-gray-100' : ''
        }`}
      >
        <LinkIcon className="w-5 h-5" />
      </button>
      <button
        type="button"
        onClick={addImage}
        className="p-2 rounded hover:bg-gray-100"
      >
        <ImageIcon className="w-5 h-5" />
      </button>
      <button
        type="button"
        onClick={addCodeBlock}
        className={`p-2 rounded hover:bg-gray-100 ${
          editor.isActive('codeBlock') ? 'bg-gray-100' : ''
        }`}
      >
        <Code className="w-5 h-5" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().undo().run()}
        className="p-2 rounded hover:bg-gray-100"
      >
        <Undo className="w-5 h-5" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().redo().run()}
        className="p-2 rounded hover:bg-gray-100"
      >
        <Redo className="w-5 h-5" />
      </button>
    </div>
  );
};

/* ------------------------------------------------------------------
   4) Composant interne "RichTextEditorContent"
   Cet éditeur Tiptap se base sur la "value" initiale,
   et appelle onChange() à chaque mise à jour.
------------------------------------------------------------------ */
const RichTextEditorContent = ({
  value,
  onChange,
}: {
  value: string;
  onChange: (content: string) => void;
}) => {
  // capture la "value" initiale dans un state local :
  const [initialValue] = useState(value);

  // Setup Tiptap Editor
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: false,
        heading: { levels: [1, 2, 3] },
        bulletList: { keepMarks: true, keepAttributes: false },
        orderedList: { keepMarks: true, keepAttributes: false },
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'max-w-full h-auto rounded-lg',
        },
        allowBase64: true,
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300',
        },
      }),
      CodeBlockLowlight.configure({
        lowlight,
        HTMLAttributes: {
          class: 'rounded-lg p-4 bg-gray-100 dark:bg-gray-800',
        },
      }),
    ],
    // On n'utilise QUE la "initialValue" pour éviter de réécraser en continu
    content: initialValue,
    onUpdate: ({ editor }) => {
      // À chaque frappe, on remonte le HTML dans onChange
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose dark:prose-invert max-w-none focus:outline-none min-h-[200px] p-4',
      },
      handleDrop: (view, event, slice, moved) => {
        if (!moved && event.dataTransfer?.files.length) {
          const file = event.dataTransfer.files[0];
          if (file.type.startsWith('image/')) {
            // TODO: Gérer le drop d'image
            return true;
          }
        }
        return false;
      },
      handlePaste: (view, event) => {
        if (event.clipboardData?.files.length) {
          const file = event.clipboardData.files[0];
          if (file.type.startsWith('image/')) {
            // TODO: Gérer le collage d'image
            return true;
          }
        }
        return false;
      },
    },
    immediatelyRender: false,
  });

  // Gestion d'insertion de suggestions IA
  const handleAISuggestion = (suggestion: string) => {
    if (editor) {
      editor.chain().focus().insertContent(suggestion).run();
    }
  };

  // Gestion d'upload d'image (ex: via URL)
  const handleImageUpload = (url: string) => {
    if (editor) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  };

  if (!editor) {
    return null;
  }

  return (
    <div className="space-y-4">
      {/* Barre d'outils */}
      <div className="w-full border rounded-lg overflow-hidden dark:border-gray-700">
        <MenuBar editor={editor} />
        {/* Zone pour upload direct (bouton) */}
        <div className="border-t dark:border-gray-700">
          <ImageUpload onUpload={handleImageUpload} />
        </div>
        {/* Zone d'édition */}
        <div className="border-t dark:border-gray-700">
          <EditorContent editor={editor} />
        </div>
      </div>

      {/* Assistant IA */}
      <div className="border-t pt-4 dark:border-gray-700">
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Assistant IA
        </h3>
        <AIAssistant onSuggestion={handleAISuggestion} />
      </div>
    </div>
  );
};

/* ------------------------------------------------------------------
   5) Composant "RichTextEditor" final
   => C'est celui que vous importez dans vos pages
------------------------------------------------------------------ */
const RichTextEditor = ({
  content,
  onChange,
  onPublish,
  showPublishOptions = true,
}: RichTextEditorProps) => {
  // On importe dynamiquement RichTextEditorContent si on veut le SSR: false
  // Mais ici, tout est dans le même fichier ; vous n’avez plus besoin du dynamic import
  // (ou vous pouvez l'utiliser comme avant, si vous voulez).
  // Pour la démo, on ne fait pas de dynamic import supplémentaire.

  return (
    <div className="space-y-4">
      {/* L'éditeur */}
      <div>
        <RichTextEditorContent
          value={content}
          onChange={onChange}
        />
      </div>

      {/* Options de publication (facultatif) */}
      {showPublishOptions && onPublish && (
        <div className="mt-4 space-y-4">
          <div className="flex justify-end">
            <button
              onClick={() => onPublish([])}
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
            >
              Publier sur les plateformes sélectionnées
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default RichTextEditor;
