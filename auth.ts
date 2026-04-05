import NextAuth, { type DefaultSession } from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "./lib/prisma";
import authConfig from "./auth.config";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      emailVerified: Date | null;
    } & DefaultSession["user"];
  }

  interface User {
    emailVerified?: Date | null;
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  pages: {
    signIn: "/auth/sign-in",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.emailVerified = user.emailVerified || null;
      }
      return token;
    },
    async session({ session, token }) {
      if (token.id && session.user) {
        session.user.id = token.id as string;
        session.user.emailVerified = (token.emailVerified as Date | null) || null;
      }
      return session;
    },
  },
  ...authConfig,
});
