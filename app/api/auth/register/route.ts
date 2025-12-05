import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin'; // وارد کردن کلاینت ادمین از گام ۱

// این مسیر ثبت‌نام کاربر با ایمیل و رمز عبور را مدیریت می‌کند
export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Name, email, and password are required.' }, { status: 400 }); 
    }

    // 1. Sign up the user in Supabase Auth (auth.users) using the Admin client
    const { data: userData, error: signUpError } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        // Optional: auto confirm the email if you don't need email verification
        email_confirm: true, 
        user_metadata: { name: name },
    });

    if (signUpError) {
      console.error('Supabase Sign Up Error:', signUpError);
      // Supabase خطاهای مختلفی برمی‌گرداند، مثلاً "User already exists"
      return NextResponse.json({ error: signUpError.message || 'Sign up failed.' }, { status: 400 }); 
    }

    const userId = userData.user?.id;

    if (!userId) {
        return NextResponse.json({ error: 'Internal error: User ID not created.' }, { status: 500 });
    }

    // 2. Insert the profile record into public.profiles
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .insert([
        {
          user_id: userId,
          name: name,
          email: email,
          role: 'user', // Set default role
        },
      ]);

    if (profileError) {
      // CRITICAL: If profile creation fails, delete the user auth record to prevent orphaned accounts
      await supabaseAdmin.auth.admin.deleteUser(userId);
      console.error('Supabase Profile Creation Error:', profileError);
      return NextResponse.json({ error: 'Error creating profile. Account was rolled back.' }, { status: 500 });
    }

    // 3. Success response
    return NextResponse.json({ message: 'Registration successful.' }, { status: 200 });

  } catch (error) {
    console.error('API Handler Error:', error);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}