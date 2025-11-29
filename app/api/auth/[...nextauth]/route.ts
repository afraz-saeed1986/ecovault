import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import GithubProvider from "next-auth/providers/github";

// تنظیمات Auth شما را در یک آبجکت جداگانه export می‌کنیم
const authOptions = {
  providers: [
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
    // مسیر صفحه sign-in را به ساختار App Router منتقل می‌کنیم
    signIn: "/auth/signin", 
  },
  callbacks: {
    // Callback شما بدون تغییر می‌ماند
    async redirect({ url, baseUrl }) {
      if (url.startsWith(baseUrl)) {
        return url;
      }
      return baseUrl;
    },
  },
};

// NextAuth به صورت داخلی Route Handlerها را برای GET و POST ایجاد می‌کند
const handler = NextAuth(authOptions);

// export کردن توابع GET و POST که توسط NextAuth تولید شده‌اند
export { handler as GET, handler as POST };