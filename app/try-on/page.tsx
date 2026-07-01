"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Nav from "@/components/nav";
import {
  getUserBodyPhoto,
  getWardrobeForTryOn,
  startTryOn,
  checkTryOnStatus,
} from "./actions";
import { toFashnCategory } from "./utils";

type WardrobeItem = Awaited<ReturnType<typeof getWardrobeForTryOn>>[number];
type FashnCategory = "tops" | "bottoms" | "one-pieces";

function PhotoSlot({
  label,
  hint,
  preview,
  onClick,
  onFile,
  inputId,
}: {
  label: string;
  hint: string;
  preview: string | null;
  onClick?: () => void;
  onFile?: (file: File) => void;
  inputId: string;
}) {
  return (
    <div className="flex flex-col gap-2">
      <p className="text-xs font-semibold uppercase tracking-widest text-ss-text-muted">{label}</p>
      <div
        onClick={onClick ?? (() => document.getElementById(inputId)?.click())}
        className={`relative aspect-[3/4] rounded-2xl border overflow-hidden cursor-pointer transition-colors ${
          preview ? "border-ss-border" : "border-dashed border-ss-border hover:border-ss-text/40 hover:bg-ss-bg-secondary"
        } bg-ss-bg-secondary`}
      >
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={preview} alt={label} className="w-full h-full object-cover" />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 p-4">
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="#9CA3AF" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
            </svg>
            <p className="text-xs text-ss-text-muted text-center leading-snug">{hint}</p>
          </div>
        )}
        {onFile && (
          <input id={inputId} type="file" accept="image/*" className="hidden"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) onFile(f); }}
          />
        )}
      </div>
    </div>
  );
}

export default function TryOnPage() {
  // Person state
  const [bodyPhotoUrl, setBodyPhotoUrl]     = useState<string | null>(null);
  const [bodyPhotoPath, setBodyPhotoPath]   = useState<string | null>(null);
  const [personPreview, setPersonPreview]   = useState<string | null>(null);
  const [personBase64, setPersonBase64]     = useState<{ base64: string; mediaType: string } | null>(null);

  // Garment state
  const [wardrobe, setWardrobe]             = useState<WardrobeItem[]>([]);
  const [wardrobeOpen, setWardrobeOpen]     = useState(false);
  const [selectedItem, setSelectedItem]     = useState<WardrobeItem | null>(null);
  const [garmentPreview, setGarmentPreview] = useState<string | null>(null);
  const [garmentBase64, setGarmentBase64]   = useState<{ base64: string; mediaType: string } | null>(null);
  const [garmentPath, setGarmentPath]       = useState<string | null>(null);
  const [category, setCategory]             = useState<FashnCategory>("tops");

  // Result state
  const [loading, setLoading]   = useState(false);
  const [predId, setPredId]     = useState<string | null>(null);
  const [result, setResult]     = useState<string | null>(null);
  const [error, setError]       = useState("");
  const [statusMsg, setStatusMsg] = useState("");
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Load user body photo + wardrobe on mount
  useEffect(() => {
    getUserBodyPhoto().then((p) => {
      if (p) { setBodyPhotoUrl(p.url); setBodyPhotoPath(p.path); setPersonPreview(p.url); }
    });
    getWardrobeForTryOn().then(setWardrobe);
  }, []);

  // Poll for result
  useEffect(() => {
    if (!predId) return;
    pollRef.current = setInterval(async () => {
      const { status, output, error: pollError } = await checkTryOnStatus(predId);
      if (status === "completed" && output?.[0]) {
        clearInterval(pollRef.current!);
        setResult(output[0]);
        setLoading(false);
        setStatusMsg("");
      } else if (status === "failed" || status === "error") {
        clearInterval(pollRef.current!);
        setError(pollError ?? "Try-on failed — please try again.");
        setLoading(false);
        setStatusMsg("");
      } else {
        setStatusMsg(status === "processing" ? "Generating your try-on…" : "Starting up…");
      }
    }, 3000);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [predId]);

  const handlePersonFile = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      setPersonPreview(dataUrl);
      setPersonBase64({ base64: dataUrl.split(",")[1], mediaType: file.type });
      setBodyPhotoPath(null); // using uploaded, not stored
    };
    reader.readAsDataURL(file);
  }, []);

  const handleGarmentFile = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      setGarmentPreview(dataUrl);
      setGarmentBase64({ base64: dataUrl.split(",")[1], mediaType: file.type });
      setSelectedItem(null);
      setGarmentPath(null);
    };
    reader.readAsDataURL(file);
  }, []);

  const selectWardrobeItem = useCallback((item: WardrobeItem) => {
    setSelectedItem(item);
    setGarmentPreview(item.signedUrl);
    setGarmentBase64(null);
    setGarmentPath(item.image_path);
    setCategory(toFashnCategory(item.category));
    setWardrobeOpen(false);
  }, []);

  async function handleTryOn() {
    if (!personPreview || !garmentPreview) return;
    setLoading(true);
    setError("");
    setResult(null);
    setStatusMsg("Sending to Fashn.ai…");

    const { id, error: startError } = await startTryOn(
      personBase64,
      bodyPhotoPath,
      garmentBase64,
      garmentPath,
      garmentPath ? "wardrobe-items" : null,
      category
    );

    if (startError || !id) {
      setError(startError ?? "Failed to start try-on");
      setLoading(false);
      setStatusMsg("");
      return;
    }
    setPredId(id);
  }

  const canTryOn = personPreview && garmentPreview && !loading;

  return (
    <>
      <Nav />
      <main className="pt-20 pb-20 px-6 min-h-screen bg-ss-bg">
        <div className="mx-auto max-w-2xl space-y-8">

          {/* Header */}
          <div className="pt-8">
            <h1 className="text-3xl font-semibold tracking-tight text-ss-text">Virtual try-on</h1>
            <p className="text-sm text-ss-text-muted mt-1">
              See exactly how any item looks on you before buying.
            </p>
          </div>

          {/* Two slots */}
          <div className="grid grid-cols-2 gap-4">
            {/* Person */}
            <div className="flex flex-col gap-2">
              <p className="text-xs font-semibold uppercase tracking-widest text-ss-text-muted">Your photo</p>
              <div
                className={`relative aspect-[3/4] rounded-2xl border overflow-hidden cursor-pointer transition-colors ${
                  personPreview ? "border-ss-border" : "border-dashed border-ss-border hover:border-ss-text/40 hover:bg-ss-bg-secondary"
                } bg-ss-bg-secondary`}
                onClick={() => document.getElementById("person-input")?.click()}
              >
                {personPreview ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={personPreview} alt="You" className="w-full h-full object-cover" />
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 p-4">
                    <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="#9CA3AF" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
                    </svg>
                    <p className="text-xs text-ss-text-muted text-center">Full-body photo</p>
                  </div>
                )}
                <input id="person-input" type="file" accept="image/*" className="hidden"
                  onChange={(e) => { const f = e.target.files?.[0]; if (f) handlePersonFile(f); }}
                />
                {bodyPhotoUrl && personPreview === bodyPhotoUrl && (
                  <div className="absolute bottom-2 left-2">
                    <span className="text-[10px] font-semibold bg-ss-text text-white px-2 py-0.5 rounded-full">
                      From profile
                    </span>
                  </div>
                )}
              </div>
              <button type="button"
                onClick={() => document.getElementById("person-input")?.click()}
                className="text-xs text-ss-text-muted hover:text-ss-text transition-colors text-center"
              >
                {personPreview ? "Change photo" : "Upload photo"}
              </button>
            </div>

            {/* Garment */}
            <div className="flex flex-col gap-2">
              <p className="text-xs font-semibold uppercase tracking-widest text-ss-text-muted">Item to try on</p>
              <div
                className={`relative aspect-[3/4] rounded-2xl border overflow-hidden cursor-pointer transition-colors ${
                  garmentPreview ? "border-ss-border" : "border-dashed border-ss-border hover:border-ss-text/40 hover:bg-ss-bg-secondary"
                } bg-ss-bg-secondary`}
                onClick={() => !garmentPreview && setWardrobeOpen(true)}
              >
                {garmentPreview ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={garmentPreview} alt="Garment" className="w-full h-full object-cover" />
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 p-4">
                    <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="#9CA3AF" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                    </svg>
                    <p className="text-xs text-ss-text-muted text-center">Pick from wardrobe or upload</p>
                  </div>
                )}
                {selectedItem && (
                  <div className="absolute bottom-2 left-2">
                    <span className="text-[10px] font-semibold bg-ss-text text-white px-2 py-0.5 rounded-full truncate max-w-[90%] block">
                      {selectedItem.name}
                    </span>
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                <button type="button" onClick={() => setWardrobeOpen(true)}
                  className="flex-1 text-xs text-ss-text-muted hover:text-ss-text transition-colors text-center">
                  From wardrobe
                </button>
                <span className="text-ss-text-muted text-xs">·</span>
                <button type="button" onClick={() => document.getElementById("garment-input")?.click()}
                  className="flex-1 text-xs text-ss-text-muted hover:text-ss-text transition-colors text-center">
                  Upload
                </button>
                <input id="garment-input" type="file" accept="image/*" className="hidden"
                  onChange={(e) => { const f = e.target.files?.[0]; if (f) handleGarmentFile(f); }}
                />
              </div>
            </div>
          </div>

          {/* Category selector (shown if garment selected) */}
          {garmentPreview && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-ss-text-muted mb-2">Item type</p>
              <div className="flex gap-2">
                {(["tops", "bottoms", "one-pieces"] as FashnCategory[]).map((cat) => (
                  <button key={cat} type="button" onClick={() => setCategory(cat)}
                    className={`px-4 py-2 rounded-full text-xs font-medium border transition-colors capitalize ${
                      category === cat
                        ? "bg-ss-text text-white border-ss-text"
                        : "border-ss-border text-ss-text-muted hover:border-ss-text/40"
                    }`}>
                    {cat === "one-pieces" ? "Dress / Jumpsuit" : cat}
                  </button>
                ))}
              </div>
            </div>
          )}

          {error && (
            <p className="text-xs text-ss-error bg-red-50 border border-red-100 rounded-lg px-3 py-2">{error}</p>
          )}

          {/* Try on button */}
          <button type="button" onClick={handleTryOn} disabled={!canTryOn}
            className="w-full inline-flex items-center justify-center gap-2 bg-ss-text text-white py-3 rounded-xl text-sm font-medium hover:bg-ss-text/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                {statusMsg || "Processing…"}
              </>
            ) : "Try it on →"}
          </button>

          {/* Result */}
          {result && (
            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-widest text-ss-text-muted">Result</p>
              <div className="rounded-2xl overflow-hidden border border-ss-border">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={result} alt="Try-on result" className="w-full" />
              </div>
              <div className="flex gap-3">
                <a href={result} download="styleself-tryon.jpg"
                  className="flex-1 text-center text-xs font-medium bg-ss-text text-white py-2.5 rounded-lg hover:bg-ss-text/90 transition-colors">
                  Download
                </a>
                <button type="button"
                  onClick={() => { setResult(null); setPredId(null); setGarmentPreview(null); setSelectedItem(null); setGarmentBase64(null); setGarmentPath(null); }}
                  className="flex-1 text-center text-xs font-medium border border-ss-border text-ss-text py-2.5 rounded-lg hover:bg-ss-bg-secondary transition-colors">
                  Try another item
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Wardrobe picker modal */}
      {wardrobeOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4" onClick={() => setWardrobeOpen(false)}>
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
          <div className="relative w-full max-w-md bg-ss-bg rounded-2xl border border-ss-border shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 border-b border-ss-border">
              <p className="text-sm font-semibold text-ss-text">Pick from wardrobe</p>
              <button onClick={() => setWardrobeOpen(false)} className="text-ss-text-muted hover:text-ss-text transition-colors">
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" d="M6 18 18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {wardrobe.length === 0 ? (
              <div className="p-10 text-center">
                <p className="text-sm text-ss-text-muted">No wardrobe items yet.</p>
                <p className="text-xs text-ss-text-muted mt-1">Add items in the Wardrobe tab first.</p>
              </div>
            ) : (
              <div className="p-4 grid grid-cols-3 gap-3 max-h-[60vh] overflow-y-auto">
                {wardrobe.map((item) => (
                  <button key={item.id} type="button" onClick={() => selectWardrobeItem(item)}
                    className="group relative text-left">
                    <div className="aspect-[3/4] rounded-xl overflow-hidden border border-ss-border bg-ss-bg-secondary">
                      {item.signedUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={item.signedUrl} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-2xl">👕</div>
                      )}
                    </div>
                    <p className="text-[11px] text-ss-text mt-1 truncate">{item.name}</p>
                  </button>
                ))}
              </div>
            )}

            <div className="p-4 border-t border-ss-border">
              <button type="button"
                onClick={() => { setWardrobeOpen(false); document.getElementById("garment-input")?.click(); }}
                className="w-full text-xs text-ss-text-muted hover:text-ss-text transition-colors py-2">
                Or upload a new garment photo instead →
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
