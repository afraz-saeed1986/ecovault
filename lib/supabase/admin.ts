import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database.types'; // فرض بر وجود تعریف نوع دیتابیس است

// متغیرهای محیطی مورد نیاز برای کلاینت ادمین (کلید سکرت)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
// حتماً باید از کلید SERVICE_ROLE_KEY استفاده شود که در .env.local تعریف شده است
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY; 

if (!supabaseUrl || !supabaseServiceRoleKey) {
  // اگر متغیرهای محیطی حیاتی برای کلاینت ادمین تنظیم نشده باشند، خطا ایجاد می‌شود
  throw new Error('Missing Supabase environment variables for admin client.'); 
}

/**
 * ایجاد کلاینت Supabase با پیکربندی مدیریتی برای استفاده در API Routes.
 * این کلاینت از Service Role Key برای دور زدن RLS و انجام عملیات مدیریتی استفاده می‌کند.
 */
export const supabaseAdmin = createClient<Database>(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false,
    },
});