"use client";

import { signIn, getSession } from "next-auth/react";
import { FcGoogle } from "react-icons/fc";
import { FaGithub } from "react-icons/fa";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import "@/app/globals.css";

export default function SignIn() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams?.get("callbackUrl") || "/";

  useEffect(() => {
    getSession().then((session) => {
      if (session) {
        router.push(callbackUrl);
      }
    });
  }, [router, callbackUrl]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-eco-light to-eco-green/20 flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 space-y-8 transform transition-all hover:scale-[1.01]">
        {/* لوگو */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-eco-green rounded-full mb-4">
            <span className="text-2xl font-bold text-white">EV</span>
          </div>
          <h1 className="text-3xl font-bold text-eco-dark">EcoVault</h1>
          <p className="text-gray-600 mt-2">
            Sign in to your eco-friendly store
          </p>
        </div>

        {/* دکمه‌ها */}
        <div className="space-y-4">
          <button
            onClick={() => signIn("google", { callbackUrl })}
            className="w-full flex items-center justify-center gap-3 py-3.5 px-4 border border-gray-300 rounded-xl hover:border-eco-green hover:bg-eco-light/50 transition-all duration-200 font-medium text-gray-700 shadow-sm hover:shadow-md"
          >
            <FcGoogle className="w-5 h-5" />
            Continue with Google
          </button>

          <button
            onClick={() => signIn("github", { callbackUrl })}
            className="w-full flex items-center justify-center gap-3 py-3.5 px-4 border border-gray-300 rounded-xl hover:border-gray-800 hover:bg-gray-50 transition-all duration-200 font-medium text-gray-700 shadow-sm hover:shadow-md"
          >
            <FaGithub className="w-5 h-5" />
            Continue with GitHub
          </button>
        </div>

        <div className="mt-12 text-center text-xs text-gray-500">
          By signing in, you agree to our{" "}
          <a href="/privacy" className="underline hover:text-eco-green">
            Privacy Policy
          </a>
        </div>
      </div>
    </div>
  );
}
