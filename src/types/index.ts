// ─── Enums ────────────────────────────────────────────────────────────────────

export type TimeSlot = "MORNING" | "AFTERNOON" | "EVENING";
export type AdviceSource = "GEMINI_AI" | "OFFLINE_RULES";
export type ClimateStatus = "SAFE" | "CAUTION" | "DANGER";

// ─── Firestore document shapes ────────────────────────────────────────────────

/**
 * Collection: users/{uid}/batches/{batchId}
 */
export interface Batch {
  id: string;
  name: string;
  breed: string;
  startDateMs: number;       // epoch ms — replaces startDateEpoch
  harvestDateMs: number;     // computed at creation
  startingInstar: number;
  isActive: boolean;
  notes: string;
  createdAt: number;
}

/**
 * Collection: users/{uid}/batches/{batchId}/climateLogs/{logId}
 */
export interface ClimateLog {
  id: string;
  batchId: string;
  temperatureCelsius: number;
  humidityPercent: number;
  instarStageAtEntry: number;
  timeSlot: TimeSlot;
  loggedAt: number;
}

/**
 * Collection: users/{uid}/batches/{batchId}/adviceLogs/{adviceId}
 */
export interface AdviceLog {
  id: string;
  batchId: string;
  climateLogId: string;
  adviceText: string;
  instarStage: number;
  temperatureCelsius: number;
  humidityPercent: number;
  climateStatus: ClimateStatus;
  source: AdviceSource;
  generatedAt: number;
}

// ─── Domain types ─────────────────────────────────────────────────────────────

export interface InstarRange {
  stage: number;
  label: string;
  tempMinCelsius: number;
  tempMaxCelsius: number;
  humidityMinPercent: number;
  humidityMaxPercent: number;
  durationDays: number;
  biologicalNote: string;
}

export interface AdviceResult {
  status: ClimateStatus;
  headline: string;
  actions: string[];
  rangeInfo: string;
}

// ─── UI state types ───────────────────────────────────────────────────────────

export interface HomeState {
  activeBatch: Batch | null;
  currentStage: number;
  daysElapsed: number;
  harvestLabel: string;
  cycleProgress: number;
  climateStatus: ClimateStatus;
  latestLog: ClimateLog | null;
  latestAdvice: AdviceLog | null;
}
