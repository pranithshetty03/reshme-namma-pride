"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { useLang } from "@/lib/lang-context";
import AppLayout from "@/components/layout/AppLayout";
import { onActiveBatches, onAdviceLogs } from "@/lib/firestore";
import type { Batch, AdviceLog } from "@/types";
import { formatDistanceToNow } from "date-fns";

const STATUS_STYLES = {
  SAFE:    "bg-green-50 border-green-200 text-reshme-green",
  CAUTION: "bg-amber-50 border-amber-200 text-reshme-amber",
  DANGER:  "bg-red-50 border-red-200 text-reshme-red",
};

export default function AdvicePage() {
  const { user } = useAuth();
  const { tr } = useLang();
  const [batches, setBatches] = useState<Batch[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [advice, setAdvice] = useState<AdviceLog[]>([]);

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
    const unsub = onAdviceLogs(user.uid, selectedId, setAdvice);
    return unsub;
  }, [user, selectedId]);

  return (
    <AppLayout>
      <div className="space-y-4">
        <h2 className="text-xl font-serif font-bold text-reshme-dark">{tr("adviceLog")}</h2>

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

        {advice.length === 0 ? (
          <div className="card text-center py-10 text-gray-400">
            <div className="text-4xl mb-2">💬</div>
            {tr("noAdviceYet")}
          </div>
        ) : (
          <div className="space-y-3">
            {advice.map((a) => (
              <div
                key={a.id}
                className={`card border ${STATUS_STYLES[a.climateStatus]}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wide">
                      {a.climateStatus}
                    </span>
                    <span className="text-xs text-gray-400">· {tr("instar")} {a.instarStage}</span>
                  </div>
                  {a.source === "GEMINI_AI" ? (
                    <span className="badge-ai">{tr("aiAdvice")}</span>
                  ) : (
                    <span className="badge-offline">{tr("offlineAdvice")}</span>
                  )}
                </div>

                <div className="flex gap-3 text-xs text-gray-500 mb-3">
                  <span>🌡️ {a.temperatureCelsius}°C</span>
                  <span>💧 {a.humidityPercent}%</span>
                </div>

                <p className="text-sm text-gray-700 whitespace-pre-line">{a.adviceText}</p>

                <p className="text-xs text-gray-400 mt-3">
                  {formatDistanceToNow(a.generatedAt, { addSuffix: true })}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
