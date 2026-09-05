import { type LifeChapter } from "@/lib/chapter-service";

/**
 * Parses numeric value from mood score string (e.g., "+0.85" -> 0.85, "-0.20" -> -0.20)
 */
export function parseMoodScore(scoreStr: string): number {
  if (!scoreStr) return 0.5;
  const cleaned = scoreStr.replace(/[^\d.-]/g, "");
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0.5 : num;
}

/**
 * Calculates current consecutive daily reflection streak based on chapter timestamps
 */
export function calculateDailyStreak(chapters: LifeChapter[]): number {
  if (!chapters || chapters.length === 0) return 0;

  // Extract unique calendar dates sorted descending
  const dates = Array.from(
    new Set(
      chapters.map((chap) => {
        const d = new Date(chap.createdAt);
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
          d.getDate()
        ).padStart(2, "0")}`;
      })
    )
  ).sort((a, b) => (a < b ? 1 : -1));

  if (dates.length === 0) return 0;

  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(
    today.getDate()
  ).padStart(2, "0")}`;

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, "0")}-${String(
    yesterday.getDate()
  ).padStart(2, "0")}`;

  // Streak is active if user reflected today or yesterday
  const lastEntryDate = dates[0];
  if (lastEntryDate !== todayStr && lastEntryDate !== yesterdayStr) {
    return 0;
  }

  let streak = 1;
  let currDate = new Date(lastEntryDate);

  for (let i = 1; i < dates.length; i++) {
    const prevExpected = new Date(currDate);
    prevExpected.setDate(prevExpected.getDate() - 1);
    const expectedStr = `${prevExpected.getFullYear()}-${String(prevExpected.getMonth() + 1).padStart(2, "0")}-${String(
      prevExpected.getDate()
    ).padStart(2, "0")}`;

    if (dates[i] === expectedStr) {
      streak++;
      currDate = prevExpected;
    } else {
      break;
    }
  }

  return streak;
}
