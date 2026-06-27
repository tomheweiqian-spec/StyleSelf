export interface StyleOption {
  id: string;
  label: string;
  vibe: string;
  category: string;
  emoji: string;
}

export const STYLE_CATEGORIES = [
  "Clean & Minimal",
  "Street",
  "Retro",
  "Outdoor",
  "Soft & Feminine",
  "Elevated",
] as const;

export const STYLES: StyleOption[] = [
  // Clean & Minimal
  { id: "quiet-luxury",   label: "Quiet Luxury",      vibe: "Understated, expensive, no logos",           category: "Clean & Minimal", emoji: "🤍" },
  { id: "old-money",      label: "Old Money",          vibe: "Preppy, classic, timeless wealth",           category: "Clean & Minimal", emoji: "⚓" },
  { id: "clean-girl",     label: "Clean Girl",         vibe: "Effortless, fresh, minimal makeup",          category: "Clean & Minimal", emoji: "✨" },
  { id: "normcore",       label: "Normcore",           vibe: "Deliberately plain, unremarkable, anti-trend",category: "Clean & Minimal", emoji: "⬜" },

  // Street
  { id: "streetwear",     label: "Streetwear",         vibe: "Hoodies, sneakers, urban edge",              category: "Street", emoji: "🔥" },
  { id: "hypebeast",      label: "Hypebeast",          vibe: "Limited drops, bold logos, hype culture",    category: "Street", emoji: "👟" },
  { id: "skater",         label: "Skater",             vibe: "Baggy, graphic tees, Vans, laid-back",       category: "Street", emoji: "🛹" },
  { id: "e-boy-e-girl",   label: "E-Boy / E-Girl",     vibe: "Alt, layered, chains, moody colour",         category: "Street", emoji: "🖤" },

  // Retro
  { id: "y2k",            label: "Y2K",                vibe: "Low-rise, baby tees, 2000s nostalgia",       category: "Retro", emoji: "💿" },
  { id: "dark-academia",  label: "Dark Academia",      vibe: "Tweed, books, moody autumn palette",         category: "Retro", emoji: "📚" },
  { id: "grunge",         label: "Grunge",             vibe: "Flannel, distressed denim, band tees",       category: "Retro", emoji: "🎸" },
  { id: "indie",          label: "Indie / Alt",        vibe: "Thrifted, eclectic, self-expression",        category: "Retro", emoji: "🌀" },

  // Outdoor
  { id: "gorpcore",       label: "Gorpcore",           vibe: "Technical outdoor gear worn casually",       category: "Outdoor", emoji: "🏔️" },
  { id: "workwear",       label: "Workwear / Heritage",vibe: "Carhartt, Dickies, rugged American",        category: "Outdoor", emoji: "🧱" },
  { id: "techwear",       label: "Techwear",           vibe: "Tactical, dark, functional futurism",        category: "Outdoor", emoji: "🤖" },
  { id: "athleisure",     label: "Athleisure",         vibe: "Gym-to-street, performance fabrics",         category: "Outdoor", emoji: "⚡" },

  // Soft & Feminine
  { id: "cottagecore",    label: "Cottagecore",        vibe: "Floral, linen, pastoral, romantic",          category: "Soft & Feminine", emoji: "🌸" },
  { id: "coquette",       label: "Coquette",           vibe: "Bows, pink, ultra-feminine, dainty",         category: "Soft & Feminine", emoji: "🎀" },
  { id: "soft-girl",      label: "Soft Girl",          vibe: "Pastel, kawaii, cute, gentle",               category: "Soft & Feminine", emoji: "🍓" },
  { id: "boho",           label: "Boho / Festival",    vibe: "Flowy, earthy, free-spirited, layered",      category: "Soft & Feminine", emoji: "🌙" },

  // Elevated
  { id: "smart-casual",   label: "Smart Casual",       vibe: "Put-together without trying too hard",       category: "Elevated", emoji: "👔" },
  { id: "business-casual",label: "Business Casual",    vibe: "Office-ready, polished, professional",       category: "Elevated", emoji: "💼" },
  { id: "mob-wife",       label: "Mob Wife",           vibe: "Glamorous excess, fur, drama, power",        category: "Elevated", emoji: "💎" },
  { id: "coastal",        label: "Coastal / Preppy",   vibe: "Linen, nautical, breezy, sun-bleached",      category: "Elevated", emoji: "🌊" },
];
