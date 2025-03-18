import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const isAdmin = token?.role === 'ADMIN';
    const path = req.nextUrl.pathname;

    // Si l'utilisateur est déjà connecté et essaie d'accéder à /login
    if (path === '/login' && token) {
      return NextResponse.redirect(new URL(isAdmin ? '/dashboard' : '/profile', req.url));
    }

    // Protection des routes admin
    if (path.startsWith('/dashboard')) {
      if (!isAdmin) {
        return NextResponse.redirect(new URL('/profile', req.url));
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ req, token }) => {
        const path = req.nextUrl.pathname;
        // Permettre l'accès à /login même sans token
        if (path === '/login') return true;
        // Vérifier le token pour les autres routes protégées
        return !!token;
      },
    },
  }
);

export const config = {
  matcher: ['/dashboard/:path*', '/profile/:path*', '/login'],
};
