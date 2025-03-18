'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { X, Loader2 } from 'lucide-react';
import RichTextEditor from '@/components/editor/RichTextEditor';
import { toast } from 'react-hot-toast';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import ImageUpload from '@/components/shared/ImageUpload';

interface ArticleFormData {
  title: string;
  excerpt: string;
  content: string;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  accessLevel: 'FREE' | 'BASIC' | 'PRO';
  tags: string[];
  categories: string[];
  featuredImage?: string;
  publishPlatforms?: string[];
}

interface ArticleFormPageProps {
  params: { action: string; id?: string };
}

export default function ArticleFormPage({ params }: ArticleFormPageProps) {
  const router = useRouter();
  const isEditing = params.action === 'edit';

  const [loading, setLoading] = useState(false);
  const [isPublishingToWordPress, setIsPublishingToWordPress] = useState(false);

  const [formData, setFormData] = useState<ArticleFormData>({
    title: '',
    excerpt: '',
    content: '',
    status: 'DRAFT',
    accessLevel: 'FREE',
    tags: [],
    categories: [],
    featuredImage: '',
    publishPlatforms: [],
  });

  const [categories, setCategories] = useState<Array<{ id: string; name: string }>>([]);
  const [currentTag, setCurrentTag] = useState('');

  // Chargement initial
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/categories', { credentials: 'include' });
        if (!response.ok) throw new Error('Erreur lors du chargement des catégories');
        const data = await response.json();
        setCategories(data);
      } catch (error) {
        console.error('Erreur:', error);
        toast.error('Erreur lors du chargement des catégories');
      }
    };
    fetchCategories();

    if (isEditing && params.id) {
      (async () => {
        setLoading(true);
        try {
          const response = await fetch(`/api/articles/${params.id}`, { credentials: 'include' });
          if (!response.ok) throw new Error('Article non trouvé');
          const data = await response.json();

          setFormData({
            title: data.title || '',
            excerpt: data.excerpt || '',
            content: data.content || '',
            status: data.status || 'DRAFT',
            accessLevel: data.accessLevel || 'FREE',
            tags: data.tags?.map((t: any) => t.name) || [],
            categories: data.categories?.map((c: any) => c.id) || [],
            featuredImage: data.featuredImage || '',
            publishPlatforms: data.publishPlatforms || [],
          });
        } catch (error) {
          console.error("Erreur lors du chargement de l'article:", error);
          toast.error("Erreur lors du chargement de l'article");
          router.push('/dashboard/articles');
        } finally {
          setLoading(false);
        }
      })();
    }
  }, [isEditing, params.id, router]);

  // Extraction auto de titre et excerpt
  useEffect(() => {
    if (!formData.content || (formData.title && formData.excerpt)) return;

    const parser = new DOMParser();
    const doc = parser.parseFromString(formData.content, 'text/html');

    if (!formData.title.trim()) {
      const possibleHeading = doc.querySelector('h1, h2, h3');
      if (possibleHeading?.textContent) {
        const autoTitle = possibleHeading.textContent.trim();
        if (autoTitle) {
          setFormData((prev) => ({ ...prev, title: autoTitle }));
        } else {
          callAIForTitle();
        }
      } else {
        callAIForTitle();
      }
    }

    if (!formData.excerpt.trim()) {
      const possibleParagraph = doc.querySelector('p');
      if (possibleParagraph?.textContent) {
        const rawText = possibleParagraph.textContent.trim();
        const autoExcerpt = rawText.substring(0, 150) + (rawText.length > 150 ? '…' : '');
        if (autoExcerpt) {
          setFormData((prev) => ({ ...prev, excerpt: autoExcerpt }));
        }
      }
    }
  }, [formData.content]);

  async function callAIForTitle() {
    try {
      await new Promise((r) => setTimeout(r, 1000));
      const aiResponse = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: `Générer un titre pour un article sur : ${formData.content.substring(0, 200)}`, 
          model: 'llama3.2:latest',
          tone: 'professional',
          type: 'title' // Ajouter ce champ pour identifier le type de requête
        }),
      });

      if (aiResponse.ok) {
        const { content } = await aiResponse.json();
        if (content && !formData.title.trim()) {
          setFormData((prev) => ({ ...prev, title: content }));
          toast.success(`Titre suggéré par l'IA : « ${content} »`);
        }
      }
    } catch (e) {
      console.error('Erreur appel IA :', e);
    }
  }

  const handlePublishToggle = (platform: string) => {
    setFormData((prev) => ({
      ...prev,
      publishPlatforms: prev.publishPlatforms?.includes(platform)
        ? prev.publishPlatforms.filter((p) => p !== platform)
        : [...(prev.publishPlatforms || []), platform],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.content.trim()) {
      return toast.error('Le titre et le contenu sont requis');
    }
    setLoading(true);

    try {
      const payload = {
        title: formData.title.trim(),
        content: formData.content.trim(),
        excerpt: formData.excerpt?.trim() || '',
        status: formData.status,
        accessLevel: formData.accessLevel,
        tags: formData.tags,
        categories: formData.categories,
        featuredImage: formData.featuredImage,
        publishPlatforms: formData.publishPlatforms,
      };

      const url = isEditing ? `/api/articles/${params.id}` : '/api/articles';
      const method = isEditing ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors de la sauvegarde');
      }

      if (formData.publishPlatforms?.includes('wordpress')) {
        setIsPublishingToWordPress(true);
        toast.loading('Publication WordPress en cours…', { id: 'wp-publish' });

        try {
          const wpResponse = await fetch('/api/publish/wordpress', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify(payload),
          });

          const wpData = await wpResponse.json();
          if (wpResponse.ok) {
            toast.success(`Publié sur WordPress : ${wpData.url}`, { id: 'wp-publish' });
          } else {
            throw new Error(wpData.error || 'Erreur WordPress');
          }
        } catch (wpError) {
          toast.error('Échec de la publication WordPress', { id: 'wp-publish' });
          console.error('Erreur WordPress:', wpError);
        } finally {
          setIsPublishingToWordPress(false);
        }
      }

      toast.success(isEditing ? 'Article mis à jour !' : 'Article créé avec succès !');
      router.push('/dashboard/articles');
    } catch (error) {
      toast.error('Erreur globale : ' + (error as Error).message);
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const addTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && currentTag.trim()) {
      e.preventDefault();
      if (!formData.tags.includes(currentTag.trim())) {
        setFormData((prev) => ({ ...prev, tags: [...prev.tags, currentTag.trim()] }));
      }
      setCurrentTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }));
  };

  const handleImageUpload = (imageUrl: string) => {
    setFormData((prev) => ({ ...prev, featuredImage: imageUrl }));
  };

  const handleImageRemove = () => {
    setFormData((prev) => ({ ...prev, featuredImage: '' }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container p-4 w-full">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
          {isEditing ? "Modifier l'article" : 'Nouvel article'}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="featuredImage">Image mise en avant</Label>
          <ImageUpload
            value={formData.featuredImage}
            onChange={handleImageUpload}
            onRemove={handleImageRemove}
          />
        </div>

        <div>
          <Label htmlFor="title">Titre</Label>
          <input
            type="text"
            id="title"
            value={formData.title}
            onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
            className="mt-1 block w-full px-4 py-2 rounded-lg border dark:border-gray-600
                       focus:ring-2 focus:ring-primary-500 focus:border-primary-500
                       dark:bg-gray-700 dark:text-white"
            required
          />
        </div>

        <div>
          <Label htmlFor="excerpt">Extrait</Label>
          <textarea
            id="excerpt"
            value={formData.excerpt}
            onChange={(e) => setFormData((prev) => ({ ...prev, excerpt: e.target.value }))}
            rows={3}
            className="mt-1 block w-full px-4 py-2 rounded-lg border dark:border-gray-600
                       focus:ring-2 focus:ring-primary-500 focus:border-primary-500
                       dark:bg-gray-700 dark:text-white"
          />
        </div>

        <div>
          <Label className="text-gray-700 dark:text-gray-300 mb-2 block">
            Plateformes de publication
          </Label>
          <div className="flex flex-row gap-4">
            {['wordpress', 'youtube', 'twitter'].map((platform) => (
              <div
                key={platform}
                className="flex-1 flex items-center justify-between p-2 rounded-lg
                           bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
              >
                <span className="text-sm text-gray-700 dark:text-gray-300 capitalize">
                  {platform}
                </span>
                <Switch
                  checked={formData.publishPlatforms?.includes(platform)}
                  onCheckedChange={() => handlePublishToggle(platform)}
                  className={cn(
                    formData.publishPlatforms?.includes(platform)
                      ? 'bg-primary'
                      : 'bg-gray-200 dark:bg-gray-700'
                  )}
                />
              </div>
            ))}
          </div>

          {isPublishingToWordPress && (
            <div className="flex items-center space-x-2 text-sm text-gray-500
                            dark:text-gray-400 mt-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Publication WordPress en cours…</span>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <Label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
            Catégories
          </Label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {categories.map((category) => (
              <div key={category.id} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id={`category-${category.id}`}
                  checked={formData.categories.includes(category.id)}
                  onChange={(e) => {
                    const isChecked = e.target.checked;
                    setFormData((prev) => ({
                      ...prev,
                      categories: isChecked
                        ? [...prev.categories, category.id]
                        : prev.categories.filter((catId) => catId !== category.id),
                    }));
                  }}
                  className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                />
                <Label
                  htmlFor={`category-${category.id}`}
                  className="text-sm text-gray-700 dark:text-gray-200"
                >
                  {category.name}
                </Label>
              </div>
            ))}
          </div>
        </div>

        <div>
          <Label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
            Contenu
          </Label>
          <RichTextEditor
            content={formData.content}
            onChange={(content) => setFormData((prev) => ({ ...prev, content }))}
          />
        </div>

        <div>
          <Label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
            Tags
          </Label>
          <div className="flex flex-wrap gap-2 mb-2">
            {formData.tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium
                           bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200"
              >
                {tag}
                <button
                  type="button"
                  onClick={() => removeTag(tag)}
                  className="ml-2 inline-flex items-center hover:text-primary-900 dark:hover:text-primary-100"
                >
                  <X className="w-4 h-4" />
                </button>
              </span>
            ))}
          </div>
          <input
            type="text"
            value={currentTag}
            onChange={(e) => setCurrentTag(e.target.value)}
            onKeyDown={addTag}
            placeholder="Ajouter un tag (Entrée pour valider)"
            className="mt-1 block w-full px-4 py-2 rounded-lg border dark:border-gray-600
                       focus:ring-2 focus:ring-primary-500 focus:border-primary-500
                       dark:bg-gray-700 dark:text-white"
          />
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div>
            <Label htmlFor="status" className="block text-sm font-medium text-gray-700
                                              dark:text-gray-200 mb-2">
              Statut
            </Label>
            <select
              id="status"
              value={formData.status}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  status: e.target.value as 'DRAFT' | 'PUBLISHED' | 'ARCHIVED',
                }))
              }
              className="mt-1 block w-full px-4 py-2 rounded-lg border dark:border-gray-600
                         focus:ring-2 focus:ring-primary-500 focus:border-primary-500
                         dark:bg-gray-700 dark:text-white"
            >
              <option value="DRAFT">Brouillon</option>
              <option value="PUBLISHED">Publié</option>
              <option value="ARCHIVED">Archivé</option>
            </select>
          </div>

          <div>
            <Label htmlFor="accessLevel" className="block text-sm font-medium text-gray-700
                                                   dark:text-gray-200 mb-2">
              Niveau d'accès
            </Label>
            <select
              id="accessLevel"
              value={formData.accessLevel}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  accessLevel: e.target.value as 'FREE' | 'BASIC' | 'PRO',
                }))
              }
              className="mt-1 block w-full px-4 py-2 rounded-lg border dark:border-gray-600
                         focus:ring-2 focus:ring-primary-500 focus:border-primary-500
                         dark:bg-gray-700 dark:text-white"
            >
              <option value="FREE">Gratuit</option>
              <option value="BASIC">Basic</option>
              <option value="PRO">Pro</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end space-x-4">
          <Button
            type="button"
            onClick={() => router.back()}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200
                       bg-white dark:bg-gray-800 border dark:border-gray-600 rounded-lg
                       hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            Annuler
          </Button>
          <Button
            type="submit"
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-white bg-primary
                       hover:bg-primary/90 rounded-lg disabled:opacity-50"
          >
            {loading ? 'En cours...' : isEditing ? 'Mettre à jour' : 'Créer'}
          </Button>
        </div>
      </form>
    </div>
  );
}