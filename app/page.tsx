import Link from "next/link";

const features = [
  {
    icon: (
      <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
      </svg>
    ),
    title: "Virtual Try-On",
    desc: "See any item on your body — clothes, shoes, accessories — rendered with AI precision before you commit to buying.",
  },
  {
    icon: (
      <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09Z" />
      </svg>
    ),
    title: "Outfit Analysis",
    desc: "Get honest, AI-powered feedback on fit, color harmony, and style — with real scores, not uniform 80s.",
  },
  {
    icon: (
      <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25Z" />
      </svg>
    ),
    title: "Smart Wardrobe",
    desc: "Upload your existing pieces. StyleSelf auto-categorizes them and suggests outfit combinations built around your actual closet.",
  },
  {
    icon: (
      <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m13.35-.622 1.757-1.757a4.5 4.5 0 0 0-6.364-6.364l-4.5 4.5a4.5 4.5 0 0 0 1.242 7.244" />
      </svg>
    ),
    title: "URL Import",
    desc: "Paste any product URL from any retailer. StyleSelf extracts the item image and lets you try it on instantly.",
  },
];

const steps = [
  {
    num: "01",
    title: "Upload a photo of yourself",
    desc: "Any well-lit, full-body photo works. We never store it beyond your session.",
  },
  {
    num: "02",
    title: "Pick an item to try on",
    desc: "From your wardrobe, our catalog, or paste any product URL from the web.",
  },
  {
    num: "03",
    title: "See yourself wearing it",
    desc: "AI renders the item onto your photo in seconds. Share, save, or buy with confidence.",
  },
];

const stats = [
  { value: "10s", label: "Average try-on time" },
  { value: "All", label: "Wearable categories" },
  { value: "Any URL", label: "From any retailer" },
  { value: "0 bias", label: "Real scoring" },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-ss-bg text-ss-text">
      {/* Nav */}
      <header className="fixed top-0 inset-x-0 z-50 border-b border-ss-border bg-ss-bg/80 backdrop-blur-md">
        <div className="mx-auto max-w-6xl px-6 h-14 flex items-center justify-between">
          <span className="font-semibold tracking-tight">StyleSelf</span>
          <nav className="hidden md:flex items-center gap-6 text-sm text-ss-text-muted">
            <Link href="#features" className="hover:text-ss-text transition-colors">Features</Link>
            <Link href="#how-it-works" className="hover:text-ss-text transition-colors">How it works</Link>
          </nav>
          <div className="flex items-center gap-3">
            <Link
              href="/auth"
              className="text-sm text-ss-text-muted hover:text-ss-text transition-colors"
            >
              Log in
            </Link>
            <Link
              href="/auth"
              className="text-sm bg-ss-text text-white px-4 py-2 rounded-lg hover:bg-ss-text/90 transition-colors font-medium"
            >
              Get started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="pt-32 pb-24 px-6">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-ss-border bg-ss-bg-secondary text-xs text-ss-text-muted mb-8">
              <span className="w-1.5 h-1.5 rounded-full bg-ss-success inline-block" />
              Virtual fitting room — now for everything you wear
            </div>
            <h1 className="text-5xl md:text-7xl font-semibold tracking-tight leading-[1.05] text-ss-text mb-6">
              Wear it before
              <br />
              you buy it.
            </h1>
            <p className="text-lg text-ss-text-muted max-w-xl leading-relaxed mb-10">
              StyleSelf is a virtual fitting room for every wearable — clothes,
              shoes, accessories, hairstyles. Upload a photo, pick any item, and
              see yourself in it within seconds.
            </p>
            <div className="flex flex-wrap items-center gap-4">
              <Link
                href="/auth"
                className="inline-flex items-center gap-2 bg-ss-text text-white px-6 py-3 rounded-lg text-sm font-medium hover:bg-ss-text/90 transition-colors"
              >
                Get started free
                <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                </svg>
              </Link>
              <Link
                href="#how-it-works"
                className="inline-flex items-center gap-2 text-sm text-ss-text-muted hover:text-ss-text transition-colors"
              >
                See how it works
                <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                </svg>
              </Link>
            </div>
          </div>

          {/* Visual demo area */}
          <div className="mt-20 grid grid-cols-3 gap-4">
            {[
              { label: "Before", sub: "Original photo" },
              { label: "Item", sub: "Product from URL" },
              { label: "After", sub: "Try-on result" },
            ].map((card) => (
              <div
                key={card.label}
                className="aspect-[3/4] rounded-2xl bg-ss-bg-secondary border border-ss-border flex flex-col items-center justify-center gap-3 relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-gray-100" />
                <div className="relative z-10 text-center">
                  <div className="w-12 h-12 rounded-xl bg-white border border-ss-border mx-auto mb-3 flex items-center justify-center shadow-sm">
                    <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="#9CA3AF" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
                    </svg>
                  </div>
                  <p className="text-sm font-medium text-ss-text">{card.label}</p>
                  <p className="text-xs text-ss-text-muted mt-0.5">{card.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <section className="border-y border-ss-border py-8 px-6 bg-ss-bg-secondary">
        <div className="mx-auto max-w-6xl grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((s) => (
            <div key={s.label} className="text-center">
              <p className="text-2xl font-semibold text-ss-text">{s.value}</p>
              <p className="text-xs text-ss-text-muted mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 px-6">
        <div className="mx-auto max-w-6xl">
          <div className="mb-14">
            <p className="text-xs font-medium text-ss-text-muted uppercase tracking-widest mb-3">
              Features
            </p>
            <h2 className="text-3xl md:text-4xl font-semibold tracking-tight">
              Everything a fitting room
              <br />
              can&apos;t do.
            </h2>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            {features.map((f) => (
              <div
                key={f.title}
                className="p-7 rounded-2xl border border-ss-border bg-ss-bg hover:bg-ss-bg-secondary transition-colors group"
              >
                <div className="w-10 h-10 rounded-xl bg-ss-bg-secondary border border-ss-border flex items-center justify-center mb-5 text-ss-text-muted group-hover:border-ss-text/20 transition-colors">
                  {f.icon}
                </div>
                <h3 className="font-semibold text-ss-text mb-2">{f.title}</h3>
                <p className="text-sm text-ss-text-muted leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="py-24 px-6 bg-ss-bg-secondary border-y border-ss-border">
        <div className="mx-auto max-w-6xl">
          <div className="mb-14">
            <p className="text-xs font-medium text-ss-text-muted uppercase tracking-widest mb-3">
              How it works
            </p>
            <h2 className="text-3xl md:text-4xl font-semibold tracking-tight">
              Three steps to your
              <br />
              perfect look.
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((step) => (
              <div key={step.num}>
                <div className="text-xs font-mono text-ss-text-muted mb-5 flex items-center gap-3">
                  <span className="text-2xl font-semibold text-ss-text">{step.num}</span>
                  <div className="flex-1 h-px bg-ss-border" />
                </div>
                <h3 className="font-semibold text-ss-text mb-2">{step.title}</h3>
                <p className="text-sm text-ss-text-muted leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 px-6">
        <div className="mx-auto max-w-6xl">
          <div className="rounded-3xl bg-ss-text text-white p-14 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
            <div>
              <h2 className="text-3xl md:text-4xl font-semibold tracking-tight mb-3">
                Ready to try it on?
              </h2>
              <p className="text-white/60 text-sm max-w-sm leading-relaxed">
                Create a free account. No credit card needed. Start trying on
                anything within two minutes.
              </p>
            </div>
            <div className="shrink-0">
              <Link
                href="/auth"
                className="inline-flex items-center gap-2 bg-white text-ss-text px-6 py-3 rounded-lg text-sm font-medium hover:bg-white/90 transition-colors"
              >
                Create free account
                <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-ss-border py-10 px-6">
        <div className="mx-auto max-w-6xl flex flex-col md:flex-row items-center justify-between gap-4">
          <span className="font-semibold tracking-tight text-ss-text">StyleSelf</span>
          <p className="text-xs text-ss-text-muted">
            Virtual try-on for every wearable. Built with AI.
          </p>
          <div className="flex items-center gap-5 text-xs text-ss-text-muted">
            <Link href="#" className="hover:text-ss-text transition-colors">Privacy</Link>
            <Link href="#" className="hover:text-ss-text transition-colors">Terms</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
