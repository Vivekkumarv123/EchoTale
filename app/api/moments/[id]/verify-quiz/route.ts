import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firestore-admin";
import { checkRateLimit } from "@/lib/rate-limiter";
import { SanctumMoment } from "@/types/moment";
import { z } from "zod";

/**
 * Quiz Answer Verification Route
 * Verifies memory trivia answers strictly server-side without exposing correct answers in client payloads.
 */
export const dynamic = "force-dynamic";

const VerifyQuizSchema = z.object({
  questionId: z.string().min(1),
  selectedIndex: z.number().int().min(0).max(10),
});

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    // Rate-limit per IP
    const forwardedFor = request.headers.get("x-forwarded-for");
    const ip = forwardedFor ? forwardedFor.split(",")[0].trim() : "anonymous-ip";
    const rateLimit = checkRateLimit(`quiz_${ip}`, 60, 60);

    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: "Too Many Requests", message: "Please slow down." },
        { status: 429 }
      );
    }

    let rawBody: unknown;
    try {
      rawBody = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    const parseResult = VerifyQuizSchema.safeParse(rawBody);
    if (!parseResult.success) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    const { questionId, selectedIndex } = parseResult.data;

    // Look up doc in Firestore using Firebase Admin SDK
    const docRef = getAdminDb().collection("sanctumMoments").doc(id);
    const snap = await docRef.get();

    if (!snap.exists) {
      return NextResponse.json({ error: "Moment not found" }, { status: 404 });
    }

    const data = snap.data() as SanctumMoment;
    const targetQuestion = (data.quizzes || []).find((q) => q.id === questionId);

    if (!targetQuestion) {
      return NextResponse.json({ error: "Question not found" }, { status: 404 });
    }

    const isCorrect = targetQuestion.correctIndex === selectedIndex;

    return NextResponse.json({
      success: true,
      correct: isCorrect,
      correctIndex: isCorrect ? targetQuestion.correctIndex : undefined, // Reveal answer only on correct or completed
    });
  } catch (error) {
    console.error("Quiz verification error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
