import NextAuth from "next-auth"
import { Role, SubscriptionType } from "@prisma/client"

declare module "next-auth" {
  interface User {
    id: string
    name: string
    email: string
    avatar: string | null
    role: Role
    subscriptionType: SubscriptionType
  }
  
  interface Session {
    user: {
      id: string
      name: string
      email: string
      avatar: string | null
      role: Role
      subscriptionType: SubscriptionType
    }
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    email: string
    name: string | null
    avatar: string | null
    role: Role
    subscriptionType: SubscriptionType
  }
}
