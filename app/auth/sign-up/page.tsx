import { SignUpForm } from "@/components/auth/sign-up-form";

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6 sm:p-12 bg-gray-50/50">
      <SignUpForm />
    </div>
  );
}
