"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoginSchema, type LoginType } from "@/lib/validations/auth";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { GoogleAuthButton } from "./google-auth-button";

export function SignInForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginType>({
    resolver: zodResolver(LoginSchema),
  });

  const onSubmit = async (data: LoginType) => {
    setError(null);

    try {
      const result = await signIn("credentials", {
        redirect: false,
        email: data.email,
        password: data.password,
      });

      if (result?.error) {
        // NextAuth v5 custom credentials error parsing
         if (result.error === "CredentialsSignin") {
            throw new Error("Invalid email or password.");
         } else {
            throw new Error(result.error || "An unexpected error occurred.");
         }
      }

      // Success redirect
      router.push("/");
      router.refresh();
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unexpected error occurred");
      }
    }
  };

  return (
    <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-xl shadow-lg border m-auto border-gray-100">
      <div className="space-y-2 text-center">
         <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Welcome Back</h2>
         <p className="text-gray-500 text-sm">Sign in to your account to continue</p>
      </div>
      
      <GoogleAuthButton actionText="Sign in" />

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-200"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white text-gray-500">Or continue with email</span>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input 
            {...register("email")} 
            type="email"
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all text-gray-900" 
            placeholder="you@example.com" 
          />
          {errors.email && <p className="text-red-500 text-xs mt-1 font-medium">{errors.email.message}</p>}
        </div>

        <div>
           <div className="flex items-center justify-between mb-1">
              <label className="block text-sm font-medium text-gray-700">Password</label>
              {/* Optional: we can add a forgot password link later */}
              <a href="#" className="text-xs text-blue-600 font-medium hover:underline">Forgot password?</a>
           </div>
           
           <input 
             {...register("password")} 
             type="password"
             className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all text-gray-900" 
             placeholder="••••••••" 
           />
           {errors.password && <p className="text-red-500 text-xs mt-1 font-medium">{errors.password.message}</p>}
        </div>

        {error && <div className="p-3 text-sm text-red-600 bg-red-50 rounded-md border border-red-100">{error}</div>}

        <button 
          type="submit" 
          disabled={isSubmitting}
          className="w-full py-2.5 px-4 text-white font-medium bg-blue-600 hover:bg-blue-700 rounded-lg disabled:bg-blue-400 transition-colors shadow-sm"
        >
          {isSubmitting ? "Signing in..." : "Sign In"}
        </button>
      </form>

      <div className="text-sm text-center text-gray-500">
        Don&apos;t have an account? <a href="/auth/sign-up" className="text-blue-600 font-medium hover:underline">Sign up</a>
      </div>
    </div>
  );
}
