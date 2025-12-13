// lib/supabase/hooks/useProfile.ts
"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase/client";
import { Profile } from "@/types";


export function useProfile() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // گرفتن کاربر فعلی
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        setProfile(null);
        setLoading(false);
        return;
      }

      // گرفتن پروفایل از جدول profiles
      const { data, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (profileError) {
        // اگر رکورد پیدا نشد (اولین بار کاربر وارد شده)
        if (profileError.code === "PGRST116") {
          setProfile(null);
        } else {
          console.error("Error fetching profile:", profileError);
          setError(profileError.message || "Failed to load profile");
        }
      } else {
        setProfile(data as Profile);
      }
    } catch (err: any) {
      console.error("Unexpected error in useProfile:", err);
      setError("An unexpected error occurred");
      setProfile(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();

    // هر بار که وضعیت احراز هویت تغییر کرد (لاگین، لاگ‌اوت، آپلود عکس و ...)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        fetchProfile();
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [fetchProfile]);

  // برای وقتی که بخوای دستی رفرش کنی (مثلاً بعد از آپلود عکس)
  const refetch = useCallback(() => {
    fetchProfile();
  }, [fetchProfile]);

  return {
    profile,
    loading,
    error,
    refetch,
  };
}