import { NextRequest, NextResponse } from "next/server";
import type { ClimateStatus } from "@/types";
import { getInstarRange } from "@/lib/domain";

/**
 * POST /api/advice
 * Called by the climate page after a log is saved.
 * Calls Google Gemini API server-side (API key never exposed to browser).
 */
export async function POST(req: NextRequest) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey.startsWith("your_") || apiKey === "your_gemini_api_key_here") {
    return NextResponse.json({ error: "GEMINI_API_KEY not configured" }, { status: 503 });
  }

  const body = await req.json();
  const { temp, hum, stage, status, breed, lang } = body as {
    temp: number; hum: number; stage: number;
    status: ClimateStatus; breed: string; lang?: string;
  };

  const range = getInstarRange(stage);
  if (!range) {
    return NextResponse.json({ error: "Unknown stage" }, { status: 400 });
  }

  const langInstruction = lang === "kn"
    ? "Respond entirely in Kannada (ಕನ್ನಡ) language."
    : "Respond in English.";

  const prompt = `You are an expert Karnataka sericulture advisor helping a silk farmer. ${langInstruction}

Current batch situation:
- Silkworm breed: ${breed}
- Instar stage: ${stage} (${range.label})
- Biological context: ${range.biologicalNote}
- Logged temperature: ${temp}°C (ideal range: ${range.tempMinCelsius}–${range.tempMaxCelsius}°C)
- Logged humidity: ${hum}% (ideal range: ${range.humidityMinPercent}–${range.humidityMaxPercent}%)
- Climate assessment: ${status}

Provide actionable, stage-specific advice in 3–5 bullet points.
Start with a one-line status summary, then list concrete actions.
Use simple English suitable for a rural farmer. Keep the total response under 200 words.`;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 7000);
    // Also abort if the client disconnects (client has a 5s timeout)
    req.signal.addEventListener("abort", () => controller.abort());
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash-lite:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { maxOutputTokens: 400, temperature: 0.4 },
        }),
        signal: controller.signal,
      }
    );
    clearTimeout(timeout);

    if (!res.ok) {
      const err = await res.text();
      console.error(`Gemini ${res.status} error:`, err);
      return NextResponse.json({ error: "Gemini request failed", detail: err }, { status: 502 });
    }

    const data = await res.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
    if (!text) {
      return NextResponse.json({ error: "Empty response from Gemini" }, { status: 502 });
    }

    return NextResponse.json({ text });
  } catch (err) {
    console.error("Gemini fetch error:", err);
    return NextResponse.json({ error: "Network error" }, { status: 503 });
  }
}
