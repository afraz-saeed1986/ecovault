"use client";

import React, { useState } from "react";
import { User, Mail, Lock, Loader2, LogIn, UserPlus } from "lucide-react";
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
        // Sign In with Email/Password
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        window.location.href = "/";
      } else {
        // Sign Up
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: name },
            emailRedirectTo: window.location.origin,
          },
        });

        if (error) throw error;

        // If email confirmation is disabled or user is auto-confirmed
        if (data.user && data.session) {
          // Create profile
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
        redirectTo: "http://localhost:3000/auth/callback", // دقیقاً این
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
            className="w-full flex items-center justify-center gap-2 sm:gap-3 py-3 sm:py-3.css5 px-3 sm:px-4 border border-gray-300 rounded-xl hover:border-eco-green hover:bg-eco-light/50 transition-all duration-200 font-medium text-sm sm:text-base text-gray-700 shadow-sm hover:shadow-md"
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

          {/* Messages */}
          {error && (
            <p className="text-red-500 text-sm text-center font-medium">
              Error: {error}
            </p>
          )}
          {successMessage && (
            <p className="text-eco-green text-sm text-center font-medium">
              {successMessage}
            </p>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-eco-green text-white py-3 sm:py-3.5 rounded-xl font-semibold text-sm sm:text-base hover:bg-eco-green/90 transition-all duration-300 flex items-center justify-center shadow-lg"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin mr-2" />
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

// //
// "use client";

// import React, { useState } from "react";
// import { User, Mail, Lock, Loader2, LogIn, UserPlus } from "lucide-react";
// import GoogleIcon from "@/components/icons/GoogleIcon";
// import GitHubIcon from "@/components/icons/GitHubIcon";
// // import { supabase } from "@/lib/supabase/client";
// import { supabase } from "@/lib/supabase/client";
// import { z } from "zod";
// // import { createClient } from "@supabase/supabase-js";
// // import { Database } from "@/types/database.types";

// // Placeholder - Please replace these with your actual Supabase values
// // const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
// // const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// // Initialize Supabase Client (only for operations not covered by NextAuth: Sign Up and Social Redirect)
// // const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY);
// // const supabase = createClient();
// // --- 2. Define Validation Schema with Zod (Step 2) ---
// const AuthSchema = z.object({
//   // name is REQUIRED in the base schema. It will be excluded for sign-in via .pick()
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

// // --- 3. Authentication Handler Function with Profile Creation Logic ---
// const handleEmailAuth = async (
//   isSignIn: boolean,
//   email: string,
//   password: string,
//   name: string | undefined,
//   callbackUrl: string
// ) => {
//   if (!isSignIn) {
//     // --- Sign Up Flow (using Supabase for profile creation) ---
//     if (!name) {
//       throw new Error("Name is required for sign up.");
//     }

//     // 1. Supabase: Create user in auth.users
//     const { data: authData, error: authError } = await supabase.auth.signUp({
//       email: email,
//       password: password,
//       options: {
//         data: {
//           full_name: name,
//         },
//         emailRedirectTo: `${window.location.origin}/`,
//       },
//     });

//     if (authError) {
//       throw new Error(authError.message);
//     }

//     // 2. If the user was created immediately (session exists, no email confirmation required)
//     if (authData.user) {
//       // 3. Insert record into the profiles table
//       const { error: profileError } = await supabase.from("profiles").insert({
//         user_id: authData.user.id,
//         name: name,
//         email: email,
//       });

//       if (profileError) {
//         console.error("Failed to create user profile:", profileError);
//       }

//       // 🔥 After successful registration and profile creation, we directly sign in via NextAuth.
//       const result = await signIn("credentials", {
//         email,
//         password,
//         redirect: false, // Prevent automatic redirect
//       });

//       if (result?.error) {
//         throw new Error(result.error);
//       }

//       return "SIGNIN_SUCCESS"; // Now the flow acts like a successful Sign In
//     }

//     // 4. If no session was returned, email confirmation is required.
//     return "SIGNUP_PENDING_CONFIRMATION";
//   } else {
//     // --- Sign In Flow (Main change: using NextAuth) ---

//     const result = await signIn("credentials", {
//       email,
//       password,
//       redirect: false, // Prevent automatic redirect
//     });

//     if (result?.error) {
//       // NextAuth/Supabase error
//       throw new Error(result.error);
//     }

//     return "SIGNIN_SUCCESS";
//   }
// };

// export default function AuthPage() {
//   const callbackUrl = "/";

//   // --- State for unified component state ---
//   const [isSignIn, setIsSignIn] = useState(true); // true = Sign In, false = Sign Up
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [name, setName] = useState("");
//   const [isLoading, setIsLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);
//   const [successMessage, setSuccessMessage] = useState<string | null>(null);

//   // 💡 Step 3: New states for field validation errors
//   const [nameError, setNameError] = useState<string | null>(null);
//   const [emailError, setEmailError] = useState<string | null>(null);
//   const [passwordError, setPasswordError] = useState<string | null>(null);

//   // Function to clear all field errors
//   const clearFieldErrors = () => {
//     setNameError(null);
//     setEmailError(null);
//     setPasswordError(null);
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     // 🔥 CORRECTION 1: Prevent default form submission to let Zod run first.
//     e.preventDefault();

//     setError(null);
//     setSuccessMessage(null);
//     clearFieldErrors(); // Clear previous errors

//     // 💡 Step 4: Execute Zod validation before submission
//     const validationData = {
//       email,
//       password,
//       name: isSignIn ? undefined : name, // Name is only included for sign up
//     };

//     // This is the correct way to conditionally require fields based on mode.
//     // For Sign In: only 'email' and 'password' are required from the base schema.
//     // For Sign Up: 'name', 'email', and 'password' are required.
//     const schema = AuthSchema.pick(
//       isSignIn
//         ? { email: true, password: true }
//         : { name: true, email: true, password: true }
//     );

//     const result = schema.safeParse(validationData);

//     if (!result.success) {
//       // Client-side validation failed

//       // Map Zod errors to dedicated states
//       result.error.issues.forEach((issue) => {
//         if (issue.path[0] === "name") {
//           setNameError(issue.message);
//         }
//         if (issue.path[0] === "email") {
//           setEmailError(issue.message);
//         }
//         if (issue.path[0] === "password") {
//           setPasswordError(issue.message);
//         }
//       });

//       // Display error in public message (optional)
//       setError("Please correct the form errors.");
//       return; // Stop form submission
//     }

//     // If validation passed, continue:
//     setIsLoading(true);

//     try {
//       // Pass callbackUrl to the function
//       const authResult = await handleEmailAuth(
//         isSignIn,
//         email,
//         password,
//         name,
//         callbackUrl
//       );

//       if (authResult === "SIGNIN_SUCCESS") {
//         setSuccessMessage("Authentication successful. Redirecting to app...");

//         // The final redirect is usually handled by NextAuth (if we hadn't set redirect: false)
//         // Since we set redirect: false, we must redirect manually.
//         setTimeout(() => {
//           window.location.href = callbackUrl;
//         }, 500);
//       } else if (authResult === "SIGNUP_PENDING_CONFIRMATION") {
//         setSuccessMessage(
//           "Sign up successful! Please check your email to confirm your account."
//         );
//       }
//     } catch (e) {
//       // 1. Check if e is an Error object (most common case)
//       if (e instanceof Error) {
//         const errorMessage =
//           e.message ||
//           "Authentication failed. Please check your details and try again.";
//         setError(errorMessage);
//       }
//       // 2. If it was a simple object or another type (since e has type unknown)
//       else if (
//         typeof e === "object" &&
//         e !== null &&
//         "message" in e &&
//         typeof (e as { message: unknown }).message === "string"
//       ) {
//         // This case is for objects that have a message but are not Error objects.
//         setError((e as { message: string }).message);
//       }
//       // 3. Default case (if we could not determine the type)
//       else {
//         setError(
//           "An unknown error occurred during authentication. Please try again."
//         );
//       }

//       setSuccessMessage(null);
//     } finally {
//       // Only set isLoading to false if redirect hasn't started
//       if (!successMessage || successMessage.indexOf("Redirecting") === -1) {
//         setIsLoading(false);
//       }
//     }
//   };

//   // 🔥 Replacing Supabase OAuth with NextAuth signIn
//   //   const handleSocialLogin = (provider: string) => {
//   //     setError(null);
//   //     setSuccessMessage(null);
//   //     clearFieldErrors();
//   //     setIsLoading(true); // Display loading before OAuth redirect
//   //     try {
//   //       // Use NextAuth signIn instead of Supabase
//   //       // NextAuth directly redirects the user to the OAuth Provider page
//   //       signIn(provider.toLowerCase(), {
//   //         callbackUrl: callbackUrl, // Redirect to the main route after successful login
//   //       });
//   //       // Note: NextAuth performs the redirect immediately, so isLoading is cleared by the next page load.
//   //     } catch (e) {
//   //       let errorMessage = `Error starting ${provider} login: An unknown error occurred.`;

//   //       // 1. Check if e is a standard Error object
//   //       if (e instanceof Error) {
//   //         errorMessage = `Error starting ${provider} login: ${e.message}`;
//   //       }
//   //       // 2. If it was an object with a message property (like some API responses)
//   //       else if (
//   //         typeof e === "object" &&
//   //         e !== null &&
//   //         "message" in e &&
//   //         typeof (e as { message: unknown }).message === "string"
//   //       ) {
//   //         errorMessage = `Error starting ${provider} login: ${
//   //           (e as { message: string }).message
//   //         }`;
//   //       }

//   //       setError(errorMessage);
//   //       setIsLoading(false);
//   //     }
//   //   };

//   //   const supabase = createClient();

//   const handleSocialLogin = async (provider: "github" | "google") => {
//     setIsLoading(true);
//     setError(null);

//     const { error } = await supabase.auth.signInWithOAuth({
//       provider,
//       options: {
//         redirectTo: `${window.location.origin}/auth/callback`,
//       },
//     });

//     if (error) {
//       console.error("OAuth Error:", error);
//       setError(error.message);
//       setIsLoading(false);
//     }
//     // اگر موفق باشه، Supabase ریدایرکت می‌کنه
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-eco-light to-eco-green/20 flex items-center justify-center px-4 py-8 sm:py-12 font-sans">
//       <div className="max-w-sm sm:max-w-md w-full bg-white rounded-2xl shadow-xl sm:shadow-2xl p-6 sm:p-8 space-y-6 sm:space-y-8 transform transition-all">
//         {/* --- Logo and Title --- */}
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

//         {/* --- Sign In/Sign Up Switch --- */}
//         <div className="flex justify-center -mt-4 mb-6">
//           <button
//             onClick={() => {
//               setIsSignIn(true);
//               setError(null);
//               setSuccessMessage(null);
//               clearFieldErrors(); // Clear errors when switching mode
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
//               clearFieldErrors(); // Clear errors when switching mode
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

//         {/* --- OAuth Buttons (Social Login) --- */}
//         <div className="space-y-3 sm:space-y-4">
//           <button
//             onClick={() => handleSocialLogin("google")}
//             className="w-full flex items-center justify-center gap-2 sm:gap-3 py-3 sm:py-3.5 px-3 sm:px-4 border border-gray-300 rounded-xl hover:border-eco-green hover:bg-eco-light/50 transition-all duration-200 font-medium text-sm sm:text-base text-gray-700 shadow-sm hover:shadow-md"
//             disabled={isLoading}
//           >
//             <GoogleIcon />
//             Continue with Google
//           </button>

//           <button
//             onClick={() => handleSocialLogin("github")}
//             className="w-full flex items-center justify-center gap-2 sm:gap-3 py-3 sm:py-3.5 px-3 sm:px-4 border border-gray-300 rounded-xl hover:border-gray-800 hover:bg-gray-50 transition-all duration-200 font-medium text-sm sm:text-base text-gray-700 shadow-sm hover:shadow-md"
//             disabled={isLoading}
//           >
//             <GitHubIcon />
//             Continue with GitHub
//           </button>
//         </div>

//         {/* --- Separator --- */}
//         <div className="flex items-center my-6">
//           <div className="flex-grow border-t border-gray-200"></div>
//           <span className="flex-shrink mx-4 text-gray-500 text-xs sm:text-sm">
//             or {isSignIn ? "Sign In" : "Sign Up"} with Email
//           </span>
//           <div className="flex-grow border-t border-gray-200"></div>
//         </div>

//         {/* --- Email/Password Form --- */}
//         {/* 🔥 CORRECTION 2: Added noValidate to disable browser's built-in validation */}
//         <form
//           onSubmit={handleSubmit}
//           className="space-y-3 sm:space-y-4"
//           noValidate
//         >
//           {/* Name Field (Sign Up only) */}
//           {!isSignIn && (
//             <div className="relative">
//               <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
//               <input
//                 type="text"
//                 placeholder="Full Name"
//                 value={name}
//                 onChange={(e) => {
//                   setName(e.target.value);
//                   setNameError(null); // Clear error on typing
//                 }}
//                 // 🔥 CORRECTION 3: Removed 'required' attribute
//                 // required={!isSignIn}
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
//                 setEmailError(null); // Clear error on typing
//               }}
//               // 🔥 CORRECTION 3: Removed 'required' attribute
//               // required
//               className={`w-full pl-10 pr-4 py-3 sm:py-3.5 border ${
//                 emailError ? "border-red-500 ring-red-100" : "border-gray-300"
//               } rounded-xl focus:ring-2 focus:ring-eco-green focus:border-eco-green transition-shadow shadow-sm text-sm sm:text-base text-left`}
//               dir="ltr" // Email is usually LTR
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
//                 setPasswordError(null); // Clear error on typing
//               }}
//               // 🔥 CORRECTION 3: Removed 'required' attribute
//               // required
//               className={`w-full pl-10 pr-4 py-3 sm:py-3.5 border ${
//                 passwordError
//                   ? "border-red-500 ring-red-100"
//                   : "border-gray-300"
//               } rounded-xl focus:ring-2 focus:ring-eco-green focus:border-eco-green transition-shadow shadow-sm text-sm sm:text-base text-left`}
//               dir="ltr" // Password is usually LTR
//               disabled={isLoading}
//             />
//             {passwordError && (
//               <p className="mt-1 text-xs text-red-500 font-medium text-left">
//                 {passwordError}
//               </p>
//             )}
//           </div>

//           {/* Global Messages */}
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

//           {/* Final Submission Button */}
//           <button
//             type="submit"
//             className="w-full bg-eco-green text-white py-3 sm:py-3.5 rounded-xl font-semibold text-sm sm:text-base hover:bg-eco-green/90 transition-all duration-300 flex items-center justify-center shadow-lg"
//             disabled={isLoading}
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
