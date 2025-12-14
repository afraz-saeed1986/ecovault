// app/api/profile/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/types/index"; // تایپ Profile شما

export async function PATCH(req: Request) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const body = (await req.json()) as {
      phone?: string | null;
      avatar_url?: string | null;
    };

    const updateData: Partial<Pick<Profile, "phone" | "avatar_url">> = {};

    if ("phone" in body) updateData.phone = body.phone ?? null;
    if ("avatar_url" in body) updateData.avatar_url = body.avatar_url ?? null;

    // نام معتبر — هیچوقت null نمی‌شه
    const fallbackName: string =
      (user.user_metadata?.full_name as string | undefined) ||
      (user.user_metadata?.name as string | undefined) ||
      (user.user_metadata?.user_name as string | undefined) ||
      user.email?.split("@")[0] ||
      "User";

    // اول سعی می‌کنیم آپدیت کنیم
    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        ...updateData,
        name: fallbackName,
        email: user.email ?? null,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", user.id);

    if (updateError && updateError.code !== "PGRST116") {
      console.error("Update error:", updateError);
      return NextResponse.json(
        { error: updateError.message || "Failed to update profile" },
        { status: 500 }
      );
    }

    // گرفتن پروفایل
    const { data: profile, error: selectError } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (selectError) {
      // اگر وجود نداشت، ایجاد کن
      const { data: newProfile, error: insertError } = await supabase
        .from("profiles")
        .insert({
          user_id: user.id,
          name: fallbackName,
          email: user.email ?? null,
          ...updateData,
        })
        .select()
        .single();

      if (insertError) {
        console.error("Insert error:", insertError);
        return NextResponse.json(
          { error: insertError.message || "Failed to create profile" },
          { status: 500 }
        );
      }

      return NextResponse.json({ data: newProfile as Profile });
    }

    return NextResponse.json({ data: profile as Profile });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Internal server error";
    console.error("Unexpected error in /api/profile:", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}