"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, Suspense } from "react";
import { createClient } from "@/lib/supabase";

function AuthForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlError = searchParams.get("error");

  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<"google" | "apple" | null>(null);
  const [error, setError] = useState(urlError === "auth_failed" ? "Authentication failed. Please try again." : "");
  const [message, setMessage] = useState("");

  const supabase = createClient();

  async function handleEmailAuth(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    const { error } =
      mode === "signin"
        ? await supabase.auth.signInWithPassword({ email, password })
        : await supabase.auth.signUp({
            email,
            password,
            options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
          });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    if (mode === "signup") {
      setMessage("Check your email to confirm your account.");
      setLoading(false);
    } else {
      router.push("/dashboard");
      router.refresh();
    }
  }

  async function handleOAuth(provider: "google" | "apple") {
    setOauthLoading(provider);
    setError("");
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) {
      setError(error.message);
      setOauthLoading(null);
    }
  }

  return (
    <div className="min-h-screen bg-ss-bg flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        {/* Back + header */}
        <div className="mb-10 text-center">
          <Link href="/" className="text-sm text-ss-text-muted hover:text-ss-text transition-colors">
            ← Back
          </Link>
          <h1 className="text-2xl font-semibold tracking-tight text-ss-text mt-6 mb-2">
            Welcome to StyleSelf
          </h1>
          <p className="text-sm text-ss-text-muted">
            {mode === "signin" ? "Sign in to your account." : "Create a free account."}
          </p>
        </div>

        {/* Mode toggle */}
        <div className="flex rounded-lg border border-ss-border p-1 mb-6 bg-ss-bg-secondary">
          {(["signin", "signup"] as const).map((m) => (
            <button
              key={m}
              onClick={() => { setMode(m); setError(""); setMessage(""); }}
              className={`flex-1 py-2 text-xs font-medium rounded-md transition-colors ${
                mode === m
                  ? "bg-white text-ss-text shadow-sm"
                  : "text-ss-text-muted hover:text-ss-text"
              }`}
            >
              {m === "signin" ? "Sign in" : "Create account"}
            </button>
          ))}
        </div>

        {/* OAuth buttons */}
        <div className="space-y-3">
          <button
            onClick={() => handleOAuth("google")}
            disabled={!!oauthLoading}
            className="w-full flex items-center justify-center gap-3 border border-ss-border rounded-lg px-4 py-3 text-sm font-medium text-ss-text hover:bg-ss-bg-secondary transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {oauthLoading === "google" ? <Spinner /> : <GoogleIcon />}
            Continue with Google
          </button>
          <button
            onClick={() => handleOAuth("apple")}
            disabled={!!oauthLoading}
            className="w-full flex items-center justify-center gap-3 border border-ss-border rounded-lg px-4 py-3 text-sm font-medium text-ss-text hover:bg-ss-bg-secondary transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {oauthLoading === "apple" ? <Spinner /> : <AppleIcon />}
            Continue with Apple
          </button>
        </div>

        <div className="flex items-center gap-3 my-6">
          <div className="flex-1 h-px bg-ss-border" />
          <span className="text-xs text-ss-text-muted">or</span>
          <div className="flex-1 h-px bg-ss-border" />
        </div>

        {/* Email form */}
        <form onSubmit={handleEmailAuth} className="space-y-3">
          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full border border-ss-border rounded-lg px-4 py-3 text-sm text-ss-text placeholder:text-ss-text-muted focus:outline-none focus:ring-2 focus:ring-ss-text/10 focus:border-ss-text transition-colors"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            className="w-full border border-ss-border rounded-lg px-4 py-3 text-sm text-ss-text placeholder:text-ss-text-muted focus:outline-none focus:ring-2 focus:ring-ss-text/10 focus:border-ss-text transition-colors"
          />

          {error && (
            <p className="text-xs text-ss-error bg-red-50 border border-red-100 rounded-lg px-3 py-2">
              {error}
            </p>
          )}
          {message && (
            <p className="text-xs text-ss-success bg-green-50 border border-green-100 rounded-lg px-3 py-2">
              {message}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-ss-text text-white rounded-lg px-4 py-3 text-sm font-medium hover:bg-ss-text/90 transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading && <Spinner white />}
            {mode === "signin" ? "Sign in" : "Create account"}
          </button>
        </form>

        <p className="text-center text-xs text-ss-text-muted mt-6">
          By continuing, you agree to our{" "}
          <Link href="#" className="underline hover:text-ss-text transition-colors">Terms</Link>
          {" "}and{" "}
          <Link href="#" className="underline hover:text-ss-text transition-colors">Privacy Policy</Link>.
        </p>
      </div>
    </div>
  );
}

export default function AuthPage() {
  return (
    <Suspense>
      <AuthForm />
    </Suspense>
  );
}

function Spinner({ white }: { white?: boolean }) {
  return (
    <svg
      className={`animate-spin h-4 w-4 ${white ? "text-white" : "text-ss-text-muted"}`}
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
    </svg>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M23.745 12.27c0-.79-.07-1.54-.19-2.27h-11.3v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58v3h3.86c2.26-2.09 3.56-5.17 3.56-8.82Z" />
      <path fill="#34A853" d="M12.255 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96h-3.98v3.09C3.515 21.3 7.615 24 12.255 24Z" />
      <path fill="#FBBC05" d="M5.525 14.29c-.25-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29V6.62h-3.98a11.86 11.86 0 0 0 0 10.76l3.98-3.09Z" />
      <path fill="#EA4335" d="M12.255 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C18.205 1.19 15.495 0 12.255 0c-4.64 0-8.74 2.7-10.71 6.62l3.98 3.09c.95-2.85 3.6-4.96 6.73-4.96Z" />
    </svg>
  );
}

function AppleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11Z" />
    </svg>
  );
}
