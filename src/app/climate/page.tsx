"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { useLang } from "@/lib/lang-context";
import AppLayout from "@/components/layout/AppLayout";
import ClimateDial from "@/components/climate/ClimateDial";
import {
  onActiveBatches, insertClimateLog, insertAdviceLog,
} from "@/lib/firestore";
import {
  currentStage, evaluateClimateStatus, generateOfflineAdvice, getInstarRange,
} from "@/lib/domain";
import type { Batch, ClimateStatus, TimeSlot } from "@/types";

const TIME_SLOTS: TimeSlot[] = ["MORNING", "AFTERNOON", "EVENING"];
const SLOT_LABELS = { MORNING: "🌅 Morning (~07:00)", AFTERNOON: "🌞 Afternoon (~13:00)", EVENING: "🌙 Evening (~18:00)" };

const STATUS_CARD: Record<ClimateStatus, string> = {
  SAFE:    "bg-green-50 border-green-200",
  CAUTION: "bg-amber-50 border-amber-200",
  DANGER:  "bg-red-50 border-red-200",
};

export default function ClimatePage() {
  const { user } = useAuth();
  const { lang, tr } = useLang();
  const [batches, setBatches] = useState<Batch[]>([]);
  const [selectedBatchId, setSelectedBatchId] = useState("");
  const [temp, setTemp] = useState(26);
  const [hum, setHum] = useState(85);
  const [slot, setSlot] = useState<TimeSlot>("MORNING");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [adviceText, setAdviceText] = useState("");
  const [adviceSource, setAdviceSource] = useState<"GEMINI_AI" | "OFFLINE_RULES">("OFFLINE_RULES");
  const [climateStatus, setClimateStatus] = useState<ClimateStatus>("SAFE");

  useEffect(() => {
    if (!user) return;
    const unsub = onActiveBatches(user.uid, (bs) => {
      setBatches(bs);
      if (bs.length > 0 && !selectedBatchId) setSelectedBatchId(bs[0].id);
    });
    return unsub;
  }, [user, selectedBatchId]);

  // Live climate status as sliders move
  useEffect(() => {
    if (!selectedBatchId) return;
    const batch = batches.find((b) => b.id === selectedBatchId);
    if (batch) {
      const stage = currentStage(batch.startDateMs);
      setClimateStatus(evaluateClimateStatus(temp, hum, stage));
    }
  }, [temp, hum, selectedBatchId, batches]);

  const selectedBatch = batches.find((b) => b.id === selectedBatchId);
  const stage = selectedBatch ? currentStage(selectedBatch.startDateMs) : 1;
  const idealRange = getInstarRange(stage);

  function firestoreTimeout<T>(promise: Promise<T>, ms = 6000): Promise<T> {
    return Promise.race([
      promise,
      new Promise<T>((_, reject) =>
        setTimeout(() => reject(new Error("Firestore write timed out")), ms)
      ),
    ]);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user || !selectedBatchId) return;

    setSubmitting(true);
    setError("");

    try {
      const batch = batches.find((b) => b.id === selectedBatchId)!;
      const batchStage = currentStage(batch.startDateMs);
      const status = evaluateClimateStatus(temp, hum, batchStage);

      // Save climate log — if Firestore is offline/slow, continue anyway
      let logId = "";
      try {
        logId = await firestoreTimeout(
          insertClimateLog(user.uid, {
            batchId: selectedBatchId,
            temperatureCelsius: temp,
            humidityPercent: hum,
            instarStageAtEntry: batchStage,
            timeSlot: slot,
            loggedAt: Date.now(),
          })
        );
      } catch (err) {
        console.warn("Climate log save failed (offline?):", err);
      }

      // Generate advice — try Gemini, fall back to offline rules
      let text = "";
      let source: "GEMINI_AI" | "OFFLINE_RULES" = "OFFLINE_RULES";

      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 10000);
        const res = await fetch("/api/advice", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ temp, hum, stage: batchStage, status, breed: batch.breed, lang }),
          signal: controller.signal,
        });
        clearTimeout(timeout);
        if (res.ok) {
          const json = await res.json();
          if (json.text) { text = json.text; source = "GEMINI_AI"; }
        }
      } catch {
        // Gemini failed or timed out — fall back to offline
      }

      if (!text) {
        const result = generateOfflineAdvice(temp, hum, batchStage, lang);
        text = [result.headline, ...result.actions].join("\n\n");
        source = "OFFLINE_RULES";
      }

      // Save advice log — if Firestore is offline/slow, still show advice
      try {
        await firestoreTimeout(
          insertAdviceLog(user.uid, {
            batchId: selectedBatchId,
            climateLogId: logId,
            adviceText: text,
            instarStage: batchStage,
            temperatureCelsius: temp,
            humidityPercent: hum,
            climateStatus: status,
            source,
            generatedAt: Date.now(),
          })
        );
      } catch (err) {
        console.warn("Advice log save failed (offline?):", err);
      }

      setAdviceText(text);
      setAdviceSource(source);
      setClimateStatus(status);
      setSubmitted(true);
    } catch (err) {
      console.error(err);
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  function resetForm() {
    setTemp(26); setHum(85);
    setSubmitted(false); setAdviceText(""); setError("");
  }

  if (batches.length === 0) {
    return (
      <AppLayout>
        <div className="card text-center py-10">
          <div className="text-4xl mb-3">🪴</div>
          <p className="text-gray-500">{tr("createBatchFirst")}</p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-4">
        <h2 className="text-xl font-serif font-bold text-reshme-dark">{tr("logClimate")}</h2>

        {submitted ? (
          <div className="space-y-4">
            <div className={`card border ${STATUS_CARD[climateStatus]} flex justify-center`}>
              <ClimateDial status={climateStatus} temp={temp} hum={hum} size={200} />
            </div>
            <div className="card">
              <div className="flex items-center gap-2 mb-3">
                <span className="font-semibold text-reshme-dark">{tr("advice")}</span>
                {adviceSource === "GEMINI_AI" ? (
                  <span className="badge-ai">{tr("aiAdvice")}</span>
                ) : (
                  <span className="badge-offline">{tr("offlineRules")}</span>
                )}
              </div>
              <p className="text-sm text-gray-700 whitespace-pre-line">{adviceText}</p>
            </div>
            <button onClick={resetForm} className="btn-secondary w-full">
              {tr("logAnotherReading")}
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Batch selector */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{tr("batch")}</label>
              <select
                className="input-field"
                value={selectedBatchId}
                onChange={(e) => setSelectedBatchId(e.target.value)}
              >
                {batches.map((b) => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            </div>

            {/* Live dial preview */}
            <div className={`card border ${STATUS_CARD[climateStatus]} flex justify-center py-3 transition-colors duration-300`}>
              <ClimateDial status={climateStatus} size={150} />
            </div>

            {/* Temperature slider */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-sm font-medium text-gray-700">{tr("temperatureLabel")}</label>
                <span className="text-2xl font-bold text-reshme-dark">{temp}°C</span>
              </div>
              <input
                type="range"
                min={10} max={45} step={0.5}
                value={temp}
                onChange={(e) => setTemp(parseFloat(e.target.value))}
                className="w-full accent-reshme-green"
              />
              {idealRange && (
                <p className="text-xs text-gray-400 mt-1">
                  {tr("idealForInstar")} {stage}: {idealRange.tempMinCelsius}–{idealRange.tempMaxCelsius}°C
                </p>
              )}
            </div>

            {/* Humidity slider */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-sm font-medium text-gray-700">{tr("humidityLabel")}</label>
                <span className="text-2xl font-bold text-reshme-dark">{hum}%</span>
              </div>
              <input
                type="range"
                min={0} max={100} step={1}
                value={hum}
                onChange={(e) => setHum(parseFloat(e.target.value))}
                className="w-full accent-reshme-green"
              />
              {idealRange && (
                <p className="text-xs text-gray-400 mt-1">
                  {tr("idealForInstar")} {stage}: {idealRange.humidityMinPercent}–{idealRange.humidityMaxPercent}% RH
                </p>
              )}
            </div>

            {/* Time slot */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{tr("timeSlot")}</label>
              <div className="grid grid-cols-3 gap-2">
                {TIME_SLOTS.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setSlot(s)}
                    className={`text-xs font-medium py-2.5 rounded-xl border transition-all ${
                      slot === s
                        ? "border-reshme-green bg-green-50 text-reshme-green font-semibold"
                        : "border-amber-200 text-gray-600 hover:border-reshme-green"
                    }`}
                  >
                    {SLOT_LABELS[s].split(" ")[0]}<br />
                    <span className="text-gray-400 font-normal">
                      {s === "MORNING" ? tr("morning") : s === "AFTERNOON" ? tr("afternoon") : tr("evening")}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {error && (
              <p className="text-sm text-reshme-red bg-red-50 rounded-lg px-3 py-2">{error}</p>
            )}

            <button
              type="submit"
              className="btn-primary w-full"
              disabled={submitting}
            >
              {submitting ? tr("gettingAdvice") : tr("submitReading")}
            </button>
          </form>
        )}
      </div>
    </AppLayout>
  );
}
