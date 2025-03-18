'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Eye, EyeOff, Github, Mail } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { signIn, getSession } from 'next-auth/react';
import { Role } from '@prisma/client';
import { toast } from 'react-hot-toast';

interface AuthFormProps {
  mode: 'login' | 'register';
}

function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getRedirectPath = async () => {
    try {
      const session = await getSession();
      const userRole = session?.user?.role;

      switch (userRole) {
        case 'ADMIN':
          return '/dashboard';
        case 'MODERATOR':
          return '/moderator';
        case 'USER':
          return '/profile';
        default:
          return '/';
      }
    } catch (error) {
      console.error('Erreur lors de la récupération du rôle:', error);
      return '/';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (mode === 'register') {
        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: email.toLowerCase(), password, name }),
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || 'Une erreur est survenue lors de l\'inscription');
        }

        toast.success('Inscription réussie ! Un email de vérification a été envoyé à votre adresse.');
        setTimeout(() => router.push('/login'), 3000);
      } else {
        const result = await signIn('credentials', {
          redirect: false,
          email: email.toLowerCase(),
          password,
        });

        if (result?.error) {
          if (result.error === 'Veuillez vérifier votre email avant de vous connecter') {
            toast.error('Veuillez vérifier votre email avant de vous connecter');
          } else {
            toast.error('Email ou mot de passe incorrect');
          }
          throw new Error(result.error);
        }

        toast.success('Connexion réussie !');
        const redirectPath = await getRedirectPath();
        router.push(redirectPath);
        router.refresh();
      }
    } catch (err: any) {
      console.error('Erreur:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid gap-6">
      <div className="grid gap-2">
        <div className="grid gap-1">
          <h1 className="text-2xl font-semibold tracking-tight text-darkText">
            {mode === 'login' ? 'Connexion' : 'Créer un compte'}
          </h1>
          <p className="text-sm text-muted:foreground">
            {mode === 'login'
              ? 'Entrez vos identifiants pour vous connecter'
              : 'Entrez vos informations pour créer un compte'}
          </p>
        </div>
        {error && (
          <div className="bg-red-900/10 text-red-400 text-sm p-3 rounded">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="grid gap-4">
          <div className="grid gap-4">
            {mode === 'register' && (
              <div className="grid gap-1.5">
                <label className="text-sm font-medium text-darkText" htmlFor="name">
                  Nom
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  autoCapitalize="none"
                  autoComplete="name"
                  autoCorrect="off"
                  disabled={loading}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full p-2 border-1 border-darkBorder rounded focus:ring-2 focus:ring-primary bg-darkCard text-darkText placeholder-muted:foreground"
                />
              </div>
            )}
            <div className="grid gap-1.5">
              <label className="text-sm font-medium text-darkText" htmlFor="email">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoCapitalize="none"
                autoComplete="email"
                autoCorrect="off"
                disabled={loading}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full p-2 border-1 border-darkBorder rounded focus:ring-2 focus:ring-primary bg-darkCard text-darkText placeholder-muted:foreground"
              />
            </div>
            <div className="grid gap-1.5">
              <label className="text-sm font-medium text-darkText" htmlFor="password">
                Mot de passe
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoCapitalize="none"
                  autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                  autoCorrect="off"
                  disabled={loading}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full p-2 border-1 border-darkBorder rounded focus:ring-2 focus:ring-primary bg-darkCard text-darkText placeholder-muted:foreground"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-muted:foreground hover:text-darkText"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            {mode === 'login' && (
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember"
                    name="remember"
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="h-4 w-4 text-primary focus:ring-primary border-darkBorder rounded bg-darkCard"
                  />
                  <label htmlFor="remember" className="ml-2 block text-sm text-darkText">
                    Se souvenir de moi
                  </label>
                </div>
                <Link
                  href="/forgot-password"
                  className="text-sm font-medium text-primary hover:underline"
                >
                  Mot de passe oublié ?
                </Link>
              </div>
            )}
            {mode === 'register' && (
              <div className="flex items-center">
                <input
                  id="terms"
                  name="terms"
                  type="checkbox"
                  checked={acceptTerms}
                  onChange={(e) => setAcceptTerms(e.target.checked)}
                  required
                  className="h-4 w-4 text-primary focus:ring-primary border-darkBorder rounded bg-darkCard"
                />
                <label htmlFor="terms" className="ml-2 block text-sm text-darkText">
                  J'accepte les{' '}
                  <Link href="/terms" className="text-primary hover:underline">
                    conditions d'utilisation
                  </Link>
                </label>
              </div>
            )}
            <button
              type="submit"
              disabled={loading || (mode === 'register' && !acceptTerms)}
              className="w-full flex justify-center py-2 px-4 border-1 border-transparent rounded-md shadow-sm text-sm font-medium text-darkText bg-primary hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50"
            >
              {loading ? (
                <div className="h-5 w-5 border-2 border-darkText border-t-transparent rounded-full animate-spin"></div>
              ) : mode === 'login' ? (
                'Se connecter'
              ) : (
                'S\'inscrire'
              )}
            </button>
          </div>
        </form>
        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-darkBorder"></span>
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-darkCard px-2 text-muted:foreground">Ou continuer avec</span>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <button
            type="button"
            disabled={loading}
            onClick={() => signIn('github')}
            className="flex items-center justify-center gap-2 px-4 py-2 border-1 border-darkBorder rounded-lg text-sm font-medium hover:bg-darkCard/20 text-darkText"
          >
            <Github className="h-4 w-4" />
            Github
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={() => signIn('google')}
            className="flex items-center justify-center gap-2 px-4 py-2 border-1 border-darkBorder rounded-lg text-sm font-medium hover:bg-darkCard/20 text-darkText"
          >
            <Mail className="h-4 w-4" />
            Google
          </button>
        </div>
        <p className="text-center text-sm text-muted:foreground">
          {mode === 'login' ? (
            <>
              Pas encore de compte ?{' '}
              <Link href="/register" className="text-primary hover:underline">
                S'inscrire
              </Link>
            </>
          ) : (
            <>
              Déjà un compte ?{' '}
              <Link href="/login" className="text-primary hover:underline">
                Se connecter
              </Link>
            </>
          )}
        </p>
      </div>
    </div>
  );
}

export { AuthForm };