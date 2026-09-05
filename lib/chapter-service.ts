import {
  collection,
  doc,
  getDocs,
  addDoc,
  deleteDoc,
  query,
  orderBy,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import { db, auth } from "@/lib/firebase-client";
import { handleFirestoreError, OperationType } from "@/lib/firestore-errors";

export interface LifeChapter {
  id: string;
  userId: string;
  title: string;
  prompt: string;
  reflection: string;
  summary: string;
  contextTag: string;
  moodScore: string;
  moodLabel: string;
  createdAt: string;
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
 * Fetch saved chapters for the authenticated user from Cloud Firestore.
 * Ordered newest first.
 */
export async function fetchUserChapters(userId: string): Promise<LifeChapter[]> {
  if (!userId) return [];

  const currentUid = auth.currentUser?.uid;
  if (currentUid && currentUid !== userId) {
    console.warn(`[Security Check] Requesting chapters for UID (${userId}) different from active session (${currentUid})`);
  }

  const targetUid = currentUid || userId;
  const chaptersRef = collection(db, "users", targetUid, "chapters");

  try {
    const q = query(chaptersRef, orderBy("createdAt", "desc"));
    const snapshot = await withTimeout(
      getDocs(q),
      6000,
      "Fetching chapters timed out"
    );

    const chapters: LifeChapter[] = [];
    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      chapters.push({
        id: docSnap.id,
        userId: targetUid,
        title: data.title || "Untitled Chapter",
        prompt: data.prompt || "",
        reflection: data.reflection || "",
        summary: data.summary || "",
        contextTag: data.contextTag || "Daily Reverie",
        moodScore: data.moodScore || "+0.80",
        moodLabel: data.moodLabel || "Reflective",
        createdAt: data.createdAt instanceof Timestamp 
          ? data.createdAt.toDate().toISOString() 
          : (data.createdAt || new Date().toISOString()),
        synced: true,
      });
    });

    return chapters;
  } catch (error) {
    console.warn("[Firestore Chapters Fetch Fallback]:", error);
    return [];
  }
}

/**
 * Save a new life chapter directly to `/users/{userId}/chapters` via Client SDK.
 */
export async function saveChapter(
  userId: string,
  chapterData: Omit<LifeChapter, "id" | "userId" | "createdAt" | "synced">
): Promise<LifeChapter> {
  const currentUser = auth.currentUser;
  if (!currentUser || currentUser.uid !== userId) {
    throw new Error("Unauthorized: Session UID mismatch when saving chapter");
  }

  const chaptersRef = collection(db, "users", userId, "chapters");
  const docPath = `users/${userId}/chapters`;

  try {
    const payload = {
      ...chapterData,
      userId,
      createdAt: serverTimestamp(),
    };

    const docRef = await withTimeout(
      addDoc(chaptersRef, payload),
      7000,
      "Saving chapter timed out"
    );

    return {
      id: docRef.id,
      userId,
      ...chapterData,
      createdAt: new Date().toISOString(),
      synced: true,
    };
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, docPath);
    throw error;
  }
}

export async function updateChapter(
  userId: string,
  chapterId: string,
  updates: Partial<Pick<LifeChapter, "title" | "summary" | "reflection" | "contextTag" | "moodScore" | "moodLabel">>
): Promise<void> {
  const currentUser = auth.currentUser;
  if (!currentUser || currentUser.uid !== userId) {
    throw new Error("Unauthorized: Session UID mismatch when updating chapter");
  }

  const docPath = `users/${userId}/chapters/${chapterId}`;
  const chapterDocRef = doc(db, "users", userId, "chapters", chapterId);

  try {
    const { updateDoc } = await import("firebase/firestore");
    await withTimeout(
      updateDoc(chapterDocRef, updates),
      7000,
      "Updating chapter timed out"
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, docPath);
    throw error;
  }
}

// Note: All chapter writes and deletes are executed directly via the client Firestore SDK, relying strictly on Firestore Security Rules (/users/{userId}/chapters/{chapterId}) for authorization enforcement rather than server API proxies.
export async function deleteChapter(userId: string, chapterId: string): Promise<void> {
  const currentUser = auth.currentUser;
  if (!currentUser || currentUser.uid !== userId) {
    throw new Error("Unauthorized: Session UID mismatch when deleting chapter");
  }

  const docPath = `users/${userId}/chapters/${chapterId}`;
  const chapterDocRef = doc(db, "users", userId, "chapters", chapterId);

  try {
    await withTimeout(
      deleteDoc(chapterDocRef),
      7000,
      "Deleting chapter timed out"
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, docPath);
    throw error;
  }
}
