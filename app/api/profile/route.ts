// app/api/profile/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { supabaseAdmin } from "@/lib/supabase/admin";
import type { Database } from "@/types/database.types";
import type { Profile as DbProfile } from "@/types/index";

type ProfilePayload = {
  phone?: string | null;
  avatar_url?: string | null;
  name?: string | null;
  email?: string | null;
};

/** تبدیل خطای unknown به پیام قابل نمایش */
function getErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  try {
    return String(err);
  } catch {
    return "خطای ناشناخته";
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const userId = String(session.user.id);
    const body = (await req.json()) as ProfilePayload;

    // آماده‌سازی شیء برای update (تایپ‌ها مطابق Update در database.types.ts)
    const updateObj: {
      phone?: string | null;
      avatar_url?: string | null;
      name?: string; // Update برای name انتظار string | undefined دارد (null -> undefined)
      email?: string | null;
    } = {};

    if (Object.prototype.hasOwnProperty.call(body, "phone")) {
      updateObj.phone = body.phone ?? null;
    }

    if (Object.prototype.hasOwnProperty.call(body, "avatar_url")) {
      updateObj.avatar_url = body.avatar_url ?? null;
    }

    if (Object.prototype.hasOwnProperty.call(body, "name")) {
      // اگر مقدار null است آن را به undefined تبدیل می‌کنیم تا با تایپ Update سازگار باشد
      updateObj.name = body.name ?? undefined;
    }

    if (Object.prototype.hasOwnProperty.call(body, "email")) {
      updateObj.email = body.email ?? null;
    }

    // تلاش برای آپدیت رکورد موجود بر اساس user_id
    const { data: updatedData, error: updateError } = await supabaseAdmin
      .from("profiles")
      .update(updateObj)
      .eq("user_id", userId)
      .select();

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    const didUpdate = Array.isArray(updatedData)
      ? updatedData.length > 0
      : !!updatedData;

    if (didUpdate) {
      // نرمال‌سازی خروجی به تایپ DbProfile (user_id باید string | null باشد)
      const raw = Array.isArray(updatedData) ? updatedData[0] : updatedData;
      const normalized: DbProfile = {
        ...raw,
        user_id: raw.user_id ?? null,
        avatar_url: raw.avatar_url ?? null,
        email: raw.email ?? null,
        phone: raw.phone ?? null,
        role: raw.role ?? null,
      };
      return NextResponse.json({ data: normalized });
    }

    // اگر رکورد وجود نداشت، insert انجام می‌دهیم
    const insertObj: {
      user_id: string;
      name: string;
      email?: string | null;
      phone?: string | null;
      avatar_url?: string | null;
      role?: string | null;
    } = {
      user_id: userId,
      // برای name مقدار معتبر لازم است؛ از body.name یا body.email یا مقدار پیش‌فرض استفاده می‌کنیم
      name: body.name ?? body.email ?? "کاربر",
    };

    if (body.email !== undefined) insertObj.email = body.email ?? null;
    if (body.phone !== undefined) insertObj.phone = body.phone ?? null;
    if (body.avatar_url !== undefined)
      insertObj.avatar_url = body.avatar_url ?? null;

    const { data: insertedData, error: insertError } = await supabaseAdmin
      .from("profiles")
      .insert(insertObj)
      .select();

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    const insertedRaw = Array.isArray(insertedData)
      ? insertedData[0]
      : insertedData;
    const normalizedInserted: DbProfile = {
      ...insertedRaw,
      user_id: insertedRaw.user_id ?? null,
      avatar_url: insertedRaw.avatar_url ?? null,
      email: insertedRaw.email ?? null,
      phone: insertedRaw.phone ?? null,
      role: insertedRaw.role ?? null,
    };

    return NextResponse.json({ data: normalizedInserted });
  } catch (err: unknown) {
    const message = getErrorMessage(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
