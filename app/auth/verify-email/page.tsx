import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { VerifyEmailForm } from "@/components/auth/verify-email-form";
import { prisma } from "@/lib/prisma";

interface PageProps {
  searchParams: Promise<{ email?: string }>;
}

export default async function VerifyEmailPage({ searchParams }: PageProps) {
  const { email: queryEmail } = await searchParams;
  const session = await auth();
  
  const targetEmail = queryEmail || session?.user?.email;

  // 1. If no email at all (no session and no query), go to sign in
  if (!targetEmail) {
    redirect("/auth/sign-in");
  }

  // 2. Safety Check: If user is ALREADY verified, send them home
  const dbUser = await prisma.user.findUnique({
    where: { email: targetEmail },
    select: { emailVerified: true }
  });

  if (dbUser?.emailVerified) {
    redirect("/");
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6 sm:p-12 bg-[#FCFBF7]">
      <VerifyEmailForm email={targetEmail} isSessionAuth={!!session?.user} />
    </div>
  );
}