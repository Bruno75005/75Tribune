'use client';

import { useAuth } from '@/providers/AuthProvider';

export default function LogoutButton() {
  const { clearAuth } = useAuth();

  return (
    <button
      onClick={clearAuth}
      className="text-gray-700 dark:text-gray-200 hover:text-red-600 dark:hover:text-red-400 transition-colors"
    >
      Déconnexion
    </button>
  );
}
