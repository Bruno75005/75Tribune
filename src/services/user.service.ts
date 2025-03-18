import { prisma } from '@/lib/prisma';
import { Role, SubscriptionType, User } from '@prisma/client';
import { hash } from 'bcryptjs';

export interface UserWithoutPassword {
  id: string;
  email: string;
  name: string | null;
  role: Role;
  subscriptionType: SubscriptionType;
  emailVerified: boolean;
  lastLogin: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export class UserService {
  static async list() {
    try {
      const users = await prisma.user.findMany({
        orderBy: {
          createdAt: 'desc',
        },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          subscriptionType: true,
          emailVerified: true,
          lastLogin: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      return users;
    } catch (error) {
      console.error('Erreur dans UserService.list:', error);
      throw error;
    }
  }

  static async getById(id: string): Promise<UserWithoutPassword | null> {
    try {
      const user = await prisma.user.findUnique({
        where: { id },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          subscriptionType: true,
          emailVerified: true,
          lastLogin: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      return user;
    } catch (error) {
      console.error('Erreur dans UserService.getById:', error);
      throw error;
    }
  }

  static async create({
    email,
    password,
    name,
    role = 'USER',
    subscriptionType = 'FREE',
  }: {
    email: string;
    password: string;
    name?: string;
    role?: Role;
    subscriptionType?: SubscriptionType;
  }) {
    try {
      const hashedPassword = await hash(password, 12);

      const user = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          name: name || null,
          role,
          subscriptionType,
        },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          subscriptionType: true,
          emailVerified: true,
          lastLogin: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      return user;
    } catch (error) {
      console.error('Erreur dans UserService.create:', error);
      throw error;
    }
  }

  static async update({
    id,
    email,
    name,
    role,
    subscriptionType,
    password,
  }: {
    id: string;
    email?: string;
    name?: string;
    role?: Role;
    subscriptionType?: SubscriptionType;
    password?: string;
  }) {
    try {
      const updateData: any = {};
      if (email) updateData.email = email;
      if (name !== undefined) updateData.name = name;
      if (role) updateData.role = role;
      if (subscriptionType) updateData.subscriptionType = subscriptionType;
      if (password) {
        updateData.password = await hash(password, 12);
      }

      const user = await prisma.user.update({
        where: { id },
        data: updateData,
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          subscriptionType: true,
          emailVerified: true,
          lastLogin: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      return user;
    } catch (error) {
      console.error('Erreur dans UserService.update:', error);
      throw error;
    }
  }

  static async delete(id: string) {
    try {
      await prisma.user.delete({
        where: { id },
      });
    } catch (error) {
      console.error('Erreur dans UserService.delete:', error);
      throw error;
    }
  }
}
