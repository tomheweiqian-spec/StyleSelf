import Nav from "@/components/nav";

const scoreCategories = [
  { label: "Fit", score: null },
  { label: "Color Harmony", score: null },
  { label: "Style", score: null },
  { label: "Overall", score: null },
];

export default function AnalyzePage() {
  return (
    <>
      <Nav />
      <main className="pt-20 pb-16 px-6 min-h-screen bg-ss-bg">
        <div className="mx-auto max-w-6xl">
          <div className="py-10 border-b border-ss-border mb-10">
            <p className="text-sm text-ss-text-muted mb-1">AI-powered scoring</p>
            <h1 className="text-3xl font-semibold tracking-tight text-ss-text">Outfit Analysis</h1>
          </div>

          <div className="grid md:grid-cols-2 gap-10">
            {/* Upload area */}
            <div>
              <p className="text-xs font-medium uppercase tracking-widest text-ss-text-muted mb-4">
                Outfit photo
              </p>
              <div className="aspect-[3/4] rounded-2xl border border-dashed border-ss-border bg-ss-bg-secondary flex flex-col items-center justify-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-white border border-ss-border flex items-center justify-center shadow-sm">
                  <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="#9CA3AF" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
                  </svg>
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium text-ss-text">Upload your outfit</p>
                  <p className="text-xs text-ss-text-muted mt-1">Full-body photo works best.</p>
                </div>
                <button className="text-xs font-medium border border-ss-border rounded-lg px-4 py-2 hover:bg-white transition-colors">
                  Choose file
                </button>
              </div>
              <button
                disabled
                className="w-full mt-4 bg-ss-text text-white rounded-lg px-4 py-3 text-sm font-medium opacity-40 cursor-not-allowed"
              >
                Analyze outfit
              </button>
            </div>

            {/* Scores */}
            <div>
              <p className="text-xs font-medium uppercase tracking-widest text-ss-text-muted mb-4">
                Analysis results
              </p>
              <div className="space-y-4">
                {scoreCategories.map((cat) => (
                  <div key={cat.label} className="p-5 rounded-xl border border-ss-border">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-medium text-ss-text">{cat.label}</span>
                      <span className="text-sm text-ss-text-muted">—</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-ss-bg-secondary overflow-hidden">
                      <div className="h-full bg-ss-border rounded-full w-0" />
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 p-5 rounded-xl border border-ss-border bg-ss-bg-secondary">
                <p className="text-xs font-medium uppercase tracking-widest text-ss-text-muted mb-3">
                  Feedback
                </p>
                <p className="text-sm text-ss-text-muted italic">
                  Upload an outfit photo to see detailed AI feedback and suggestions.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
