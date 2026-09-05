import { NextRequest, NextResponse } from "next/server";
import { getAdminDb, FieldValue } from "@/lib/firestore-admin";
import { checkRateLimit } from "@/lib/rate-limiter";
import { PublicSanctumMoment, SanctumMoment } from "@/types/moment";
import { verifyPasscode } from "@/lib/password-hasher";

// =========================================================================
// PERSONA A — SECURE BACKEND ENGINEER
// THREAT MODEL:
// 1. Scraping / mass enumeration of moment IDs.
// 2. Leaking ownerUid or secret quiz answer keys to unauthenticated viewers.
// 3. Read amplification / DoS against public view route.
// 4. Unauthorized viewer bypassing passcode protection to read private letters or view personal photos.
// 5. Brute-force attacks guessing the passcode.
//
// SECURITY RULES:
// - Use server-side Firebase Admin SDK with authenticated service credentials.
// - Rate-limit per client IP address and per unlock attempt.
// - Sanitise output strictly: strip ownerUid, strip quiz correctIndex.
// - For locked keepsakes, strictly omit displayMessage, photoPaths, and quizzes until passcode is verified.
// - Passcode verification uses constant-time PBKDF2 hash comparison with unique salt.
// - Plaintext passcodes and raw journal contents are NEVER logged.
// - Atomic increment of viewCount only on valid access with timeout protection.
// =========================================================================

export async function GET(
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

    // 1. IP Rate Limiting (Prevent scraping and DoS)
    const forwardedFor = request.headers.get("x-forwarded-for");
    const ip = forwardedFor ? forwardedFor.split(",")[0].trim() : "anonymous-ip";
    const rateLimit = checkRateLimit(`ip_${ip}`, 60, 60);

    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: "Too Many Requests", message: "Rate limit exceeded. Please wait a moment." },
        {
          status: 429,
          headers: { "Retry-After": String(rateLimit.resetTime) },
        }
      );
    }

    // 2. Fetch single document from Firestore using Firebase Admin SDK with timeout
    const docRef = getAdminDb().collection("sanctumMoments").doc(id);
    const snapPromise = docRef.get();
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error("Database lookup timed out")), 5000)
    );

    const snap = await Promise.race([snapPromise, timeoutPromise]);

    if (!snap.exists) {
      return NextResponse.json(
        { error: "Not Found", message: "This Sanctum Moment could not be found or has dissolved into the ether." },
        { status: 404 }
      );
    }

    const data = snap.data() as SanctumMoment;

    // 3. Passcode Protection Handling
    const isProtected = Boolean(data.isPasswordProtected && data.passwordHash && data.passwordSalt);
    const candidatePasscode =
      request.headers.get("x-keepsake-password") ||
      request.nextUrl.searchParams.get("password") ||
      "";

    if (isProtected) {
      // If passcode is supplied in header or query, verify it
      if (candidatePasscode.trim()) {
        const unlockRateLimit = checkRateLimit(`unlock_${ip}_${id}`, 10, 60);
        if (!unlockRateLimit.allowed) {
          return NextResponse.json(
            { error: "Too Many Attempts", message: "Too many unlock attempts. Please wait 1 minute." },
            { status: 429 }
          );
        }

        const isMatch = await verifyPasscode(
          candidatePasscode.trim(),
          data.passwordHash || "",
          data.passwordSalt || ""
        );

        if (!isMatch) {
          return NextResponse.json(
            {
              error: "Incorrect Passcode",
              message: "The secret passcode entered does not match.",
              isPasswordProtected: true,
              isUnlocked: false,
              passwordHint: data.passwordHint,
              occasion: data.occasion,
              recipientName: data.recipientName,
              senderName: data.senderName,
            },
            { status: 401 }
          );
        }
        // Verified! Fall-through to build full unlocked response below
      } else {
        // No passcode provided yet — return locked public stub with ZERO private content
        const lockedMoment: PublicSanctumMoment = {
          id: snap.id,
          occasion: data.occasion || "love",
          recipientName: data.recipientName || "My Dear Friend",
          senderName: data.senderName || "Someone Special",
          createdAt: data.createdAt || new Date().toISOString(),
          viewCount: data.viewCount || 0,
          isPasswordProtected: true,
          isUnlocked: false,
          passwordHint: data.passwordHint,
          photoPaths: [],
          quizzes: [],
        };

        return NextResponse.json(
          { success: true, moment: lockedMoment },
          {
            headers: {
              "Cache-Control": "private, no-cache, no-store, must-revalidate",
              "X-Content-Type-Options": "nosniff",
            },
          }
        );
      }
    }

    // 4. Increment viewCount asynchronously (best-effort)
    try {
      docRef.update({
        viewCount: FieldValue.increment(1),
      }).catch((err) => console.warn("ViewCount increment note:", err));
    } catch {
      // Non-blocking
    }

    // 5. Transform to PublicSanctumMoment (stripping ownerUid, password hash, and quiz correctIndex)
    const sanitizedQuizzes = (data.quizzes || []).map((q) => ({
      id: q.id,
      question: q.question,
      options: q.options,
    }));

    const displayMessage = data.usePolished && data.polishedMessage
      ? data.polishedMessage
      : data.rawMessage;

    const publicMoment: PublicSanctumMoment = {
      id: snap.id,
      occasion: data.occasion || "love",
      recipientName: data.recipientName || "My Dear Friend",
      senderName: data.senderName || "Someone Special",
      displayMessage,
      hasPolishedOption: Boolean(data.polishedMessage && data.polishedMessage !== data.rawMessage),
      photoPaths: Array.isArray(data.photoPaths) ? data.photoPaths : [],
      quizzes: sanitizedQuizzes,
      createdAt: data.createdAt || new Date().toISOString(),
      viewCount: (data.viewCount || 0) + 1,
      isPasswordProtected: isProtected,
      isUnlocked: true,
      passwordHint: data.passwordHint,
    };

    return NextResponse.json(
      { success: true, moment: publicMoment },
      {
        headers: {
          "Cache-Control": isProtected ? "private, no-cache" : "public, s-maxage=30, stale-while-revalidate=60",
          "X-Content-Type-Options": "nosniff",
          "X-Frame-Options": "SAMEORIGIN",
        },
      }
    );
  } catch (error) {
    console.error("Error serving public moment:", error);
    return NextResponse.json(
      { error: "Internal Server Error", message: "Failed to retrieve this moment." },
      { status: 500 }
    );
  }
}

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

    const forwardedFor = request.headers.get("x-forwarded-for");
    const ip = forwardedFor ? forwardedFor.split(",")[0].trim() : "anonymous-ip";
    const unlockRateLimit = checkRateLimit(`unlock_${ip}_${id}`, 10, 60);

    if (!unlockRateLimit.allowed) {
      return NextResponse.json(
        { error: "Too Many Attempts", message: "Too many attempts. Please wait 1 minute before trying again." },
        { status: 429 }
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

    if (!data.isPasswordProtected) {
      // Not protected — return full public moment
      const sanitizedQuizzes = (data.quizzes || []).map((q) => ({
        id: q.id,
        question: q.question,
        options: q.options,
      }));
      const displayMessage = data.usePolished && data.polishedMessage
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

    // Verify passcode against PBKDF2 hash
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

    // Increment viewCount on successful unlock
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

    const displayMessage = data.usePolished && data.polishedMessage
      ? data.polishedMessage
      : data.rawMessage;

    const unlockedMoment: PublicSanctumMoment = {
      id: snap.id,
      occasion: data.occasion || "love",
      recipientName: data.recipientName || "My Dear Friend",
      senderName: data.senderName || "Someone Special",
      displayMessage,
      hasPolishedOption: Boolean(data.polishedMessage && data.polishedMessage !== data.rawMessage),
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
    console.error("Error unlocking keepsake:", error);
    return NextResponse.json(
      { error: "Internal Server Error", message: "Failed to unlock keepsake." },
      { status: 500 }
    );
  }
}
