/**
 * Firestore data access — mirrors the Android Room DAOs.
 *
 * Schema:
 *   users/{uid}/batches/{batchId}
 *   users/{uid}/batches/{batchId}/climateLogs/{logId}
 *   users/{uid}/batches/{batchId}/adviceLogs/{adviceId}
 */

import {
  collection,
  doc,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  getDoc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  serverTimestamp,
  Unsubscribe,
} from "firebase/firestore";
import { db } from "./firebase";
import type { Batch, ClimateLog, AdviceLog } from "@/types";

function requireDb() {
  if (!db) {
    throw new Error("Firebase Firestore is not configured. Check your NEXT_PUBLIC_FIREBASE_* values.");
  }

  return db;
}

// ─── Collection helpers ───────────────────────────────────────────────────────

const batchesCol = (uid: string) =>
  collection(requireDb(), "users", uid, "batches");

const climateLogsCol = (uid: string, batchId: string) =>
  collection(requireDb(), "users", uid, "batches", batchId, "climateLogs");

const adviceLogsCol = (uid: string, batchId: string) =>
  collection(requireDb(), "users", uid, "batches", batchId, "adviceLogs");

// ─── Batch DAO ────────────────────────────────────────────────────────────────

export async function createBatch(uid: string, batch: Omit<Batch, "id">): Promise<string> {
  const ref = await addDoc(batchesCol(uid), { ...batch, createdAt: Date.now() });
  return ref.id;
}

export async function updateBatch(uid: string, batchId: string, data: Partial<Batch>): Promise<void> {
  await updateDoc(doc(batchesCol(uid), batchId), data);
}

export async function archiveBatch(uid: string, batchId: string): Promise<void> {
  await updateDoc(doc(batchesCol(uid), batchId), { isActive: false });
}

export async function deleteBatch(uid: string, batchId: string): Promise<void> {
  // Firestore does NOT cascade sub-collections — delete them first
  const [climateLogs, adviceLogs] = await Promise.all([
    getDocs(climateLogsCol(uid, batchId)),
    getDocs(adviceLogsCol(uid, batchId)),
  ]);
  const deletes = [
    ...climateLogs.docs.map((d) => deleteDoc(d.ref)),
    ...adviceLogs.docs.map((d) => deleteDoc(d.ref)),
  ];
  await Promise.all(deletes);
  await deleteDoc(doc(batchesCol(uid), batchId));
}

export async function getBatchById(uid: string, batchId: string): Promise<Batch | null> {
  const snap = await getDoc(doc(batchesCol(uid), batchId));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as Batch;
}

/** Real-time listener for active batches — replaces Flow<List<Batch>> */
export function onActiveBatches(
  uid: string,
  callback: (batches: Batch[]) => void
): Unsubscribe {
  const q = query(
    batchesCol(uid),
    where("isActive", "==", true),
    orderBy("createdAt", "desc")
  );
  return onSnapshot(q, (snap) =>
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Batch)))
  );
}

export function onAllBatches(
  uid: string,
  callback: (batches: Batch[]) => void
): Unsubscribe {
  const q = query(batchesCol(uid), orderBy("createdAt", "desc"));
  return onSnapshot(q, (snap) =>
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Batch)))
  );
}

// ─── Climate Log DAO ──────────────────────────────────────────────────────────

export async function insertClimateLog(
  uid: string,
  log: Omit<ClimateLog, "id">
): Promise<string> {
  const ref = await addDoc(climateLogsCol(uid, log.batchId), {
    ...log,
    loggedAt: log.loggedAt ?? Date.now(),
  });
  return ref.id;
}

export function onClimateLogs(
  uid: string,
  batchId: string,
  callback: (logs: ClimateLog[]) => void
): Unsubscribe {
  const q = query(climateLogsCol(uid, batchId), orderBy("loggedAt", "desc"));
  return onSnapshot(q, (snap) =>
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() } as ClimateLog)))
  );
}

export async function getLatestClimateLog(
  uid: string,
  batchId: string
): Promise<ClimateLog | null> {
  const q = query(
    climateLogsCol(uid, batchId),
    orderBy("loggedAt", "desc"),
    limit(1)
  );
  const snap = await getDocs(q);
  if (snap.empty) return null;
  const d = snap.docs[0];
  return { id: d.id, ...d.data() } as ClimateLog;
}

// ─── Advice Log DAO ───────────────────────────────────────────────────────────

export async function insertAdviceLog(
  uid: string,
  advice: Omit<AdviceLog, "id">
): Promise<string> {
  const ref = await addDoc(adviceLogsCol(uid, advice.batchId), {
    ...advice,
    generatedAt: advice.generatedAt ?? Date.now(),
  });
  return ref.id;
}

export function onAdviceLogs(
  uid: string,
  batchId: string,
  callback: (logs: AdviceLog[]) => void
): Unsubscribe {
  const q = query(adviceLogsCol(uid, batchId), orderBy("generatedAt", "desc"));
  return onSnapshot(q, (snap) =>
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() } as AdviceLog)))
  );
}

export async function getLatestAdviceLog(
  uid: string,
  batchId: string
): Promise<AdviceLog | null> {
  const q = query(
    adviceLogsCol(uid, batchId),
    orderBy("generatedAt", "desc"),
    limit(1)
  );
  const snap = await getDocs(q);
  if (snap.empty) return null;
  const d = snap.docs[0];
  return { id: d.id, ...d.data() } as AdviceLog;
}
