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

  // 2. Safety Check: If session says ALREADY verified, send them home
  if (session?.user?.emailVerified) {
    redirect("/");
  }

  return (
    <VerifyEmailForm email={targetEmail} isSessionAuth={!!session?.user} />
  );
}
