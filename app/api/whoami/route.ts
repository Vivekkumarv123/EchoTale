import { NextRequest, NextResponse } from "next/server";
import { verifyIdToken, AuthError } from "@/lib/auth-server";

/**
 * Health & Identity Verification Route (/api/whoami)
 * Proves end-to-end cryptographic token verification between client and server.
 */
export const dynamic = "force-dynamic";

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
