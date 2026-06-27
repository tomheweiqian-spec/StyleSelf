import Nav from "@/components/nav";
import Link from "next/link";
import { signOut } from "@/app/auth/actions";

const sections = [
  {
    label: "Body Profile",
    desc: "Height, weight, measurements, skin tone",
    href: "/onboarding",
  },
  {
    label: "Account",
    desc: "Email, password, connected accounts",
    href: "#",
  },
  {
    label: "Preferences",
    desc: "Style preferences and notifications",
    href: "#",
  },
];

export default function ProfilePage() {
  return (
    <>
      <Nav />
      <main className="pt-20 pb-16 px-6 min-h-screen bg-ss-bg">
        <div className="mx-auto max-w-2xl">
          <div className="py-10 border-b border-ss-border mb-10">
            <p className="text-sm text-ss-text-muted mb-1">Your account</p>
            <h1 className="text-3xl font-semibold tracking-tight text-ss-text">Profile</h1>
          </div>

          {/* Avatar */}
          <div className="flex items-center gap-5 mb-10 pb-10 border-b border-ss-border">
            <div className="w-16 h-16 rounded-full bg-ss-bg-secondary border border-ss-border flex items-center justify-center">
              <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="#9CA3AF" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
              </svg>
            </div>
            <div>
              <p className="font-medium text-ss-text">Your name</p>
              <p className="text-sm text-ss-text-muted">your@email.com</p>
            </div>
            <button className="ml-auto text-xs border border-ss-border rounded-lg px-3 py-2 hover:bg-ss-bg-secondary transition-colors text-ss-text-muted hover:text-ss-text">
              Edit
            </button>
          </div>

          {/* Settings sections */}
          <div className="space-y-3 mb-10">
            {sections.map((section) => (
              <Link
                key={section.label}
                href={section.href}
                className="flex items-center justify-between p-5 rounded-xl border border-ss-border hover:bg-ss-bg-secondary transition-colors group"
              >
                <div>
                  <p className="text-sm font-medium text-ss-text">{section.label}</p>
                  <p className="text-xs text-ss-text-muted mt-0.5">{section.desc}</p>
                </div>
                <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="#9CA3AF" strokeWidth={1.5} className="group-hover:stroke-ss-text transition-colors">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                </svg>
              </Link>
            ))}
          </div>

          <form action={signOut}>
            <button type="submit" className="text-sm text-ss-error hover:underline transition-colors">
              Sign out
            </button>
          </form>
        </div>
      </main>
    </>
  );
}
