import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { VerifyEmailForm } from "@/components/auth/verify-email-form";
import { prisma } from "@/lib/prisma";

export default async function VerifyEmailPage() {
  console.log("[VERIFY PAGE] =========== START ===========");
  
  const session = await auth();
  console.log("[VERIFY PAGE] Session from auth():", JSON.stringify(session, null, 2));
  console.log("[VERIFY PAGE] Session user:", session?.user);
  console.log("[VERIFY PAGE] Session emailVerified:", session?.user?.emailVerified);

  // 1. If not logged in, redirect to sign-in
  if (!session?.user?.email || !session?.user?.id) {
    console.log("[VERIFY PAGE] No session or missing user data - redirecting to sign-in");
    redirect("/auth/sign-in");
  }

  console.log("[VERIFY PAGE] User is logged in with ID:", session.user.id);
  console.log("[VERIFY PAGE] User email:", session.user.email);

  // 2. Safety Check (Direct DB Check)
  console.log("[VERIFY PAGE] Checking database directly for user:", session.user.id);
  const dbUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { 
      emailVerified: true,
      email: true 
    }
  });

  console.log("[VERIFY PAGE] Database query result:");
  console.log("[VERIFY PAGE] - User found:", !!dbUser);
  console.log("[VERIFY PAGE] - Email from DB:", dbUser?.email);
  console.log("[VERIFY PAGE] - emailVerified from DB:", dbUser?.emailVerified);
  console.log("[VERIFY PAGE] - emailVerified from Session:", session.user.emailVerified);

  if (dbUser?.emailVerified) {
    console.log("[VERIFY PAGE] Database shows user is verified! Redirecting to home.");
    console.log("[VERIFY PAGE] DB emailVerified:", dbUser.emailVerified);
    console.log("[VERIFY PAGE] Session emailVerified:", session.user.emailVerified);
    redirect("/");
  }

  console.log("[VERIFY PAGE] User is NOT verified - rendering verification form");
  console.log("[VERIFY PAGE] =========== END ===========");

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6 sm:p-12 bg-gray-50/50">
      <VerifyEmailForm email={session.user.email} />
    </div>
  );
}