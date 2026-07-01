# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # start dev server (localhost:3000)
npm run build    # production build
npm run start    # run production build
npm run lint     # next lint (eslint-config-next: next/core-web-vitals, next/typescript)
```

There is no test runner configured in this project.

Database schema changes live as raw SQL files in `supabase/`, applied manually/sequentially against the Supabase project (`001_profiles.sql` → `004_style_wardrobe.sql`). There is no migration CLI wired up — new schema changes should be added as a new numbered `NNN_description.sql` file rather than editing existing ones.

## Architecture

StyleSelf is a Next.js 14 App Router app (TypeScript, Tailwind, shadcn/radix components) for AI-driven fashion: users upload body photos, get outfit/fit analysis, build a digital wardrobe, and virtually try on garments.

**Auth & routing gate.** [middleware.ts](middleware.ts) is the single source of truth for route protection: it creates a Supabase server client per-request and redirects unauthenticated users away from `PROTECTED` paths (`/dashboard`, `/try-on`, `/analyze`, `/wardrobe`, `/profile`, `/onboarding`) to `/auth`, and redirects authenticated users away from `/auth`. Adding a new authenticated page requires adding its path to the `PROTECTED` array here.

**Two Supabase clients, never mixed.** [lib/supabase.ts](lib/supabase.ts) (`createBrowserClient`) is for Client Components; [lib/supabase-server.ts](lib/supabase-server.ts) (`createServerClient` reading `next/headers` cookies) is for Server Components and Server Actions. All data access and mutation goes through `"use server"` action files colocated per route (`app/<route>/actions.ts`), not through API routes — there are no `app/api/*` handlers.

**Route-per-feature, actions own the logic.** Each top-level route under `app/` (`onboarding`, `analyze`, `wardrobe`, `try-on`, `profile`, `dashboard`) pairs a `page.tsx` (UI/state) with an `actions.ts` (server-side DB + AI calls). `page.tsx` files are large client-driven multi-step flows (e.g. `onboarding/page.tsx` is a multi-step wizard); business logic and external API calls belong in the actions file, not the page.

**Supabase schema.** `profiles` (1:1 with `auth.users`) holds body measurements, `skin_tone`, `style_preferences text[]`, `onboarding_complete`, and paths to body photos in the private `user-photos` storage bucket (front/side/back). `wardrobe_items` holds per-user clothing entries (`colors`, `style_tags`, `formality`, `season`, `brand_guess`, an `outfits jsonb` blob of AI-generated outfit recommendations) with images in the private `wardrobe-items` bucket. Every table and bucket uses RLS policies keyed on `auth.uid()` — new tables/buckets must follow the same "user can only touch their own rows/folder" pattern (see `supabase/*.sql`).

**AI integration points (all server-side, via `@anthropic-ai/sdk`, model `claude-sonnet-4-6`):**
- `app/onboarding/actions.ts` — `estimateMeasurements`: estimates bust/waist/hips from body photos.
- `app/analyze/actions.ts` — `analyzeOutfit`: scores an outfit photo across 5 dimensions.
- `app/wardrobe/actions.ts` — `tagAndRecommend`: tags an uploaded garment then generates 5 outfit sets built around it.

All three prompt Claude to "Return ONLY valid JSON" and then extract the response with a `{[\s\S]+\}` regex match before `JSON.parse` — there is no structured-output/tool-use enforcement, so any change to these prompts must preserve strict "JSON only" instructions or parsing breaks.

**Try-on flow is a separate third-party API**, not Claude: `app/try-on/actions.ts` calls Fashn.ai (`FASHN_API_KEY`) with a person image + garment image and polls `checkTryOnStatus` for the async result. `app/try-on/utils.ts` maps internal wardrobe categories to Fashn's `tops | bottoms | one-pieces` categories.

**Wardrobe ingestion has two paths** that converge on the same tagging/recommendation pipeline: direct file upload (`uploadWardrobeItem`) and URL scraping (`app/wardrobe/scrape.ts`'s `addFromUrl`, which uses `cheerio` to pull `og:image`/`og:title`/price/brand from a product page, downloads the image, then calls into `tagAndRecommend` from `actions.ts`).

## Environment variables

`ANTHROPIC_API_KEY`, `SUPABASE_URL`/`SUPABASE_ANON_KEY`/`SUPABASE_SERVICE_ROLE_KEY`, `NEXT_PUBLIC_SUPABASE_URL`/`NEXT_PUBLIC_SUPABASE_ANON_KEY`, `FASHN_API_KEY`, `REPLICATE_API_KEY`, `NEXT_PUBLIC_SITE_URL` — all in `.env.local` (gitignored). Server actions check for key presence (e.g. `if (!process.env.ANTHROPIC_API_KEY) return { error: ... }`) and return a typed `{ error }` instead of throwing, so new AI/external-API actions should follow the same "never throw, return `{ error }`" convention.
