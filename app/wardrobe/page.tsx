import Nav from "@/components/nav";

const categories = [
  "All",
  "Tops",
  "Bottoms",
  "Dresses",
  "Outerwear",
  "Shoes",
  "Accessories",
  "Hairstyles",
];

export default function WardrobePage() {
  return (
    <>
      <Nav />
      <main className="pt-20 pb-16 px-6 min-h-screen bg-ss-bg">
        <div className="mx-auto max-w-6xl">
          <div className="py-10 border-b border-ss-border mb-10 flex items-center justify-between">
            <div>
              <p className="text-sm text-ss-text-muted mb-1">Your closet, digitized</p>
              <h1 className="text-3xl font-semibold tracking-tight text-ss-text">Wardrobe</h1>
            </div>
            <button className="inline-flex items-center gap-2 bg-ss-text text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-ss-text/90 transition-colors">
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              Add item
            </button>
          </div>

          {/* Category filters */}
          <div className="flex gap-2 overflow-x-auto pb-2 mb-8 scrollbar-hide">
            {categories.map((cat, i) => (
              <button
                key={cat}
                className={`shrink-0 px-4 py-2 rounded-full text-xs font-medium transition-colors border ${
                  i === 0
                    ? "bg-ss-text text-white border-ss-text"
                    : "border-ss-border text-ss-text-muted hover:text-ss-text hover:border-ss-text/30"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Empty state */}
          <div className="rounded-2xl border border-dashed border-ss-border p-20 flex flex-col items-center justify-center text-center">
            <div className="w-14 h-14 rounded-2xl bg-ss-bg-secondary border border-ss-border flex items-center justify-center mb-5">
              <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="#9CA3AF" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25Z" />
              </svg>
            </div>
            <p className="text-sm font-medium text-ss-text mb-2">No items yet</p>
            <p className="text-xs text-ss-text-muted mb-6 max-w-xs">
              Add your first item by uploading an image or pasting a product URL. Claude will auto-categorize it.
            </p>
            <button className="inline-flex items-center gap-2 bg-ss-text text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-ss-text/90 transition-colors">
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              Add first item
            </button>
          </div>
        </div>
      </main>
    </>
  );
}
