"use client";

import { useState, useCallback, useEffect } from "react";
import Nav from "@/components/nav";
import { uploadWardrobeItem, getWardrobeItems, getSignedUrl, deleteWardrobeItem, getShoppingLinks } from "./actions";
import type { WardrobeItem, Outfit } from "./actions";

const CATEGORY_ICONS: Record<string, string> = {
  tops: "👕", bottoms: "👖", shoes: "👟", outerwear: "🧥",
  accessories: "💍", dresses: "👗", activewear: "⚡", bags: "👜",
};

const RETAILER_LABELS: { key: keyof ReturnType<typeof getShoppingLinks>; label: string }[] = [
  { key: "google",  label: "Google Shopping" },
  { key: "asos",    label: "ASOS" },
  { key: "zara",    label: "Zara" },
  { key: "hm",      label: "H&M" },
  { key: "uniqlo",  label: "Uniqlo" },
];

function UploadZone({ onUpload }: { onUpload: (file: File) => void }) {
  const [dragging, setDragging] = useState(false);

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => {
        e.preventDefault(); setDragging(false);
        const f = e.dataTransfer.files[0];
        if (f) onUpload(f);
      }}
      onClick={() => document.getElementById("wardrobe-file-input")?.click()}
      className={`border-2 border-dashed rounded-2xl p-10 flex flex-col items-center justify-center gap-3 cursor-pointer transition-colors ${
        dragging ? "border-ss-text bg-ss-bg-secondary" : "border-ss-border hover:border-ss-text/40 hover:bg-ss-bg-secondary"
      }`}
    >
      <div className="w-12 h-12 rounded-xl bg-ss-bg-secondary border border-ss-border flex items-center justify-center">
        <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="#9CA3AF" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
        </svg>
      </div>
      <div className="text-center">
        <p className="text-sm font-medium text-ss-text">Drop a photo here, or click to browse</p>
        <p className="text-xs text-ss-text-muted mt-1">JPG or PNG · StyleSelf will auto-tag and build 5 outfits</p>
      </div>
      <input id="wardrobe-file-input" type="file" accept="image/*" className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) onUpload(f); }}
      />
    </div>
  );
}

function OutfitCard({ outfit }: { outfit: Outfit }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="rounded-2xl border border-ss-border overflow-hidden">
      <button type="button"
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-4 hover:bg-ss-bg-secondary transition-colors text-left"
      >
        <div>
          <p className="text-sm font-medium text-ss-text">{outfit.name}</p>
          <p className="text-xs text-ss-text-muted mt-0.5">{outfit.style} · {outfit.vibe}</p>
        </div>
        <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
          className={`shrink-0 transition-transform text-ss-text-muted ${expanded ? "rotate-180" : ""}`}>
          <path strokeLinecap="round" strokeLinejoin="round" d="m19 9-7 7-7-7" />
        </svg>
      </button>

      {expanded && (
        <div className="border-t border-ss-border divide-y divide-ss-border">
          {outfit.items.map((item, i) => {
            const links = getShoppingLinks(item.searchQuery);
            return (
              <div key={i} className="p-4">
                <div className="flex items-start gap-3 mb-3">
                  <span className="text-lg shrink-0">
                    {CATEGORY_ICONS[item.category] ?? "👔"}
                  </span>
                  <div>
                    <p className="text-sm font-medium text-ss-text">{item.piece}</p>
                    <p className="text-xs text-ss-text-muted mt-0.5 leading-snug">{item.description}</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {RETAILER_LABELS.map(({ key, label }) => (
                    <a key={key} href={links[key]} target="_blank" rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] font-medium border border-ss-border rounded-full px-2.5 py-1 hover:bg-ss-bg-secondary hover:border-ss-text/30 transition-colors text-ss-text">
                      {label}
                      <svg width="9" height="9" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                      </svg>
                    </a>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function ItemCard({
  item,
  onDelete,
}: {
  item: WardrobeItem & { signedUrl?: string };
  onDelete: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="group relative">
      <button type="button" onClick={() => setOpen(true)} className="w-full text-left">
        <div className="aspect-[3/4] rounded-2xl overflow-hidden border border-ss-border bg-ss-bg-secondary relative">
          {item.signedUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={item.signedUrl} alt={item.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-3xl">
              {CATEGORY_ICONS[item.category] ?? "👔"}
            </div>
          )}
          {item.outfits && (
            <div className="absolute bottom-2 left-2">
              <span className="text-[10px] font-semibold bg-ss-text text-white px-2 py-0.5 rounded-full">
                {item.outfits.outfits.length} outfits
              </span>
            </div>
          )}
        </div>
        <div className="mt-2 px-0.5">
          <p className="text-xs font-medium text-ss-text truncate">{item.name}</p>
          <p className="text-[11px] text-ss-text-muted capitalize">{item.category}</p>
        </div>
      </button>

      {/* Delete */}
      <button type="button"
        onClick={async (e) => {
          e.stopPropagation();
          await deleteWardrobeItem(item.id, item.image_path);
          onDelete(item.id);
        }}
        className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/50 items-center justify-center hidden group-hover:flex hover:bg-black/70 transition-colors"
      >
        <svg width="10" height="10" fill="none" stroke="white" strokeWidth={2.5} viewBox="0 0 24 24">
          <path strokeLinecap="round" d="M6 18 18 6M6 6l12 12" />
        </svg>
      </button>

      {/* Detail drawer */}
      {open && (
        <div className="fixed inset-0 z-50 flex" onClick={() => setOpen(false)}>
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
          <div
            className="relative ml-auto w-full max-w-md h-full bg-ss-bg overflow-y-auto shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {item.signedUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={item.signedUrl} alt={item.name} className="w-full aspect-square object-cover" />
            )}
            <div className="p-6 space-y-5">
              <div>
                <h2 className="text-xl font-semibold text-ss-text">{item.name}</h2>
                {item.brand_guess && (
                  <p className="text-sm text-ss-text-muted mt-0.5">{item.brand_guess}</p>
                )}
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {item.colors.map((c) => (
                    <span key={c} className="text-xs border border-ss-border rounded-full px-2 py-0.5 capitalize text-ss-text">{c}</span>
                  ))}
                  {item.style_tags.map((t) => (
                    <span key={t} className="text-xs border border-ss-border rounded-full px-2 py-0.5 capitalize text-ss-text-muted">{t}</span>
                  ))}
                  {item.season.map((s) => (
                    <span key={s} className="text-xs bg-ss-bg-secondary border border-ss-border rounded-full px-2 py-0.5 capitalize text-ss-text-muted">{s}</span>
                  ))}
                </div>
              </div>

              {item.outfits?.outfits && item.outfits.outfits.length > 0 && (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-ss-text-muted mb-3">
                    5 outfits built around this piece
                  </p>
                  <div className="space-y-2">
                    {item.outfits.outfits.map((outfit, i) => (
                      <OutfitCard key={i} outfit={outfit} />
                    ))}
                  </div>
                </div>
              )}

              <button type="button" onClick={() => setOpen(false)}
                className="w-full text-sm text-ss-text-muted hover:text-ss-text transition-colors py-2">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function WardrobePage() {
  const [items, setItems] = useState<(WardrobeItem & { signedUrl?: string })[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const data = await getWardrobeItems();
      const withUrls = await Promise.all(
        data.map(async (item) => ({
          ...item,
          signedUrl: (await getSignedUrl(item.image_path)) ?? undefined,
        }))
      );
      setItems(withUrls);
      setLoading(false);
    })();
  }, []);

  const handleUpload = useCallback(async (file: File) => {
    setUploading(true);
    setUploadError("");
    const fd = new FormData();
    fd.append("file", file);
    const result = await uploadWardrobeItem(fd);
    if (result.error) {
      setUploadError(result.error);
    } else if (result.item) {
      const signedUrl = (await getSignedUrl(result.item.image_path)) ?? undefined;
      setItems((prev) => [{ ...result.item!, signedUrl }, ...prev]);
    }
    setUploading(false);
  }, []);

  const handleDelete = useCallback((id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }, []);

  return (
    <>
      <Nav />
      <main className="pt-20 pb-20 px-6 min-h-screen bg-ss-bg">
        <div className="mx-auto max-w-2xl space-y-8">
          <div className="pt-8">
            <h1 className="text-3xl font-semibold tracking-tight text-ss-text">Wardrobe</h1>
            <p className="text-sm text-ss-text-muted mt-1">
              {items.length > 0 ? `${items.length} item${items.length !== 1 ? "s" : ""}` : "Add your first item"}
            </p>
          </div>

          {uploading ? (
            <div className="border-2 border-dashed border-ss-border rounded-2xl p-10 flex flex-col items-center gap-3">
              <svg className="animate-spin h-6 w-6 text-ss-text-muted" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
              <div className="text-center">
                <p className="text-sm font-medium text-ss-text">Uploading and analysing…</p>
                <p className="text-xs text-ss-text-muted mt-1">Claude is tagging your item and building 5 outfits</p>
              </div>
            </div>
          ) : (
            <UploadZone onUpload={handleUpload} />
          )}

          {uploadError && (
            <p className="text-xs text-ss-error bg-red-50 border border-red-100 rounded-lg px-3 py-2">{uploadError}</p>
          )}

          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="aspect-[3/4] rounded-2xl bg-ss-bg-secondary border border-ss-border animate-pulse" />
              ))}
            </div>
          ) : items.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {items.map((item) => (
                <ItemCard key={item.id} item={item} onDelete={handleDelete} />
              ))}
            </div>
          ) : !uploading && (
            <div className="text-center py-12">
              <p className="text-sm text-ss-text-muted">Your wardrobe is empty — add your first item above.</p>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
