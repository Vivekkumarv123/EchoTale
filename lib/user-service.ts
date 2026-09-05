import { doc, getDoc, getDocFromCache, setDoc, serverTimestamp } from "firebase/firestore";
import { db, auth } from "@/lib/firebase-client";
import { handleFirestoreError, OperationType } from "@/lib/firestore-errors";

export type ChronicleTheme = "grimoire" | "fairytale" | "cyber";

export interface UserProfileData {
  uid: string;
  email: string | null;
  displayName?: string | null;
  photoURL?: string | null;
  theme?: ChronicleTheme;
  createdAt?: unknown;
  updatedAt?: unknown;
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
 * Fetch the authenticated user's profile document from Firestore.
 * Strictly scoped to `auth.currentUser.uid`.
 * Includes offline resilience & cached document fallback.
 */
export async function fetchUserProfile(userId: string): Promise<UserProfileData | null> {
  if (!userId) return null;

  // Zero-Trust Security Validation: ensure requested userId belongs to logged-in session if available
  const currentUid = auth.currentUser?.uid;
  if (currentUid && currentUid !== userId) {
    console.warn(`[Security Alert] fetchUserProfile requested UID (${userId}) differs from authenticated session UID (${currentUid})`);
  }

  const targetUid = currentUid || userId;
  const docPath = `users/${targetUid}`;
  const userDocRef = doc(db, "users", targetUid);

  try {
    // 1. Attempt standard fetch with a 5-second timeout
    const snap = await withTimeout(
      getDoc(userDocRef),
      5000,
      "Firestore profile request timed out"
    );
    if (snap.exists()) {
      return snap.data() as UserProfileData;
    }
    return null;
  } catch (error: unknown) {
    const errorString = error instanceof Error ? error.message : String(error);

    // 2. Offline / Network Recovery: Attempt cache retrieval if offline or timed out
    if (
      errorString.includes("offline") ||
      errorString.includes("unavailable") ||
      errorString.includes("network") ||
      errorString.includes("timed out")
    ) {
      console.warn(`[Firestore Offline Recovery] Reading ${docPath} from local cache...`);
      try {
        const cacheSnap = await getDocFromCache(userDocRef);
        if (cacheSnap.exists()) {
          return cacheSnap.data() as UserProfileData;
        }
      } catch (cacheErr) {
        console.warn(`[Firestore Offline Cache Miss] ${docPath}:`, cacheErr);
      }
      // If offline/timed out and no cache exists, return null gracefully instead of crashing
      return null;
    }

    handleFirestoreError(error, OperationType.GET, docPath);
  }
}

/**
 * Save the user's selected theme directly to `/users/{userId}` in Cloud Firestore.
 * Enforces authenticated UID scoping and appends a server timestamp for `updatedAt`.
 */
export async function saveUserTheme(
  userId: string,
  theme: ChronicleTheme
): Promise<void> {
  if (!userId) {
    throw new Error("Cannot save theme: Missing authenticated user ID");
  }

  const currentUser = auth.currentUser;
  if (!currentUser || currentUser.uid !== userId) {
    throw new Error("Unauthorized: Session UID mismatch");
  }

  // Validate theme value
  if (!["grimoire", "fairytale", "cyber"].includes(theme)) {
    throw new Error(`Invalid theme option provided: ${theme}`);
  }

  const docPath = `users/${userId}`;
  try {
    const userDocRef = doc(db, "users", userId);
    await withTimeout(
      setDoc(
        userDocRef,
        {
          uid: userId,
          email: currentUser.email || null,
          displayName: currentUser.displayName || null,
          photoURL: currentUser.photoURL || null,
          theme,
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      ),
      7000,
      "Database write timed out. Please check your internet connection or database setup."
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, docPath);
  }
}
