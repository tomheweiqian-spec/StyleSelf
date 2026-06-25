import Nav from "@/components/nav";
import Link from "next/link";

const quickActions = [
  {
    href: "/try-on",
    label: "Try On",
    desc: "Upload a photo and try any item",
    icon: (
      <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
      </svg>
    ),
  },
  {
    href: "/analyze",
    label: "Analyze Outfit",
    desc: "Get AI scoring on any look",
    icon: (
      <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09Z" />
      </svg>
    ),
  },
  {
    href: "/wardrobe",
    label: "Add to Wardrobe",
    desc: "Upload or import a new item",
    icon: (
      <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
      </svg>
    ),
  },
];

export default function DashboardPage() {
  return (
    <>
      <Nav />
      <main className="pt-20 pb-16 px-6 min-h-screen bg-ss-bg">
        <div className="mx-auto max-w-6xl">
          {/* Header */}
          <div className="py-10 border-b border-ss-border mb-10">
            <p className="text-sm text-ss-text-muted mb-1">Good morning</p>
            <h1 className="text-3xl font-semibold tracking-tight text-ss-text">Dashboard</h1>
          </div>

          {/* Quick actions */}
          <section className="mb-12">
            <h2 className="text-xs font-medium uppercase tracking-widest text-ss-text-muted mb-5">
              Quick actions
            </h2>
            <div className="grid sm:grid-cols-3 gap-4">
              {quickActions.map((action) => (
                <Link
                  key={action.href}
                  href={action.href}
                  className="p-6 rounded-2xl border border-ss-border hover:bg-ss-bg-secondary transition-colors group"
                >
                  <div className="w-10 h-10 rounded-xl bg-ss-bg-secondary border border-ss-border flex items-center justify-center mb-4 text-ss-text-muted group-hover:border-ss-text/20 transition-colors">
                    {action.icon}
                  </div>
                  <p className="font-medium text-ss-text text-sm mb-1">{action.label}</p>
                  <p className="text-xs text-ss-text-muted">{action.desc}</p>
                </Link>
              ))}
            </div>
          </section>

          {/* Recent try-ons */}
          <section className="mb-12">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xs font-medium uppercase tracking-widest text-ss-text-muted">
                Recent try-ons
              </h2>
              <Link href="/try-on" className="text-xs text-ss-text-muted hover:text-ss-text transition-colors">
                View all →
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="aspect-[3/4] rounded-xl bg-ss-bg-secondary border border-ss-border flex items-center justify-center"
                >
                  <p className="text-xs text-ss-text-muted">Empty</p>
                </div>
              ))}
            </div>
          </section>

          {/* Wardrobe preview */}
          <section>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xs font-medium uppercase tracking-widest text-ss-text-muted">
                Wardrobe preview
              </h2>
              <Link href="/wardrobe" className="text-xs text-ss-text-muted hover:text-ss-text transition-colors">
                View all →
              </Link>
            </div>
            <div className="rounded-2xl border border-ss-border border-dashed p-12 flex flex-col items-center justify-center text-center">
              <p className="text-sm font-medium text-ss-text mb-1">Your wardrobe is empty</p>
              <p className="text-xs text-ss-text-muted mb-5">Start adding items to unlock outfit suggestions.</p>
              <Link
                href="/wardrobe"
                className="text-xs font-medium bg-ss-text text-white px-4 py-2 rounded-lg hover:bg-ss-text/90 transition-colors"
              >
                Add first item
              </Link>
            </div>
          </section>
        </div>
      </main>
    </>
  );
}
