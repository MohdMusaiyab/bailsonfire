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
  async jwt({ token, user, trigger, session }) {
    console.log("[JWT CALLBACK] =========== START ===========");
    console.log("[JWT CALLBACK] Trigger:", trigger);
    console.log("[JWT CALLBACK] Token before any changes:", JSON.stringify(token, null, 2));
    
    if (user) {
      console.log("[JWT CALLBACK] User object present, setting initial token values");
      console.log("[JWT CALLBACK] User ID:", user.id);
      console.log("[JWT CALLBACK] User emailVerified:", user.emailVerified);
      token.id = user.id;
      token.emailVerified = user.emailVerified || null;
    }

    // FIXED: Handle session.update() correctly
    // The 'update' trigger happens when client calls update()
    // We should ALWAYS refresh from DB on update to get latest emailVerified status
    if (trigger === "update") {
      console.log("[JWT CALLBACK] Trigger is 'update' - refreshing from database");
      console.log("[JWT CALLBACK] Session data received (if any):", JSON.stringify(session, null, 2));
      console.log("[JWT CALLBACK] Current token.id:", token.id);
      
      // ALWAYS query database on update to get fresh emailVerified status
      if (token.id) {
        console.log("[JWT CALLBACK] Querying database for user:", token.id);
        const dbUser = await prisma.user.findUnique({
          where: { id: token.id as string },
          select: { 
            emailVerified: true,
            email: true 
          }
        });
        
        if (dbUser) {
          console.log("[JWT CALLBACK] Database user found:");
          console.log("[JWT CALLBACK] - Email:", dbUser.email);
          console.log("[JWT CALLBACK] - emailVerified (DB):", dbUser.emailVerified);
          console.log("[JWT CALLBACK] - emailVerified (old token):", token.emailVerified);
          
          // Update token with database values
          token.emailVerified = dbUser.emailVerified;
          console.log("[JWT CALLBACK] Token updated with DB emailVerified:", token.emailVerified);
        } else {
          console.log("[JWT CALLBACK] ERROR: User not found in database for ID:", token.id);
        }
      } else {
        console.log("[JWT CALLBACK] ERROR: No token.id found to query database");
      }
    }

    console.log("[JWT CALLBACK] Final token:", JSON.stringify(token, null, 2));
    console.log("[JWT CALLBACK] =========== END ===========");
    
    return token;
  },
  
  async session({ session, token }) {
    console.log("[SESSION CALLBACK] =========== START ===========");
    console.log("[SESSION CALLBACK] Session before:", JSON.stringify(session, null, 2));
    console.log("[SESSION CALLBACK] Token:", JSON.stringify(token, null, 2));
    
    if (token.id && session.user) {
      session.user.id = token.id as string;
      session.user.emailVerified = (token.emailVerified as Date | null) || null;
      console.log("[SESSION CALLBACK] Updated session.user.id:", session.user.id);
      console.log("[SESSION CALLBACK] Updated session.user.emailVerified:", session.user.emailVerified);
    } else {
      console.log("[SESSION CALLBACK] Warning: Missing token.id or session.user");
    }
    
    console.log("[SESSION CALLBACK] Final session:", JSON.stringify(session, null, 2));
    console.log("[SESSION CALLBACK] =========== END ===========");
    
    return session;
  },
},
});