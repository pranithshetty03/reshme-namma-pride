"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { useLang } from "@/lib/lang-context";
import { onActiveBatches, getLatestClimateLog, getLatestAdviceLog } from "@/lib/firestore";
import { currentStage, daysElapsed, harvestCountdownLabel, cycleProgress, evaluateClimateStatus } from "@/lib/domain";
import ClimateDial from "@/components/climate/ClimateDial";
import type { Batch, ClimateLog, AdviceLog, ClimateStatus } from "@/types";

export default function DashboardPage() {
  const { user } = useAuth();
  const { tr } = useLang();
  const [batches, setBatches] = useState<Batch[]>([]);
  const [latestLog, setLatestLog] = useState<ClimateLog | null>(null);
  const [latestAdvice, setLatestAdvice] = useState<AdviceLog | null>(null);
  const [activeBatch, setActiveBatch] = useState<Batch | null>(null);

  useEffect(() => {
    if (!user) return;
    const unsub = onActiveBatches(user.uid, (bs) => {
      setBatches(bs);
      setActiveBatch(bs[0] ?? null);
    });
    return unsub;
  }, [user]);

  useEffect(() => {
    if (!user || !activeBatch) return;
    Promise.all([
      getLatestClimateLog(user.uid, activeBatch.id),
      getLatestAdviceLog(user.uid, activeBatch.id),
    ]).then(([log, advice]) => {
      setLatestLog(log);
      setLatestAdvice(advice);
    });
  }, [user, activeBatch]);

  if (!activeBatch) {
    return (
      <div>
        <h2 className="text-xl font-serif font-bold text-reshme-dark mb-1">
          {tr("welcomeTitle")}
        </h2>
        <p className="text-gray-500 text-sm mb-6">{tr("welcomeSub")}</p>
        <div className="card text-center py-10">
          <div className="text-5xl mb-4">🪴</div>
          <p className="text-gray-600 mb-5">{tr("noActiveBatches")}</p>
          <Link href="/batches" className="btn-primary inline-block">
            {tr("createFirstBatch")}
          </Link>
        </div>
      </div>
    );
  }

  const stage = currentStage(activeBatch.startDateMs);
  const elapsed = daysElapsed(activeBatch.startDateMs);
  const harvestLabel = harvestCountdownLabel(activeBatch.harvestDateMs);
  const progress = cycleProgress(activeBatch.startDateMs, activeBatch.harvestDateMs);

  const climateStatus: ClimateStatus = latestLog
    ? evaluateClimateStatus(latestLog.temperatureCelsius, latestLog.humidityPercent, stage)
    : "SAFE";

  const statusColors: Record<ClimateStatus, string> = {
    SAFE: "bg-reshme-green",
    CAUTION: "bg-reshme-amber",
    DANGER: "bg-reshme-red",
  };

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-serif font-bold text-reshme-dark">{tr("dashboard")}</h2>
        <p className="text-sm text-gray-500">{user?.email}</p>
      </div>

      {/* Batch selector */}
      {batches.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {batches.map((b) => (
            <button
              key={b.id}
              onClick={() => setActiveBatch(b)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-full text-sm font-semibold border transition-colors ${
                activeBatch?.id === b.id
                  ? "bg-reshme-green text-white border-reshme-green"
                  : "bg-white text-reshme-dark border-gray-200 hover:border-reshme-green"
              }`}
            >
              {b.name}
            </button>
          ))}
        </div>
      )}

      {/* Active batch card */}
      <div className="card overflow-hidden">
        <div className={`h-1.5 w-full rounded-full ${statusColors[climateStatus]} mb-4`} />

        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="font-bold text-lg text-reshme-dark">{activeBatch.name}</h3>
            <p className="text-sm text-gray-500">{activeBatch.breed}</p>
          </div>
          <div className="text-right">
            <span className="text-xs bg-amber-100 text-amber-800 font-semibold px-2.5 py-0.5 rounded-full">
              Instar {stage}
            </span>
            <p className="text-xs text-gray-400 mt-1">{tr("day")} {elapsed + 1}</p>
          </div>
        </div>

        {/* Climate Dial */}
        <div className="flex justify-center my-2">
          <ClimateDial
            status={climateStatus}
            temp={latestLog?.temperatureCelsius}
            hum={latestLog?.humidityPercent}
            size={180}
          />
        </div>

        {/* Harvest progress */}
        <div className="mt-4">
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>{tr("cycleProgress")}</span>
            <span className="font-semibold text-reshme-gold">{harvestLabel}</span>
          </div>
          <div className="h-2 bg-amber-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-reshme-gold rounded-full transition-all duration-700"
              style={{ width: `${progress * 100}%` }}
            />
          </div>
        </div>

        {/* Last reading */}
        {latestLog ? (
          <div className="mt-4 flex gap-3 text-sm">
            <div className="flex-1 bg-amber-50 rounded-xl px-3 py-2 text-center">
              <p className="text-xs text-gray-400">{tr("temperature")}</p>
              <p className="font-bold text-reshme-dark">{latestLog.temperatureCelsius}°C</p>
            </div>
            <div className="flex-1 bg-amber-50 rounded-xl px-3 py-2 text-center">
              <p className="text-xs text-gray-400">{tr("humidity")}</p>
              <p className="font-bold text-reshme-dark">{latestLog.humidityPercent}%</p>
            </div>
            <div className="flex-1 bg-amber-50 rounded-xl px-3 py-2 text-center">
              <p className="text-xs text-gray-400">{tr("slot")}</p>
              <p className="font-bold text-reshme-dark capitalize">
                {latestLog.timeSlot.toLowerCase()}
              </p>
            </div>
          </div>
        ) : (
          <p className="text-sm text-gray-400 text-center mt-3">{tr("noReadingToday")}</p>
        )}
      </div>

      {/* Latest advice snippet */}
      {latestAdvice && (
        <div className="card">
          <div className="flex items-center gap-2 mb-2">
            <span className="font-semibold text-sm text-reshme-dark">{tr("latestAdvice")}</span>
            {latestAdvice.source === "GEMINI_AI" ? (
              <span className="badge-ai">{tr("aiAdvice")}</span>
            ) : (
              <span className="badge-offline">{tr("offlineAdvice")}</span>
            )}
          </div>
          <p className="text-sm text-gray-600 line-clamp-3">{latestAdvice.adviceText}</p>
          <Link href="/advice" className="text-xs text-reshme-green font-semibold mt-2 inline-block">
            {tr("viewFullAdvice")}
          </Link>
        </div>
      )}

      {/* Quick actions */}
      <div className="grid grid-cols-2 gap-3">
        <Link href="/climate" className="card flex flex-col items-center py-5 hover:border-reshme-green transition-colors">
          <span className="text-3xl mb-2">🌡️</span>
          <span className="text-sm font-semibold text-reshme-dark">{tr("logClimate")}</span>
        </Link>
        <Link href="/batches" className="card flex flex-col items-center py-5 hover:border-reshme-green transition-colors">
          <span className="text-3xl mb-2">🗂️</span>
          <span className="text-sm font-semibold text-reshme-dark">{tr("manageBatches")}</span>
        </Link>
      </div>
    </div>
  );
}
