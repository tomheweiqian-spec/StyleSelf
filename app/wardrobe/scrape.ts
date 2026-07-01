"use server";

import * as cheerio from "cheerio";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { tagAndRecommend } from "./actions";

export interface ScrapeResult {
  title: string;
  image: string;
  url: string;
  price?: string;
  brand?: string;
}

export async function scrapeProductUrl(url: string): Promise<{ data?: ScrapeResult; error?: string }> {
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5",
      },
      signal: AbortSignal.timeout(10000),
    });

    if (!res.ok) return { error: `Could not load page (${res.status})` };

    const html = await res.text();
    const $ = cheerio.load(html);

    const meta = (name: string) =>
      $(`meta[property="${name}"]`).attr("content") ||
      $(`meta[name="${name}"]`).attr("content") ||
      "";

    const image =
      meta("og:image") ||
      meta("twitter:image") ||
      $('img[class*="product"]').first().attr("src") ||
      "";

    const title =
      meta("og:title") ||
      meta("twitter:title") ||
      $("title").text().split("|")[0].split("-")[0].trim() ||
      "";

    const price =
      meta("product:price:amount") ||
      meta("og:price:amount") ||
      $('[class*="price"]').first().text().trim() ||
      "";

    const brand =
      meta("og:site_name") ||
      meta("og:brand") ||
      "";

    if (!image) return { error: "Could not find a product image on that page. Try uploading the image directly." };
    if (!title) return { error: "Could not read the product name from that page." };

    return {
      data: {
        title: title.slice(0, 120),
        image: image.startsWith("//") ? `https:${image}` : image,
        url,
        price: price || undefined,
        brand: brand || undefined,
      },
    };
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    if (msg.includes("timeout")) return { error: "Page took too long to load. Try uploading the image directly." };
    return { error: "Could not reach that URL. Check the link and try again." };
  }
}

export async function addFromUrl(url: string) {
  const supabase = createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not signed in" };

  // 1. Scrape the URL
  const { data: scraped, error: scrapeError } = await scrapeProductUrl(url);
  if (scrapeError || !scraped) return { error: scrapeError ?? "Scrape failed" };

  // 2. Download the product image
  let imageBuffer: Buffer;
  let contentType: string;
  try {
    const imgRes = await fetch(scraped.image, {
      headers: { "User-Agent": "Mozilla/5.0" },
      signal: AbortSignal.timeout(15000),
    });
    if (!imgRes.ok) return { error: "Could not download the product image." };
    contentType = imgRes.headers.get("content-type") || "image/jpeg";
    imageBuffer = Buffer.from(await imgRes.arrayBuffer());
  } catch {
    return { error: "Failed to download the product image." };
  }

  // 3. Upload to Supabase storage
  const ext = contentType.includes("png") ? "png" : contentType.includes("webp") ? "webp" : "jpg";
  const path = `${user.id}/${Date.now()}-url.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from("wardrobe-items")
    .upload(path, imageBuffer, { contentType, upsert: false });

  if (uploadError) return { error: uploadError.message };

  // 4. Get user style preferences
  const { data: profile } = await supabase
    .from("profiles")
    .select("style_preferences")
    .eq("id", user.id)
    .single();

  const stylePrefs: string[] = profile?.style_preferences ?? [];

  // 5. Tag + recommend outfits
  const { tag, outfits } = await tagAndRecommend(path, stylePrefs);

  // 6. Save to wardrobe_items
  const { data: item, error: dbError } = await supabase
    .from("wardrobe_items")
    .insert({
      user_id:     user.id,
      name:        tag?.name        ?? scraped.title,
      category:    tag?.category    ?? "tops",
      colors:      tag?.colors      ?? [],
      style_tags:  tag?.style_tags  ?? [],
      formality:   tag?.formality   ?? 3,
      season:      tag?.season      ?? [],
      brand_guess: tag?.brand_guess ?? scraped.brand ?? null,
      image_path:  path,
      outfits:     outfits ?? null,
    })
    .select()
    .single();

  if (dbError) return { error: dbError.message };
  return { item };
}
