import NextAuth, { NextAuthOptions, Session, User, Account } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import GithubProvider from "next-auth/providers/github";
import CredentialsProvider from "next-auth/providers/credentials";
import { createClient } from "@supabase/supabase-js";
import { Database } from "@/types/database.types";
import { JWT } from "next-auth/jwt";

// --- کلاینت Admin (برای دور زدن RLS و انجام عملیات سرور) ---
const supabaseAdmin = createClient<Database>(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

type ExtendedSession = Session & {
  user: Session["user"] & { id?: string };
};

type CustomUser = {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
};

/**
 * تابع کمکی برای حل مشکل استنتاج تایپ 'never' در متد insert
 * (از کلاینت Admin استفاده می کند)
 */
function typedAdminFrom<T extends keyof Database["public"]["Tables"]>(
  table: T
) {
  type Row = Database["public"]["Tables"][T]["Row"];
  type Insert = Database["public"]["Tables"][T]["Insert"];

  // ما از as unknown as استفاده می‌کنیم تا به TypeScript بگوییم تایپ‌های زیر درست هستند
  return supabaseAdmin.from(table) as unknown as {
    select: (
      columns?: string
    ) => Promise<{ data: Row[] | null; error: unknown }>;
    insert: (
      values: Insert[] | Insert
    ) => Promise<{ data: Row[] | Row | null; error: unknown }>;
    // متدهای دیگر را در صورت نیاز اضافه کنید
  };
}

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
  },

  // آداپتور به دلیل تداخل و خطاها کامنت شده است

  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const { data, error } = await supabaseAdmin.auth.signInWithPassword({
          email: credentials.email,
          password: credentials.password,
        });

        if (error || !data?.user) {
          console.error("Login Failed:", error?.message);
          return null;
        }

        return {
          id: data.user.id,
          email: data.user.email!,
          name:
            data.user.user_metadata?.full_name ||
            data.user.email?.split("@")[0],
          image: data.user.user_metadata?.avatar_url || null,
        };
      },
    }),

    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    GithubProvider({
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!,
    }),
  ],

  callbacks: {
    async jwt({ token, user, account }) {
      if (!user) return token;

      const u = user as CustomUser;

      // تعریف تایپی که فقط فیلد 'id' را شامل می‌شود
      type UserIDRow = Pick<Database["public"]["Tables"]["users"]["Row"], "id">;

      // حالت OAuth (گوگل/گیت‌هاب)
      if (account?.provider && account.provider !== "credentials" && u.email) {
        try {
          // 1. چک می‌کنیم کاربر وجود دارد؟
          const { data: existingUserRaw } = await supabaseAdmin
            .from("users")
            .select("id")
            .eq("email", u.email)
            .single();

          // --- اصلاح نهایی: Type Casting برای رفع خطای 'never' ---
          // داده‌های خام را به تایپ UserIDRow کست می‌کنیم
          const existingUser = existingUserRaw as UserIDRow | null;

          if (existingUser) {
            token.sub = existingUser.id; // ✅ اکنون این خط کار می‌کند
          } else {
            // 2. اگر نبود، می‌سازیم
            const payload: Database["public"]["Tables"]["users"]["Insert"] = {
              email: u.email,
              name: u.name ?? u.email.split("@")[0],
              image: u.image ?? null,
            };

            const insertRes = await typedAdminFrom("users").insert(payload);

            const newUser = Array.isArray(insertRes.data)
              ? (insertRes
                  .data[0] as Database["public"]["Tables"]["users"]["Row"])
              : (insertRes.data as
                  | Database["public"]["Tables"]["users"]["Row"]
                  | null);

            if (newUser) {
              token.sub = newUser.id;
            } else if (insertRes.error) {
              console.error("Supabase Insert Error:", insertRes.error);
            }
          }
        } catch (err) {
          console.error("JWT Callback Error (DB Sync):", err);
        }
      }
      // حالت Credentials
      else if (u.id) {
        token.sub = u.id;
      }

      // انتقال اطلاعات تکمیلی به توکن
      token.email = u.email;
      token.name = u.name;
      token.picture = u.image;

      return token;
    },
    // ... ادامه کد callbacks ...,

    async session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub;
        session.user.name = token.name;
        session.user.image = token.picture;
        session.user.email = token.email;
      }
      return session;
    },
  },

  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };

// import NextAuth, { NextAuthOptions } from "next-auth";
// import GoogleProvider from "next-auth/providers/google";
// import GithubProvider from "next-auth/providers/github";
// import CredentialsProvider from "next-auth/providers/credentials";
// import { SupabaseAdapter } from "@auth/supabase-adapter";
// import { createClient } from "@supabase/supabase-js";
// import { Database } from "@/types/database.types";

// // TS Types
// import { Session } from "next-auth";
// import { JWT } from "next-auth/jwt";

// // ⭐ Supabase Client برای Credential Login
// const supabase = createClient<Database>(
//   process.env.SUPABASE_URL!,
//   process.env.SUPABASE_ANON_KEY!
// );

// // ⭐ Type ایمن برای Session شامل user.id
// type ExtendedSession = Session & {
//   user: Session["user"] & { id?: string };
// };

// export const authOptions: NextAuthOptions = {
//   // ⭐ NextAuth + Supabase یکپارچه
//   adapter: SupabaseAdapter({
//     url: process.env.SUPABASE_URL!,
//     secret: process.env.SUPABASE_SERVICE_ROLE_KEY!,
//   }),

//   providers: [
//     // ⭐ 1) Email/Password via Supabase
//     CredentialsProvider({
//       name: "Credentials",
//       credentials: {
//         email: { label: "Email", type: "email" },
//         password: { label: "Password", type: "password" },
//       },

//       async authorize(credentials) {
//         // ورودی معتبر؟
//         if (!credentials || !credentials.email || !credentials.password) {
//           console.error("Missing credentials");
//           return null;
//         }

//         // لاگین در Supabase
//         const { data, error } = await supabase.auth.signInWithPassword({
//           email: credentials.email,
//           password: credentials.password,
//         });

//         if (error || !data?.user) {
//           console.error("Supabase login failed:", error?.message);
//           return null;
//         }

//         // خروجی لازم برای NextAuth
//         return {
//           id: data.user.id, // UUID Supabase
//           email: data.user.email!,
//           name: data.user.user_metadata?.full_name || data.user.email!,
//           image: data.user.user_metadata?.avatar_url || null,
//         };
//       },
//     }),

//     // ⭐ 2) OAuth Providers → با Supabase Adapter یکپارچه
//     GoogleProvider({
//       clientId: process.env.GOOGLE_CLIENT_ID!,
//       clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
//     }),

//     GithubProvider({
//       clientId: process.env.GITHUB_ID!,
//       clientSecret: process.env.GITHUB_SECRET!,
//     }),
//   ],

//   callbacks: {
//     // ⭐ Logic برای نگه داشتن UUID در session.user.id
//     async jwt({
//       token,
//       user,
//     }: {
//       token: JWT;
//       user?: { id?: string } | undefined;
//     }): Promise<JWT> {
//       // یعنی کاربر تازه لاگین کرده → user وجود دارد
//       if (user?.id) {
//         token.sub = user.id; // همیشه UUID
//       }
//       return token;
//     },

//     async session({
//       session,
//       token,
//     }: {
//       session: ExtendedSession;
//       token: JWT;
//     }): Promise<ExtendedSession> {
//       // token.sub همیشه uuid
//       if (token.sub) {
//         session.user.id = token.sub;
//       }
//       console.log("Session>>>>>>>>>>>>>>>>>>", session);

//       return session;
//     },
//   },

//   secret: process.env.NEXTAUTH_SECRET,
// };

// const handler = NextAuth(authOptions);
// export { handler as GET, handler as POST };
