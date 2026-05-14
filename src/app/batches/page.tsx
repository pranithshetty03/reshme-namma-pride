"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { useLang } from "@/lib/lang-context";
import AppLayout from "@/components/layout/AppLayout";
import {
  onAllBatches, createBatch, archiveBatch, deleteBatch,
} from "@/lib/firestore";
import { harvestDateMs, currentStage, daysElapsed } from "@/lib/domain";
import type { Batch } from "@/types";
import { Trash2, Archive, Plus, ChevronDown, ChevronUp } from "lucide-react";

const BREEDS = [
  "PM × CSR2 (Multivoltine)",
  "CSR2 × CSR4 (Bivoltine)",
  "NB4D2 × NB418",
];

export default function BatchesPage() {
  const { user } = useAuth();
  const { tr } = useLang();
  const [batches, setBatches] = useState<Batch[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [breed, setBreed] = useState(BREEDS[0]);
  const [startDate, setStartDate] = useState(
    new Date().toISOString().slice(0, 10)
  );
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) return;
    const unsub = onAllBatches(user.uid, setBatches);
    return unsub;
  }, [user]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    setError("");
    try {
      const startMs = new Date(startDate).getTime();
      const harvestMs = harvestDateMs(startMs, breed);
      await createBatch(user.uid, {
        name: name.trim(),
        breed,
        startDateMs: startMs,
        harvestDateMs: harvestMs,
        startingInstar: 1,
        isActive: true,
        notes: notes.trim(),
        createdAt: Date.now(),
      });
      setName(""); setNotes(""); setShowForm(false);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : tr("failedToCreate"));
    } finally {
      setSaving(false);
    }
  }

  async function handleArchive(b: Batch) {
    if (!user) return;
    await archiveBatch(user.uid, b.id);
  }

  async function handleDelete(b: Batch) {
    if (!user || !confirm(`Delete "${b.name}"? This removes all logs.`)) return;
    await deleteBatch(user.uid, b.id);
  }

  const active = batches.filter((b) => b.isActive);
  const archived = batches.filter((b) => !b.isActive);

  return (
    <AppLayout>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-serif font-bold text-reshme-dark">{tr("batchesTitle")}</h2>
          <button
            onClick={() => setShowForm(!showForm)}
            className="btn-primary flex items-center gap-1.5 text-sm py-2 px-4"
          >
            <Plus size={16} />
            {tr("newBatch")}
          </button>
        </div>

        {/* Create form */}
        {showForm && (
          <div className="card border-reshme-green border">
            <h3 className="font-semibold text-reshme-dark mb-4">{tr("newSilkwormBatch")}</h3>
            <form onSubmit={handleCreate} className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{tr("batchName")}</label>
                <input className="input-field" placeholder="e.g. May Batch 1" value={name}
                  onChange={(e) => setName(e.target.value)} required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{tr("breedLabel")}</label>
                <select className="input-field" value={breed} onChange={(e) => setBreed(e.target.value)}>
                  {BREEDS.map((b) => <option key={b}>{b}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{tr("startDate")}</label>
                <input type="date" className="input-field" value={startDate}
                  onChange={(e) => setStartDate(e.target.value)} required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{tr("notesOptional")}</label>
                <textarea className="input-field" rows={2} value={notes}
                  onChange={(e) => setNotes(e.target.value)} placeholder="Any notes…" />
              </div>
              {error && <p className="text-sm text-reshme-red">{error}</p>}
              <div className="flex gap-2">
                <button type="submit" className="btn-primary flex-1" disabled={saving}>
                  {saving ? tr("creating") : tr("createBatch")}
                </button>
                <button type="button" className="btn-secondary" onClick={() => setShowForm(false)}>
                  {tr("cancel")}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Active batches */}
        <div>
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">
            {tr("activeLabel")} ({active.length})
          </h3>
          {active.length === 0 ? (
            <div className="card text-center text-gray-400 py-8">{tr("noActiveBatchesList")}</div>
          ) : (
            <div className="space-y-3">
              {active.map((b) => (
                <BatchCard key={b.id} batch={b}
                  onArchive={() => handleArchive(b)}
                  onDelete={() => handleDelete(b)} />
              ))}
            </div>
          )}
        </div>

        {/* Archived */}
        {archived.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">
              {tr("archivedLabel")} ({archived.length})
            </h3>
            <div className="space-y-3 opacity-60">
              {archived.map((b) => (
                <BatchCard key={b.id} batch={b} archived
                  onArchive={() => {}} onDelete={() => handleDelete(b)} />
              ))}
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}

function BatchCard({
  batch, archived = false, onArchive, onDelete,
}: {
  batch: Batch; archived?: boolean;
  onArchive: () => void; onDelete: () => void;
}) {
  const { tr } = useLang();
  const stage = currentStage(batch.startDateMs);
  const elapsed = daysElapsed(batch.startDateMs);
  const daysLeft = Math.max(0, Math.floor((batch.harvestDateMs - Date.now()) / 86_400_000));

  return (
    <div className="card flex items-start gap-3">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-semibold text-reshme-dark truncate">{batch.name}</span>
          <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">
            {archived ? tr("archivedLabel") : `${tr("instar")} ${stage}`}
          </span>
        </div>
        <p className="text-xs text-gray-500 mt-0.5">{batch.breed}</p>
        <p className="text-xs text-gray-400 mt-1">
          {tr("day")} {elapsed + 1} &middot;{" "}
          {archived
            ? tr("archivedLabel")
            : daysLeft > 0
            ? `${daysLeft} ${tr("dToHarvest")}`
            : tr("harvestReady")}
        </p>
      </div>
      <div className="flex gap-1">
        {!archived && (
          <button onClick={onArchive} title="Archive" className="p-2 text-gray-400 hover:text-reshme-amber hover:bg-amber-50 rounded-lg transition-colors">
            <Archive size={16} />
          </button>
        )}
        <button onClick={onDelete} title="Delete" className="p-2 text-gray-400 hover:text-reshme-red hover:bg-red-50 rounded-lg transition-colors">
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
}
