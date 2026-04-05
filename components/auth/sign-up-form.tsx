"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { RegisterSchema, type RegisterType } from "@/lib/validations/auth";
import { useState } from "react";
import { useRouter } from "next/navigation";

import { GoogleAuthButton } from "./google-auth-button";

export function SignUpForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterType>({
    resolver: zodResolver(RegisterSchema),
  });

  const onSubmit = async (data: RegisterType) => {
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch("/api/auth/sign-up", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      // Expecting standard { success: boolean, message: string, data?: any } response
      const result = await res.json();
      
      if (!result.success) {
        throw new Error(result.message || "Something went wrong");
      }

      setSuccess(result.message);
      setTimeout(() => router.push("/auth/sign-in"), 2000);
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
         <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Create an Account</h2>
         <p className="text-gray-500 text-sm">Join IPL Roast AI to start commenting.</p>
      </div>

      <GoogleAuthButton actionText="Sign up" />

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
          <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
          <input 
            {...register("name")} 
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all text-gray-900" 
            placeholder="John Doe" 
          />
          {errors.name && <p className="text-red-500 text-xs mt-1 font-medium">{errors.name.message}</p>}
        </div>

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
           <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
           <input 
             {...register("password")} 
             type="password"
             className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all text-gray-900" 
             placeholder="••••••••" 
           />
           {errors.password && <p className="text-red-500 text-xs mt-1 font-medium">{errors.password.message}</p>}
        </div>

        {error && <div className="p-3 text-sm text-red-600 bg-red-50 rounded-md border border-red-100">{error}</div>}
        {success && <div className="p-3 text-sm text-green-700 bg-green-50 rounded-md border border-green-100">{success}</div>}

        <button 
          type="submit" 
          disabled={isSubmitting}
          className="w-full py-2.5 px-4 text-white font-medium bg-blue-600 hover:bg-blue-700 rounded-lg disabled:bg-blue-400 transition-colors shadow-sm"
        >
          {isSubmitting ? "Creating Account..." : "Sign Up"}
        </button>
      </form>

      <div className="text-sm text-center text-gray-500">
        Already have an account? <a href="/auth/sign-in" className="text-blue-600 font-medium hover:underline">Log in</a>
      </div>
    </div>
  );
}
