'use client';

import { SessionProvider } from 'next-auth/react';
import { ThemeProvider } from '@/providers/ThemeProvider';
import { AuthProvider } from '@/providers/AuthProvider';

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <SessionProvider>
        <AuthProvider>
          {children}
        </AuthProvider>
      </SessionProvider>
    </ThemeProvider>
  );
}
