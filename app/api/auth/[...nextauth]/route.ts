
// pages/api/auth/[...nextauth].ts

import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import GithubProvider from "next-auth/providers/github";
import CredentialsProvider from "next-auth/providers/credentials"; 

// --- Supabase Imports & Client Initialization (همانند AuthPage.tsx) ---
import { createClient } from '@supabase/supabase-js';
import { Database } from "@/types/database.types"; 
import { CustomUser } from "@/types/next-auth"; // 💡 ایمپورت کردن تایپ CustomUser

// اطمینان حاصل کنید که متغیرهای محیطی در اینجا در دسترس هستند
// توجه: در API Routes که Server-Side هستند، باید از متغیرهای بدون پیشوند NEXT_PUBLIC استفاده شود
// اما چون شما از متغیرهای NEXT_PUBLIC استفاده می‌کنید، فرض می‌کنیم برای سازگاری در Vercel اینگونه تعریف شده‌اند.
const SUPABASE_URL = process.env.SUPABASE_URL!
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY!


const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY);
// ----------------------------------------------------------------------


const authOptions: NextAuthOptions = {
  providers: [
    // 1. Credential Provider
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
     async authorize(credentials, req) {
  console.log("--- Credentials Login Attempt ---");
  console.log("Email:", credentials?.email);
  console.log("SUPABASE_URL:", SUPABASE_URL ? "OK" : "MISSING!");

  if (!credentials?.email || !credentials?.password) {
    console.error("Missing email or password");
    return null;
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email: credentials.email,
    password: credentials.password,   // ← این خط رو درست کن!
  });

  if (error) {
    console.error("Supabase Auth Error:", error.message);
    return null;
  }

  if (!data.user) {
    console.error("No user returned from Supabase");
    return null;
  }

  console.log("Login successful for user:", data.user.id);

  const user: CustomUser = {
    id: data.user.id,
    email: data.user.email!,
    name: data.user.user_metadata?.full_name || data.user.email!,
    image: data.user.user_metadata?.avatar_url || null,
    accessToken: data.session?.access_token || undefined,
  };

  return user;
},
    }),
    // 2. OAuth Providers قبلی شما
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    GithubProvider({
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!,
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/auth/signin", 
  },
  
  // --- تنظیمات JWT و Session برای انتقال اطلاعات Supabase ---
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        // 🔥 حذف @ts-ignore
        token.accessToken = (user as CustomUser).accessToken; 
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      // 🔥 حذف @ts-ignore
      session.accessToken = token.accessToken;
      // 🔥 حذف @ts-ignore - 'id' مستقیماً به user اضافه می‌شود
      session.user.id = token.id; 
      return session;
    },
    async redirect({ url, baseUrl }) {
      if (url.startsWith(baseUrl)) {
        return url;
      }
      return baseUrl;
    },
  },
  // -------------------------------------------------------------
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };



