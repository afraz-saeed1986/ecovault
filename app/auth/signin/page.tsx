
"use client";

import React, { useState } from "react";
import { User, Mail, Lock, Loader2, LogIn, UserPlus } from "lucide-react";
import GoogleIcon from "@/components/icons/GoogleIcon";
import GitHubIcon from "@/components/icons/GitHubIcon";

// 💡 Step 1: Import Zod library
import { z } from 'zod';

// 🔥 Import signIn function from NextAuth
import { signIn } from "next-auth/react";

// --- 1. Supabase Imports & Client Initialization (for Sign Up and Redirect-based Social Login) ---
import { createClient } from '@supabase/supabase-js';
import { Database } from "@/types/database.types";

// Placeholder - Please replace these with your actual Supabase values
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Initialize Supabase Client (only for operations not covered by NextAuth: Sign Up and Social Redirect)
const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY);


// --- 2. Define Validation Schema with Zod (Step 2) ---
const AuthSchema = z.object({
    // name is REQUIRED in the base schema. It will be excluded for sign-in via .pick()
    name: z.string().min(3, { message: "Full name must be at least 3 characters." }).max(50, { message: "Full name cannot exceed 50 characters." }),
    email: z.string().email({ message: "Invalid email format." }),
    password: z.string().min(6, { message: "Password must be at least 6 characters." }).max(100, { message: "Password cannot exceed 100 characters." }),
});



// --- 3. Authentication Handler Function with Profile Creation Logic ---
const handleEmailAuth = async (isSignIn: boolean, email: string, password: string, name: string | undefined, callbackUrl: string) => {
    
    if (!isSignIn) {
        // --- Sign Up Flow (using Supabase for profile creation) ---
        if (!name) {
            throw new Error("Name is required for sign up.");
        }
        
        // 1. Supabase: Create user in auth.users
        const { data: authData, error: authError } = await supabase.auth.signUp({
            email: email,
            password: password,
            options: {
                data: { 
                    full_name: name 
                },
                emailRedirectTo: `${window.location.origin}/`,
            },
        });

        if (authError) {
            throw new Error(authError.message);
        }

        // 2. If the user was created immediately (session exists, no email confirmation required)
        if (authData.user) {
             // 3. Insert record into the profiles table
            const { error: profileError } = await supabase
                .from('profiles')
                .insert({ 
                    user_id: authData.user.id, 
                    name: name,
                    email: email, 
                });

            if (profileError) {
                console.error("Failed to create user profile:", profileError);
            }
            
            // 🔥 After successful registration and profile creation, we directly sign in via NextAuth.
            const result = await signIn('credentials', {
                email,
                password,
                redirect: false, // Prevent automatic redirect
            });

            if (result?.error) {
                throw new Error(result.error);
            }

            return "SIGNIN_SUCCESS"; // Now the flow acts like a successful Sign In

        }
        
        // 4. If no session was returned, email confirmation is required.
        return "SIGNUP_PENDING_CONFIRMATION";

    } else {
        // --- Sign In Flow (Main change: using NextAuth) ---
        
        const result = await signIn('credentials', {
            email,
            password,
            redirect: false, // Prevent automatic redirect
        });

        if (result?.error) {
            // NextAuth/Supabase error
            throw new Error(result.error);
        }

        return "SIGNIN_SUCCESS";
    }
};


export default function AuthPage() {
    const callbackUrl = "/"; 

    // --- State for unified component state ---
    const [isSignIn, setIsSignIn] = useState(true); // true = Sign In, false = Sign Up
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    // 💡 Step 3: New states for field validation errors
    const [nameError, setNameError] = useState<string | null>(null);
    const [emailError, setEmailError] = useState<string | null>(null);
    const [passwordError, setPasswordError] = useState<string | null>(null);

    // Function to clear all field errors
    const clearFieldErrors = () => {
        setNameError(null);
        setEmailError(null);
        setPasswordError(null);
    };


    const handleSubmit = async (e: React.FormEvent) => {
        // 🔥 CORRECTION 1: Prevent default form submission to let Zod run first.
        e.preventDefault(); 
        
        setError(null);
        setSuccessMessage(null);
        clearFieldErrors(); // Clear previous errors

        // 💡 Step 4: Execute Zod validation before submission
        const validationData = {
            email, 
            password, 
            name: isSignIn ? undefined : name, // Name is only included for sign up
        };
        
        // This is the correct way to conditionally require fields based on mode.
        // For Sign In: only 'email' and 'password' are required from the base schema.
        // For Sign Up: 'name', 'email', and 'password' are required.
        const schema = AuthSchema.pick(isSignIn ? { email: true, password: true } : { name: true, email: true, password: true });
        
        const result = schema.safeParse(validationData);

        if (!result.success) {
            // Client-side validation failed
            
            // Map Zod errors to dedicated states
            result.error.issues.forEach(issue => {
                if (issue.path[0] === 'name') {
                    setNameError(issue.message);
                }
                if (issue.path[0] === 'email') {
                    setEmailError(issue.message);
                }
                if (issue.path[0] === 'password') {
                    setPasswordError(issue.message);
                }
            });

            // Display error in public message (optional)
            setError("Please correct the form errors.");
            return; // Stop form submission
        }

        // If validation passed, continue:
        setIsLoading(true);

        try {
            // Pass callbackUrl to the function
            const authResult = await handleEmailAuth(isSignIn, email, password, name, callbackUrl);
            
            if (authResult === "SIGNIN_SUCCESS") {
                setSuccessMessage("Authentication successful. Redirecting to app...");
                
                // The final redirect is usually handled by NextAuth (if we hadn't set redirect: false)
                // Since we set redirect: false, we must redirect manually.
                setTimeout(() => {
                    window.location.href = callbackUrl;
                }, 500); 

            } else if (authResult === "SIGNUP_PENDING_CONFIRMATION") {
                setSuccessMessage("Sign up successful! Please check your email to confirm your account.");
            }

        } catch (e) {
            // 1. Check if e is an Error object (most common case)
            if (e instanceof Error) {
                const errorMessage = e.message || "Authentication failed. Please check your details and try again.";
                setError(errorMessage);
            } 
            // 2. If it was a simple object or another type (since e has type unknown)
            else if (typeof e === 'object' && e !== null && 'message' in e && typeof (e as { message: unknown }).message === 'string') {
                // This case is for objects that have a message but are not Error objects.
                setError((e as { message: string }).message);
            }
            // 3. Default case (if we could not determine the type)
            else {
                setError("An unknown error occurred during authentication. Please try again.");
            }

            setSuccessMessage(null);
        } finally {
            // Only set isLoading to false if redirect hasn't started
            if (!successMessage || successMessage.indexOf("Redirecting") === -1) {
                setIsLoading(false);
            }
        }
    };
    
    // 🔥 Replacing Supabase OAuth with NextAuth signIn
    const handleSocialLogin = (provider: string) => {
        setError(null);
        setSuccessMessage(null);
        clearFieldErrors();
        setIsLoading(true); // Display loading before OAuth redirect
        try {
            // Use NextAuth signIn instead of Supabase
            // NextAuth directly redirects the user to the OAuth Provider page
            signIn(provider.toLowerCase(), {
                callbackUrl: callbackUrl, // Redirect to the main route after successful login
            });
            // Note: NextAuth performs the redirect immediately, so isLoading is cleared by the next page load.
        } catch (e) {
    
            let errorMessage = `Error starting ${provider} login: An unknown error occurred.`;

            // 1. Check if e is a standard Error object
            if (e instanceof Error) {
                errorMessage = `Error starting ${provider} login: ${e.message}`;
            } 
            // 2. If it was an object with a message property (like some API responses)
            else if (
                typeof e === 'object' && 
                e !== null && 
                'message' in e && 
                typeof (e as { message: unknown }).message === 'string'
            ) {
                errorMessage = `Error starting ${provider} login: ${(e as { message: string }).message}`;
            }
            
            setError(errorMessage);
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-eco-light to-eco-green/20 flex items-center justify-center px-4 py-8 sm:py-12 font-sans">
            <div className="max-w-sm sm:max-w-md w-full bg-white rounded-2xl shadow-xl sm:shadow-2xl p-6 sm:p-8 space-y-6 sm:space-y-8 transform transition-all">
                
                {/* --- Logo and Title --- */}
                <div className="text-center">
                    <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 bg-eco-green rounded-full mb-3 sm:mb-4">
                        <span className="text-xl sm:text-2xl font-bold text-white">EV</span>
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-eco-dark">
                        {isSignIn ? 'Welcome to EcoVault!' : 'Sign Up for EcoVault'}
                    </h1>
                    <p className="text-sm sm:text-base text-gray-600 mt-1 sm:mt-2">
                        {isSignIn ? 'Log in to access your eco-friendly store.' : 'Create an account to begin your green journey.'}
                    </p>
                </div>

                {/* --- Sign In/Sign Up Switch --- */}
                <div className="flex justify-center -mt-4 mb-6">
                    <button
                        onClick={() => {
                            setIsSignIn(true); 
                            setError(null);
                            setSuccessMessage(null);
                            clearFieldErrors(); // Clear errors when switching mode
                        }}
                        className={`px-4 py-2 text-sm font-semibold rounded-l-xl transition-all duration-300 border-2 border-eco-green ${
                            isSignIn
                                ? 'bg-eco-green text-white shadow-md'
                                : 'bg-white text-eco-green hover:bg-gray-100'
                        }`}
                    >
                        Sign In
                    </button>
                    <button
                        onClick={() => {
                            setIsSignIn(false);
                            setError(null);
                            setSuccessMessage(null);
                            clearFieldErrors(); // Clear errors when switching mode
                        }}
                        className={`px-4 py-2 text-sm font-semibold rounded-r-xl transition-all duration-300 border-2 border-eco-green ${
                            !isSignIn
                                ? 'bg-eco-green text-white shadow-md'
                                : 'bg-white text-eco-green hover:bg-gray-100'
                        }`}
                    >
                        Sign Up
                    </button>
                </div>
                
                {/* --- OAuth Buttons (Social Login) --- */}
                <div className="space-y-3 sm:space-y-4">
                    <button
                        onClick={() => handleSocialLogin("Google")}
                        className="w-full flex items-center justify-center gap-2 sm:gap-3 py-3 sm:py-3.5 px-3 sm:px-4 border border-gray-300 rounded-xl hover:border-eco-green hover:bg-eco-light/50 transition-all duration-200 font-medium text-sm sm:text-base text-gray-700 shadow-sm hover:shadow-md"
                        disabled={isLoading}
                    >
                        <GoogleIcon />
                        Continue with Google
                    </button>

                    <button
                        onClick={() => handleSocialLogin("GitHub")}
                        className="w-full flex items-center justify-center gap-2 sm:gap-3 py-3 sm:py-3.5 px-3 sm:px-4 border border-gray-300 rounded-xl hover:border-gray-800 hover:bg-gray-50 transition-all duration-200 font-medium text-sm sm:text-base text-gray-700 shadow-sm hover:shadow-md"
                        disabled={isLoading}
                    >
                        <GitHubIcon />
                        Continue with GitHub
                    </button>
                </div>

                {/* --- Separator --- */}
                <div className="flex items-center my-6">
                    <div className="flex-grow border-t border-gray-200"></div>
                    <span className="flex-shrink mx-4 text-gray-500 text-xs sm:text-sm">
                        or {isSignIn ? 'Sign In' : 'Sign Up'} with Email
                    </span>
                    <div className="flex-grow border-t border-gray-200"></div>
                </div>

                {/* --- Email/Password Form --- */}
                {/* 🔥 CORRECTION 2: Added noValidate to disable browser's built-in validation */}
                <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4" noValidate> 
                    
                    {/* Name Field (Sign Up only) */}
                    {!isSignIn && (
                        <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Full Name"
                                value={name}
                                onChange={(e) => {
                                    setName(e.target.value);
                                    setNameError(null); // Clear error on typing
                                }}
                                // 🔥 CORRECTION 3: Removed 'required' attribute
                                // required={!isSignIn} 
                                className={`w-full pl-10 pr-4 py-3 sm:py-3.5 border ${nameError ? 'border-red-500 ring-red-100' : 'border-gray-300'} rounded-xl focus:ring-2 focus:ring-eco-green focus:border-eco-green transition-shadow shadow-sm text-sm sm:text-base text-left`}
                                dir="ltr" 
                                disabled={isLoading}
                            />
                            {nameError && (
                                <p className="mt-1 text-xs text-red-500 font-medium text-left">{nameError}</p>
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
                                setEmailError(null); // Clear error on typing
                            }}
                            // 🔥 CORRECTION 3: Removed 'required' attribute
                            // required 
                            className={`w-full pl-10 pr-4 py-3 sm:py-3.5 border ${emailError ? 'border-red-500 ring-red-100' : 'border-gray-300'} rounded-xl focus:ring-2 focus:ring-eco-green focus:border-eco-green transition-shadow shadow-sm text-sm sm:text-base text-left`}
                            dir="ltr" // Email is usually LTR
                            disabled={isLoading}
                        />
                        {emailError && (
                            <p className="mt-1 text-xs text-red-500 font-medium text-left">{emailError}</p>
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
                                setPasswordError(null); // Clear error on typing
                            }}
                            // 🔥 CORRECTION 3: Removed 'required' attribute
                            // required 
                            className={`w-full pl-10 pr-4 py-3 sm:py-3.5 border ${passwordError ? 'border-red-500 ring-red-100' : 'border-gray-300'} rounded-xl focus:ring-2 focus:ring-eco-green focus:border-eco-green transition-shadow shadow-sm text-sm sm:text-base text-left`}
                            dir="ltr" // Password is usually LTR
                            disabled={isLoading}
                        />
                       {passwordError && (
                            <p className="mt-1 text-xs text-red-500 font-medium text-left">{passwordError}</p>
                        )}
                    </div>

                    {/* Global Messages */}
                    {error && (
                        <p className="text-red-500 text-sm text-center font-medium">Error: {error}</p>
                    )}
                    {successMessage && (
                        <p className="text-eco-green text-sm text-center font-medium">{successMessage}</p>
                    )}


                    {/* Final Submission Button */}
                    <button
                        type="submit"
                        className="w-full bg-eco-green text-white py-3 sm:py-3.5 rounded-xl font-semibold text-sm sm:text-base hover:bg-eco-green/90 transition-all duration-300 flex items-center justify-center shadow-lg"
                        disabled={isLoading}
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

                {isSignIn && (
                    <p className="mt-4 text-center text-xs text-gray-500">
                        <a href="/auth/forgot-password" onClick={(e) => { e.preventDefault(); setError("Password reset is done via email."); }} className="text-eco-green hover:underline transition-colors">
                            Forgot Password?
                        </a>
                    </p>
                )}

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

// // 🔥 وارد کردن تابع signIn از NextAuth
// import { signIn } from "next-auth/react";

// // --- 1. Supabase Imports & Client Initialization (برای Sign Up و Social Login ریدایرکتی) ---
// import { createClient } from '@supabase/supabase-js';
// import { Database } from "@/types/database.types";

// // Placeholder - Please replace these with your actual Supabase values
// const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
// const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// // Initialize Supabase Client (فقط برای عملیاتی که NextAuth پوشش نمی‌دهد: Sign Up و Social Redirect)

// const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY);


// // --- SVG Components (No Change) ---
// const GoogleIcon = (props: React.SVGProps<SVGSVGElement>) => (
//     <svg {...props} viewBox="0 0 24 24" fill="none" className="w-5 h-5">
//         <path d="M22.56 12.25c0-.66-.06-1.3-.17-1.92H12v3.84h5.68c-.26 1.34-1.04 2.53-2.22 3.32v2.66h3.42c2.01-1.85 3.17-4.57 3.17-7.9z" fill="#4285F4"/>
//         <path d="M12 23c3.27 0 6.02-1.08 8.03-2.92l-3.42-2.66c-.95.63-2.18 1-3.61 1-2.79 0-5.16-1.89-6.01-4.45H2.57v2.75C4.69 21.52 8.16 23 12 23z" fill="#34A853"/>
//         <path d="M5.99 14.97c-.24-.7-.38-1.44-.38-2.23s.14-1.53.38-2.23V7.76H2.57c-.98 1.95-1.57 4.17-1.57 6.48s.59 4.53 1.57 6.48l3.42-2.75c-.24-.7-.38-1.44-.38-2.23z" fill="#FBBC05"/>
//         <path d="M12 4.19c1.47 0 2.82.5 3.88 1.41l3.05-3.04C18.02 1.5 15.27.42 12 .42c-3.84 0-7.31 1.48-9.43 3.99l3.42 2.75c.85-2.56 3.22-4.45 6.01-4.45z" fill="#EA4335"/>
//     </svg>
// );

// const GitHubIcon = (props: React.SVGProps<SVGSVGElement>) => (
//     <svg {...props} viewBox="0 0 24 24" className="w-5 h-5">
//         <path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.438 9.8 8.205 11.385c.6.11.82-.26.82-.57c0-.285-.01-1.045-.015-2.04c-3.338.725-4.04-1.605-4.04-1.605c-.545-1.38-1.335-1.75-1.335-1.75c-1.09-.745.085-.73.085-.73c1.205.085 1.838 1.238 1.838 1.238c1.07 1.835 2.805 1.305 3.49.995c.11-.775.418-1.305.76-1.605c-2.665-.3-5.464-1.33-5.464-5.94c0-1.31.467-2.385 1.235-3.23c-.12-.3-.535-1.52.115-3.175c0 0 1.005-.325 3.305 1.23c.958-.265 1.98-.398 3-.404c1.02.006 2.042.139 3 .404c2.298-1.555 3.303-1.23 3.303-1.23c.65 1.655.235 2.875.115 3.175c.77.845 1.235 1.92 1.235 3.23c0 4.62-2.8 5.63-5.475 5.93c.42.365.815 1.095.815 2.215c0 1.605-.015 2.898-.015 3.283c0 .31.21.695.825.57C20.565 21.8 24 17.3 24 12c0-6.63-5.37-12-12-12z" fill="#333333"/>
//     </svg>
// );


// // --- 3. Authentication Handler Function with Profile Creation Logic ---
// const handleEmailAuth = async (isSignIn: boolean, email: string, password: string, name: string | undefined, callbackUrl: string) => {
    
//     if (!isSignIn) {
//         // --- Sign Up Flow (با Supabase برای ایجاد پروفایل) ---
//         if (!name) {
//             throw new Error("Name is required for registration.");
//         }
        
//         // 1. Supabase: Create user in auth.users
//         const { data: authData, error: authError } = await supabase.auth.signUp({
//             email: email,
//             password: password,
//             options: {
//                 data: { 
//                     full_name: name 
//                 },
//                 emailRedirectTo: `${window.location.origin}/`,
//             },
//         });

//         if (authError) {
//             throw new Error(authError.message);
//         }

//         // 2. If the user was created immediately (session exists, no email confirmation required)
//         if (authData.user) {
//              // 3. Insert record into the profiles table
//             const { error: profileError } = await supabase
//                 .from('profiles')
//                 .insert({ 
//                     user_id: authData.user.id, 
//                     name: name,
//                     email: email, 
//                 });

//             if (profileError) {
//                 console.error("Failed to create user profile:", profileError);
//             }
            
//             // 🔥 اصلاحیه: پس از ثبت نام موفق و ایجاد پروفایل، مستقیماً از طریق NextAuth لاگین می‌کنیم.
//             const result = await signIn('credentials', {
//                 email,
//                 password,
//                 redirect: false, // جلوگیری از ریدایرکت خودکار
//             });

//             if (result?.error) {
//                 throw new Error(result.error);
//             }

//             return "SIGNIN_SUCCESS"; // حالا جریان مانند یک Sign In موفق عمل می‌کند

//         }
        
//         // 4. If no session was returned, email confirmation is required.
//         return "SIGNUP_PENDING_CONFIRMATION";

//     } else {
//         // --- Sign In Flow (تغییر اصلی: استفاده از NextAuth) ---
        
//         const result = await signIn('credentials', {
//             email,
//             password,
//             redirect: false, // جلوگیری از ریدایرکت خودکار
//         });

//         if (result?.error) {
//             // NextAuth/Supabase error
//             throw new Error(result.error);
//         }

//         return "SIGNIN_SUCCESS";
//     }
// };


// export default function AuthPage() {
//     const callbackUrl = "/"; 

//     // --- State for unified component state ---
//     const [isSignIn, setIsSignIn] = useState(true); // true = Sign In, false = Sign Up
//     const [email, setEmail] = useState('');
//     const [password, setPassword] = useState('');
//     const [name, setName] = useState('');
//     const [isLoading, setIsLoading] = useState(false);
//     const [error, setError] = useState<string | null>(null);
//     const [successMessage, setSuccessMessage] = useState<string | null>(null);

//     // 🔥 حذف کامل useEffect برای Supabase Listener
//     // NextAuth اکنون مسئول مدیریت و ریدایرکت سشن است.

//     const handleSubmit = async (e: React.FormEvent) => {
//         e.preventDefault();
//         setError(null);
//         setSuccessMessage(null);
//         setIsLoading(true);

//         // Ensure name is present for sign up
//         if (!isSignIn && !name.trim()) {
//             setError("Full Name is required for registration.");
//             setIsLoading(false);
//             return;
//         }

//         try {
//             // ارسال callbackUrl به تابع
//             const result = await handleEmailAuth(isSignIn, email, password, name, callbackUrl);
            
//             if (result === "SIGNIN_SUCCESS") {
//                 setSuccessMessage("Authentication successful. Redirecting you to the app...");
                
//                 // ریدایرکت نهایی توسط NextAuth انجام می‌شود. (اگر redirect: false را نداده بودیم)
//                 // چون ما redirect: false را دادیم، باید خودمان ریدایرکت کنیم.
//                 setTimeout(() => {
//                     window.location.href = callbackUrl;
//                 }, 500); 

//             } else if (result === "SIGNUP_PENDING_CONFIRMATION") {
//                 setSuccessMessage("Registration successful! Please check your email to confirm your account before signing in.");
//             }

//         } catch (e) {
//     // 1. بررسی می‌کنیم که آیا e یک شیء Error است (رایج‌ترین حالت)
//     if (e instanceof Error) {
//         const errorMessage = e.message || "Authentication failed. Please check your details and try again.";
//         setError(errorMessage);
//     } 
//     // 2. اگر یک شیء ساده یا نوع دیگری بود (به دلیل اینکه e نوع unknown دارد)
//     else if (typeof e === 'object' && e !== null && 'message' in e && typeof e.message === 'string') {
//         // این حالت برای آبجکت‌هایی است که message دارند ولی Error نیستند.
//         setError(e.message);
//     }
//     // 3. حالت پیش‌فرض (اگر نتوانستیم نوع را بفهمیم)
//     else {
//         setError("An unknown error occurred during authentication. Please try again.");
//     }

//     setSuccessMessage(null);
// } finally {
//             // فقط در صورتی isLoading را false می‌کنیم که ریدایرکت شروع نشده باشد
//             if (!successMessage || successMessage.indexOf("Redirecting") === -1) {
//                 setIsLoading(false);
//             }
//         }
//     };
    
//     // 🔥 جایگزینی Supabase OAuth با NextAuth signIn
//     const handleSocialLogin = (provider: string) => {
//         setError(null);
//         setSuccessMessage(null);
//         setIsLoading(true); // نمایش لودینگ قبل از ریدایرکت OAuth
//         try {
//             // استفاده از signIn NextAuth به جای Supabase
//             // NextAuth مستقیماً کاربر را به صفحه OAuth Provider ریدایرکت می‌کند
//             signIn(provider.toLowerCase(), {
//                 callbackUrl: callbackUrl, // ریدایرکت به مسیر اصلی پس از ورود موفق
//             });
//             // توجه: NextAuth ریدایرکت را بلافاصله انجام می‌دهد، بنابراین isLoading توسط لودینگ صفحه بعدی برطرف می‌شود.
//         } catch (e) {
//     // e در اینجا نوع unknown دارد.
    
//     let errorMessage = `Error initiating ${provider} login: An unknown error occurred.`;

//     // 1. بررسی می‌کند که آیا e یک شیء Error استاندارد است
//     if (e instanceof Error) {
//         errorMessage = `Error initiating ${provider} login: ${e.message}`;
//     } 
//     // 2. اگر یک شیء بود که خصوصیت message داشت (مانند برخی پاسخ‌های API)
//     else if (
//         typeof e === 'object' && 
//         e !== null && 
//         'message' in e && 
//         typeof (e as { message: unknown }).message === 'string'
//     ) {
//         errorMessage = `Error initiating ${provider} login: ${(e as { message: string }).message}`;
//     }
    
//     setError(errorMessage);
//     setIsLoading(false);
// }
//     };

//     return (
//         <div className="min-h-screen bg-gradient-to-br from-eco-light to-eco-green/20 flex items-center justify-center px-4 py-8 sm:py-12 font-sans">
//             <div className="max-w-sm sm:max-w-md w-full bg-white rounded-2xl shadow-xl sm:shadow-2xl p-6 sm:p-8 space-y-6 sm:space-y-8 transform transition-all">
                
//                 {/* --- Logo and Title --- */}
//                 <div className="text-center">
//                     <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 bg-eco-green rounded-full mb-3 sm:mb-4">
//                         <span className="text-xl sm:text-2xl font-bold text-white">EV</span>
//                     </div>
//                     <h1 className="text-2xl sm:text-3xl font-bold text-eco-dark">
//                         {isSignIn ? 'Welcome to EcoVault!' : 'Sign Up for EcoVault'}
//                     </h1>
//                     <p className="text-sm sm:text-base text-gray-600 mt-1 sm:mt-2">
//                         {isSignIn ? 'Sign in to access your eco-friendly store.' : 'Create an account to start your green journey.'}
//                     </p>
//                 </div>

//                 {/* --- Sign In/Sign Up Switch --- */}
//                 <div className="flex justify-center -mt-4 mb-6">
//                     <button
//                         onClick={() => {
//                             setIsSignIn(true); 
//                             setError(null);
//                             setSuccessMessage(null);
//                         }}
//                         className={`px-4 py-2 text-sm font-semibold rounded-l-xl transition-all duration-300 border-2 border-eco-green ${
//                             isSignIn
//                                 ? 'bg-eco-green text-white shadow-md'
//                                 : 'bg-white text-eco-green hover:bg-gray-100'
//                         }`}
//                     >
//                         Sign In
//                     </button>
//                     <button
//                         onClick={() => {
//                             setIsSignIn(false);
//                             setError(null);
//                             setSuccessMessage(null);
//                         }}
//                         className={`px-4 py-2 text-sm font-semibold rounded-r-xl transition-all duration-300 border-2 border-eco-green ${
//                             !isSignIn
//                                 ? 'bg-eco-green text-white shadow-md'
//                                 : 'bg-white text-eco-green hover:bg-gray-100'
//                         }`}
//                     >
//                         Sign Up
//                     </button>
//                 </div>
                
//                 {/* --- OAuth Buttons (Social Login) --- */}
//                 <div className="space-y-3 sm:space-y-4">
//                     <button
//                         onClick={() => handleSocialLogin("Google")}
//                         className="w-full flex items-center justify-center gap-2 sm:gap-3 py-3 sm:py-3.5 px-3 sm:px-4 border border-gray-300 rounded-xl hover:border-eco-green hover:bg-eco-light/50 transition-all duration-200 font-medium text-sm sm:text-base text-gray-700 shadow-sm hover:shadow-md"
//                         disabled={isLoading}
//                     >
//                         <GoogleIcon />
//                         Continue with Google
//                     </button>

//                     <button
//                         onClick={() => handleSocialLogin("GitHub")}
//                         className="w-full flex items-center justify-center gap-2 sm:gap-3 py-3 sm:py-3.5 px-3 sm:px-4 border border-gray-300 rounded-xl hover:border-gray-800 hover:bg-gray-50 transition-all duration-200 font-medium text-sm sm:text-base text-gray-700 shadow-sm hover:shadow-md"
//                         disabled={isLoading}
//                     >
//                         <GitHubIcon />
//                         Continue with GitHub
//                     </button>
//                 </div>

//                 {/* --- Separator --- */}
//                 <div className="flex items-center my-6">
//                     <div className="flex-grow border-t border-gray-200"></div>
//                     <span className="flex-shrink mx-4 text-gray-500 text-xs sm:text-sm">
//                         or {isSignIn ? 'Sign In' : 'Sign Up'} with Email
//                     </span>
//                     <div className="flex-grow border-t border-gray-200"></div>
//                 </div>

//                 {/* --- Email/Password Form --- */}
//                 <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
                    
//                     {/* Name Field (Sign Up only) */}
//                     {!isSignIn && (
//                         <div className="relative">
//                             <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
//                             <input
//                                 type="text"
//                                 placeholder="Full Name"
//                                 value={name}
//                                 onChange={(e) => setName(e.target.value)}
//                                 required={!isSignIn}
//                                 className="w-full pl-10 pr-4 py-3 sm:py-3.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-eco-green focus:border-eco-green transition-shadow shadow-sm text-sm sm:text-base"
//                                 disabled={isLoading}
//                             />
//                         </div>
//                     )}

//                     {/* Email Field */}
//                     <div className="relative">
//                         <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
//                         <input
//                             type="email"
//                             placeholder="Email"
//                             value={email}
//                             onChange={(e) => setEmail(e.target.value)}
//                             required
//                             className="w-full pl-10 pr-4 py-3 sm:py-3.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-eco-green focus:border-eco-green transition-shadow shadow-sm text-sm sm:text-base"
//                             disabled={isLoading}
//                         />
//                     </div>

//                     {/* Password Field */}
//                     <div className="relative">
//                         <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
//                         <input
//                             type="password"
//                             placeholder="Password"
//                             value={password}
//                             onChange={(e) => setPassword(e.target.value)}
//                             required
//                             className="w-full pl-10 pr-4 py-3 sm:py-3.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-eco-green focus:border-eco-green transition-shadow shadow-sm text-sm sm:text-base"
//                             disabled={isLoading}
//                         />
//                     </div>

//                     {/* Messages */}
//                     {error && (
//                         <p className="text-red-500 text-sm text-center font-medium">Error: {error}</p>
//                     )}
//                     {successMessage && (
//                         <p className="text-eco-green text-sm text-center font-medium">{successMessage}</p>
//                     )}


//                     {/* Final Submission Button */}
//                     <button
//                         type="submit"
//                         className="w-full bg-eco-green text-white py-3 sm:py-3.5 rounded-xl font-semibold text-sm sm:text-base hover:bg-eco-green/90 transition-all duration-300 flex items-center justify-center shadow-lg"
//                         disabled={isLoading}
//                     >
//                         {isLoading ? (
//                             <Loader2 className="w-5 h-5 animate-spin mr-2" />
//                         ) : isSignIn ? (
//                             <>
//                                 <LogIn className="w-5 h-5 mr-2" /> Sign In
//                             </>
//                         ) : (
//                             <>
//                                 <UserPlus className="w-5 h-5 mr-2" /> Sign Up
//                             </>
//                         )}
//                     </button>
//                 </form>

//                 {isSignIn && (
//                     <p className="mt-4 text-center text-xs text-gray-500">
//                         <a href="/auth/forgot-password" onClick={(e) => { e.preventDefault(); setError("Password reset is handled via email."); }} className="text-eco-green hover:underline transition-colors">
//                             Forgot your password?
//                         </a>
//                     </p>
//                 )}

//                 <div className="mt-8 sm:mt-12 text-center text-xs text-gray-500">
//                     By signing in, you agree to our{" "}
//                     <a href="/privacy" className="underline hover:text-eco-green">
//                         Privacy Policy
//                     </a>
//                     .
//                 </div>
//             </div>
//         </div>
//     );
// }

