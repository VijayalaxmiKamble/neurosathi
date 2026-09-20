import { activityStreak, byGameAverages, calculateCognitiveEngagement, currentDifficulty, getGameStats } from "./ai";
import { GAMES, gameName } from "./games";
import { t } from "./i18n";
import { getData, KEYS, today } from "./storage";
import type { GameSession } from "./types";

export interface Recommendation {
  id: string;
  title: string;
  detail: string;
  gameId: string;
  href: string;
}

export interface RecommendationService {
  getRecommendations(patientId: string): Promise<Recommendation[]>;
}

function localRecommendations(patientId: string): Recommendation[] {
  const avgs = byGameAverages(patientId);
  const sessions = getData<GameSession[]>(KEYS.sessions, []).filter((s) => s.patientId === patientId);
  const todayCount = sessions.filter((s) => s.date === today()).length;
  const weakest = Object.entries(avgs).sort((a, b) => a[1] - b[1])[0];
  const pattern = avgs["pattern"] ?? 0;
  const numbers = avgs["numbers"] ?? 0;
  const recs: Recommendation[] = [];

  if (todayCount === 0) {
    recs.push({
      id: "try-memory",
      title: t("recTryMemory"),
      detail: t("recommended"),
      gameId: "memory",
      href: "/games/memory",
    });
  }

  if (pattern >= 70) {
    recs.push({
      id: "improved",
      title: t("recImproved"),
      detail: `${t("accuracy")} ${pattern}%`,
      gameId: "pattern",
      href: "/games/pattern",
    });
  }

  if (numbers > 0 && numbers < 55) {
    recs.push({
      id: "easier-numbers",
      title: t("recEasier"),
      detail: `${t("chooseDifficulty")}: ${t("easy")}`,
      gameId: "numbers",
      href: "/games/numbers",
    });
  }

  if (weakest && weakest[1] < 65) {
    recs.push({
      id: "weakest",
      title: t("recFocus"),
      detail: gameName(weakest[0]),
      gameId: weakest[0],
      href: `/games/${weakest[0]}`,
    });
  }

  const stale = GAMES.find((g) => {
    const st = getGameStats(g.id);
    return !st.lastPlayed || st.lastPlayed < today();
  });
  if (stale && recs.length < 3) {
    recs.push({
      id: "stale",
      title: t("recommended"),
      detail: t(stale.nameKey),
      gameId: stale.id,
      href: `/games/${stale.id}`,
    });
  }

  if (!recs.length) {
    recs.push({
      id: "default",
      title: t("recTryMemory"),
      detail: `${t("level")} ${currentDifficulty("memory")}`,
      gameId: "memory",
      href: "/games/memory",
    });
  }

  return recs.slice(0, 3);
}

export const localRecommendationService: RecommendationService = {
  async getRecommendations(patientId: string) {
    return localRecommendations(patientId);
  },
};

/** Optional remote AI endpoint. Falls back to on-device recommendations. Never diagnoses. */
export async function getRecommendations(patientId: string): Promise<Recommendation[]> {
  const endpoint = import.meta.env.VITE_AI_ENDPOINT;
  if (endpoint) {
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientId,
          engagement: calculateCognitiveEngagement(patientId),
          averages: byGameAverages(patientId),
          streak: activityStreak(patientId),
        }),
      });
      if (res.ok) {
        const data = (await res.json()) as { recommendations?: Recommendation[] };
        if (data.recommendations?.length) return data.recommendations;
      }
    } catch {
      /* use local fallback */
    }
  }
  return localRecommendationService.getRecommendations(patientId);
}
