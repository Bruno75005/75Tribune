import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { AuthResponse } from '@/types/auth';

interface AuthState {
  user: AuthResponse['user'] | null;
  token: string | null;
  setAuth: (auth: AuthResponse | null) => void;
  logout: () => void;
}

export const useAuth = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      setAuth: (auth) =>
        set({
          user: auth?.user || null,
          token: auth?.token || null,
        }),
      logout: () =>
        set({
          user: null,
          token: null,
        }),
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => sessionStorage),
    }
  )
);
