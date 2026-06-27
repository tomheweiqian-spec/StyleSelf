"use server";

import { createServerSupabaseClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";

export interface ProfileData {
  height: number;
  weight: number;
  gender: string;
  bust: number;
  waist: number;
  hips: number;
  shoe_size: number;
  skin_tone: string;
  body_photo_path?: string;
}

export async function saveProfile(data: ProfileData) {
  const supabase = createServerSupabaseClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) return { error: "Not authenticated" };

  const { error } = await supabase.from("profiles").upsert({
    id: user.id,
    ...data,
    onboarding_complete: true,
    updated_at: new Date().toISOString(),
  });

  if (error) return { error: error.message };

  redirect("/dashboard");
}
