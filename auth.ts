import NextAuth, { type DefaultSession } from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "./lib/prisma";
import authConfig from "./auth.config";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { LoginSchema } from "./lib/validations/auth";

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
  providers: [
    ...authConfig.providers,
    Credentials({
      async authorize(credentials) {
        const validatedFields = LoginSchema.safeParse(credentials);

        if (validatedFields.success) {
          const { email, password } = validatedFields.data;

          const user = await prisma.user.findUnique({
            where: { email },
          });

          if (!user || !user.password) return null;

          const passwordsMatch = await bcrypt.compare(password, user.password);

          if (passwordsMatch) return user;
        }

        return null;
      },
    }),
  ],
  callbacks: {
    ...authConfig.callbacks,
    async signIn({ user, account }) {
      if (account?.provider === "google" && user.email) {
        const existingUser = await prisma.user.findUnique({
          where: { email: user.email },
          select: { id: true, emailVerified: true, password: true },
        });

        // If an unverified account was pre-registered with a password,
        // Google proves the real owner is logging in.
        // Wipe the unverified password so any prior unverified password attempt is eliminated,
        // and mark the email as verified.
        if (existingUser && !existingUser.emailVerified && existingUser.password) {
          await prisma.user.update({
            where: { id: existingUser.id },
            data: {
              password: null,
              emailVerified: new Date(),
            },
          });
        }
      }
      return true;
    },

    async jwt({ token, user, trigger }) {
      if (user) {
        token.id = user.id;
        const dbUser = await prisma.user.findUnique({
          where: { id: user.id },
          select: { emailVerified: true },
        });
        token.emailVerified = dbUser?.emailVerified || user.emailVerified || null;
      }

      if (trigger === "update" && token.id) {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.id as string },
          select: { emailVerified: true },
        });

        if (dbUser) {
          token.emailVerified = dbUser.emailVerified;
        }
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
});