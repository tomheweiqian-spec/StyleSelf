"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import { saveProfile } from "./actions";

// ─── Shoe size data ───────────────────────────────────────────────────────────
type ShoeSystem = "eu" | "usMen" | "usWomen" | "uk";

const SHOE_SIZES: { eu: number; usMen: number | null; usWomen: number | null; uk: number }[] = [
  { eu: 35,   usMen: null, usWomen: 4.5,  uk: 2.5  },
  { eu: 36,   usMen: 4,    usWomen: 5.5,  uk: 3.5  },
  { eu: 37,   usMen: 4.5,  usWomen: 6,    uk: 4    },
  { eu: 38,   usMen: 5.5,  usWomen: 7,    uk: 5    },
  { eu: 39,   usMen: 6.5,  usWomen: 8,    uk: 6    },
  { eu: 40,   usMen: 7,    usWomen: 8.5,  uk: 6.5  },
  { eu: 41,   usMen: 8,    usWomen: 9.5,  uk: 7.5  },
  { eu: 42,   usMen: 8.5,  usWomen: 10,   uk: 8    },
  { eu: 42.5, usMen: 9,    usWomen: 10.5, uk: 8.5  },
  { eu: 43,   usMen: 9.5,  usWomen: 11,   uk: 9    },
  { eu: 44,   usMen: 10,   usWomen: 11.5, uk: 9.5  },
  { eu: 44.5, usMen: 10.5, usWomen: 12,   uk: 10   },
  { eu: 45,   usMen: 11,   usWomen: 12.5, uk: 10.5 },
  { eu: 46,   usMen: 12,   usWomen: 13.5, uk: 11.5 },
  { eu: 47,   usMen: 13,   usWomen: 14.5, uk: 12.5 },
  { eu: 48,   usMen: 14,   usWomen: null, uk: 13   },
];

function findNearestEU(value: number, system: ShoeSystem): number | null {
  if (system === "eu") return value;
  let best = SHOE_SIZES[0];
  let minDiff = Infinity;
  for (const s of SHOE_SIZES) {
    const v = s[system];
    if (v !== null) {
      const diff = Math.abs(v - value);
      if (diff < minDiff) { minDiff = diff; best = s; }
    }
  }
  return best.eu;
}

function getConversions(eu: number) {
  const row = SHOE_SIZES.find(s => s.eu === eu);
  if (!row) return null;
  return {
    eu: row.eu,
    usMen: row.usMen,
    usWomen: row.usWomen,
    uk: row.uk,
  };
}

// ─── Skin tones ───────────────────────────────────────────────────────────────
const SKIN_TONES = [
  { hex: "#FDDBB4", label: "Very light" },
  { hex: "#E8B88A", label: "Light"      },
  { hex: "#C68642", label: "Medium"     },
  { hex: "#8D5524", label: "Tan"        },
  { hex: "#4A2912", label: "Deep"       },
  { hex: "#1A0A00", label: "Very deep"  },
];

const GENDERS = ["Female", "Male", "Non-binary"] as const;
const SHOE_SYSTEMS: { key: ShoeSystem; label: string }[] = [
  { key: "eu",      label: "EU"      },
  { key: "usMen",   label: "US Men"  },
  { key: "usWomen", label: "US Women"},
  { key: "uk",      label: "UK"      },
];

const STEPS = [
  { num: 1, title: "Tell us about yourself",   desc: "We use this to size items correctly. Don't worry — body type matters more than numbers." },
  { num: 2, title: "Upload a body photo",       desc: "A full-body photo gives far more accurate try-on results than measurements alone." },
  { num: 3, title: "Your measurements",         desc: "Used to fine-tune clothing fits. Measure at the fullest point of each area." },
  { num: 4, title: "Shoe size",                 desc: "So footwear try-ons fit you correctly. Enter in whichever system you know." },
  { num: 5, title: "Skin tone",                 desc: "Helps calibrate colour matching for accessories and makeup." },
  { num: 6, title: "You're all set",            desc: "Here's what we've saved. You can update this any time in your profile." },
];

interface FormData {
  height: string; weight: string; gender: string;
  bust: string; waist: string; hips: string;
  shoe_eu: string; skin_tone: string;
}

const EMPTY: FormData = {
  height: "", weight: "", gender: "",
  bust: "", waist: "", hips: "",
  shoe_eu: "", skin_tone: "",
};

// ─── Small reusable field ─────────────────────────────────────────────────────
function Field({ label, placeholder, value, onChange }: {
  label: string; placeholder: string; value: string; onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className="text-xs font-medium text-ss-text-muted block mb-2">{label}</label>
      <input
        type="number"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border border-ss-border rounded-lg px-4 py-3 text-sm text-ss-text placeholder:text-ss-text-muted focus:outline-none focus:ring-2 focus:ring-ss-text/10 focus:border-ss-text transition-colors"
      />
    </div>
  );
}

// ─── Silhouette SVGs ──────────────────────────────────────────────────────────
function FrontSilhouette() {
  return (
    <svg viewBox="0 0 60 130" className="w-full h-full p-2">
      <circle cx="30" cy="13" r="10" fill="#D1D5DB" />
      <rect x="19" y="27" width="22" height="35" rx="5" fill="#D1D5DB" />
      <rect x="7"  y="29" width="10" height="27" rx="5" fill="#D1D5DB" />
      <rect x="43" y="29" width="10" height="27" rx="5" fill="#D1D5DB" />
      <rect x="19" y="64" width="10" height="48" rx="5" fill="#D1D5DB" />
      <rect x="31" y="64" width="10" height="48" rx="5" fill="#D1D5DB" />
    </svg>
  );
}
function SideSilhouette() {
  return (
    <svg viewBox="0 0 60 130" className="w-full h-full p-2">
      <circle cx="33" cy="13" r="9" fill="#D1D5DB" />
      <rect x="26" y="27" width="14" height="35" rx="5" fill="#D1D5DB" />
      <rect x="15" y="31" width="9" height="22" rx="4" fill="#D1D5DB" />
      <rect x="38" y="29" width="9" height="14" rx="4" fill="#D1D5DB" />
      <rect x="26" y="64" width="10" height="48" rx="5" fill="#D1D5DB" />
      <rect x="37" y="64" width="10" height="44" rx="5" fill="#D1D5DB" />
    </svg>
  );
}
function BackSilhouette() {
  return (
    <svg viewBox="0 0 60 130" className="w-full h-full p-2">
      <circle cx="30" cy="13" r="10" fill="#D1D5DB" />
      <rect x="12" y="9" width="36" height="8" rx="4" fill="#C4C4C4" />
      <rect x="19" y="27" width="22" height="35" rx="5" fill="#D1D5DB" />
      <rect x="7"  y="29" width="10" height="27" rx="5" fill="#D1D5DB" />
      <rect x="43" y="29" width="10" height="27" rx="5" fill="#D1D5DB" />
      <rect x="19" y="64" width="10" height="48" rx="5" fill="#D1D5DB" />
      <rect x="31" y="64" width="10" height="48" rx="5" fill="#D1D5DB" />
    </svg>
  );
}

// ─── Photo guide ──────────────────────────────────────────────────────────────
function PhotoGuide() {
  const angles = [
    { label: "Front", Icon: FrontSilhouette },
    { label: "Side",  Icon: SideSilhouette  },
    { label: "Back",  Icon: BackSilhouette  },
  ];
  return (
    <div className="rounded-2xl border border-ss-border bg-ss-bg-secondary p-5 space-y-4">
      <div>
        <p className="text-xs font-medium uppercase tracking-widest text-ss-text-muted mb-1">
          Photo guide
        </p>
        <p className="text-xs text-ss-text-muted">
          💡 Ask a peer to take your photos — it&apos;s much easier than a selfie and gives better results.
        </p>
      </div>

      {/* Angle illustrations */}
      <div className="grid grid-cols-3 gap-3">
        {angles.map(({ label, Icon }) => (
          <div key={label} className="text-center">
            <div className="relative border border-ss-border rounded-xl bg-white overflow-hidden mx-auto" style={{ aspectRatio: "3/4", maxWidth: 72 }}>
              <div className="absolute top-1 left-1 w-2.5 h-2.5 border-l-2 border-t-2 border-ss-text/40 rounded-sm" />
              <div className="absolute top-1 right-1 w-2.5 h-2.5 border-r-2 border-t-2 border-ss-text/40 rounded-sm" />
              <div className="absolute bottom-1 left-1 w-2.5 h-2.5 border-l-2 border-b-2 border-ss-text/40 rounded-sm" />
              <div className="absolute bottom-1 right-1 w-2.5 h-2.5 border-r-2 border-b-2 border-ss-text/40 rounded-sm" />
              <Icon />
            </div>
            <p className="text-xs font-medium text-ss-text mt-1.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Tips */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-2">
        {[
          ["↕", "Full body — head to feet"],
          ["↑", "Stand straight, look forward"],
          ["↔", "Arms slightly away from body"],
          ["◑", "Even lighting, no harsh shadows"],
          ["□", "Plain, uncluttered background"],
          ["📱", "Phone at chest height"],
        ].map(([icon, tip]) => (
          <div key={tip} className="flex items-start gap-2">
            <span className="text-xs text-ss-text-muted w-4 shrink-0 mt-0.5">{icon}</span>
            <p className="text-xs text-ss-text-muted leading-snug">{tip}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Shoe size step ───────────────────────────────────────────────────────────
function ShoeSizeStep({ shoeEU, setShoeEU }: { shoeEU: string; setShoeEU: (v: string) => void }) {
  const [system, setSystem] = useState<ShoeSystem>("eu");
  const [input, setInput] = useState("");
  const [showChart, setShowChart] = useState(false);

  function handleInput(val: string) {
    setInput(val);
    const num = parseFloat(val);
    if (!isNaN(num)) {
      const eu = findNearestEU(num, system);
      if (eu) setShoeEU(String(eu));
    } else {
      setShoeEU("");
    }
  }

  function handleSystemChange(s: ShoeSystem) {
    setSystem(s);
    setInput("");
    setShoeEU("");
  }

  const conversions = shoeEU ? getConversions(parseFloat(shoeEU)) : null;

  return (
    <div className="space-y-5">
      {/* System selector */}
      <div>
        <label className="text-xs font-medium text-ss-text-muted block mb-2">Size system</label>
        <div className="flex rounded-lg border border-ss-border p-1 bg-ss-bg-secondary gap-1">
          {SHOE_SYSTEMS.map((s) => (
            <button
              key={s.key}
              type="button"
              onClick={() => handleSystemChange(s.key)}
              className={`flex-1 py-2 text-xs font-medium rounded-md transition-colors ${
                system === s.key
                  ? "bg-white text-ss-text shadow-sm"
                  : "text-ss-text-muted hover:text-ss-text"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Size input */}
      <div>
        <label className="text-xs font-medium text-ss-text-muted block mb-2">
          Your size ({SHOE_SYSTEMS.find(s => s.key === system)?.label})
        </label>
        <input
          type="number"
          step="0.5"
          placeholder={system === "eu" ? "42" : system === "usMen" ? "9.5" : system === "usWomen" ? "10" : "8"}
          value={input}
          onChange={(e) => handleInput(e.target.value)}
          className="w-full border border-ss-border rounded-lg px-4 py-3 text-sm text-ss-text placeholder:text-ss-text-muted focus:outline-none focus:ring-2 focus:ring-ss-text/10 focus:border-ss-text transition-colors"
        />
      </div>

      {/* Live conversions */}
      {conversions && (
        <div className="grid grid-cols-4 gap-2">
          {[
            { label: "EU",       value: conversions.eu      },
            { label: "US Men",   value: conversions.usMen   },
            { label: "US Women", value: conversions.usWomen },
            { label: "UK",       value: conversions.uk      },
          ].map((c) => (
            <div
              key={c.label}
              className={`p-3 rounded-xl border text-center transition-colors ${
                SHOE_SYSTEMS.find(s => s.label === c.label)?.key === system
                  ? "border-ss-text bg-ss-bg-secondary"
                  : "border-ss-border"
              }`}
            >
              <p className="text-base font-semibold text-ss-text">{c.value ?? "—"}</p>
              <p className="text-xs text-ss-text-muted mt-0.5">{c.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Size chart toggle */}
      <button
        type="button"
        onClick={() => setShowChart((v) => !v)}
        className="text-xs text-ss-text-muted hover:text-ss-text transition-colors flex items-center gap-1"
      >
        {showChart ? "Hide" : "View"} full size chart
        <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
          className={`transition-transform ${showChart ? "rotate-180" : ""}`}>
          <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
        </svg>
      </button>

      {showChart && (
        <div className="overflow-x-auto rounded-xl border border-ss-border">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-ss-border bg-ss-bg-secondary">
                {["EU", "US Men", "US Women", "UK"].map((h) => (
                  <th key={h} className="px-3 py-2.5 text-left font-medium text-ss-text-muted">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {SHOE_SIZES.map((row) => (
                <tr
                  key={row.eu}
                  onClick={() => { setSystem("eu"); setInput(String(row.eu)); handleInput(String(row.eu)); }}
                  className={`border-b border-ss-border last:border-0 cursor-pointer transition-colors hover:bg-ss-bg-secondary ${
                    shoeEU === String(row.eu) ? "bg-ss-bg-secondary font-semibold" : ""
                  }`}
                >
                  <td className="px-3 py-2.5 text-ss-text font-medium">{row.eu}</td>
                  <td className="px-3 py-2.5 text-ss-text-muted">{row.usMen ?? "—"}</td>
                  <td className="px-3 py-2.5 text-ss-text-muted">{row.usWomen ?? "—"}</td>
                  <td className="px-3 py-2.5 text-ss-text-muted">{row.uk}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<FormData>(EMPTY);

  // Photo state — front / side / back
  type Angle = "front" | "side" | "back";
  const [photos, setPhotos] = useState<Record<Angle, { preview: string | null; path: string | null }>>({
    front: { preview: null, path: null },
    side:  { preview: null, path: null },
    back:  { preview: null, path: null },
  });
  const [photoUploading, setPhotoUploading] = useState<Angle | null>(null);
  const [photoError, setPhotoError] = useState("");
  const [dragging, setDragging] = useState<Angle | null>(null);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const set = (key: keyof FormData) => (value: string) =>
    setForm((f) => ({ ...f, [key]: value }));

  // Photo upload handler
  const handlePhotoFile = useCallback(async (file: File, angle: "front" | "side" | "back") => {
    if (!file.type.startsWith("image/")) {
      setPhotoError("Please upload an image file (JPG or PNG).");
      return;
    }
    setPhotoError("");
    setPhotoUploading(angle);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setPhotoError("Not signed in."); setPhotoUploading(null); return; }

    const ext = file.name.split(".").pop();
    const path = `${user.id}/body-photo-${angle}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("user-photos")
      .upload(path, file, { upsert: true });

    if (uploadError) {
      setPhotoError(uploadError.message);
    } else {
      setPhotos(prev => ({ ...prev, [angle]: { preview: URL.createObjectURL(file), path } }));
    }
    setPhotoUploading(null);
  }, []);

  function canContinue() {
    if (step === 1) return form.height && form.weight && form.gender;
    if (step === 2) return true; // photo is optional
    if (step === 3) return form.bust && form.waist && form.hips;
    if (step === 4) return !!form.shoe_eu;
    if (step === 5) return !!form.skin_tone;
    return true;
  }

  async function handleNext() {
    if (step < 6) { setStep((s) => s + 1); return; }
    setSaving(true);
    setError("");
    const result = await saveProfile({
      height: Number(form.height),
      weight: Number(form.weight),
      gender: form.gender,
      bust: Number(form.bust),
      waist: Number(form.waist),
      hips: Number(form.hips),
      shoe_size: Number(form.shoe_eu),
      skin_tone: form.skin_tone,
      body_photo_path:      photos.front.path ?? undefined,
      body_photo_side_path: photos.side.path  ?? undefined,
      body_photo_back_path: photos.back.path  ?? undefined,
    });
    if (result?.error) { setError(result.error); setSaving(false); }
  }

  const current = STEPS[step - 1];

  return (
    <div className="min-h-screen bg-ss-bg flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-lg">
        {/* Progress */}
        <div className="flex items-center gap-1.5 mb-12">
          {STEPS.map((s) => (
            <div key={s.num}
              className={`flex-1 h-1 rounded-full transition-colors duration-300 ${s.num <= step ? "bg-ss-text" : "bg-ss-border"}`}
            />
          ))}
        </div>

        {/* Header */}
        <p className="text-xs font-medium uppercase tracking-widest text-ss-text-muted mb-2">
          Step {step} of 6
        </p>
        <h1 className="text-2xl font-semibold tracking-tight text-ss-text mb-2">{current.title}</h1>
        <p className="text-sm text-ss-text-muted mb-8">{current.desc}</p>

        {/* ── Step content ── */}

        {step === 1 && (
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <Field label="Height (cm)" placeholder="170" value={form.height} onChange={set("height")} />
              <Field label="Weight (kg)" placeholder="80" value={form.weight} onChange={set("weight")} />
            </div>
            <div>
              <label className="text-xs font-medium text-ss-text-muted block mb-2">Gender</label>
              <div className="grid grid-cols-3 gap-3">
                {GENDERS.map((g) => (
                  <button key={g} type="button"
                    onClick={() => set("gender")(g.toLowerCase())}
                    className={`border rounded-lg py-3 text-sm transition-colors ${
                      form.gender === g.toLowerCase()
                        ? "border-ss-text text-ss-text font-medium bg-ss-bg-secondary"
                        : "border-ss-border text-ss-text-muted hover:border-ss-text hover:text-ss-text"
                    }`}
                  >{g}</button>
                ))}
              </div>
            </div>
            <p className="text-xs text-ss-text-muted bg-ss-bg-secondary border border-ss-border rounded-lg px-4 py-3">
              Height and weight give us a rough starting point, but your body photo in the next step is what really makes try-ons accurate.
            </p>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-5">
            {/* Three upload slots */}
            <div className="grid grid-cols-3 gap-3">
              {(["front", "side", "back"] as const).map((angle) => {
                const slot = photos[angle];
                const isUploading = photoUploading === angle;
                const isDraggingThis = dragging === angle;
                return (
                  <div key={angle} className="flex flex-col gap-2">
                    <p className="text-xs font-medium text-ss-text capitalize text-center">{angle} view</p>
                    {slot.preview ? (
                      <div className="relative rounded-xl overflow-hidden border border-ss-border" style={{ aspectRatio: "3/4" }}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={slot.preview} alt={`${angle} view`} className="w-full h-full object-cover" />
                        <button type="button"
                          onClick={() => setPhotos(p => ({ ...p, [angle]: { preview: null, path: null } }))}
                          className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/50 flex items-center justify-center hover:bg-black/70 transition-colors"
                        >
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                            <path strokeLinecap="round" d="M6 18 18 6M6 6l12 12" />
                          </svg>
                        </button>
                        <div className="absolute bottom-1.5 right-1.5">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                            <circle cx="12" cy="12" r="10" fill="#10B981" />
                            <path stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="m8 12 3 3 5-5" />
                          </svg>
                        </div>
                      </div>
                    ) : (
                      <div
                        onDragOver={(e) => { e.preventDefault(); setDragging(angle); }}
                        onDragLeave={() => setDragging(null)}
                        onDrop={(e) => {
                          e.preventDefault(); setDragging(null);
                          const file = e.dataTransfer.files[0];
                          if (file) handlePhotoFile(file, angle);
                        }}
                        onClick={() => {
                          const el = document.getElementById(`file-${angle}`) as HTMLInputElement;
                          el?.click();
                        }}
                        className={`border-2 border-dashed rounded-xl flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors ${
                          isDraggingThis ? "border-ss-text bg-ss-bg-secondary" : "border-ss-border hover:border-ss-text/40 hover:bg-ss-bg-secondary"
                        }`}
                        style={{ aspectRatio: "3/4" }}
                      >
                        {isUploading ? (
                          <svg className="animate-spin h-5 w-5 text-ss-text-muted" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                          </svg>
                        ) : (
                          <>
                            <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="#9CA3AF" strokeWidth={1.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
                            </svg>
                            <p className="text-xs text-ss-text-muted text-center px-2">
                              {angle === "front" ? "Tap to add" : "Optional"}
                            </p>
                          </>
                        )}
                        <input id={`file-${angle}`} type="file" accept="image/*" className="hidden"
                          onChange={(e) => { const f = e.target.files?.[0]; if (f) handlePhotoFile(f, angle); }}
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {photoError && (
              <p className="text-xs text-ss-error bg-red-50 border border-red-100 rounded-lg px-3 py-2">{photoError}</p>
            )}

            <PhotoGuide />
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <Field label="Bust (cm)" placeholder="90" value={form.bust} onChange={set("bust")} />
            <Field label="Waist (cm)" placeholder="75" value={form.waist} onChange={set("waist")} />
            <Field label="Hips (cm)" placeholder="95" value={form.hips} onChange={set("hips")} />
            <p className="text-xs text-ss-text-muted bg-ss-bg-secondary border border-ss-border rounded-lg px-4 py-3">
              Measure at the fullest part of each area. Wrap the tape comfortably snug — not tight.
            </p>
          </div>
        )}

        {step === 4 && (
          <ShoeSizeStep shoeEU={form.shoe_eu} setShoeEU={set("shoe_eu")} />
        )}

        {step === 5 && (
          <div>
            <label className="text-xs font-medium text-ss-text-muted block mb-4">Select your skin tone</label>
            <div className="grid grid-cols-6 gap-3">
              {SKIN_TONES.map((tone) => (
                <button key={tone.hex} type="button"
                  onClick={() => set("skin_tone")(tone.hex)}
                  title={tone.label}
                  className={`aspect-square rounded-full border-2 transition-all ${
                    form.skin_tone === tone.hex
                      ? "border-ss-text scale-110 shadow-md"
                      : "border-transparent hover:border-ss-text/40"
                  }`}
                  style={{ backgroundColor: tone.hex }}
                />
              ))}
            </div>
            {form.skin_tone && (
              <p className="text-xs text-ss-text-muted mt-4">
                Selected: {SKIN_TONES.find((t) => t.hex === form.skin_tone)?.label}
              </p>
            )}
          </div>
        )}

        {step === 6 && (
          <div className="space-y-1">
            {[
              { label: "Height",    value: `${form.height} cm` },
              { label: "Weight",    value: `${form.weight} kg` },
              { label: "Gender",    value: form.gender },
              { label: "Bust",      value: `${form.bust} cm` },
              { label: "Waist",     value: `${form.waist} cm` },
              { label: "Hips",      value: `${form.hips} cm` },
              { label: "Shoe (EU)", value: `EU ${form.shoe_eu}` },
              { label: "Skin tone", value: SKIN_TONES.find((t) => t.hex === form.skin_tone)?.label ?? "—", hex: form.skin_tone },
            ].map((row) => (
              <div key={row.label} className="flex items-center justify-between py-3 border-b border-ss-border last:border-0">
                <span className="text-sm text-ss-text-muted">{row.label}</span>
                <div className="flex items-center gap-2">
                  {row.hex && <span className="w-3.5 h-3.5 rounded-full border border-ss-border" style={{ backgroundColor: row.hex }} />}
                  <span className="text-sm font-medium text-ss-text capitalize">{row.value}</span>
                </div>
              </div>
            ))}
            {(["front","side","back"] as const).map(angle => photos[angle].path && (
              <div key={angle} className="flex items-center justify-between py-3 border-b border-ss-border">
                <span className="text-sm text-ss-text-muted capitalize">{angle} photo</span>
                <span className="text-sm font-medium text-ss-success">Uploaded ✓</span>
              </div>
            ))}
            {error && (
              <p className="text-xs text-ss-error bg-red-50 border border-red-100 rounded-lg px-3 py-2 mt-2">{error}</p>
            )}
          </div>
        )}

        {/* Navigation */}
        <div className="pt-10 flex items-center justify-between">
          {step > 1 ? (
            <button type="button" onClick={() => setStep((s) => s - 1)}
              className="text-sm text-ss-text-muted hover:text-ss-text transition-colors">
              ← Back
            </button>
          ) : (
            <button type="button" onClick={() => router.push("/dashboard")}
              className="text-sm text-ss-text-muted hover:text-ss-text transition-colors">
              Skip for now
            </button>
          )}

          {/* Skip photo step */}
          {step === 2 && !photos.front.preview && (
            <button type="button" onClick={() => setStep(3)}
              className="text-sm text-ss-text-muted hover:text-ss-text transition-colors underline">
              Skip photo
            </button>
          )}

          <button type="button" onClick={handleNext}
            disabled={!canContinue() || saving || photoUploading !== null}
            className="inline-flex items-center gap-2 bg-ss-text text-white px-6 py-3 rounded-lg text-sm font-medium hover:bg-ss-text/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {saving ? (
              <>
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                Saving…
              </>
            ) : step === 6 ? "Go to dashboard →" : (
              <>Continue <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
              </svg></>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
