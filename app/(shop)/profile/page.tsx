// app/(shop)/profile/page.tsx
import React from "react";
import ProfileForm from "@/components/ProfileForm";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { supabaseAdmin } from "@/lib/supabase/admin";
import type { Profile as DbProfile } from "@/types/index"; // Type for the profiles table from types/index

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return (
      <div className="max-w-3xl mx-auto p-4">
        Please sign in to view your profile.
      </div>
    );
  }

  const userId = String(session.user.id);
  console.log("userId>>>>>", userId);

  const { data: profileFromDb, error } = await supabaseAdmin
    .from("profiles")
    .select("*")
    .eq("user_id", userId)
    .single();

  console.log("profileFromDb>>>>>>>>>>>>>>>>>>>>>", profileFromDb);

  if (error) {
    console.error("Error fetching profile:", error.message ?? error);
  }

  // profileFromDb has type DbProfile | null (same as imported from types/index)
  const profile: DbProfile | null = profileFromDb ?? null;

  return (
    <div className="max-w-3xl mx-auto p-4">
      {/* <h1 className="text-2xl font-semibold mb-4">My Profile</h1> */}
      <ProfileForm initialData={profile} />
    </div>
  );
}
