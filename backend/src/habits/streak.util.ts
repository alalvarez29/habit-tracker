const DAY_MS = 24 * 60 * 60 * 1000;

function toUtcMidnight(dateStr: string): number {
  return Date.parse(`${dateStr}T00:00:00.000Z`);
}

function shiftDays(timestamp: number, days: number): number {
  return timestamp + days * DAY_MS;
}

export interface StreakResult {
  currentStreak: number;
  longestStreak: number;
}

export function calculateStreaks(checkInDates: string[], today: string): StreakResult {
  const uniqueSorted = [...new Set(checkInDates)].sort();
  if (uniqueSorted.length === 0) {
    return { currentStreak: 0, longestStreak: 0 };
  }

  let longestStreak = 1;
  let runLength = 1;

  for (let i = 1; i < uniqueSorted.length; i++) {
    const previousDay = shiftDays(toUtcMidnight(uniqueSorted[i - 1]), 1);
    const isConsecutive = previousDay === toUtcMidnight(uniqueSorted[i]);
    runLength = isConsecutive ? runLength + 1 : 1;
    longestStreak = Math.max(longestStreak, runLength);
  }

  const dateSet = new Set(uniqueSorted);
  const todayTimestamp = toUtcMidnight(today);
  const yesterday = new Date(shiftDays(todayTimestamp, -1)).toISOString().slice(0, 10);

  let anchor: string | null = null;
  if (dateSet.has(today)) anchor = today;
  else if (dateSet.has(yesterday)) anchor = yesterday;

  let currentStreak = 0;
  if (anchor) {
    let cursor = toUtcMidnight(anchor);
    while (dateSet.has(new Date(cursor).toISOString().slice(0, 10))) {
      currentStreak++;
      cursor = shiftDays(cursor, -1);
    }
  }

  return { currentStreak, longestStreak };
}
