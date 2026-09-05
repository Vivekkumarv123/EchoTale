import { NextRequest, NextResponse } from "next/server";
import { getAdminDb, FieldValue } from "@/lib/firestore-admin";
import { checkRateLimit } from "@/lib/rate-limiter";
import { PublicSanctumMoment, SanctumMoment } from "@/types/moment";
import { verifyPasscode } from "@/lib/password-hasher";

// =========================================================================
// PERSONA A — SECURE BACKEND ENGINEER
// THREAT MODEL:
// 1. Password brute-forcing attacks through automated dictionary attacks.
// 2. Leaking internal document metadata (ownerUid, salt, hash).
// 3. Replay attacks with invalid payloads.
//
// SECURITY RULES:
// - Rate-limit per IP + moment ID to throttle guessing attempts (max 10 attempts/min).
// - Validate and sanitize user input server-side.
// - Constant-time PBKDF2 hash verification.
// - Never log raw passcodes or user journal data.
// =========================================================================

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    if (!id || typeof id !== "string" || id.length < 5 || id.length > 120) {
      return NextResponse.json(
        { error: "Invalid Moment ID", message: "Moment identifier is invalid." },
        { status: 400 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const password = typeof body.password === "string" ? body.password.trim() : "";

    if (!password) {
      return NextResponse.json(
        { error: "Missing Passcode", message: "Passcode is required to unlock this keepsake." },
        { status: 400 }
      );
    }

    // Rate limiting per IP + Moment ID to prevent brute-forcing
    const forwardedFor = request.headers.get("x-forwarded-for");
    const ip = forwardedFor ? forwardedFor.split(",")[0].trim() : "anonymous-ip";
    const unlockRateLimit = checkRateLimit(`unlock_${ip}_${id}`, 10, 60);

    if (!unlockRateLimit.allowed) {
      return NextResponse.json(
        {
          error: "Too Many Attempts",
          message: "Too many unlock attempts. Please wait 1 minute before trying again.",
        },
        { status: 429, headers: { "Retry-After": String(unlockRateLimit.resetTime) } }
      );
    }

    const docRef = getAdminDb().collection("sanctumMoments").doc(id);
    const snap = await docRef.get();

    if (!snap.exists) {
      return NextResponse.json(
        { error: "Not Found", message: "This Sanctum Moment could not be found." },
        { status: 404 }
      );
    }

    const data = snap.data() as SanctumMoment;

    // If not protected, immediately return public moment
    if (!data.isPasswordProtected) {
      const sanitizedQuizzes = (data.quizzes || []).map((q) => ({
        id: q.id,
        question: q.question,
        options: q.options,
      }));
      const displayMessage =
        data.usePolished && data.polishedMessage
          ? data.polishedMessage
          : data.rawMessage;

      return NextResponse.json({
        success: true,
        isUnlocked: true,
        moment: {
          id: snap.id,
          occasion: data.occasion || "love",
          recipientName: data.recipientName || "My Dear Friend",
          senderName: data.senderName || "Someone Special",
          displayMessage,
          photoPaths: Array.isArray(data.photoPaths) ? data.photoPaths : [],
          quizzes: sanitizedQuizzes,
          createdAt: data.createdAt || new Date().toISOString(),
          viewCount: (data.viewCount || 0) + 1,
          isPasswordProtected: false,
          isUnlocked: true,
        },
      });
    }

    // Verify passcode against PBKDF2 hash using salt
    const isMatch = await verifyPasscode(
      password,
      data.passwordHash || "",
      data.passwordSalt || ""
    );

    if (!isMatch) {
      return NextResponse.json(
        {
          error: "Incorrect Passcode",
          message: "Incorrect passcode. Please check with the sender.",
          isUnlocked: false,
          passwordHint: data.passwordHint,
        },
        { status: 401 }
      );
    }

    // Best-effort viewCount increment
    try {
      docRef.update({
        viewCount: FieldValue.increment(1),
      }).catch((err) => console.warn("ViewCount increment note:", err));
    } catch {
      // Non-blocking
    }

    const sanitizedQuizzes = (data.quizzes || []).map((q) => ({
      id: q.id,
      question: q.question,
      options: q.options,
    }));

    const displayMessage =
      data.usePolished && data.polishedMessage
        ? data.polishedMessage
        : data.rawMessage;

    const unlockedMoment: PublicSanctumMoment = {
      id: snap.id,
      occasion: data.occasion || "love",
      recipientName: data.recipientName || "My Dear Friend",
      senderName: data.senderName || "Someone Special",
      displayMessage,
      hasPolishedOption: Boolean(
        data.polishedMessage && data.polishedMessage !== data.rawMessage
      ),
      photoPaths: Array.isArray(data.photoPaths) ? data.photoPaths : [],
      quizzes: sanitizedQuizzes,
      createdAt: data.createdAt || new Date().toISOString(),
      viewCount: (data.viewCount || 0) + 1,
      isPasswordProtected: true,
      isUnlocked: true,
      passwordHint: data.passwordHint,
    };

    return NextResponse.json({
      success: true,
      isUnlocked: true,
      moment: unlockedMoment,
    });
  } catch (error) {
    console.error("Error in unlock route:", error);
    return NextResponse.json(
      { error: "Internal Server Error", message: "Failed to unlock keepsake." },
      { status: 500 }
    );
  }
}
