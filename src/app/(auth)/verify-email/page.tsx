'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function VerifyEmailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [verifying, setVerifying] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        const token = searchParams.get('token');
        const email = searchParams.get('email');

        if (!token || !email) {
          setError('Lien de vérification invalide');
          return;
        }

        const response = await fetch('/api/auth/verify-email', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ token, email }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Une erreur est survenue');
        }

        toast.success('Email vérifié avec succès');
        
        // Rediriger vers la page de connexion après un court délai
        setTimeout(() => {
          router.push('/login');
        }, 2000);
      } catch (error) {
        console.error('Erreur vérification:', error);
        setError(error instanceof Error ? error.message : 'Une erreur est survenue');
      } finally {
        setVerifying(false);
      }
    };

    verifyEmail();
  }, [router, searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
      <div className="max-w-md w-full space-y-8 p-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
            Vérification de l'email
          </h2>
          <div className="mt-4">
            {verifying ? (
              <div className="flex flex-col items-center space-y-4">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                <p className="text-gray-600 dark:text-gray-300">
                  Vérification de votre email en cours...
                </p>
              </div>
            ) : error ? (
              <div className="text-red-600 dark:text-red-400">
                <p>{error}</p>
                <button
                  onClick={() => router.push('/login')}
                  className="mt-4 text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Retour à la connexion
                </button>
              </div>
            ) : (
              <div className="text-green-600 dark:text-green-400">
                <p>Email vérifié avec succès !</p>
                <p className="mt-2 text-gray-600 dark:text-gray-300">
                  Redirection vers la page de connexion...
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
