"use server";

import { createServerSupabaseClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";
import Anthropic from "@anthropic-ai/sdk";

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
  body_photo_side_path?: string;
  body_photo_back_path?: string;
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

export async function estimateMeasurements(
  photoPaths: { front?: string; side?: string; back?: string },
  height: number,
  weight: number
): Promise<{ bust?: number; waist?: number; hips?: number; error?: string }> {
  if (!process.env.ANTHROPIC_API_KEY) {
    return { error: "AI estimation not configured" };
  }

  const supabase = createServerSupabaseClient();

  // Collect available photos as base64
  const imageContents: Anthropic.ImageBlockParam[] = [];

  for (const [angle, path] of Object.entries(photoPaths)) {
    if (!path) continue;

    const { data: signedData, error } = await supabase.storage
      .from("user-photos")
      .createSignedUrl(path, 60);

    const signedUrl = signedData?.signedUrl;
    if (error || !signedUrl) continue;

    try {
      const res = await fetch(signedUrl);
      const buffer = await res.arrayBuffer();
      const base64 = Buffer.from(buffer).toString("base64");
      const mediaType = (res.headers.get("content-type") || "image/jpeg") as
        | "image/jpeg"
        | "image/png"
        | "image/gif"
        | "image/webp";

      imageContents.push({
        type: "image",
        source: { type: "base64", media_type: mediaType, data: base64 },
      });
    } catch {
      // skip this angle if fetch fails
    }
  }

  if (imageContents.length === 0) {
    return { error: "No photos available for estimation" };
  }

  try {
    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

    const angles = Object.keys(photoPaths).filter(
      (k) => photoPaths[k as keyof typeof photoPaths]
    );
    const angleDesc = angles.join(", ");

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 128,
      messages: [
        {
          role: "user",
          content: [
            ...imageContents,
            {
              type: "text",
              text: `These are ${angleDesc} view photos of a person who is ${height} cm tall and weighs ${weight} kg. Based on their visible body proportions, estimate their clothing measurements in centimetres. Reply with ONLY a JSON object, no other text: {"bust": <number>, "waist": <number>, "hips": <number>}`,
            },
          ],
        },
      ],
    });

    const raw =
      message.content[0].type === "text" ? message.content[0].text.trim() : "";
    const match = raw.match(/\{[^}]+\}/);
    if (!match) return { error: "Could not parse AI response" };

    const parsed = JSON.parse(match[0]);
    return {
      bust: Math.round(Number(parsed.bust)),
      waist: Math.round(Number(parsed.waist)),
      hips: Math.round(Number(parsed.hips)),
    };
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    return { error: msg };
  }
}
