"use client";

import { useState, useCallback } from "react";
import Nav from "@/components/nav";
import { analyzeOutfit, getUserStyles } from "./actions";
import type { OutfitAnalysis } from "./actions";

function ScoreBar({ score, label, comment }: { score: number; label: string; comment: string }) {
  const color =
    score >= 80 ? "#10B981" :
    score >= 60 ? "#F59E0B" :
    "#EF4444";

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-ss-text">{label}</span>
        <span className="text-sm font-semibold tabular-nums" style={{ color }}>{score}</span>
      </div>
      <div className="h-1.5 rounded-full bg-ss-bg-secondary overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${score}%`, backgroundColor: color }}
        />
      </div>
      <p className="text-xs text-ss-text-muted leading-snug">{comment}</p>
    </div>
  );
}

function OverallRing({ score }: { score: number }) {
  const color =
    score >= 80 ? "#10B981" :
    score >= 60 ? "#F59E0B" :
    "#EF4444";
  const r = 38;
  const circ = 2 * Math.PI * r;
  const dash = (score / 100) * circ;

  return (
    <div className="flex flex-col items-center gap-1">
      <svg width="96" height="96" viewBox="0 0 96 96">
        <circle cx="48" cy="48" r={r} fill="none" stroke="#E5E7EB" strokeWidth="8" />
        <circle cx="48" cy="48" r={r} fill="none" stroke={color} strokeWidth="8"
          strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
          transform="rotate(-90 48 48)" />
        <text x="48" y="53" textAnchor="middle" fontSize="20" fontWeight="700" fill={color}>{score}</text>
      </svg>
      <p className="text-xs font-medium uppercase tracking-widest text-ss-text-muted">Overall</p>
    </div>
  );
}

export default function AnalyzePage() {
  const [preview, setPreview] = useState<string | null>(null);
  const [imageData, setImageData] = useState<{ base64: string; mediaType: string } | null>(null);
  const [dragging, setDragging] = useState(false);
  const [analysing, setAnalysing] = useState(false);
  const [analysis, setAnalysis] = useState<OutfitAnalysis | null>(null);
  const [error, setError] = useState("");

  const handleFile = useCallback((file: File) => {
    if (!file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      const base64 = dataUrl.split(",")[1];
      setPreview(dataUrl);
      setImageData({ base64, mediaType: file.type });
      setAnalysis(null);
      setError("");
    };
    reader.readAsDataURL(file);
  }, []);

  async function handleAnalyse() {
    if (!imageData) return;
    setAnalysing(true);
    setError("");
    const styles = await getUserStyles();
    const result = await analyzeOutfit(imageData.base64, imageData.mediaType, styles);
    if (result.error) setError(result.error);
    else if (result.analysis) setAnalysis(result.analysis);
    setAnalysing(false);
  }

  return (
    <>
      <Nav />
      <main className="pt-20 pb-20 px-6 min-h-screen bg-ss-bg">
        <div className="mx-auto max-w-2xl space-y-8">

          {/* Header */}
          <div className="pt-8">
            <h1 className="text-3xl font-semibold tracking-tight text-ss-text">Outfit analyser</h1>
            <p className="text-sm text-ss-text-muted mt-1">
              Upload any outfit and get an honest AI score with specific feedback.
            </p>
          </div>

          {/* Upload */}
          <div
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => { e.preventDefault(); setDragging(false); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }}
            onClick={() => !preview && document.getElementById("analyze-input")?.click()}
            className={`relative rounded-2xl border-2 overflow-hidden transition-colors ${
              preview ? "border-ss-border cursor-default" :
              dragging ? "border-ss-text bg-ss-bg-secondary cursor-pointer" :
              "border-dashed border-ss-border hover:border-ss-text/40 hover:bg-ss-bg-secondary cursor-pointer"
            }`}
            style={{ aspectRatio: preview ? "auto" : "4/3" }}
          >
            {preview ? (
              <div className="relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={preview} alt="Outfit" className="w-full max-h-[480px] object-cover" />
                <button type="button"
                  onClick={(e) => { e.stopPropagation(); setPreview(null); setImageData(null); setAnalysis(null); }}
                  className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/50 flex items-center justify-center hover:bg-black/70 transition-colors"
                >
                  <svg width="12" height="12" fill="none" stroke="white" strokeWidth={2.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" d="M6 18 18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-ss-bg-secondary border border-ss-border flex items-center justify-center">
                  <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="#9CA3AF" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
                  </svg>
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium text-ss-text">Drop your outfit photo here</p>
                  <p className="text-xs text-ss-text-muted mt-1">Full-body shot works best</p>
                </div>
              </div>
            )}
            <input id="analyze-input" type="file" accept="image/*" className="hidden"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
            />
          </div>

          {/* Analyse button */}
          {preview && !analysis && (
            <button type="button" onClick={handleAnalyse} disabled={analysing}
              className="w-full inline-flex items-center justify-center gap-2 bg-ss-text text-white py-3 rounded-xl text-sm font-medium hover:bg-ss-text/90 transition-colors disabled:opacity-50"
            >
              {analysing ? (
                <>
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  Analysing your outfit…
                </>
              ) : "Analyse this outfit →"}
            </button>
          )}

          {error && (
            <p className="text-xs text-ss-error bg-red-50 border border-red-100 rounded-lg px-3 py-2">{error}</p>
          )}

          {/* Results */}
          {analysis && (
            <div className="space-y-6">
              {/* Overall + verdict */}
              <div className="rounded-2xl border border-ss-border p-6 flex gap-6 items-start">
                <OverallRing score={analysis.overall} />
                <div className="flex-1">
                  <p className="text-xs font-semibold uppercase tracking-widest text-ss-text-muted mb-1">
                    {analysis.styleMatch}
                  </p>
                  <p className="text-sm text-ss-text leading-relaxed">{analysis.verdict}</p>
                </div>
              </div>

              {/* Score bars */}
              <div className="rounded-2xl border border-ss-border p-6 space-y-5">
                <p className="text-xs font-semibold uppercase tracking-widest text-ss-text-muted">Scores</p>
                {analysis.scores.map((s) => (
                  <ScoreBar key={s.label} score={s.score} label={s.label} comment={s.comment} />
                ))}
              </div>

              {/* What works / improve */}
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-2xl border border-ss-border p-5 space-y-3">
                  <p className="text-xs font-semibold uppercase tracking-widest text-ss-success">What works</p>
                  <ul className="space-y-2">
                    {analysis.whatWorks.map((w, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="mt-0.5 shrink-0">
                          <circle cx="12" cy="12" r="10" fill="#10B981" />
                          <path stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="m8 12 3 3 5-5" />
                        </svg>
                        <span className="text-xs text-ss-text leading-snug">{w}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="rounded-2xl border border-ss-border p-5 space-y-3">
                  <p className="text-xs font-semibold uppercase tracking-widest text-ss-error">Improve</p>
                  <ul className="space-y-2">
                    {analysis.improve.map((item, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="mt-0.5 shrink-0">
                          <circle cx="12" cy="12" r="10" fill="#EF4444" />
                          <path stroke="white" strokeWidth="2" strokeLinecap="round" d="M12 8v4m0 4h.01" />
                        </svg>
                        <span className="text-xs text-ss-text leading-snug">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Analyse another */}
              <button type="button"
                onClick={() => { setPreview(null); setImageData(null); setAnalysis(null); }}
                className="w-full text-sm text-ss-text-muted hover:text-ss-text transition-colors py-2"
              >
                ← Analyse another outfit
              </button>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
