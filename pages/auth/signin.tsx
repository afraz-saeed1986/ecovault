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
    <div className="min-h-screen bg-gradient-to-br from-eco-light to-eco-green/20 flex items-center justify-center px-4 py-8 sm:py-12">
      <div className="max-w-sm sm:max-w-md w-full bg-white rounded-2xl shadow-xl sm:shadow-2xl p-6 sm:p-8 space-y-6 sm:space-y-8 transform transition-all hover:scale-[1.01]">
        {/* لوگو */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 bg-eco-green rounded-full mb-3 sm:mb-4">
            <span className="text-xl sm:text-2xl font-bold text-white">EV</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-eco-dark">EcoVault</h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1 sm:mt-2">
            Sign in to your eco-friendly store
          </p>
        </div>

        {/* دکمه‌ها */}
        <div className="space-y-3 sm:space-y-4">
          <button
            onClick={() => signIn("google", { callbackUrl })}
            className="w-full flex items-center justify-center gap-2 sm:gap-3 py-3 sm:py-3.5 px-3 sm:px-4 border border-gray-300 rounded-xl hover:border-eco-green hover:bg-eco-light/50 transition-all duration-200 font-medium text-sm sm:text-base text-gray-700 shadow-sm hover:shadow-md"
          >
            <FcGoogle className="w-5 h-5" />
            Continue with Google
          </button>

          <button
            onClick={() => signIn("github", { callbackUrl })}
            className="w-full flex items-center justify-center gap-2 sm:gap-3 py-3 sm:py-3.5 px-3 sm:px-4 border border-gray-300 rounded-xl hover:border-gray-800 hover:bg-gray-50 transition-all duration-200 font-medium text-sm sm:text-base text-gray-700 shadow-sm hover:shadow-md"
          >
            <FaGithub className="w-5 h-5" />
            Continue with GitHub
          </button>
        </div>

        <div className="mt-8 sm:mt-12 text-center text-xs text-gray-500">
          By signing in, you agree to our{" "}
          <a href="/privacy" className="underline hover:text-eco-green">
            Privacy Policy
          </a>
        </div>
      </div>
    </div>
  );
}