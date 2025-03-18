import { NextAuthOptions } from 'next-auth';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { prisma } from './prisma';
import CredentialsProvider from 'next-auth/providers/credentials';
import { hashPassword, comparePasswords, createToken, setAuthCookie, removeAuthCookie, verifyToken } from './auth.utils';
import { Adapter } from 'next-auth/adapters';
import { randomBytes } from 'crypto';
import { Role, SubscriptionType } from '@prisma/client';

// Définir le type de session étendu
declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      role: Role;
      avatar: string | null;
      subscriptionType: SubscriptionType;
    }
  }
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as Adapter,
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: '/login',
    error: '/login',
    signOut: '/',
  },
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      console.log('JWT Callback - Input:', { token, user, trigger, session });
      
      if (trigger === 'update' && session) {
        console.log('JWT Update triggered with session:', session);
        // Mettre à jour directement à partir de la session
        token.name = session.user.name;
        token.email = session.user.email;
        token.avatar = session.user.avatar;
        token.role = session.user.role;
        token.subscriptionType = session.user.subscriptionType;

        console.log('JWT token updated from session:', token);
      } else if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.role = user.role;
        token.avatar = user.avatar;
        token.subscriptionType = user.subscriptionType || 'FREE';
        console.log('JWT token updated from user:', token);
      }
      
      console.log('JWT Callback - Output token:', token);
      return token;
    },
    async session({ token, session }) {
      console.log('Session Callback - Input:', { token, session });
      
      if (token && session.user) {
        // Récupérer les données les plus récentes de l'utilisateur
        const user = await prisma.user.findUnique({
          where: { id: token.id as string },
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
            avatar: true,
            subscriptionType: true
          }
        });
        
        console.log('Fresh user data from database:', user);
        
        if (user) {
          session.user = {
            id: user.id,
            email: user.email,
            name: user.name || '', // Garantir une chaîne non-null
            role: user.role,
            avatar: user.avatar,
            subscriptionType: user.subscriptionType
          };
        } else {
          console.warn('User not found in database:', token.id);
        }
      }
      
      console.log('Session Callback - Output:', session);
      return session;
    },
  },
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        try {
          console.log('Authorize attempt with credentials:', { email: credentials?.email });

          if (!credentials?.email || !credentials?.password) {
            console.log('Missing credentials');
            throw new Error('Email ou mot de passe incorrect');
          }

          const user = await prisma.user.findUnique({
            where: { 
              email: credentials.email.toLowerCase(),
            },
            select: {
              id: true,
              email: true,
              name: true,
              role: true,
              password: true,
              avatar: true,
              subscriptionType: true,
              emailVerified: true
            },
          });

          console.log('User found:', { user: user ? { ...user, password: '[HIDDEN]' } : null });

          if (!user || !user.password) {
            console.log('User not found or no password');
            throw new Error('Email ou mot de passe incorrect');
          }

          const isPasswordValid = await comparePasswords(credentials.password, user.password);
          console.log('Password validation:', { isValid: isPasswordValid });

          if (!isPasswordValid) {
            console.log('Invalid password');
            throw new Error('Email ou mot de passe incorrect');
          }

          if (!user.emailVerified) {
            console.log('Email not verified');
            throw new Error('Veuillez vérifier votre email avant de vous connecter');
          }

          console.log('Authorization successful');
          return {
            id: user.id,
            email: user.email,
            name: user.name || '',
            role: user.role,
            avatar: user.avatar,
            subscriptionType: user.subscriptionType || 'FREE'
          };
        } catch (error) {
          console.error('Auth error:', error);
          throw new Error(error instanceof Error ? error.message : 'Une erreur est survenue');
        }
      },
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development',
};

export {
  hashPassword,
  comparePasswords,
  createToken,
  setAuthCookie,
  removeAuthCookie,
  verifyToken,
};
