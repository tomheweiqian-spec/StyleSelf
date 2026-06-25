import Nav from "@/components/nav";

export default function TryOnPage() {
  return (
    <>
      <Nav />
      <main className="pt-20 pb-16 px-6 min-h-screen bg-ss-bg">
        <div className="mx-auto max-w-6xl">
          <div className="py-10 border-b border-ss-border mb-10">
            <p className="text-sm text-ss-text-muted mb-1">Step into your look</p>
            <h1 className="text-3xl font-semibold tracking-tight text-ss-text">Virtual Try-On</h1>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Left: upload photo */}
            <div>
              <p className="text-xs font-medium uppercase tracking-widest text-ss-text-muted mb-4">
                Your photo
              </p>
              <div className="aspect-[3/4] rounded-2xl border border-dashed border-ss-border bg-ss-bg-secondary flex flex-col items-center justify-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-white border border-ss-border flex items-center justify-center shadow-sm">
                  <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="#9CA3AF" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
                  </svg>
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium text-ss-text">Upload your photo</p>
                  <p className="text-xs text-ss-text-muted mt-1">Full-body, well-lit. JPG or PNG.</p>
                </div>
                <button className="text-xs font-medium border border-ss-border rounded-lg px-4 py-2 hover:bg-white transition-colors">
                  Choose file
                </button>
              </div>
            </div>

            {/* Right: pick item */}
            <div>
              <p className="text-xs font-medium uppercase tracking-widest text-ss-text-muted mb-4">
                Item to try on
              </p>
              <div className="space-y-3 mb-6">
                <input
                  type="text"
                  placeholder="Paste a product URL from any store…"
                  className="w-full border border-ss-border rounded-lg px-4 py-3 text-sm text-ss-text placeholder:text-ss-text-muted focus:outline-none focus:ring-2 focus:ring-ss-text/10 focus:border-ss-text transition-colors"
                />
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-px bg-ss-border" />
                  <span className="text-xs text-ss-text-muted">or</span>
                  <div className="flex-1 h-px bg-ss-border" />
                </div>
                <button className="w-full flex items-center justify-center gap-2 border border-ss-border rounded-lg px-4 py-3 text-sm text-ss-text hover:bg-ss-bg-secondary transition-colors">
                  <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                  </svg>
                  Upload item image
                </button>
                <button className="w-full flex items-center justify-center gap-2 border border-ss-border rounded-lg px-4 py-3 text-sm text-ss-text hover:bg-ss-bg-secondary transition-colors">
                  <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25Z" />
                  </svg>
                  Pick from my wardrobe
                </button>
              </div>

              <button
                disabled
                className="w-full bg-ss-text text-white rounded-lg px-4 py-3 text-sm font-medium opacity-40 cursor-not-allowed"
              >
                Try it on
              </button>
              <p className="text-xs text-ss-text-muted text-center mt-3">
                Add a photo and item above to enable
              </p>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
