// lib/supabase/server.ts
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export const createClient = async () => {
  const cookieStore = await cookies(); // await اضافه شد!

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          try {
            cookieStore.set({ name, value, ...options });
          } catch (error) {
            // ignore
          }
        },
        remove(name: string, options: any) {
          try {
            cookieStore.set({ name, value: '', ...options });
          } catch (error) {
            // ignore
          }
        },
      },
    }
  );
};

// // lib/supabase/server.ts
// import { createServerClient } from '@supabase/ssr';
// import { cookies } from 'next/headers';
// import type { Database } from '@/types/database.types';  // اگر types نداری، حذف کن

// export async function createClient() {  // async اضافه شد!
//   const cookieStore = await cookies();  // await برای resolve Promise

//   return createServerClient<Database>(
//     process.env.NEXT_PUBLIC_SUPABASE_URL!,
//     process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
//     {
//       cookies: {
//         async getAll() {
//           const store = await cookies();  // هر بار await برای freshness
//           return store.getAll();
//         },
//         async setAll(cookiesToSet) {
//           const store = await cookies();  // await برای set
//           try {
//             cookiesToSet.forEach(({ name, value, options }) => {
//               store.set(name, value, options);
//             });
//           } catch (error) {
//             // fallback بی‌صدا (در middleware یا edge ممکنه fail کنه)
//             console.warn('Cookie set failed:', error);
//           }
//         },
//       },
//     }
//   );
// }









