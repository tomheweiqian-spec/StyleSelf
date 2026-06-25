"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navLinks = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/try-on", label: "Try On" },
  { href: "/analyze", label: "Analyze" },
  { href: "/wardrobe", label: "Wardrobe" },
];

export default function Nav() {
  const pathname = usePathname();
  const isLanding = pathname === "/";

  if (isLanding) return null;

  return (
    <header className="fixed top-0 inset-x-0 z-50 border-b border-ss-border bg-ss-bg/80 backdrop-blur-md">
      <div className="mx-auto max-w-6xl px-6 h-14 flex items-center justify-between">
        <Link href="/" className="font-semibold text-ss-text tracking-tight">
          StyleSelf
        </Link>
        <nav className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-sm transition-colors ${
                pathname === link.href
                  ? "text-ss-text font-medium"
                  : "text-ss-text-muted hover:text-ss-text"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <Link
            href="/profile"
            className="w-8 h-8 rounded-full bg-ss-bg-secondary border border-ss-border flex items-center justify-center hover:bg-gray-100 transition-colors"
          >
            <span className="text-xs font-medium text-ss-text-muted">P</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
