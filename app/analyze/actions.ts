"use server";

import { createServerSupabaseClient } from "@/lib/supabase-server";
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export interface ScoreCategory {
  label: string;
  score: number;
  comment: string;
}

export interface OutfitAnalysis {
  scores: ScoreCategory[];
  overall: number;
  verdict: string;
  whatWorks: string[];
  improve: string[];
  styleMatch: string;
}

export async function analyzeOutfit(
  imageBase64: string,
  mediaType: string,
  stylePreferences: string[]
): Promise<{ analysis?: OutfitAnalysis; error?: string }> {
  if (!process.env.ANTHROPIC_API_KEY) return { error: "AI not configured" };

  const stylesCtx = stylePreferences.length > 0
    ? `The user's preferred styles are: ${stylePreferences.join(", ")}.`
    : "The user has no stated style preference.";

  try {
    const msg = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 1024,
      messages: [{
        role: "user",
        content: [
          {
            type: "image",
            source: {
              type: "base64",
              media_type: mediaType as "image/jpeg" | "image/png" | "image/gif" | "image/webp",
              data: imageBase64,
            },
          },
          {
            type: "text",
            text: `You are a brutally honest but constructive fashion critic. Analyse this outfit photo.
${stylesCtx}

Score the outfit across these 5 dimensions (0–100, be varied and genuine — do NOT give everything 75):
1. Fit & Silhouette — how well the clothes fit the body
2. Colour Harmony — how well the colours work together
3. Style Coherence — does it tell a clear style story
4. Occasion Appropriateness — versatility and context-readiness
5. Accessories & Details — attention to finishing touches

Return ONLY valid JSON:
{
  "scores": [
    { "label": "Fit & Silhouette", "score": <0-100>, "comment": "<1 sentence>" },
    { "label": "Colour Harmony",   "score": <0-100>, "comment": "<1 sentence>" },
    { "label": "Style Coherence",  "score": <0-100>, "comment": "<1 sentence>" },
    { "label": "Occasion",         "score": <0-100>, "comment": "<1 sentence>" },
    { "label": "Details",          "score": <0-100>, "comment": "<1 sentence>" }
  ],
  "overall": <0-100>,
  "verdict": "<2-3 sentence honest overall verdict>",
  "whatWorks": ["<specific thing that works>", "<another>", "<another>"],
  "improve": ["<specific actionable improvement>", "<another>", "<another>"],
  "styleMatch": "<which style aesthetic this outfit most closely fits>"
}`,
          },
        ],
      }],
    });

    const raw = msg.content[0].type === "text" ? msg.content[0].text.trim() : "";
    const match = raw.match(/\{[\s\S]+\}/);
    if (!match) return { error: "Could not parse analysis" };

    const analysis: OutfitAnalysis = JSON.parse(match[0]);
    return { analysis };
  } catch (e: unknown) {
    return { error: e instanceof Error ? e.message : String(e) };
  }
}

export async function getUserStyles(): Promise<string[]> {
  const supabase = createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];
  const { data } = await supabase
    .from("profiles")
    .select("style_preferences")
    .eq("id", user.id)
    .single();
  return data?.style_preferences ?? [];
}
