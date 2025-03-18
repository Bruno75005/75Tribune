import { cookies } from 'next/headers';
import { SignJWT, jwtVerify } from 'jose';
import bcrypt from 'bcryptjs';
import { AuthUser } from '@/types/auth';
import crypto from 'crypto';
import { NextResponse } from 'next/server';
import { Role } from '@prisma/client';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'your-secret-key');

export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

export async function comparePasswords(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

export async function createToken(user: AuthUser): Promise<string> {
  console.log('Creating token for user:', {
    id: user.id,
    email: user.email,
    role: user.role
  });
  return new SignJWT({ 
    id: user.id,
    email: user.email,
    role: user.role 
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(JWT_SECRET);
}

export function setAuthCookie(response: NextResponse, token: string): NextResponse {
  response.cookies.set('auth-token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24, // 24 hours
    path: '/',
  });
  return response;
}

export function removeAuthCookie(): void {
  cookies().delete('auth-token');
}

interface JWTPayloadWithUser {
  id: string;
  email: string;
  role: Role;
  exp: number;
  [key: string]: unknown;
}

export async function verifyToken(token: string): Promise<JWTPayloadWithUser | null> {
  try {
    const verified = await jwtVerify(token, JWT_SECRET);
    const payload = verified.payload as unknown as JWTPayloadWithUser;
    
    console.log('Token payload:', payload);
    
    // Vérifier que les champs requis sont présents
    if (!payload.id || !payload.email || !payload.role) {
      console.log('Missing required fields in token');
      return null;
    }
    
    return payload;
  } catch (error) {
    console.error('Token verification error:', error);
    return null;
  }
}

export async function getAuthUser(): Promise<AuthUser | null> {
  try {
    console.log('=== getAuthUser Start ===');
    const token = cookies().get('auth-token');
    console.log('Found token:', token?.value ? 'yes' : 'no');
    
    if (!token) {
      console.log('No token found');
      return null;
    }

    console.log('Verifying token...');
    const verified = await verifyToken(token.value);
    console.log('Token verification result:', verified);
    
    if (!verified) {
      console.log('Token verification failed');
      return null;
    }

    const user = {
      id: verified.id,
      email: verified.email,
      role: verified.role as Role,
    };
    console.log('User from token:', user);
    return user;
  } catch (error) {
    console.error('Error in getAuthUser:', error);
    return null;
  } finally {
    console.log('=== getAuthUser End ===');
  }
}

export async function generateVerificationToken(): Promise<string> {
  return crypto.randomBytes(32).toString('hex');
}
