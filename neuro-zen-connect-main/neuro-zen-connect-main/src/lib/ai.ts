import type { Difficulty, GameSession, GameStats } from "./types";
import { getData, KEYS, saveData, today, uid, upsertInList } from "./storage";

function patientId(): string {
  if (typeof window === "undefined") return "p-001";
  const s = getData<{ patientId?: string } | null>(KEYS.session, null);
  return s?.patientId ?? "p-001";
}

const ORDER: Difficulty[] = ["BEGINNER", "EASY", "MEDIUM", "HARD"];

export function clamp(n: number, min = 0, max = 100): number {
  return Math.max(min, Math.min(max, Math.round(n)));
}

export function currentDifficulty(game: string): Difficulty {
  const store = getData<Record<string, Difficulty>>(KEYS.difficulty, {});
  return store[game] ?? "EASY";
}

export function setDifficulty(game: string, d: Difficulty): void {
  const store = getData<Record<string, Difficulty>>(KEYS.difficulty, {});
  store[game] = d;
  saveData(KEYS.difficulty, store);
}

export function nextDifficulty(
  game: string,
  perf: { accuracy: number; responseTime?: number; hintsUsed?: number },
): Difficulty {
  const current = currentDifficulty(game);
  let idx = Math.max(0, ORDER.indexOf(current));
  if (perf.accuracy >= 85 && (perf.hintsUsed ?? 0) <= 1) idx += 1;
  else if (perf.accuracy < 50) idx -= 1;
  const next = ORDER[Math.max(0, Math.min(ORDER.length - 1, idx))] ?? "EASY";
  setDifficulty(game, next);
  return next;
}

export function calculateCognitiveEngagement(pid = patientId()): number {
  const sessions = getData<GameSession[]>(KEYS.sessions, []).filter((s) => s.patientId === pid);
  if (!sessions.length) return 0;
  const recent = sessions.slice(-8);
  const accuracy = recent.reduce((a, s) => a + s.accuracy, 0) / recent.length;
  const completion = (recent.filter((s) => s.completed).length / recent.length) * 100;
  const speed = clamp(100 - (recent.reduce((a, s) => a + s.timeSec, 0) / recent.length - 60) / 1.5);
  const mistakes = clamp(100 - (recent.reduce((a, s) => a + s.mistakes, 0) / recent.length) * 10);
  return clamp(accuracy * 0.45 + completion * 0.25 + speed * 0.15 + mistakes * 0.15);
}

export function byGameAverages(pid = patientId()): Record<string, number> {
  const sessions = getData<GameSession[]>(KEYS.sessions, []).filter((s) => s.patientId === pid);
  const acc: Record<string, number> = {};
  for (const g of ["memory", "pictures", "numbers", "pattern", "words", "different", "attention", "recall"]) {
    const list = sessions.filter((s) => s.game === g);
    acc[g] = list.length ? clamp(list.reduce((a, s) => a + s.accuracy, 0) / list.length) : 0;
  }
  return acc;
}

export function recordSession(session: Omit<GameSession, "id" | "patientId" | "date"> & Partial<GameSession>) {
  const s: GameSession = {
    id: session.id ?? uid("gs"),
    patientId: session.patientId ?? patientId(),
    date: session.date ?? today(),
    game: session.game,
    accuracy: session.accuracy,
    score: session.score,
    attempts: session.attempts,
    timeSec: session.timeSec,
    mistakes: session.mistakes,
    hintsUsed: session.hintsUsed,
    completed: session.completed ?? true,
    difficulty: session.difficulty,
    streak: session.streak,
  };
  upsertInList(KEYS.sessions, s as unknown as Record<string, unknown>);
  const stats = getData<Record<string, GameStats>>(KEYS.gameStats, {});
  const prev = stats[s.game] ?? { bestScore: 0, lastPlayed: null, plays: 0 };
  stats[s.game] = {
    bestScore: Math.max(prev.bestScore, s.score ?? s.accuracy),
    lastPlayed: s.date,
    plays: prev.plays + 1,
  };
  saveData(KEYS.gameStats, stats);
  const next = nextDifficulty(s.game, {
    accuracy: s.accuracy,
    responseTime: s.timeSec / Math.max(1, s.attempts),
    hintsUsed: s.hintsUsed,
  });
  return { session: s, nextDifficulty: next };
}

export function getGameStats(game: string): GameStats {
  const stats = getData<Record<string, GameStats>>(KEYS.gameStats, {});
  return stats[game] ?? { bestScore: 0, lastPlayed: null, plays: 0 };
}

export function activityStreak(pid = patientId()): number {
  const dates = new Set(
    getData<GameSession[]>(KEYS.sessions, [])
      .filter((s) => s.patientId === pid && s.completed)
      .map((s) => s.date),
  );
  let streak = 0;
  for (let i = 0; i < 30; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    if (dates.has(key)) streak += 1;
    else if (i > 0) break;
  }
  return streak;
}
