// app/(shop)/profile/page.tsx
import ProfileForm from "@/components/ProfileForm";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function ProfilePage() {
  // await اضافه شد!
  const supabase = await createClient();

  const { data, error } = await supabase.auth.getUser();

  if (error || !data.user) {
    redirect(`/auth/signin?callbackUrl=${encodeURIComponent("/profile")}`);
  }

  const user = data.user;

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  if (profileError && profileError.code !== "PGRST116") {
    console.error("Profile fetch error:", profileError);
  }

  return (
    <div className="max-w-3xl mx-auto p-4">
      <ProfileForm initialData={profile} />
    </div>
  );
}
