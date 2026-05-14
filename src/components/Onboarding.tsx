"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const SLIDES = [
  {
    emoji: "🐛",
    num: "01 / 04",
    title: "Your silkworm rearing companion",
    body: "Reshme-Namma Pride helps Karnataka silk farmers monitor rearing house conditions and prevent crop failure — even without expensive sensors.",
  },
  {
    emoji: "🗂️",
    num: "02 / 04",
    title: "Create a batch, track every stage",
    body: "Start a batch when you receive your silkworm eggs. The app automatically tracks which Instar stage (1–5) your worms are in, based on the start date.",
  },
  {
    emoji: "🌡️",
    num: "03 / 04",
    title: "Log temp & humidity 3× a day",
    body: "Enter readings from your wall thermometer every morning, afternoon, and evening. The Climate Dial instantly shows SAFE, CAUTION, or DANGER for your current Instar stage.",
  },
  {
    emoji: "✨",
    num: "04 / 04",
    title: "AI advice, even offline",
    body: "Get stage-specific advice from Gemini AI when online — or the built-in rule engine when you're in the field without internet. You always get actionable guidance.",
  },
];

export default function Onboarding() {
  const [cur, setCur] = useState(0);
  const [dir, setDir] = useState<"right" | "left">("right");
  const router = useRouter();

  const go = (i: number) => {
    const next = Math.max(0, Math.min(3, i));
    setDir(next > cur ? "right" : "left");
    setCur(next);
  };

  const finish = () => {
    localStorage.setItem("reshme_onboarded", "1");
    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen bg-silk flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Slide card */}
        <div className="bg-white rounded-3xl border border-reshme-border overflow-hidden mb-5 shadow-sm">
          <div className={`p-8 slide-in-${dir}`} key={cur}>
            {/* Emoji */}
            <div className="text-6xl mb-5">{SLIDES[cur].emoji}</div>
            <p className="text-xs font-medium text-reshme-amber uppercase tracking-widest mb-3">
              {SLIDES[cur].num}
            </p>
            <h2 className="font-serif text-2xl font-bold text-reshme-dark leading-snug mb-4">
              {SLIDES[cur].title}
            </h2>
            <p className="text-reshme-muted text-sm leading-relaxed">
              {SLIDES[cur].body}
            </p>
          </div>

          {/* Dot indicators */}
          <div className="flex gap-2 justify-center pb-5">
            {SLIDES.map((_, i) => (
              <button
                key={i}
                onClick={() => go(i)}
                className="transition-all duration-300 h-2 rounded-full"
                style={{
                  width: cur === i ? 24 : 8,
                  background: cur === i ? "#2A6B3F" : "#E8E0CC",
                }}
              />
            ))}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex gap-3">
          {cur > 0 ? (
            <button onClick={() => go(cur - 1)} className="btn-secondary flex-shrink-0 px-5">
              ← Back
            </button>
          ) : (
            <button onClick={finish} className="btn-secondary flex-shrink-0 text-sm px-4 py-3 text-reshme-muted">
              Skip
            </button>
          )}
          <button
            onClick={cur === 3 ? finish : () => go(cur + 1)}
            className="btn-primary flex-1"
          >
            {cur === 3 ? "Get Started 🐛" : "Next →"}
          </button>
        </div>

        {/* Progress bar */}
        <div className="mt-5 h-1 bg-reshme-border rounded-full overflow-hidden">
          <div
            className="h-full bg-reshme-green rounded-full transition-all duration-500"
            style={{ width: `${((cur + 1) / 4) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
}
