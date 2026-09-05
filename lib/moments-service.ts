import type { SanctumMoment, MomentOccasion, QuizQuestion } from "./moments-types";
import { OCCASION_CONFIGS } from "./moments-types";

const LOCAL_STORAGE_MOMENTS_KEY = "echotale_sanctum_moments_v1";
const LOCAL_STORAGE_DRAFT_KEY = "echotale_moment_draft_v1";

/**
 * Generate a cryptographically secure memorable ID for a Sanctum Moment
 */
export function generateMomentId(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID().replace(/-/g, "").slice(0, 12);
  }
  const chars = "abcdefghjkmnpqrstuvwxyz23456789";
  let id = "";
  for (let i = 0; i < 12; i++) {
    id += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return id;
}

/**
 * Save draft moment to local storage
 */
export function saveMomentDraft(draft: Partial<SanctumMoment>): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(LOCAL_STORAGE_DRAFT_KEY, JSON.stringify({ ...draft, updatedAt: new Date().toISOString() }));
  } catch (err) {
    console.warn("Failed to save draft:", err);
  }
}

/**
 * Load draft moment from local storage
 */
export function loadMomentDraft(): Partial<SanctumMoment> | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_DRAFT_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

/**
 * Clear current draft
 */
export function clearMomentDraft(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(LOCAL_STORAGE_DRAFT_KEY);
  } catch {
    // ignore
  }
}

/**
 * Save a finalized moment to stored collection
 */
export function saveFinalizedMoment(moment: SanctumMoment): void {
  if (typeof window === "undefined") return;
  try {
    const existing = getAllStoredMoments();
    const filtered = existing.filter((m) => m.id !== moment.id);
    const updated = [moment, ...filtered];
    localStorage.setItem(LOCAL_STORAGE_MOMENTS_KEY, JSON.stringify(updated));
  } catch (err) {
    console.warn("Failed to save finalized moment:", err);
  }
}

/**
 * Retrieve all saved moments from local store
 */
export function getAllStoredMoments(): SanctumMoment[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_MOMENTS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    // Filter out any legacy demo seeded moments
    const realMoments = parsed.filter((m) => m && !String(m.id).startsWith("demo-"));
    if (realMoments.length !== parsed.length) {
      localStorage.setItem(LOCAL_STORAGE_MOMENTS_KEY, JSON.stringify(realMoments));
    }
    return realMoments;
  } catch {
    return [];
  }
}

/**
 * Retrieve a specific moment by ID
 */
export function getMomentById(id: string): SanctumMoment | null {
  const all = getAllStoredMoments();
  const match = all.find((m) => m.id === id);
  return match || null;
}

/**
 * Delete a moment locally
 */
export function deleteStoredMoment(id: string): void {
  if (typeof window === "undefined") return;
  try {
    const existing = getAllStoredMoments();
    const updated = existing.filter((m) => m.id !== id);
    localStorage.setItem(LOCAL_STORAGE_MOMENTS_KEY, JSON.stringify(updated));
  } catch (err) {
    console.warn("Failed to delete moment:", err);
  }
}
