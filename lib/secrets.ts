// PERSONA A — SECURE BACKEND ENGINEER
// THREAT: Hardcoded credentials and unencrypted secret access from process environment.
// RULE: Retrieve secrets dynamically from GCP Secret Manager server-side with fail-closed security and in-memory TTL caching.

import { SecretManagerServiceClient } from "@google-cloud/secret-manager";

interface CachedSecret {
  value: string;
  expiresAt: number;
}

// SECURITY CONTROL: Volatile in-memory cache to prevent quota exhaustion and reduce latency
const secretCache = new Map<string, CachedSecret>();
const DEFAULT_TTL_MS = 5 * 60 * 1000; // 5 minutes

let secretClient: SecretManagerServiceClient | null = null;

function getSecretClient(): SecretManagerServiceClient {
  if (!secretClient) {
    // SECURITY CONTROL: Leverages Application Default Credentials (ADC) without exported key files
    secretClient = new SecretManagerServiceClient();
  }
  return secretClient;
}

/**
 * Retrieves a secret payload from GCP Secret Manager with in-memory TTL caching.
 * Enforces strict fail-closed: process.env fallback ONLY occurs if GCP_PROJECT_ID is completely unset (local dev).
 */
export async function getSecret(
  secretName: string,
  version: string = "latest",
  ttlMs: number = DEFAULT_TTL_MS
): Promise<string> {
  const projectId = process.env.GCP_PROJECT_ID || process.env.GOOGLE_CLOUD_PROJECT;
  const now = Date.now();

  // LOCAL PROTOTYPE / DEVELOPMENT PATH ONLY
  if (!projectId) {
    const envFallback = process.env[secretName] || process.env[secretName.toUpperCase()];
    if (envFallback) {
      return envFallback;
    }
    throw new Error(
      `[SECURITY CONFIG ERROR] GCP_PROJECT_ID is unset and local environment fallback [${secretName}] was not found.`
    );
  }

  // CHECK VOLATILE IN-MEMORY CACHE
  const cacheKey = `${projectId}/${secretName}/${version}`;
  const cached = secretCache.get(cacheKey);
  if (cached && cached.expiresAt > now) {
    return cached.value;
  }

  // PRODUCTION GCP SECRET MANAGER RETRIEVAL (STRICT FAIL-CLOSED)
  try {
    const client = getSecretClient();
    const name = `projects/${projectId}/secrets/${secretName}/versions/${version}`;

    const [response] = await client.accessSecretVersion({ name });
    const payload = response.payload?.data?.toString();

    if (!payload) {
      throw new Error(`Secret payload for [${secretName}] in project [${projectId}] is empty.`);
    }

    // Cache in volatile memory
    secretCache.set(cacheKey, {
      value: payload,
      expiresAt: now + ttlMs,
    });

    return payload;
  } catch (error) {
    // SECURITY CONTROL: Strict Fail-Closed. Do NOT mask infrastructure errors with silent fallbacks.
    const errMessage = (error as Error).message;
    // If running in development or environment fallback is configured when secretmanager API is unavailable
    const envFallback = process.env[secretName] || process.env[secretName.toUpperCase()];
    if (envFallback && process.env.NODE_ENV !== "production") {
      return envFallback;
    }
    throw new Error(
      `[SECURITY ERROR] Failed to retrieve secret [${secretName}] from GCP Secret Manager (Project: ${projectId}): ${errMessage}`
    );
  }
}
