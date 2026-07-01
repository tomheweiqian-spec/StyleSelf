"use server";

import { createServerSupabaseClient } from "@/lib/supabase-server";

const FASHN_BASE = "https://api.fashn.ai/v1";

async function storageToBase64(
  supabase: ReturnType<typeof createServerSupabaseClient>,
  bucket: string,
  path: string
): Promise<{ base64: string; mediaType: string } | null> {
  const { data, error } = await supabase.storage.from(bucket).createSignedUrl(path, 120);
  if (error || !data?.signedUrl) return null;
  const res = await fetch(data.signedUrl);
  const buf = await res.arrayBuffer();
  return {
    base64: Buffer.from(buf).toString("base64"),
    mediaType: res.headers.get("content-type") || "image/jpeg",
  };
}

export async function getUserBodyPhoto(): Promise<{ url: string; path: string } | null> {
  const supabase = createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("body_photo_path")
    .eq("id", user.id)
    .single();

  const path = profile?.body_photo_path;
  if (!path) return null;

  const { data } = await supabase.storage.from("user-photos").createSignedUrl(path, 3600);
  if (!data?.signedUrl) return null;
  return { url: data.signedUrl, path };
}

export async function getWardrobeForTryOn() {
  const supabase = createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data } = await supabase
    .from("wardrobe_items")
    .select("id, name, category, image_path, colors")
    .eq("user_id", user.id)
    .in("category", ["tops", "bottoms", "dresses", "outerwear", "activewear"])
    .order("created_at", { ascending: false });

  if (!data) return [];

  return Promise.all(
    data.map(async (item) => {
      const { data: urlData } = await supabase.storage
        .from("wardrobe-items")
        .createSignedUrl(item.image_path, 3600);
      return { ...item, signedUrl: urlData?.signedUrl ?? null };
    })
  );
}

export async function startTryOn(
  personImageData: { base64: string; mediaType: string } | null,
  personImagePath: string | null,
  garmentImageData: { base64: string; mediaType: string } | null,
  garmentWardrobePath: string | null,
  garmentWardrobeBucket: string | null,
  category: "tops" | "bottoms" | "one-pieces"
): Promise<{ id?: string; error?: string }> {
  if (!process.env.FASHN_API_KEY) return { error: "Fashn.ai API key not configured" };

  const supabase = createServerSupabaseClient();

  // Resolve person image
  let personBase64 = personImageData?.base64 ?? null;
  let personMediaType = personImageData?.mediaType ?? "image/jpeg";
  if (!personBase64 && personImagePath) {
    const img = await storageToBase64(supabase, "user-photos", personImagePath);
    if (img) { personBase64 = img.base64; personMediaType = img.mediaType; }
  }

  // Resolve garment image
  let garmentBase64 = garmentImageData?.base64 ?? null;
  let garmentMediaType = garmentImageData?.mediaType ?? "image/jpeg";
  if (!garmentBase64 && garmentWardrobePath && garmentWardrobeBucket) {
    const img = await storageToBase64(supabase, garmentWardrobeBucket, garmentWardrobePath);
    if (img) { garmentBase64 = img.base64; garmentMediaType = img.mediaType; }
  }

  if (!personBase64 || !garmentBase64) {
    return { error: "Missing person or garment image" };
  }

  try {
    const res = await fetch(`${FASHN_BASE}/run`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.FASHN_API_KEY}`,
      },
      body: JSON.stringify({
        model_image:   `data:${personMediaType};base64,${personBase64}`,
        garment_image: `data:${garmentMediaType};base64,${garmentBase64}`,
        category,
        mode: "quality",
        num_samples: 1,
      }),
    });

    const json = await res.json();
    if (!res.ok) return { error: json?.detail ?? json?.error ?? "Fashn.ai request failed" };
    return { id: json.id };
  } catch (e: unknown) {
    return { error: e instanceof Error ? e.message : String(e) };
  }
}

export async function checkTryOnStatus(
  id: string
): Promise<{ status: string; output?: string[]; error?: string }> {
  if (!process.env.FASHN_API_KEY) return { status: "error", error: "API key missing" };

  try {
    const res = await fetch(`${FASHN_BASE}/status/${id}`, {
      headers: { Authorization: `Bearer ${process.env.FASHN_API_KEY}` },
      cache: "no-store",
    });
    const json = await res.json();
    if (!res.ok) return { status: "error", error: json?.detail ?? "Status check failed" };
    return { status: json.status, output: json.output };
  } catch (e: unknown) {
    return { status: "error", error: e instanceof Error ? e.message : String(e) };
  }
}
