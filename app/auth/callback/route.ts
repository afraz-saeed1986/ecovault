// app/auth/callback/route.ts
import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');

  if (code) {
    const supabase = await createClient(); // await اضافه شد — این خط مشکل رو حل می‌کنه
    await supabase.auth.exchangeCodeForSession(code);
  }

  // ریدایرکت به صفحه اصلی
  return NextResponse.redirect(new URL('/', requestUrl));
}