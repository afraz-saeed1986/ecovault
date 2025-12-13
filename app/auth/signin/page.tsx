"use client";

import React, { useState } from "react";
import { User, Mail, Lock, LogIn, UserPlus } from "lucide-react";
import GoogleIcon from "@/components/icons/GoogleIcon";
import GitHubIcon from "@/components/icons/GitHubIcon";
import { supabase } from "@/lib/supabase/client";
import { z } from "zod";

const AuthSchema = z.object({
  name: z
    .string()
    .min(3, { message: "Full name must be at least 3 characters." })
    .max(50, { message: "Full name cannot exceed 50 characters." }),
  email: z.string().email({ message: "Invalid email format." }),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters." })
    .max(100, { message: "Password cannot exceed 100 characters." }),
});

export default function AuthPage() {
  const [isSignIn, setIsSignIn] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [nameError, setNameError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const clearFieldErrors = () => {
    setNameError(null);
    setEmailError(null);
    setPasswordError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    clearFieldErrors();

    const schema = isSignIn
      ? AuthSchema.pick({ email: true, password: true })
      : AuthSchema;

    const result = schema.safeParse(
      isSignIn ? { email, password } : { name, email, password }
    );

    if (!result.success) {
      result.error.issues.forEach((issue) => {
        if (issue.path[0] === "name") setNameError(issue.message);
        if (issue.path[0] === "email") setEmailError(issue.message);
        if (issue.path[0] === "password") setPasswordError(issue.message);
      });
      setError("Please correct the form errors.");
      return;
    }

    setIsLoading(true);

    try {
      if (isSignIn) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        window.location.href = "/";
      } else {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: name },
            emailRedirectTo: window.location.origin,
          },
        });

        if (error) throw error;

        if (data.user && data.session) {
          const { error: profileError } = await supabase
            .from("profiles")
            .insert({
              user_id: data.user.id,
              name,
              email,
            });

          if (profileError) console.error("Profile error:", profileError);

          window.location.href = "/";
        } else {
          setSuccessMessage(
            "Sign up successful! Please check your email to confirm your account."
          );
        }
      }
    } catch (err: any) {
      setError(err.message || "An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialLogin = async (provider: "github" | "google") => {
    setIsLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: "http://localhost:3000/auth/callback",
      },
    });

    if (error) {
      setError(error.message);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-eco-light to-eco-green/20 flex items-center justify-center px-4 py-8 sm:py-12 font-sans">
      <div className="max-w-sm sm:max-w-md w-full bg-white rounded-2xl shadow-xl sm:shadow-2xl p-6 sm:p-8 space-y-6 sm:space-y-8 transform transition-all">
        {/* Logo and Title */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 bg-eco-green rounded-full mb-3 sm:mb-4">
            <span className="text-xl sm:text-2xl font-bold text-white">EV</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-eco-dark">
            {isSignIn ? "Welcome to EcoVault!" : "Sign Up for EcoVault"}
          </h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1 sm:mt-2">
            {isSignIn
              ? "Log in to access your eco-friendly store."
              : "Create an account to begin your green journey."}
          </p>
        </div>

        {/* Sign In / Sign Up Toggle */}
        <div className="flex justify-center -mt-4 mb-6">
          <button
            onClick={() => {
              setIsSignIn(true);
              setError(null);
              setSuccessMessage(null);
              clearFieldErrors();
            }}
            className={`px-4 py-2 text-sm font-semibold rounded-l-xl transition-all duration-300 border-2 border-eco-green ${
              isSignIn
                ? "bg-eco-green text-white shadow-md"
                : "bg-white text-eco-green hover:bg-gray-100"
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => {
              setIsSignIn(false);
              setError(null);
              setSuccessMessage(null);
              clearFieldErrors();
            }}
            className={`px-4 py-2 text-sm font-semibold rounded-r-xl transition-all duration-300 border-2 border-eco-green ${
              !isSignIn
                ? "bg-eco-green text-white shadow-md"
                : "bg-white text-eco-green hover:bg-gray-100"
            }`}
          >
            Sign Up
          </button>
        </div>

        {/* Social Login Buttons */}
        <div className="space-y-3 sm:space-y-4">
          <button
            onClick={() => handleSocialLogin("google")}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 sm:gap-3 py-3 sm:py-3.5 px-3 sm:px-4 border border-gray-300 rounded-xl hover:border-eco-green hover:bg-eco-light/50 transition-all duration-200 font-medium text-sm sm:text-base text-gray-700 shadow-sm hover:shadow-md"
          >
            <GoogleIcon />
            Continue with Google
          </button>

          <button
            onClick={() => handleSocialLogin("github")}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 sm:gap-3 py-3 sm:py-3.5 px-3 sm:px-4 border border-gray-300 rounded-xl hover:border-gray-800 hover:bg-gray-50 transition-all duration-200 font-medium text-sm sm:text-base text-gray-700 shadow-sm hover:shadow-md"
          >
            <GitHubIcon />
            Continue with GitHub
          </button>
        </div>

        {/* Separator */}
        <div className="flex items-center my-6">
          <div className="flex-grow border-t border-gray-200"></div>
          <span className="flex-shrink mx-4 text-gray-500 text-xs sm:text-sm">
            or {isSignIn ? "Sign In" : "Sign Up"} with Email
          </span>
          <div className="flex-grow border-t border-gray-200"></div>
        </div>

        {/* Email/Password Form */}
        <form
          onSubmit={handleSubmit}
          className="space-y-3 sm:space-y-4"
          noValidate
        >
          {/* Name Field - Only on Sign Up */}
          {!isSignIn && (
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Full Name"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setNameError(null);
                }}
                className={`w-full pl-10 pr-4 py-3 sm:py-3.5 border ${
                  nameError ? "border-red-500 ring-red-100" : "border-gray-300"
                } rounded-xl focus:ring-2 focus:ring-eco-green focus:border-eco-green transition-shadow shadow-sm text-sm sm:text-base text-left`}
                dir="ltr"
                disabled={isLoading}
              />
              {nameError && (
                <p className="mt-1 text-xs text-red-500 font-medium text-left">
                  {nameError}
                </p>
              )}
            </div>
          )}

          {/* Email Field */}
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setEmailError(null);
              }}
              className={`w-full pl-10 pr-4 py-3 sm:py-3.5 border ${
                emailError ? "border-red-500 ring-red-100" : "border-gray-300"
              } rounded-xl focus:ring-2 focus:ring-eco-green focus:border-eco-green transition-shadow shadow-sm text-sm sm:text-base text-left`}
              dir="ltr"
              disabled={isLoading}
            />
            {emailError && (
              <p className="mt-1 text-xs text-red-500 font-medium text-left">
                {emailError}
              </p>
            )}
          </div>

          {/* Password Field */}
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setPasswordError(null);
              }}
              className={`w-full pl-10 pr-4 py-3 sm:py-3.5 border ${
                passwordError
                  ? "border-red-500 ring-red-100"
                  : "border-gray-300"
              } rounded-xl focus:ring-2 focus:ring-eco-green focus:border-eco-green transition-shadow shadow-sm text-sm sm:text-base text-left`}
              dir="ltr"
              disabled={isLoading}
            />
            {passwordError && (
              <p className="mt-1 text-xs text-red-500 font-medium text-left">
                {passwordError}
              </p>
            )}
          </div>

          {/* Messages — دقیقاً مثل صفحه پروفایل */}
          {error && (
            <div className="mt-6 p-4 rounded-xl flex items-center gap-3 bg-red-50 dark:bg-red-900/30 text-red-800 dark:text-white-200 border border-red-200 dark:border-red-800">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="font-medium">Error: {error}</span>
            </div>
          )}

          {successMessage && (
            <div className="mt-6 p-4 rounded-xl flex items-center gap-3 bg-green-50 dark:bg-green-900/30 text-green-800 dark:text-green-200 border border-green-200 dark:border-green-800">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="font-medium">{successMessage}</span>
            </div>
          )}

          {/* Submit Button — حالا spinner کوچک و بدون آیکون وقتی لودینگ هست */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-eco-green text-white py-3 sm:py-3.5 rounded-xl font-semibold text-sm sm:text-base hover:bg-eco-green/90 transition-all duration-300 flex items-center justify-center shadow-lg"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v8z"
                  />
                </svg>
              </>
            ) : isSignIn ? (
              <>
                <LogIn className="w-5 h-5 mr-2" /> Sign In
              </>
            ) : (
              <>
                <UserPlus className="w-5 h-5 mr-2" /> Sign Up
              </>
            )}
          </button>
        </form>

        {/* Forgot Password */}
        {isSignIn && (
          <p className="mt-4 text-center text-xs text-gray-500">
            <a
              href="/auth/forgot-password"
              onClick={(e) => {
                e.preventDefault();
                setError("Password reset is done via email.");
              }}
              className="text-eco-green hover:underline transition-colors"
            >
              Forgot Password?
            </a>
          </p>
        )}

        {/* Privacy Policy */}
        <div className="mt-8 sm:mt-12 text-center text-xs text-gray-500">
          By logging in, you agree to our{" "}
          <a href="/privacy" className="underline hover:text-eco-green">
            Privacy Policy
          </a>
          .
        </div>
      </div>
    </div>
  );
}

// "use client";

// import React, { useState } from "react";
// import { User, Mail, Lock, Loader2, LogIn, UserPlus } from "lucide-react";
// import GoogleIcon from "@/components/icons/GoogleIcon";
// import GitHubIcon from "@/components/icons/GitHubIcon";
// import { supabase } from "@/lib/supabase/client";
// import { z } from "zod";

// const AuthSchema = z.object({
//   name: z
//     .string()
//     .min(3, { message: "Full name must be at least 3 characters." })
//     .max(50, { message: "Full name cannot exceed 50 characters." }),
//   email: z.string().email({ message: "Invalid email format." }),
//   password: z
//     .string()
//     .min(6, { message: "Password must be at least 6 characters." })
//     .max(100, { message: "Password cannot exceed 100 characters." }),
// });

// export default function AuthPage() {
//   const [isSignIn, setIsSignIn] = useState(true);
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [name, setName] = useState("");
//   const [isLoading, setIsLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);
//   const [successMessage, setSuccessMessage] = useState<string | null>(null);

//   const [nameError, setNameError] = useState<string | null>(null);
//   const [emailError, setEmailError] = useState<string | null>(null);
//   const [passwordError, setPasswordError] = useState<string | null>(null);

//   const clearFieldErrors = () => {
//     setNameError(null);
//     setEmailError(null);
//     setPasswordError(null);
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setError(null);
//     setSuccessMessage(null);
//     clearFieldErrors();

//     const schema = isSignIn
//       ? AuthSchema.pick({ email: true, password: true })
//       : AuthSchema;

//     const result = schema.safeParse(
//       isSignIn ? { email, password } : { name, email, password }
//     );

//     if (!result.success) {
//       result.error.issues.forEach((issue) => {
//         if (issue.path[0] === "name") setNameError(issue.message);
//         if (issue.path[0] === "email") setEmailError(issue.message);
//         if (issue.path[0] === "password") setPasswordError(issue.message);
//       });
//       setError("Please correct the form errors.");
//       return;
//     }

//     setIsLoading(true);

//     try {
//       if (isSignIn) {
//         // Sign In with Email/Password
//         const { error } = await supabase.auth.signInWithPassword({
//           email,
//           password,
//         });

//         if (error) throw error;

//         window.location.href = "/";
//       } else {
//         // Sign Up
//         const { data, error } = await supabase.auth.signUp({
//           email,
//           password,
//           options: {
//             data: { full_name: name },
//             emailRedirectTo: window.location.origin,
//           },
//         });

//         if (error) throw error;

//         // If email confirmation is disabled or user is auto-confirmed
//         if (data.user && data.session) {
//           // Create profile
//           const { error: profileError } = await supabase
//             .from("profiles")
//             .insert({
//               user_id: data.user.id,
//               name,
//               email,
//             });

//           if (profileError) console.error("Profile error:", profileError);

//           window.location.href = "/";
//         } else {
//           setSuccessMessage(
//             "Sign up successful! Please check your email to confirm your account."
//           );
//         }
//       }
//     } catch (err: any) {
//       setError(err.message || "An error occurred. Please try again.");
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const handleSocialLogin = async (provider: "github" | "google") => {
//     setIsLoading(true);
//     setError(null);

//     const { error } = await supabase.auth.signInWithOAuth({
//       provider,
//       options: {
//         redirectTo: "http://localhost:3000/auth/callback", // دقیقاً این
//       },
//     });

//     if (error) {
//       setError(error.message);
//       setIsLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-eco-light to-eco-green/20 flex items-center justify-center px-4 py-8 sm:py-12 font-sans">
//       <div className="max-w-sm sm:max-w-md w-full bg-white rounded-2xl shadow-xl sm:shadow-2xl p-6 sm:p-8 space-y-6 sm:space-y-8 transform transition-all">
//         {/* Logo and Title */}
//         <div className="text-center">
//           <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 bg-eco-green rounded-full mb-3 sm:mb-4">
//             <span className="text-xl sm:text-2xl font-bold text-white">EV</span>
//           </div>
//           <h1 className="text-2xl sm:text-3xl font-bold text-eco-dark">
//             {isSignIn ? "Welcome to EcoVault!" : "Sign Up for EcoVault"}
//           </h1>
//           <p className="text-sm sm:text-base text-gray-600 mt-1 sm:mt-2">
//             {isSignIn
//               ? "Log in to access your eco-friendly store."
//               : "Create an account to begin your green journey."}
//           </p>
//         </div>

//         {/* Sign In / Sign Up Toggle */}
//         <div className="flex justify-center -mt-4 mb-6">
//           <button
//             onClick={() => {
//               setIsSignIn(true);
//               setError(null);
//               setSuccessMessage(null);
//               clearFieldErrors();
//             }}
//             className={`px-4 py-2 text-sm font-semibold rounded-l-xl transition-all duration-300 border-2 border-eco-green ${
//               isSignIn
//                 ? "bg-eco-green text-white shadow-md"
//                 : "bg-white text-eco-green hover:bg-gray-100"
//             }`}
//           >
//             Sign In
//           </button>
//           <button
//             onClick={() => {
//               setIsSignIn(false);
//               setError(null);
//               setSuccessMessage(null);
//               clearFieldErrors();
//             }}
//             className={`px-4 py-2 text-sm font-semibold rounded-r-xl transition-all duration-300 border-2 border-eco-green ${
//               !isSignIn
//                 ? "bg-eco-green text-white shadow-md"
//                 : "bg-white text-eco-green hover:bg-gray-100"
//             }`}
//           >
//             Sign Up
//           </button>
//         </div>

//         {/* Social Login Buttons */}
//         <div className="space-y-3 sm:space-y-4">
//           <button
//             onClick={() => handleSocialLogin("google")}
//             disabled={isLoading}
//             className="w-full flex items-center justify-center gap-2 sm:gap-3 py-3 sm:py-3.css5 px-3 sm:px-4 border border-gray-300 rounded-xl hover:border-eco-green hover:bg-eco-light/50 transition-all duration-200 font-medium text-sm sm:text-base text-gray-700 shadow-sm hover:shadow-md"
//           >
//             <GoogleIcon />
//             Continue with Google
//           </button>

//           <button
//             onClick={() => handleSocialLogin("github")}
//             disabled={isLoading}
//             className="w-full flex items-center justify-center gap-2 sm:gap-3 py-3 sm:py-3.5 px-3 sm:px-4 border border-gray-300 rounded-xl hover:border-gray-800 hover:bg-gray-50 transition-all duration-200 font-medium text-sm sm:text-base text-gray-700 shadow-sm hover:shadow-md"
//           >
//             <GitHubIcon />
//             Continue with GitHub
//           </button>
//         </div>

//         {/* Separator */}
//         <div className="flex items-center my-6">
//           <div className="flex-grow border-t border-gray-200"></div>
//           <span className="flex-shrink mx-4 text-gray-500 text-xs sm:text-sm">
//             or {isSignIn ? "Sign In" : "Sign Up"} with Email
//           </span>
//           <div className="flex-grow border-t border-gray-200"></div>
//         </div>

//         {/* Email/Password Form */}
//         <form
//           onSubmit={handleSubmit}
//           className="space-y-3 sm:space-y-4"
//           noValidate
//         >
//           {/* Name Field - Only on Sign Up */}
//           {!isSignIn && (
//             <div className="relative">
//               <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
//               <input
//                 type="text"
//                 placeholder="Full Name"
//                 value={name}
//                 onChange={(e) => {
//                   setName(e.target.value);
//                   setNameError(null);
//                 }}
//                 className={`w-full pl-10 pr-4 py-3 sm:py-3.5 border ${
//                   nameError ? "border-red-500 ring-red-100" : "border-gray-300"
//                 } rounded-xl focus:ring-2 focus:ring-eco-green focus:border-eco-green transition-shadow shadow-sm text-sm sm:text-base text-left`}
//                 dir="ltr"
//                 disabled={isLoading}
//               />
//               {nameError && (
//                 <p className="mt-1 text-xs text-red-500 font-medium text-left">
//                   {nameError}
//                 </p>
//               )}
//             </div>
//           )}

//           {/* Email Field */}
//           <div className="relative">
//             <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
//             <input
//               type="email"
//               placeholder="Email"
//               value={email}
//               onChange={(e) => {
//                 setEmail(e.target.value);
//                 setEmailError(null);
//               }}
//               className={`w-full pl-10 pr-4 py-3 sm:py-3.5 border ${
//                 emailError ? "border-red-500 ring-red-100" : "border-gray-300"
//               } rounded-xl focus:ring-2 focus:ring-eco-green focus:border-eco-green transition-shadow shadow-sm text-sm sm:text-base text-left`}
//               dir="ltr"
//               disabled={isLoading}
//             />
//             {emailError && (
//               <p className="mt-1 text-xs text-red-500 font-medium text-left">
//                 {emailError}
//               </p>
//             )}
//           </div>

//           {/* Password Field */}
//           <div className="relative">
//             <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
//             <input
//               type="password"
//               placeholder="Password"
//               value={password}
//               onChange={(e) => {
//                 setPassword(e.target.value);
//                 setPasswordError(null);
//               }}
//               className={`w-full pl-10 pr-4 py-3 sm:py-3.5 border ${
//                 passwordError
//                   ? "border-red-500 ring-red-100"
//                   : "border-gray-300"
//               } rounded-xl focus:ring-2 focus:ring-eco-green focus:border-eco-green transition-shadow shadow-sm text-sm sm:text-base text-left`}
//               dir="ltr"
//               disabled={isLoading}
//             />
//             {passwordError && (
//               <p className="mt-1 text-xs text-red-500 font-medium text-left">
//                 {passwordError}
//               </p>
//             )}
//           </div>

//           {/* Messages */}
//           {error && (
//             <p className="text-red-500 text-sm text-center font-medium">
//               Error: {error}
//             </p>
//           )}
//           {successMessage && (
//             <p className="text-eco-green text-sm text-center font-medium">
//               {successMessage}
//             </p>
//           )}

//           {/* Submit Button */}
//           <button
//             type="submit"
//             disabled={isLoading}
//             className="w-full bg-eco-green text-white py-3 sm:py-3.5 rounded-xl font-semibold text-sm sm:text-base hover:bg-eco-green/90 transition-all duration-300 flex items-center justify-center shadow-lg"
//           >
//             {isLoading ? (
//               <Loader2 className="w-5 h-5 animate-spin mr-2" />
//             ) : isSignIn ? (
//               <>
//                 <LogIn className="w-5 h-5 mr-2" /> Sign In
//               </>
//             ) : (
//               <>
//                 <UserPlus className="w-5 h-5 mr-2" /> Sign Up
//               </>
//             )}
//           </button>
//         </form>

//         {/* Forgot Password */}
//         {isSignIn && (
//           <p className="mt-4 text-center text-xs text-gray-500">
//             <a
//               href="/auth/forgot-password"
//               onClick={(e) => {
//                 e.preventDefault();
//                 setError("Password reset is done via email.");
//               }}
//               className="text-eco-green hover:underline transition-colors"
//             >
//               Forgot Password?
//             </a>
//           </p>
//         )}

//         {/* Privacy Policy */}
//         <div className="mt-8 sm:mt-12 text-center text-xs text-gray-500">
//           By logging in, you agree to our{" "}
//           <a href="/privacy" className="underline hover:text-eco-green">
//             Privacy Policy
//           </a>
//           .
//         </div>
//       </div>
//     </div>
//   );
// }
