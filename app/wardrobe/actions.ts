"use server";

import { createServerSupabaseClient } from "@/lib/supabase-server";
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export interface WardrobeItem {
  id: string;
  name: string;
  category: string;
  colors: string[];
  style_tags: string[];
  formality: number;
  season: string[];
  brand_guess: string | null;
  image_path: string;
  outfits: OutfitSet | null;
  created_at: string;
}

export interface OutfitPiece {
  piece: string;
  description: string;
  category: string;
  searchQuery: string;
}

export interface Outfit {
  name: string;
  style: string;
  vibe: string;
  items: OutfitPiece[];
}

export interface OutfitSet {
  outfits: Outfit[];
}

function shoppingUrl(query: string, retailer: string): string {
  const q = encodeURIComponent(query);
  switch (retailer) {
    case "google":  return `https://www.google.com/search?tbm=shop&q=${q}`;
    case "asos":    return `https://www.asos.com/search/?q=${q}`;
    case "zara":    return `https://www.zara.com/search?searchTerm=${q}`;
    case "hm":      return `https://www2.hm.com/search-results.html?q=${q}`;
    case "uniqlo":  return `https://www.uniqlo.com/search?q=${q}`;
    default:        return `https://www.google.com/search?tbm=shop&q=${q}`;
  }
}

export function getShoppingLinks(query: string) {
  return {
    google:  shoppingUrl(query, "google"),
    asos:    shoppingUrl(query, "asos"),
    zara:    shoppingUrl(query, "zara"),
    hm:      shoppingUrl(query, "hm"),
    uniqlo:  shoppingUrl(query, "uniqlo"),
  };
}

async function imageToBase64(supabase: ReturnType<typeof createServerSupabaseClient>, imagePath: string) {
  const { data, error } = await supabase.storage
    .from("wardrobe-items")
    .createSignedUrl(imagePath, 60);
  if (error || !data?.signedUrl) return null;

  const res = await fetch(data.signedUrl);
  const buf = await res.arrayBuffer();
  return {
    base64: Buffer.from(buf).toString("base64"),
    mediaType: (res.headers.get("content-type") || "image/jpeg") as
      "image/jpeg" | "image/png" | "image/gif" | "image/webp",
  };
}

export async function tagAndRecommend(
  imagePath: string,
  stylePreferences: string[]
): Promise<{ tag?: Record<string, unknown>; outfits?: OutfitSet; error?: string }> {
  if (!process.env.ANTHROPIC_API_KEY) return { error: "AI not configured" };

  const supabase = createServerSupabaseClient();
  const img = await imageToBase64(supabase, imagePath);
  if (!img) return { error: "Could not load image" };

  const imageBlock: Anthropic.ImageBlockParam = {
    type: "image",
    source: { type: "base64", media_type: img.mediaType, data: img.base64 },
  };

  const stylesCtx = stylePreferences.length > 0
    ? `The user's preferred styles are: ${stylePreferences.join(", ")}.`
    : "The user has no stated style preference — suggest diverse styles.";

  // Step 1: tag the item
  const tagMsg = await anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 256,
    messages: [{
      role: "user",
      content: [
        imageBlock,
        {
          type: "text",
          text: `Analyse this clothing item and return ONLY a JSON object:
{"name":"<short name>","category":"<tops|bottoms|shoes|outerwear|accessories|dresses|activewear|bags>","colors":["<color>"],"style_tags":["<streetwear|old-money|y2k|dark-academia|gorpcore|quiet-luxury|cottagecore|athleisure|preppy|grunge|boho|techwear|smart-casual|coquette|indie|skater|normcore|workwear|hypebeast|mob-wife>"],"formality":<1-5>,"season":["<spring|summer|autumn|winter>"],"brand_guess":"<brand or null>"}`,
        },
      ],
    }],
  });

  const tagRaw = tagMsg.content[0].type === "text" ? tagMsg.content[0].text.trim() : "";
  const tagMatch = tagRaw.match(/\{[\s\S]+\}/);
  if (!tagMatch) return { error: "Could not parse item tags" };
  const tag = JSON.parse(tagMatch[0]);

  // Step 2: generate 5 outfits
  const outfitMsg = await anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 2048,
    messages: [{
      role: "user",
      content: [
        imageBlock,
        {
          type: "text",
          text: `You are a top fashion stylist. The anchor item is: ${tag.name} (${tag.category}, colors: ${tag.colors?.join(", ")}).
${stylesCtx}

Generate 5 complete outfit recommendations, each in a DIFFERENT style/aesthetic. Each outfit uses the anchor item as the hero piece and adds 3-5 supporting pieces.

For each supporting piece be VERY specific: include color, fit, material if possible (e.g. "slim-fit straight-leg dark indigo denim jeans" not just "jeans").

Return ONLY valid JSON:
{"outfits":[{"name":"<outfit name>","style":"<style aesthetic>","vibe":"<one sentence mood>","items":[{"piece":"<item name>","description":"<specific detailed description>","category":"<top|bottom|shoes|outerwear|accessory|bag>","searchQuery":"<best search query to buy this online>"}]}]}`,
        },
      ],
    }],
  });

  const outfitRaw = outfitMsg.content[0].type === "text" ? outfitMsg.content[0].text.trim() : "";
  const outfitMatch = outfitRaw.match(/\{[\s\S]+\}/);
  if (!outfitMatch) return { tag, error: "Could not parse outfit recommendations" };

  const outfits: OutfitSet = JSON.parse(outfitMatch[0]);
  return { tag, outfits };
}

export async function uploadWardrobeItem(formData: FormData) {
  const supabase = createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not signed in" };

  const file = formData.get("file") as File;
  if (!file) return { error: "No file provided" };

  const ext = file.name.split(".").pop();
  const path = `${user.id}/${Date.now()}.${ext}`;

  const bytes = await file.arrayBuffer();
  const { error: uploadError } = await supabase.storage
    .from("wardrobe-items")
    .upload(path, bytes, { contentType: file.type, upsert: false });

  if (uploadError) return { error: uploadError.message };

  // Get user style preferences
  const { data: profile } = await supabase
    .from("profiles")
    .select("style_preferences")
    .eq("id", user.id)
    .single();

  const stylePrefs: string[] = profile?.style_preferences ?? [];

  // Tag and get outfit recommendations
  const { tag, outfits, error: aiError } = await tagAndRecommend(path, stylePrefs);

  // Insert wardrobe item
  const { data: item, error: dbError } = await supabase
    .from("wardrobe_items")
    .insert({
      user_id: user.id,
      name:        tag?.name        ?? "Untitled item",
      category:    tag?.category    ?? "tops",
      colors:      tag?.colors      ?? [],
      style_tags:  tag?.style_tags  ?? [],
      formality:   tag?.formality   ?? 3,
      season:      tag?.season      ?? [],
      brand_guess: tag?.brand_guess ?? null,
      image_path:  path,
      outfits:     outfits ?? null,
    })
    .select()
    .single();

  if (dbError) return { error: dbError.message };
  return { item, aiError };
}

export async function getWardrobeItems(): Promise<WardrobeItem[]> {
  const supabase = createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data } = await supabase
    .from("wardrobe_items")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return (data as WardrobeItem[]) ?? [];
}

export async function getSignedUrl(imagePath: string): Promise<string | null> {
  const supabase = createServerSupabaseClient();
  const { data } = await supabase.storage
    .from("wardrobe-items")
    .createSignedUrl(imagePath, 3600);
  return data?.signedUrl ?? null;
}

export async function deleteWardrobeItem(id: string, imagePath: string) {
  const supabase = createServerSupabaseClient();
  await supabase.storage.from("wardrobe-items").remove([imagePath]);
  await supabase.from("wardrobe_items").delete().eq("id", id);
}
