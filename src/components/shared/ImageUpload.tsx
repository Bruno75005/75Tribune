'use client';

import { useState } from 'react';
import { Upload, X } from 'lucide-react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { normalizeImagePath } from '@/lib/image';

interface ImageUploadProps {
  value?: string;
  onChange: (url: string) => void;
  onRemove: () => void;
}

export default function ImageUpload({ value, onChange, onRemove }: ImageUploadProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setLoading(true);
      setError(null);

      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Erreur lors de l\'upload');
      }

      const data = await response.json();
      console.log('Image uploadée:', data);
      
      // Utiliser la fonction de normalisation pour le chemin
      onChange(normalizeImagePath(data.url));
    } catch (error) {
      console.error('Erreur upload:', error);
      setError('Erreur lors du téléchargement de l\'image');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center w-full">
      {error && (
        <div className="w-full p-4 mb-4 text-sm text-red-600 bg-red-100 rounded-lg">
          {error}
        </div>
      )}
      <div className="w-full p-4 border-2 border-dashed rounded-lg border-gray-300 dark:border-gray-600">
        {value ? (
          <div className="relative aspect-video w-full">
            <Image
              src={normalizeImagePath(value)}
              alt="Image téléchargée"
              fill
              className="object-cover rounded-lg"
              onError={(e) => {
                console.error('Erreur de chargement de l\'image:', value);
                setError('Impossible de charger l\'image');
              }}
            />
            <button
              onClick={onRemove}
              className="absolute top-2 right-2 p-1 rounded-full bg-red-500 text-white hover:bg-red-600"
              type="button"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-6">
            <Upload className="h-10 w-10 text-gray-400 dark:text-gray-500 mb-2" />
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Glissez-déposez une image ici ou
            </p>
            <div className="mt-2">
              <Button
                disabled={loading}
                variant="outline"
                size="sm"
                onClick={() => document.getElementById('imageUpload')?.click()}
                type="button"
              >
                {loading ? 'Chargement...' : 'Sélectionnez un fichier'}
              </Button>
            </div>
          </div>
        )}
        <input
          id="imageUpload"
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleUpload}
          disabled={loading}
        />
      </div>
    </div>
  );
}
