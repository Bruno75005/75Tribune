'use client';

import { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { FormInput } from '@/components/ui/FormInput';
import { KeyRound } from 'lucide-react';

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const token = searchParams?.get('token');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, token }),
      });

      const data = await res.json();

      if (data.error) {
        setError(data.error);
        return;
      }

      setSuccess(
        'Si un compte existe avec cette adresse email, vous recevrez un email avec les instructions pour réinitialiser votre mot de passe.'
      );
    } catch (error) {
      setError('Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  if (token) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-darkBg">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <KeyRound className="h-6 w-6 text-primary" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-darkText">
            Nouveau mot de passe
          </h2>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-darkCard border-1 border-darkBorder rounded-xl p-6 shadow-sm">
            <form className="space-y-5" onSubmit={handleSubmit}>
              {error && (
                <div className="rounded-md bg-red-900/10 p-3">
                  <div className="text-sm text-red-400">{error}</div>
                </div>
              )}
              {success && (
                <div className="rounded-md bg-green-900/10 p-3">
                  <div className="text-sm text-green-400">{success}</div>
                </div>
              )}

              <FormInput
                id="password"
                name="password"
                type="password"
                label="Nouveau mot de passe"
                required
              />

              <FormInput
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                label="Confirmer le mot de passe"
                required
              />

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex w-full justify-center rounded-md bg-primary px-3 py-2 text-sm font-semibold text-darkText shadow-sm hover:bg-secondary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:opacity-50"
                >
                  {loading ? 'Modification en cours...' : 'Modifier le mot de passe'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-darkBg">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
          <KeyRound className="h-6 w-6 text-primary" />
        </div>
        <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-darkText">
          Réinitialiser votre mot de passe
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-darkCard border-1 border-darkBorder rounded-xl p-6 shadow-sm">
          <form className="space-y-5" onSubmit={handleSubmit}>
            {error && (
              <div className="rounded-md bg-red-900/10 p-3">
                <div className="text-sm text-red-400">{error}</div>
              </div>
            )}
            {success && (
              <div className="rounded-md bg-green-900/10 p-3">
                <div className="text-sm text-green-400">{success}</div>
              </div>
            )}

            <FormInput
              id="email"
              name="email"
              type="email"
              label="Adresse email"
              required
            />

            <div>
              <button
                type="submit"
                disabled={loading}
                className="flex w-full justify-center rounded-md bg-primary px-3 py-2 text-sm font-semibold text-darkText shadow-sm hover:bg-secondary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:opacity-50"
              >
                {loading ? 'Envoi en cours...' : 'Réinitialiser le mot de passe'}
              </button>
            </div>

            <div className="text-center">
              <Link
                href="/login"
                className="text-sm font-medium text-primary hover:underline"
              >
                Retour à la connexion
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center text-darkText">Chargement...</div>}>
      <ResetPasswordContent />
    </Suspense>
  );
}