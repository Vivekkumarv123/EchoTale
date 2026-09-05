import {
  collection,
  doc,
  getDocs,
  addDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import { db, auth } from "@/lib/firebase-client";
import { handleFirestoreError, OperationType } from "@/lib/firestore-errors";

export interface JournalEntry {
  id?: string;
  userId: string;
  prompt: string;
  reflection: string;
  summary: string;
  contextTag: string;
  moodScore: string;
  moodLabel: string;
  lifeChapter: string;
  createdAt?: unknown;
  synced?: boolean;
}

function withTimeout<T>(promise: Promise<T>, ms: number, errorMessage: string): Promise<T> {
  let timer: NodeJS.Timeout;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new Error(errorMessage)), ms);
  });
  return Promise.race([promise, timeoutPromise]).finally(() => {
    if (timer) clearTimeout(timer);
  });
}

/**
 * Fetch past journal entries for the authenticated user from Cloud Firestore.
 * Scoped strictly to `auth.currentUser.uid`.
 */
export async function fetchUserEntries(userId: string): Promise<JournalEntry[]> {
  if (!userId) return [];

  const currentUid = auth.currentUser?.uid;
  if (currentUid && currentUid !== userId) {
    console.warn(`[Security Alert] Requesting entries for UID (${userId}) different from current session (${currentUid})`);
  }

  const targetUid = currentUid || userId;
  const entriesRef = collection(db, "users", targetUid, "entries");

  try {
    const q = query(entriesRef, orderBy("createdAt", "desc"));
    const snapshot = await withTimeout(
      getDocs(q),
      6000,
      "Fetching entries timed out"
    );

    const entries: JournalEntry[] = [];
    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      entries.push({
        id: docSnap.id,
        userId: targetUid,
        prompt: data.prompt || "",
        reflection: data.reflection || "",
        summary: data.summary || "",
        contextTag: data.contextTag || "Daily Reverie",
        moodScore: data.moodScore || "+0.80",
        moodLabel: data.moodLabel || "Reflective",
        lifeChapter: data.lifeChapter || "Chapter 1: The Spark of Creation",
        createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate().toISOString() : data.createdAt,
        synced: true,
      });
    });

    return entries;
  } catch (error) {
    console.warn("[Firestore Entries Fetch Fallback]:", error);
    return [];
  }
}

/**
 * Save a new journal entry to `/users/{userId}/entries` in Cloud Firestore.
 */
export async function saveJournalEntry(
  userId: string,
  entry: Omit<JournalEntry, "id" | "userId" | "createdAt" | "synced">
): Promise<JournalEntry> {
  const currentUser = auth.currentUser;
  if (!currentUser || currentUser.uid !== userId) {
    throw new Error("Unauthorized: Session UID mismatch when saving journal entry");
  }

  const entriesRef = collection(db, "users", userId, "entries");
  const docPath = `users/${userId}/entries`;

  try {
    const payload = {
      ...entry,
      userId,
      createdAt: serverTimestamp(),
    };

    const docRef = await withTimeout(
      addDoc(entriesRef, payload),
      7000,
      "Saving entry timed out"
    );

    return {
      id: docRef.id,
      userId,
      ...entry,
      createdAt: new Date().toISOString(),
      synced: true,
    };
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, docPath);
    // Local fallback if write fails offline
    return {
      id: `local-${Date.now()}`,
      userId,
      ...entry,
      createdAt: new Date().toISOString(),
      synced: false,
    };
  }
}
