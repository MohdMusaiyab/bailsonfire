import { SignInForm } from "@/components/auth/sign-in-form";

export default function SignInPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6 sm:p-12 bg-gray-50/50">
      <SignInForm />
    </div>
  );
}
