// components/ProfileForm.tsx
"use client";

import React, { useState } from "react";
import { supabase } from "@/lib/supabase/client";
import type { Profile as DbProfile } from "@/types/index";

type Props = {
  initialData: DbProfile | null;
};

function getErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  return String(err) || "An unknown error occurred";
}

export default function ProfileForm({ initialData }: Props) {
  console.log("initialData>>>>>>>>", initialData);

  const [phone, setPhone] = useState<string>(initialData?.phone ?? "");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(
    initialData?.avatar_url ?? null
  );
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{
    text: string;
    type: "success" | "error";
  } | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  async function uploadAvatar(file: File) {
    setUploading(true);
    setMessage(null);
    try {
      const fileExt = file.name.split(".").pop()?.toLowerCase() || "png";
      const filePath = `avatars/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from("avatars").getPublicUrl(filePath);
      if (!data?.publicUrl) throw new Error("Failed to get public URL");

      return data.publicUrl;
    } finally {
      setUploading(false);
    }
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    try {
      const url = await uploadAvatar(file);
      setAvatarUrl(url);
      setMessage({
        text: "Avatar uploaded! Click 'Save Changes' to apply.",
        type: "success",
      });
    } catch (err) {
      setMessage({ text: getErrorMessage(err), type: "error" });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const payload = { phone: phone.trim() || null, avatar_url: avatarUrl };
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to save profile");

      setMessage({ text: "Profile updated successfully!", type: "success" });
    } catch (err) {
      setMessage({ text: getErrorMessage(err), type: "error" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <form
        onSubmit={handleSubmit}
        className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl overflow-hidden border border-gray-200 dark:border-gray-700"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-eco-green to-eco-dark px-8 py-10 text-white">
          <h2 className="text-3xl font-bold">My Profile</h2>
          <p className="mt-2 opacity-90">Manage your personal information</p>
        </div>

        <div className="p-8 space-y-10">
          {/* Avatar Section */}
          <div className="flex flex-col sm:flex-row items-center gap-8">
            <div className="relative group">
              <div className="w-32 h-32 rounded-full overflow-hidden ring-4 ring-eco-green/20 shadow-2xl">
                <img
                  src={avatarUrl || "/images/default-avatar.png"}
                  alt="Profile avatar"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                <svg
                  className="w-12 h-12 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 9a2 2 0 012-2h14a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5h6"
                  />
                </svg>
              </div>
            </div>

            <div className="flex-1 text-center sm:text-left">
              <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
                Profile Picture
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                JPG, PNG or GIF • Max 5MB
              </p>

              <label className="mt-4 inline-block">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  disabled={uploading}
                  className="hidden"
                />
                <span className="px-6 py-3 bg-eco-green hover:bg-eco-dark text-white font-medium rounded-xl transition cursor-pointer inline-flex items-center gap-2 shadow-lg hover:shadow-xl">
                  {uploading ? (
                    <>
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                          fill="none"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8v8z"
                        />
                      </svg>
                      Uploading...
                    </>
                  ) : (
                    <>
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                        />
                      </svg>
                      Upload New Photo
                    </>
                  )}
                </span>
              </label>

              {fileName && (
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                  Selected: <span className="font-medium">{fileName}</span>
                </p>
              )}
            </div>
          </div>

          {/* Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                Full Name
              </label>
              <div className="px-4 py-3 bg-gray-50 dark:bg-gray-800 rounded-xl text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700">
                {initialData?.name || "Not set"}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                Email Address
              </label>
              <div className="px-4 py-3 bg-gray-50 dark:bg-gray-800 rounded-xl text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700">
                {initialData?.email || "Not set"}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                User Role
              </label>
              <div className="px-4 py-3 bg-eco-green/10 dark:bg-eco-green/20 rounded-xl text-eco-green dark:text-eco-accent font-medium border border-eco-green/30">
                {initialData?.role || "User"}
              </div>
            </div>

            <div>
              <label
                htmlFor="phone"
                className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2"
              >
                Phone Number
              </label>
              <input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+98 912 345 6789"
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 dark:border-gray-600 focus:border-eco-green dark:focus:border-eco-accent transition-colors bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-4 bg-eco-green hover:bg-eco-dark text-white font-bold rounded-xl transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-lg hover:shadow-xl text-lg"
            >
              {saving ? (
                <>
                  <svg className="animate-spin h-6 w-6" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v8z"
                    />
                  </svg>
                  Saving...
                </>
              ) : (
                <>
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  Save Changes
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => {
                setPhone(initialData?.phone ?? "");
                setAvatarUrl(initialData?.avatar_url ?? null);
                setFileName(null);
                setMessage(null);
              }}
              className="px-8 py-4 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition"
            >
              Cancel
            </button>
          </div>

          {/* Message */}
          {message && (
            <div
              className={`mt-6 p-4 rounded-xl flex items-center gap-3 ${
                message.type === "success"
                  ? "bg-green-50 dark:bg-green-900/30 text-green-800 dark:text-green-200 border border-green-200 dark:border-green-800"
                  : "bg-red-50 dark:bg-red-900/30 text-red-800 dark:text-red-200 border border-red-200 dark:border-red-800"
              }`}
            >
              {message.type === "success" ? (
                <svg
                  className="w-6 h-6"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
              ) : (
                <svg
                  className="w-6 h-6"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
              <span className="font-medium">{message.text}</span>
            </div>
          )}
        </div>
      </form>
    </div>
  );
}
