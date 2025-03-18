'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export function ClientForgotPasswordForm() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: email.toLowerCase() }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Une erreur est survenue');
      }

      setSuccess(true);
    } catch (error) {
      console.error('Erreur:', error);
      // On ne montre pas d'erreur spécifique pour éviter la divulgation d'informations
      setSuccess(true); // On affiche toujours le message de succès pour la sécurité
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="auth-form">
        <div className="text-center">
          <h2 className="text-2xl font-bold">Vérifiez votre email</h2>
          <p className="mt-2 text-muted-foreground">
            Si un compte existe avec cette adresse email, vous recevrez un lien de réinitialisation.
          </p>
        </div>
        <Link
          href="/login"
          className="inline-flex items-center gap-2 text-sm text-primary hover:text-primary/80"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour à la connexion
        </Link>
      </div>
    );
  }

  return (
    <div className="auth-form">
      <div>
        <h2 className="text-2xl font-bold text-center">Mot de passe oublié</h2>
        <p className="mt-2 text-center text-muted-foreground">
          Entrez votre email pour recevoir un lien de réinitialisation
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="form-group">
          <label htmlFor="email" className="form-label">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input-field"
            placeholder="vous@exemple.fr"
            required
          />
        </div>

        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? 'Envoi en cours...' : 'Envoyer le lien'}
        </button>
      </form>

      <Link
        href="/login"
        className="inline-flex items-center gap-2 text-sm text-primary hover:text-primary/80"
      >
        <ArrowLeft className="h-4 w-4" />
        Retour à la connexion
      </Link>
    </div>
  );
}
