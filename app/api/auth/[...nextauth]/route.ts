import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import GithubProvider from "next-auth/providers/github";
import CredentialsProvider from "next-auth/providers/credentials"; // 👈 اضافه شدن Provider جدید

// --- Supabase Imports & Client Initialization (همانند AuthPage.tsx) ---
import { createClient } from '@supabase/supabase-js';
import { Database } from "@/types/database.types"; 

// اطمینان حاصل کنید که متغیرهای محیطی در اینجا در دسترس هستند
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// @ts-ignore
const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY);
// ----------------------------------------------------------------------


const authOptions: NextAuthOptions = {
  providers: [
    // 1. Credential Provider برای ورود با ایمیل و رمز عبور (Supabase)
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, req) {
        if (!credentials) return null;

        // فراخوانی Sign In با Supabase
        const { data, error } = await supabase.auth.signInWithPassword({
          email: credentials.email,
          password: credentials.password,
        });

        if (error) {
          // اگر Supabase خطا داد
          console.error("Supabase Sign In Error:", error.message);
          return null; 
        }

        if (data.user) {
          // ورود موفقیت‌آمیز
          return {
            id: data.user.id,
            email: data.user.email,
            // نام را از metadata یا ایمیل می‌گیریم
            name: data.user.user_metadata.full_name || data.user.email,
            image: data.user.user_metadata.avatar_url || null,
            // توکن Supabase را برای استفاده‌های بعدی در سشن/JWT ذخیره می‌کنیم
            accessToken: data.session?.access_token,
          };
        }

        return null;
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
        // اگر از Credentials Provider آمده باشد، accessToken را اضافه کنید
        // @ts-ignore
        token.accessToken = user.accessToken;
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      // اضافه کردن accessToken و id به سشن (قابل استفاده در useSession)
      // @ts-ignore
      session.accessToken = token.accessToken;
      // @ts-ignore
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



// import NextAuth from "next-auth";
// import GoogleProvider from "next-auth/providers/google";
// import GithubProvider from "next-auth/providers/github";

// // تنظیمات Auth شما را در یک آبجکت جداگانه export می‌کنیم
// const authOptions = {
//   providers: [
//     GoogleProvider({
//       clientId: process.env.GOOGLE_CLIENT_ID!,
//       clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
//     }),
//     GithubProvider({
//       clientId: process.env.GITHUB_ID!,
//       clientSecret: process.env.GITHUB_SECRET!,
//     }),
//   ],
//   secret: process.env.NEXTAUTH_SECRET,
//   pages: {
//     // مسیر صفحه sign-in را به ساختار App Router منتقل می‌کنیم
//     signIn: "/auth/signin", 
//   },
//   callbacks: {
//     // Callback شما بدون تغییر می‌ماند
//     async redirect({ url, baseUrl }) {
//       if (url.startsWith(baseUrl)) {
//         return url;
//       }
//       return baseUrl;
//     },
//   },
// };

// // NextAuth به صورت داخلی Route Handlerها را برای GET و POST ایجاد می‌کند
// const handler = NextAuth(authOptions);

// // export کردن توابع GET و POST که توسط NextAuth تولید شده‌اند
// export { handler as GET, handler as POST };