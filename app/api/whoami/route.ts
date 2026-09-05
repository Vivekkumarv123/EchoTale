import { NextRequest, NextResponse } from "next/server";
import { verifyIdToken, AuthError } from "@/lib/auth-server";

/**
 * =========================================================================
 * PERSONA A: TEST AUTH API ROUTE (/api/whoami)
 * =========================================================================
 * THREAT:
 * 1. An unauthenticated or malicious caller making arbitrary requests to probe user data.
 * 2. An attacker trying to bypass client auth barriers by communicating directly with the API.
 * 
 * SECURITY RULE ADDRESSED:
 * - "Every backend endpoint verifies the Firebase Auth ID token server-side (using the Admin SDK)
 *    before processing the request. Never trust a UID passed in the request body."
 * - "Default-deny: Firestore rules and IAM permissions start from 'deny everything', then explicitly
 *    allow only what's needed."
 * 
 * PURPOSE:
 * Proves end-to-end cryptographic token verification between client and server before
 * any journal or database endpoints are introduced.
 * =========================================================================
 */

export async function GET(request: NextRequest) {
  try {
    const authResult = await verifyIdToken(request);

    // Secure response containing verified identity
    return NextResponse.json(
      {
        uid: authResult.uid,
        email: authResult.email,
        emailVerified: authResult.emailVerified,
        verifiedAt: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    if (error instanceof AuthError) {
      return NextResponse.json(
        {
          error: "Unauthorized",
          message: error.message,
        },
        { status: error.statusCode }
      );
    }

    return NextResponse.json(
      {
        error: "Unauthorized",
        message: "Authentication verification failed.",
      },
      { status: 401 }
    );
  }
}
