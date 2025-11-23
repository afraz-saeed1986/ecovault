// lib/axios/instance.ts
import axios from "axios"

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// نوع دقیق کوکی‌های Next.js
type NextCookie = { name: string; value: string }

// کلاینت عمومی — برای Client Components و Server Actions بدون session
export const api = axios.create({
  baseURL: `${SUPABASE_URL}/rest/v1`,
  headers: {
    apikey: SUPABASE_ANON_KEY,
    "Content-Type": "application/json",
  },
})

/**
 * کلاینت سرور — فقط در Server Components یا Server Actions استفاده کن
 * کوکی‌ها رو دستی بده یا از getServerApi استفاده کن
 */
export const apiServer = (cookies?: NextCookie[]) => {
  const instance = axios.create({
    baseURL: `${SUPABASE_URL}/rest/v1`,
    headers: {
      apikey: SUPABASE_ANON_KEY,
      "Content-Type": "application/json",
    },
  })

  if (cookies && cookies.length > 0) {
    instance.defaults.headers.Cookie = cookies
      .map((c) => `${c.name}=${c.value}`)
      .join("; ")
  }

  return instance
}