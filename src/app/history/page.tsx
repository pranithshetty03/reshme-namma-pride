"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { useLang } from "@/lib/lang-context";
import AppLayout from "@/components/layout/AppLayout";
import { onActiveBatches, onClimateLogs } from "@/lib/firestore";
import type { Batch, ClimateLog, ClimateStatus } from "@/types";
import { format } from "date-fns";

const STATUS_DOT: Record<ClimateStatus, string> = {
  SAFE:    "bg-reshme-green",
  CAUTION: "bg-reshme-amber",
  DANGER:  "bg-reshme-red",
};

export default function HistoryPage() {
  const { user } = useAuth();
  const { tr } = useLang();
  const [batches, setBatches] = useState<Batch[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [logs, setLogs] = useState<ClimateLog[]>([]);

  useEffect(() => {
    if (!user) return;
    const unsub = onActiveBatches(user.uid, (bs) => {
      setBatches(bs);
      if (bs.length > 0 && !selectedId) setSelectedId(bs[0].id);
    });
    return unsub;
  }, [user, selectedId]);

  useEffect(() => {
    if (!user || !selectedId) return;
    const unsub = onClimateLogs(user.uid, selectedId, setLogs);
    return unsub;
  }, [user, selectedId]);

  return (
    <AppLayout>
      <div className="space-y-4">
        <h2 className="text-xl font-serif font-bold text-reshme-dark">{tr("climateHistory")}</h2>

        {batches.length > 0 && (
          <select
            className="input-field"
            value={selectedId}
            onChange={(e) => setSelectedId(e.target.value)}
          >
            {batches.map((b) => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </select>
        )}

        {/* Summary chips */}
        {logs.length > 0 && (
          <div className="flex gap-2 text-xs">
            <span className="bg-green-100 text-reshme-green font-semibold px-2.5 py-1 rounded-full">
              ✅ {tr("safe")}: {logs.filter((l) => isStatus(l, "SAFE")).length}
            </span>
            <span className="bg-amber-100 text-reshme-amber font-semibold px-2.5 py-1 rounded-full">
              ⚠️ {tr("caution")}: {logs.filter((l) => isStatus(l, "CAUTION")).length}
            </span>
            <span className="bg-red-100 text-reshme-red font-semibold px-2.5 py-1 rounded-full">
              🚨 {tr("danger")}: {logs.filter((l) => isStatus(l, "DANGER")).length}
            </span>
          </div>
        )}

        {logs.length === 0 ? (
          <div className="card text-center py-10 text-gray-400">
            <div className="text-4xl mb-2">📋</div>
            {tr("noClimateReadings")}
          </div>
        ) : (
          <div className="space-y-2">
            {logs.map((log) => (
              <LogRow key={log.id} log={log} />
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}

import { evaluateClimateStatus } from "@/lib/domain";

function isStatus(log: ClimateLog, status: ClimateStatus) {
  return evaluateClimateStatus(log.temperatureCelsius, log.humidityPercent, log.instarStageAtEntry) === status;
}

function LogRow({ log }: { log: ClimateLog }) {
  const { tr } = useLang();
  const status = evaluateClimateStatus(log.temperatureCelsius, log.humidityPercent, log.instarStageAtEntry);
  return (
    <div className="card flex items-center gap-3">
      <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${STATUS_DOT[status]}`} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 text-sm">
          <span className="font-semibold text-reshme-dark">{log.temperatureCelsius}°C</span>
          <span className="text-gray-400">·</span>
          <span className="font-semibold text-reshme-dark">{log.humidityPercent}%</span>
          <span className="text-gray-400">·</span>
          <span className="text-gray-500 text-xs capitalize">{log.timeSlot.toLowerCase()}</span>
        </div>
        <p className="text-xs text-gray-400 mt-0.5">
          {tr("instar")} {log.instarStageAtEntry} · {format(log.loggedAt, "dd MMM yyyy, HH:mm")}
        </p>
      </div>
      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
        status === "SAFE" ? "bg-green-100 text-reshme-green"
          : status === "CAUTION" ? "bg-amber-100 text-reshme-amber"
          : "bg-red-100 text-reshme-red"
      }`}>
        {status}
      </span>
    </div>
  );
}
