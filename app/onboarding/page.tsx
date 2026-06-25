export default function OnboardingPage() {
  return (
    <div className="min-h-screen bg-ss-bg flex items-center justify-center px-6">
      <div className="w-full max-w-lg">
        {/* Progress */}
        <div className="flex items-center gap-2 mb-12">
          {[1, 2, 3, 4, 5].map((step) => (
            <div
              key={step}
              className={`flex-1 h-1 rounded-full ${
                step === 1 ? "bg-ss-text" : "bg-ss-border"
              }`}
            />
          ))}
        </div>

        <p className="text-xs font-medium uppercase tracking-widest text-ss-text-muted mb-2">
          Step 1 of 5
        </p>
        <h1 className="text-2xl font-semibold tracking-tight text-ss-text mb-2">
          Tell us about yourself
        </h1>
        <p className="text-sm text-ss-text-muted mb-10">
          We use this to ensure try-on results look right on your body.
        </p>

        <form className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-ss-text-muted block mb-2">
                Height (cm)
              </label>
              <input
                type="number"
                placeholder="170"
                className="w-full border border-ss-border rounded-lg px-4 py-3 text-sm text-ss-text placeholder:text-ss-text-muted focus:outline-none focus:ring-2 focus:ring-ss-text/10 focus:border-ss-text transition-colors"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-ss-text-muted block mb-2">
                Weight (kg)
              </label>
              <input
                type="number"
                placeholder="65"
                className="w-full border border-ss-border rounded-lg px-4 py-3 text-sm text-ss-text placeholder:text-ss-text-muted focus:outline-none focus:ring-2 focus:ring-ss-text/10 focus:border-ss-text transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-ss-text-muted block mb-2">
              Gender
            </label>
            <div className="grid grid-cols-3 gap-3">
              {["Female", "Male", "Non-binary"].map((g) => (
                <button
                  key={g}
                  type="button"
                  className="border border-ss-border rounded-lg py-3 text-sm text-ss-text-muted hover:border-ss-text hover:text-ss-text transition-colors first:border-ss-text first:text-ss-text"
                >
                  {g}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-ss-text-muted block mb-2">
              Skin tone
            </label>
            <div className="flex gap-3">
              {["#FDDBB4", "#E8B88A", "#C68642", "#8D5524", "#4A2912", "#1A0A00"].map(
                (color) => (
                  <button
                    key={color}
                    type="button"
                    className="w-9 h-9 rounded-full border-2 border-transparent hover:border-ss-text transition-colors"
                    style={{ backgroundColor: color }}
                  />
                )
              )}
            </div>
          </div>

          <div className="pt-4 flex items-center justify-between">
            <button
              type="button"
              className="text-sm text-ss-text-muted hover:text-ss-text transition-colors"
            >
              Skip for now
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-2 bg-ss-text text-white px-6 py-3 rounded-lg text-sm font-medium hover:bg-ss-text/90 transition-colors"
            >
              Continue
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
              </svg>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
