import { createServerSupabaseClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";
import Nav from "@/components/nav";
import Link from "next/link";

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

const QUICK_ACTIONS = [
  {
    href: "/try-on",
    label: "Virtual try-on",
    desc: "See how any item looks on you",
    icon: (
      <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
      </svg>
    ),
  },
  {
    href: "/analyze",
    label: "Analyse outfit",
    desc: "AI scores any look you put together",
    icon: (
      <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09Z" />
      </svg>
    ),
  },
  {
    href: "/wardrobe",
    label: "Add to wardrobe",
    desc: "Upload or paste a link to any item",
    icon: (
      <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
      </svg>
    ),
  },
];

function StatPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5 px-4 py-3 rounded-xl border border-ss-border bg-ss-bg">
      <span className="text-[10px] font-medium uppercase tracking-widest text-ss-text-muted">{label}</span>
      <span className="text-sm font-semibold text-ss-text">{value}</span>
    </div>
  );
}

export default async function DashboardPage() {
  const supabase = createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  const displayName =
    user.user_metadata?.full_name?.split(" ")[0] ||
    user.email?.split("@")[0] ||
    "there";

  const onboardingDone = profile?.onboarding_complete;
  const hasStats = profile?.height || profile?.bust;

  return (
    <>
      <Nav />
      <main className="pt-20 pb-20 px-6 min-h-screen bg-ss-bg">
        <div className="mx-auto max-w-2xl space-y-10">

          {/* Header */}
          <div className="pt-8">
            <p className="text-sm text-ss-text-muted mb-1">{greeting()},</p>
            <h1 className="text-3xl font-semibold tracking-tight text-ss-text capitalize">
              {displayName}
            </h1>
          </div>

          {/* Onboarding nudge */}
          {!onboardingDone && (
            <div className="flex items-center justify-between gap-4 rounded-2xl border border-ss-border bg-ss-bg-secondary p-5">
              <div>
                <p className="text-sm font-medium text-ss-text mb-0.5">Complete your profile</p>
                <p className="text-xs text-ss-text-muted">
                  Add your body measurements so StyleSelf can recommend sizes and try items on you.
                </p>
              </div>
              <Link href="/onboarding"
                className="shrink-0 text-xs font-medium bg-ss-text text-white px-4 py-2 rounded-lg hover:bg-ss-text/90 transition-colors">
                Start →
              </Link>
            </div>
          )}

          {/* Body stats */}
          {hasStats && (
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xs font-medium uppercase tracking-widest text-ss-text-muted">
                  Your measurements
                </h2>
                <Link href="/onboarding" className="text-xs text-ss-text-muted hover:text-ss-text transition-colors">
                  Edit →
                </Link>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {profile?.height  && <StatPill label="Height"  value={`${profile.height} cm`} />}
                {profile?.weight  && <StatPill label="Weight"  value={`${profile.weight} kg`} />}
                {profile?.bust    && <StatPill label="Bust"    value={`${profile.bust} cm`} />}
                {profile?.waist   && <StatPill label="Waist"   value={`${profile.waist} cm`} />}
                {profile?.hips    && <StatPill label="Hips"    value={`${profile.hips} cm`} />}
                {profile?.shoe_size && <StatPill label="Shoe (EU)" value={`EU ${profile.shoe_size}`} />}
              </div>
            </section>
          )}

          {/* Quick actions */}
          <section>
            <h2 className="text-xs font-medium uppercase tracking-widest text-ss-text-muted mb-4">
              Quick actions
            </h2>
            <div className="grid sm:grid-cols-3 gap-3">
              {QUICK_ACTIONS.map((a) => (
                <Link key={a.href} href={a.href}
                  className="p-5 rounded-2xl border border-ss-border hover:bg-ss-bg-secondary transition-colors group">
                  <div className="w-9 h-9 rounded-xl bg-ss-bg-secondary border border-ss-border flex items-center justify-center mb-4 text-ss-text-muted group-hover:border-ss-text/20 transition-colors">
                    {a.icon}
                  </div>
                  <p className="text-sm font-medium text-ss-text mb-0.5">{a.label}</p>
                  <p className="text-xs text-ss-text-muted">{a.desc}</p>
                </Link>
              ))}
            </div>
          </section>

          {/* Recent try-ons */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xs font-medium uppercase tracking-widest text-ss-text-muted">
                Recent try-ons
              </h2>
              <Link href="/try-on" className="text-xs text-ss-text-muted hover:text-ss-text transition-colors">
                View all →
              </Link>
            </div>
            <div className="rounded-2xl border border-dashed border-ss-border p-10 flex flex-col items-center justify-center text-center">
              <div className="w-10 h-10 rounded-xl bg-ss-bg-secondary border border-ss-border flex items-center justify-center mb-4 text-ss-text-muted">
                <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                </svg>
              </div>
              <p className="text-sm font-medium text-ss-text mb-1">No try-ons yet</p>
              <p className="text-xs text-ss-text-muted mb-5">Pick any item from your wardrobe and see it on you.</p>
              <Link href="/try-on"
                className="text-xs font-medium bg-ss-text text-white px-4 py-2 rounded-lg hover:bg-ss-text/90 transition-colors">
                Try something on
              </Link>
            </div>
          </section>

          {/* Wardrobe */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xs font-medium uppercase tracking-widest text-ss-text-muted">
                Wardrobe
              </h2>
              <Link href="/wardrobe" className="text-xs text-ss-text-muted hover:text-ss-text transition-colors">
                View all →
              </Link>
            </div>
            <div className="rounded-2xl border border-dashed border-ss-border p-10 flex flex-col items-center justify-center text-center">
              <div className="w-10 h-10 rounded-xl bg-ss-bg-secondary border border-ss-border flex items-center justify-center mb-4 text-ss-text-muted">
                <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
              </div>
              <p className="text-sm font-medium text-ss-text mb-1">Your wardrobe is empty</p>
              <p className="text-xs text-ss-text-muted mb-5">Upload photos or paste shop links to build your wardrobe.</p>
              <Link href="/wardrobe"
                className="text-xs font-medium bg-ss-text text-white px-4 py-2 rounded-lg hover:bg-ss-text/90 transition-colors">
                Add first item
              </Link>
            </div>
          </section>

        </div>
      </main>
    </>
  );
}
