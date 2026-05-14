/**
 * Pure TypeScript domain logic — direct port of the Kotlin
 * InstArCalculator and InstarRanges classes from the Android app.
 * No Firebase or React imports — fully unit-testable.
 */

import type { InstarRange, ClimateStatus, AdviceResult, ClimateLog } from "@/types";

// ─── Instar Ranges (KSRDI data) ───────────────────────────────────────────────

export const INSTAR_RANGES: InstarRange[] = [
  {
    stage: 1, label: "Instar 1 — Newly Hatched",
    tempMinCelsius: 26, tempMaxCelsius: 28,
    humidityMinPercent: 85, humidityMaxPercent: 90,
    durationDays: 3,
    biologicalNote: "First instar larvae are just hatched (chawki stage). Extremely delicate — high humidity is critical to prevent desiccation.",
  },
  {
    stage: 2, label: "Instar 2",
    tempMinCelsius: 25, tempMaxCelsius: 27,
    humidityMinPercent: 80, humidityMaxPercent: 85,
    durationDays: 3,
    biologicalNote: "Second instar larvae have moulted once. Still require consistent warm and humid conditions. Moulting stress increases disease risk.",
  },
  {
    stage: 3, label: "Instar 3",
    tempMinCelsius: 24, tempMaxCelsius: 26,
    humidityMinPercent: 75, humidityMaxPercent: 80,
    durationDays: 4,
    biologicalNote: "Transition stage — larvae eat voraciously and grow rapidly. Bed hygiene becomes important.",
  },
  {
    stage: 4, label: "Instar 4 — Late Young Age",
    tempMinCelsius: 23, tempMaxCelsius: 25,
    humidityMinPercent: 70, humidityMaxPercent: 75,
    durationDays: 5,
    biologicalNote: "Fourth instar larvae consume the majority of their total food intake. Disease risk peaks here.",
  },
  {
    stage: 5, label: "Instar 5 — Pre-Spinning",
    tempMinCelsius: 23, tempMaxCelsius: 24,
    humidityMinPercent: 65, humidityMaxPercent: 70,
    durationDays: 8,
    biologicalNote: "Final instar before cocooning. Lower humidity is essential to ensure tight, high-quality cocoon silk.",
  },
];

export function getInstarRange(stage: number): InstarRange | null {
  return INSTAR_RANGES.find((r) => r.stage === stage) ?? null;
}

// ─── InstArCalculator ─────────────────────────────────────────────────────────

interface StageBoundary { stage: number; startDay: number; endDay: number; }

function buildBoundaries(): StageBoundary[] {
  let cursor = 0;
  return INSTAR_RANGES.map((r) => {
    const b: StageBoundary = { stage: r.stage, startDay: cursor, endDay: cursor + r.durationDays - 1 };
    cursor += r.durationDays;
    return b;
  });
}
const BOUNDARIES = buildBoundaries();

export function currentStage(startMs: number, nowMs = Date.now()): number {
  const daysElapsed = Math.max(0, Math.floor((nowMs - startMs) / 86_400_000));
  return BOUNDARIES.find((b) => daysElapsed >= b.startDay && daysElapsed <= b.endDay)?.stage ?? 5;
}

export function daysElapsed(startMs: number, nowMs = Date.now()): number {
  return Math.max(0, Math.floor((nowMs - startMs) / 86_400_000));
}

export function harvestDateMs(startMs: number, breed: string): number {
  const isBivoltine =
    breed.toLowerCase().includes("bivoltine") ||
    breed.includes("CSR2 × CSR4");
  const days = isBivoltine ? 26 : 23;
  return startMs + days * 86_400_000;
}

export function harvestCountdownLabel(harvestMs: number): string {
  const days = Math.floor((harvestMs - Date.now()) / 86_400_000);
  if (days < 0) return `Overdue by ${-days} day(s)`;
  if (days === 0) return "🌟 Harvest today!";
  if (days === 1) return "Tomorrow!";
  return `${days} days to harvest`;
}

export function cycleProgress(startMs: number, harvestMs: number): number {
  const totalMs = harvestMs - startMs;
  const elapsedMs = Date.now() - startMs;
  return Math.min(1, Math.max(0, elapsedMs / totalMs));
}

// ─── Climate Status Evaluation ────────────────────────────────────────────────

export function evaluateClimateStatus(
  temp: number,
  hum: number,
  stage: number
): ClimateStatus {
  const range = getInstarRange(stage);
  if (!range) return "DANGER";

  const tempOk = temp >= range.tempMinCelsius && temp <= range.tempMaxCelsius;
  const humOk = hum >= range.humidityMinPercent && hum <= range.humidityMaxPercent;
  if (tempOk && humOk) return "SAFE";

  const tempCaution = temp >= range.tempMinCelsius - 2 && temp <= range.tempMaxCelsius + 2;
  const humCaution = hum >= range.humidityMinPercent - 5 && hum <= range.humidityMaxPercent + 5;
  return tempCaution && humCaution ? "CAUTION" : "DANGER";
}

// ─── InstArLogicEngine (offline advice) ───────────────────────────────────────

export function generateOfflineAdvice(
  temp: number,
  hum: number,
  stage: number,
  lang: "en" | "kn" = "en"
): AdviceResult {
  const range = getInstarRange(stage);
  const kn = lang === "kn";

  if (!range) {
    return {
      status: "DANGER",
      headline: kn ? "ಅಪರಿಚಿತ ಹಂತ — ಬ್ಯಾಚ್ ಸೆಟ್ಟಿಂಗ್ ಪರಿಶೀಲಿಸಿ." : "Unknown stage — check batch settings.",
      actions: [kn ? "ನಿಮ್ಮ ಬ್ಯಾಚ್ ಆರಂಭ ದಿನಾಂಕ ಮತ್ತು ತಳಿ ಪರಿಶೀಲಿಸಿ." : "Verify your batch start date and breed."],
      rangeInfo: "N/A",
    };
  }

  const status = evaluateClimateStatus(temp, hum, stage);
  const rangeInfo = kn
    ? `ಸೂಕ್ತ: ${range.tempMinCelsius}–${range.tempMaxCelsius}°C, ${range.humidityMinPercent}–${range.humidityMaxPercent}% RH`
    : `Ideal: ${range.tempMinCelsius}–${range.tempMaxCelsius}°C, ${range.humidityMinPercent}–${range.humidityMaxPercent}% RH`;

  const tempLow = temp < range.tempMinCelsius;
  const tempHigh = temp > range.tempMaxCelsius;
  const humLow = hum < range.humidityMinPercent;
  const humHigh = hum > range.humidityMaxPercent;

  const stageLabel = kn
    ? ["", "ಇನ್ಸ್ಟಾರ್ 1 — ತಾಜಾ ಮೊಟ್ಟೆ ಒಡೆದ ಮರಿ", "ಇನ್ಸ್ಟಾರ್ 2", "ಇನ್ಸ್ಟಾರ್ 3", "ಇನ್ಸ್ಟಾರ್ 4 — ಕೊನೆಯ ಎಳೆ ವಯಸ್ಸು", "ಇನ್ಸ್ಟಾರ್ 5 — ನೂಲು ಮೊದಲು"][stage] ?? range.label
    : range.label;

  if (status === "SAFE") {
    const stageActions: Record<number, string[]> = kn ? {
      1: ["ತಾಜಾ ಹಿಪ್ಪುನೇರಳೆ ಎಲೆ ಉಣಿಸಿ — ಎಳೆಯ ಮರಿಗಳಿಗೆ ಮೃದುವಾದ ಎಲೆ ಮಾತ್ರ ಬೇಕು.", "ಸಾಕಣೆ ಕೋಣೆಯಲ್ಲಿ ಗಾಳಿ ಮತ್ತು ತೀಕ್ಷ್ಣ ವಾಸನೆ ಇಲ್ಲದಂತೆ ಮಾಡಿ.", "ಮರಿಗಳು ಸಕ್ರಿಯವಾಗಿ ತಿನ್ನುತ್ತಿವೆಯೇ ಎಂದು ಪರಿಶೀಲಿಸಿ; ಒಂದೇ ರೀತಿ ದೇಹ ಬಣ್ಣ ನೋಡಿ."],
      2: ["ಪ್ರತಿ 4–5 ಗಂಟೆಗೊಮ್ಮೆ ತಾಜಾ ಹಿಪ್ಪುನೇರಳೆ ಉಣಿಸಿ.", "ಮರಿಗಳು ತುಂಬಾ ಸೇರಿದ್ದರೆ ಸಾಕಣೆ ಹಾಸಿಗೆ ತೆಳ್ಳಗೆ ಮಾಡಿ.", "ಮೊದಲ ಮೊಲ್ಟ್ ಗಮನಿಸಿ — ಮರಿಗಳು ತಿನ್ನುವ ನಿಲ್ಲಿಸುತ್ತವೆ, ತೊಂದರೆ ಕೊಡಬೇಡಿ."],
      3: ["ಆಹಾರ ನೀಡುವ ಆವೃತ್ತಿ ಹೆಚ್ಚಿಸಿ — ಇನ್ಸ್ಟಾರ್ 3 ರಲ್ಲಿ ಹಸಿವು ತೀವ್ರ ಹೆಚ್ಚಾಗುತ್ತದೆ.", "ತಿನ್ನದ ಎಲೆ ಮತ್ತು ಮಲ ತೆಗೆದು ರೋಗ ತಡೆಯಿರಿ.", "ಗಾಳಿ ಸಂಚಾರ ಖಚಿತಪಡಿಸಿ — ದಟ್ಟ ಆಹಾರದ ಶಾಖ ಕೋಣೆ ತಾಪ ಹೆಚ್ಚಿಸಬಹುದು."],
      4: ["ಸಾಕಣೆ ಹಾಸಿಗೆ ಜಾಗ ವಿಸ್ತರಿಸಿ — ದೊಡ್ಡ ಮರಿಗಳಿಗೆ ಚಲಿಸಲು ಜಾಗ ಬೇಕು.", "ದಿನಕ್ಕೆ ಎರಡು ಬಾರಿ ಸೋಂಕುನಾಶಕ ಪುಡಿ (ವಿಜೇತ/ಅಂಕುಶ) ಹಾಕಿ.", "ರೋಗ ಪರಿಶೀಲಿಸಿ: ಮೃದು, ಕಪ್ಪು ಅಥವಾ ದುರ್ವಾಸನೆ ಮರಿಗಳು ಎಚ್ಚರಿಕೆ ಸಂಕೇತ."],
      5: ["ಮೌಂಟಿಂಗ್ ಚಕ್ರ (ಚಂದ್ರಿಕೆ) ತಯಾರು ಮಾಡಿ — 3–4 ದಿನಗಳಲ್ಲಿ ಕೊಯ್ಲು ಆರಂಭವಾಗಬಹುದು.", "ಮರಿಗಳು ತಿನ್ನುವ ನಿಲ್ಲಿಸಿ ತಿಳಿಯಾದಾಗ ನೂಲು ನೇಯಲು ತಯಾರು.", "ಗುಣಮಟ್ಟದ ರೇಷ್ಮೆ ಕೋಶಕ್ಕಾಗಿ ತೇವಾಂಶ ಸ್ವಲ್ಪ ಕಡಿಮೆ ಮಾಡಿ.", "ನೂಲು ಜಾಗ ಶುದ್ಧ ಮತ್ತು ಒಣ ಇರಲು ತಿನ್ನದ ಎಲೆ ತೆಗೆಯಿರಿ."],
    } : {
      1: ["Feed fresh mulberry leaves — young larvae need tender leaves only.", "Keep the rearing room free from drafts and strong odours.", "Check larvae are eating actively; look for uniform body colour."],
      2: ["Continue feeding every 4–5 hours with fresh mulberry.", "Thin out rearing beds if larvae appear crowded.", "Watch for the first moult — larvae stop eating briefly, do not disturb."],
      3: ["Increase feeding frequency — Instar 3 appetite increases sharply.", "Remove uneaten leaves and frass to prevent disease.", "Ensure airflow — metabolic heat from dense feeding can raise room temp."],
      4: ["Expand rearing bed space — larvae are large and need room to move.", "Apply disinfectant powder (Vijetha/Ankush) to beds twice daily.", "Inspect for disease: soft, dark, or foul-smelling larvae are warning signs."],
      5: ["Prepare mounting frames (chandrikes) — harvest may begin in 3–4 days.", "Larvae will stop eating and turn translucent when ready to spin.", "Reduce humidity slightly to encourage tight, high-quality cocoon silk.", "Remove all uneaten leaf to keep the spinning area clean and dry."],
    };
    const headline = kn ? `✅ ${stageLabel} ಗೆ ಪರಿಸ್ಥಿತಿ ಸೂಕ್ತ.` : `✅ Conditions ideal for ${range.label}.`;
    return { status, headline, actions: stageActions[stage] ?? [kn ? "ಮೇಲ್ವಿಚಾರಣೆ ಮುಂದುವರಿಸಿ." : "Continue monitoring."], rangeInfo };
  }

  if (status === "CAUTION") {
    const actions: string[] = [];
    if (kn) {
      if (tempLow) actions.push(`ತಾಪಮಾನ ${temp}°C ಸ್ವಲ್ಪ ಕಡಿಮೆ. ಗಾಳಿ ಅಂತರ ಮುಚ್ಚಿ; ಲಭ್ಯವಿದ್ದರೆ ರೂಮ್ ಹೀಟರ್ ಬಳಸಿ. ಗುರಿ ${range.tempMinCelsius}°C.`);
      if (tempHigh) actions.push(`ತಾಪಮಾನ ${temp}°C ಸ್ವಲ್ಪ ಹೆಚ್ಚು. ಗಾಳಿ ಸಂಚಾರ ಹೆಚ್ಚಿಸಿ. ಸಾಕಣೆ ಹಾಸಿಗೆ ಮೇಲೆ ನೇರ ಫ್ಯಾನ್ ಬೇಡ.`);
      if (humLow) actions.push(`ತೇವಾಂಶ ${hum}% ಸ್ವಲ್ಪ ಕಡಿಮೆ. ಕೋಣೆ ನೆಲದಲ್ಲಿ ನೀರು ಚಿಮುಕಿಸಿ — ರೇಷ್ಮೆ ಮರಿಗಳ ಮೇಲಲ್ಲ. ಗೋಡೆಗಳಿಗೆ ಒದ್ದೆ ಗೋಣಿ ನೇತು ಹಾಕಿ.`);
      if (humHigh) actions.push(`ತೇವಾಂಶ ${hum}% ಸ್ವಲ್ಪ ಹೆಚ್ಚು. ಗಾಳಿ ಸಂಚಾರ ತೆರೆಯಿರಿ. ಒದ್ದೆ ಅಥವಾ ಕೊಳೆತ ಹಾಸಿಗೆ ಸಾಮಗ್ರಿ ಬದಲಿಸಿ.`);
      actions.push("ಮುಂದಿನ ದಾಖಲೆ ಸ್ಲಾಟ್‌ನಲ್ಲಿ ಮತ್ತೆ ಪರಿಶೀಲಿಸಿ.");
    } else {
      if (tempLow) actions.push(`Temperature ${temp}°C is slightly low. Close ventilation gaps; use a room heater if available. Target ${range.tempMinCelsius}°C.`);
      if (tempHigh) actions.push(`Temperature ${temp}°C is slightly high. Increase air circulation gently. Avoid fans directly over the rearing bed.`);
      if (humLow) actions.push(`Humidity ${hum}% is slightly low. Sprinkle water on the rearing room floor — not on the silkworms. Hang wet gunny cloth on walls.`);
      if (humHigh) actions.push(`Humidity ${hum}% is slightly high. Open ventilation. Replace wet or fouled bed material promptly.`);
      actions.push("Monitor again at the next logging slot.");
    }
    const headline = kn
      ? `⚠️ ಎಚ್ಚರಿಕೆ: ${stageLabel} ಗೆ ಪರಿಸ್ಥಿತಿ ಅಸುರಕ್ಷಿತಕ್ಕೆ ಹತ್ತಿರವಾಗುತ್ತಿದೆ.`
      : `⚠️ Caution: conditions approaching unsafe for ${range.label}.`;
    return { status, headline, actions, rangeInfo };
  }

  // DANGER
  const actions: string[] = [];
  if (kn) {
    if (tempLow) actions.push(`ತಾಪಮಾನ ${temp}°C ಅತ್ಯಂತ ಕಡಿಮೆ. ತಕ್ಷಣ ಶಾಖ ನೀಡಿ — ಕೋಣೆ ಹೀಟರ್ ಅಥವಾ ಬಟ್ಟೆಯಲ್ಲಿ ಸುತ್ತಿದ ಬಿಸಿ ನೀರಿನ ಚೀಲ ಬಳಸಿ.`);
    if (tempHigh) actions.push(`ತಾಪಮಾನ ${temp}°C ಅತ್ಯಂತ ಹೆಚ್ಚು — ಸಾಮೂಹಿಕ ಸಾವಿನ ಅಪಾಯ. ಎಲ್ಲ ಗಾಳಿ ತೆರೆಯಿರಿ, ಛಾಯೆ ಬಟ್ಟೆಯಿಂದ ಬಿಸಿಲು ಕಡಿಮೆ ಮಾಡಿ.`);
    if (humLow) actions.push(`ತೇವಾಂಶ ${hum}% ಅತ್ಯಂತ ಕಡಿಮೆ. ಅನೇಕ ಗೋಣಿ ಚೀಲ ತೋಯಿಸಿ ಎಲ್ಲ ಗೋಡೆಗಳಿಗೆ ನೇತು ಹಾಕಿ. ಪ್ರತಿ 30 ನಿಮಿಷಕ್ಕೆ ನೆಲದ ಸುತ್ತ ನೀರು ಚಿಮುಕಿಸಿ.`);
    if (humHigh) actions.push(`ತೇವಾಂಶ ${hum}% ಅತ್ಯಂತ ಹೆಚ್ಚು — ಫ್ಲಚೇರಿ ಮತ್ತು ಮಸ್ಕರ್ಡೈನ್ ಅಪಾಯ. ಎಲ್ಲ ತಿನ್ನದ ಎಲೆ ತೆಗೆಯಿರಿ. ನೆಲದ ಮೇಲೆ ಸುಣ್ಣದ ಪುಡಿ ಹರಡಿ.`);
    actions.push("1 ಗಂಟೆಯಲ್ಲಿ ಸರಿಪಡಿಸಲು ಸಾಧ್ಯವಾಗದಿದ್ದರೆ ಹತ್ತಿರದ ರೇಷ್ಮೆ ವಿಸ್ತರಣಾ ಅಧಿಕಾರಿಯನ್ನು ಸಂಪರ್ಕಿಸಿ.");
  } else {
    if (tempLow) actions.push(`Temperature ${temp}°C is critically low. Apply heat immediately — use a room heater or hot water bags wrapped in cloth at room edges.`);
    if (tempHigh) actions.push(`Temperature ${temp}°C is critically high — risk of mass mortality. Open all ventilation urgently, reduce sunlight with shade cloth.`);
    if (humLow) actions.push(`Humidity ${hum}% is critically low. Wet multiple gunny bags and hang on all walls. Sprinkle water around the room floor every 30 minutes.`);
    if (humHigh) actions.push(`Humidity ${hum}% is critically high — high risk of flacherie and muscardine. Remove ALL uneaten leaves. Spread fresh lime powder on the floor.`);
    actions.push("Contact your nearest sericulture extension officer if conditions cannot be corrected within 1 hour.");
  }
  const headline = kn
    ? `🚨 ಅಪಾಯ: ${stageLabel} ಗೆ ತಕ್ಷಣ ಕ್ರಮ ತೆಗೆದುಕೊಳ್ಳಿ!`
    : `🚨 DANGER: immediate action required for ${range.label}!`;
  return { status, headline, actions, rangeInfo };
}
