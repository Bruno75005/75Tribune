import { Role } from '@prisma/client';

export interface AuthUser {
  id: string;
  email: string;
  role: Role;
  name: string | null | undefined;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials extends LoginCredentials {
  name?: string;
}

export interface AuthResponse {
  user: AuthUser;
  token: string;
}

export interface ResetPasswordCredentials {
  email: string;
  token: string;
  newPassword: string;
}

export interface User {
  id: string;
  email: string;
  name: string | null;
  emailVerified: boolean;
  image: string | null;
  role: 'USER' | 'ADMIN';
  createdAt: Date;
  updatedAt: Date;
}

export interface Session {
  user: {
    id: string;
    email: string;
    name: string | null;
    image: string | null;
    role: 'USER' | 'ADMIN';
  };
  expires: string;
}

export interface EmailVerificationToken {
  id: string;
  token: string;
  userId: string;
  expiresAt: Date;
  createdAt: Date;
  user: User;
}

export interface PasswordResetToken {
  id: string;
  token: string;
  userId: string;
  expiresAt: Date;
  createdAt: Date;
  user: User;
}

export interface SocialProvider {
  id: string;
  userId: string;
  provider: 'google' | 'github';
  providerId: string;
  accessToken: string;
  refreshToken: string | null;
  expiresAt: Date | null;
  user: User;
}
