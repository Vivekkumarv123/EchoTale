import {
  collection,
  doc,
  getDocs,
  addDoc,
  deleteDoc,
  updateDoc,
  query,
  orderBy,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import { db, auth } from "@/lib/firebase-client";
import { handleFirestoreError, OperationType } from "@/lib/firestore-errors";

export interface TimeCapsule {
  id: string;
  userId: string;
  title: string;
  ciphertext: string;
  iv: string;
  salt: string;
  previewSnippet: string;
  unlockDate: string; // ISO date string
  isUnlocked: boolean;
  fulfilledChapter?: {
    fulfilledTitle: string;
    pastPerspective: string;
    presentReality: string;
    fulfilledSynthesis: string;
    transformationScore: string;
    transformationLabel: string;
    unlockedAt: string;
  } | null;
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

// Convert Buffer/ArrayBuffer to base64
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

// Convert base64 to Uint8Array
function base64ToUint8Array(base64: string): Uint8Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

/**
 * Derive AES-GCM Key using Web Crypto API and PBKDF2
 */
async function deriveKey(secret: string, salt: Uint8Array): Promise<CryptoKey> {
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "PBKDF2" },
    false,
    ["deriveKey"]
  );

  const saltBuffer = salt.buffer.slice(
    salt.byteOffset,
    salt.byteOffset + salt.byteLength
  ) as ArrayBuffer;

  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: saltBuffer,
      iterations: 100000,
      hash: "SHA-256",
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}

/**
 * Encrypt a text reflection client-side with AES-GCM (256-bit)
 */
export async function encryptReflection(
  plainText: string,
  userPassphrase?: string
): Promise<{ ciphertext: string; iv: string; salt: string }> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const secretKey = userPassphrase || `echotale_sanctuary_vault_${auth.currentUser?.uid || "prophecy"}`;

  const key = await deriveKey(secretKey, salt);
  const enc = new TextEncoder();
  const encodedData = enc.encode(plainText);

  const ivBuffer = iv.buffer.slice(
    iv.byteOffset,
    iv.byteOffset + iv.byteLength
  ) as ArrayBuffer;

  const encryptedBuffer = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv: ivBuffer },
    key,
    encodedData
  );

  return {
    ciphertext: arrayBufferToBase64(encryptedBuffer),
    iv: arrayBufferToBase64(iv.buffer as ArrayBuffer),
    salt: arrayBufferToBase64(salt.buffer as ArrayBuffer),
  };
}

/**
 * Decrypt a sealed prophecy client-side
 */
export async function decryptReflection(
  ciphertext: string,
  iv: string,
  salt: string,
  userPassphrase?: string
): Promise<string> {
  const saltBytes = base64ToUint8Array(salt);
  const ivBytes = base64ToUint8Array(iv);
  const cipherBytes = base64ToUint8Array(ciphertext);
  const secretKey = userPassphrase || `echotale_sanctuary_vault_${auth.currentUser?.uid || "prophecy"}`;

  const key = await deriveKey(secretKey, saltBytes);

  const ivBuffer = ivBytes.buffer.slice(
    ivBytes.byteOffset,
    ivBytes.byteOffset + ivBytes.byteLength
  ) as ArrayBuffer;

  const cipherBuffer = cipherBytes.buffer.slice(
    cipherBytes.byteOffset,
    cipherBytes.byteOffset + cipherBytes.byteLength
  ) as ArrayBuffer;

  const decryptedBuffer = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: ivBuffer },
    key,
    cipherBuffer
  );

  const dec = new TextDecoder();
  return dec.decode(decryptedBuffer);
}

/**
 * Fetch all sealed prophecies for the authenticated user
 */
export async function fetchUserProphecies(userId: string): Promise<TimeCapsule[]> {
  if (!userId) return [];

  const currentUid = auth.currentUser?.uid;
  const targetUid = currentUid || userId;
  const propheciesRef = collection(db, "users", targetUid, "prophecies");

  try {
    const q = query(propheciesRef, orderBy("createdAt", "desc"));
    const snapshot = await withTimeout(getDocs(q), 6000, "Fetching prophecies timed out");

    const capsules: TimeCapsule[] = [];
    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      capsules.push({
        id: docSnap.id,
        userId: targetUid,
        title: data.title || "Sealed Prophecy",
        ciphertext: data.ciphertext || "",
        iv: data.iv || "",
        salt: data.salt || "",
        previewSnippet: data.previewSnippet || "A sealed reflection waiting in time...",
        unlockDate: data.unlockDate || new Date(Date.now() + 86400000 * 30).toISOString(),
        isUnlocked: Boolean(data.isUnlocked),
        fulfilledChapter: data.fulfilledChapter || null,
        createdAt: data.createdAt instanceof Timestamp
          ? data.createdAt.toDate().toISOString()
          : (data.createdAt || new Date().toISOString()),
        synced: true,
      });
    });

    return capsules;
  } catch (error) {
    console.warn("[Firestore Prophecies Fetch Warning]:", error);
    return [];
  }
}

/**
 * Seal a new cryptographic time capsule in Firestore
 */
export async function sealProphecy(
  userId: string,
  capsuleData: {
    title: string;
    content: string;
    unlockDate: string;
    passphrase?: string;
  }
): Promise<TimeCapsule> {
  const currentUser = auth.currentUser;
  if (!currentUser || currentUser.uid !== userId) {
    throw new Error("Unauthorized: Session UID mismatch when sealing prophecy");
  }

  const { ciphertext, iv, salt } = await encryptReflection(
    capsuleData.content,
    capsuleData.passphrase
  );

  const words = capsuleData.content.trim().split(/\s+/).length;
  const previewSnippet = `Sealed parchment of ${words} words, locked until the chosen hour arrives.`;

  const propheciesRef = collection(db, "users", userId, "prophecies");
  const docPath = `users/${userId}/prophecies`;

  try {
    const payload = {
      userId,
      title: capsuleData.title || "Sealed Prophecy",
      ciphertext,
      iv,
      salt,
      previewSnippet,
      unlockDate: capsuleData.unlockDate,
      isUnlocked: false,
      createdAt: serverTimestamp(),
    };

    const docRef = await withTimeout(addDoc(propheciesRef, payload), 7000, "Sealing prophecy timed out");

    return {
      id: docRef.id,
      userId,
      title: capsuleData.title || "Sealed Prophecy",
      ciphertext,
      iv,
      salt,
      previewSnippet,
      unlockDate: capsuleData.unlockDate,
      isUnlocked: false,
      createdAt: new Date().toISOString(),
      synced: true,
    };
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, docPath);
    throw error;
  }
}

/**
 * Mark a prophecy as unlocked and store its fulfilled chapter synthesis
 */
export async function updateProphecyFulfilled(
  userId: string,
  capsuleId: string,
  fulfilledChapter: NonNullable<TimeCapsule["fulfilledChapter"]>
): Promise<void> {
  const currentUser = auth.currentUser;
  if (!currentUser || currentUser.uid !== userId) {
    throw new Error("Unauthorized: Session UID mismatch when unlocking prophecy");
  }

  const docPath = `users/${userId}/prophecies/${capsuleId}`;
  const docRef = doc(db, "users", userId, "prophecies", capsuleId);

  try {
    await withTimeout(
      updateDoc(docRef, {
        isUnlocked: true,
        fulfilledChapter,
        unlockedAt: serverTimestamp(),
      }),
      7000,
      "Updating prophecy status timed out"
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, docPath);
    throw error;
  }
}

/**
 * Delete a sealed prophecy
 */
export async function deleteProphecy(userId: string, capsuleId: string): Promise<void> {
  const currentUser = auth.currentUser;
  if (!currentUser || currentUser.uid !== userId) {
    throw new Error("Unauthorized: Session UID mismatch when deleting prophecy");
  }

  const docPath = `users/${userId}/prophecies/${capsuleId}`;
  const docRef = doc(db, "users", userId, "prophecies", capsuleId);

  try {
    await withTimeout(deleteDoc(docRef), 7000, "Deleting prophecy timed out");
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, docPath);
    throw error;
  }
}
