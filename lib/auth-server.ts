import { initializeApp, getApps, cert, applicationDefault, type App } from "firebase-admin/app";
import { getAuth, type DecodedIdToken } from "firebase-admin/auth";
import type { NextRequest } from "next/server";

/**
 * =========================================================================
 * PERSONA A: SECURE BACKEND AUTH HELPER
 * =========================================================================
 * THREAT:
 * 1. An unauthenticated attacker hitting backend API routes directly with forged headers.
 * 2. An attacker spoofing a user identity by passing an arbitrary UID in request bodies or query params.
 * 3. Expired or revoked JWT tokens being replayed.
 * 
 * SECURITY RULE ADDRESSED:
 * - "Every backend endpoint verifies the Firebase Auth ID token server-side (using the Admin SDK)
 *    before processing the request. Never trust a UID passed in the request body."
 * - "Default-deny: Firestore rules and IAM permissions start from 'deny everything', then explicitly
 *    allow only what's needed."
 * 
 * WHY ADMIN SDK VERIFICATION IS ESSENTIAL:
 * Client-side state in the browser is completely under the user's control and cannot be trusted
 * by backend systems. While the client app may report that a user is signed in, only the
 * server-side Firebase Admin SDK can cryptographically verify the signature, expiration, project ID,
 * and authenticity of the Firebase ID token using Google's public keys.
 * =========================================================================
 */

function getFirebaseAdminApp(): App {
  const currentApps = getApps();
  if (currentApps.length > 0 && currentApps[0]) {
    return currentApps[0];
  }

  // Check for JSON service account credentials string or discrete env variables
  const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY || process.env.FIREBASE_PRIVATE_KEY;
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL || process.env.FIREBASE_CLIENT_EMAIL;
  const projectId =
    process.env.FIREBASE_PROJECT_ID ||
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ||
    "echotale-3bf32";

  if (serviceAccountJson) {
    try {
      const parsed = JSON.parse(serviceAccountJson);
      return initializeApp({
        credential: cert(parsed),
        projectId: parsed.project_id || projectId,
      });
    } catch (err) {
      console.error("Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY JSON:", err);
    }
  }

  if (privateKey && clientEmail) {
    // Format private key properly to replace escaped newlines with actual newlines
    const formattedPrivateKey = privateKey.replace(/\\n/g, "\n");
    return initializeApp({
      credential: cert({
        projectId,
        clientEmail,
        privateKey: formattedPrivateKey,
      }),
      projectId,
    });
  }

  // Fallback to Google Application Default Credentials (e.g., within GCP / Cloud Run environment)
  return initializeApp({
    credential: applicationDefault(),
    projectId,
  });
}

export interface AuthVerificationResult {
  uid: string;
  email: string | null;
  emailVerified: boolean;
  decodedToken: DecodedIdToken;
}

export class AuthError extends Error {
  statusCode: number;

  constructor(message: string, statusCode: number = 401) {
    super(message);
    this.name = "AuthError";
    this.statusCode = statusCode;
  }
}

/**
 * Extracts and cryptographically verifies the Firebase ID token from the HTTP Authorization header.
 * 
 * @param request - Next.js NextRequest or standard Request object
 * @returns AuthVerificationResult containing verified UID and token claims
 * @throws AuthError with HTTP 401 status if the token is missing, malformed, or invalid
 */
export async function verifyIdToken(
  request: NextRequest | Request
): Promise<AuthVerificationResult> {
  const authHeader = request.headers.get("authorization");

  if (!authHeader) {
    throw new AuthError("Missing Authorization header. Expected: Bearer <token>", 401);
  }

  if (!authHeader.startsWith("Bearer ")) {
    throw new AuthError("Invalid Authorization format. Expected: Bearer <token>", 401);
  }

  const token = authHeader.split("Bearer ")[1]?.trim();

  if (!token) {
    throw new AuthError("Missing token in Bearer authorization header", 401);
  }

  try {
    const adminApp = getFirebaseAdminApp();
    const decodedToken = await getAuth(adminApp).verifyIdToken(token, true); // checkRevoked = true

    if (!decodedToken.uid) {
      throw new AuthError("Verified token does not contain a valid user identity (UID)", 401);
    }

    return {
      uid: decodedToken.uid,
      email: decodedToken.email ?? null,
      emailVerified: decodedToken.email_verified ?? false,
      decodedToken,
    };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Token verification failed";
    console.warn("Server-side token verification failed:", message);
    throw new AuthError(`Authentication verification failed: ${message}`, 401);
  }
}
