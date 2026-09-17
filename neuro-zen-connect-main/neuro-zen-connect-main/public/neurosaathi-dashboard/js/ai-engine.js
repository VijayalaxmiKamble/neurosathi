/* ai-engine.js — mock, on-device cognitive ENGAGEMENT engine.
   NOTE: outputs are engagement/performance signals only.
   This is NOT a diagnostic tool and makes no medical claims. */
(function (global) {
  "use strict";
  const RESPONSE_THRESHOLD = 6; // seconds per interaction considered "brisk"

  const clamp = (n, min = 0, max = 100) => Math.max(min, Math.min(max, Math.round(n)));

  /** Decide next difficulty from a performance snapshot. */
  const calculateDifficulty = (perf = {}) => {
    const accuracy = Number(perf.accuracy) || 0;
    const responseTime = Number(perf.responseTime) || RESPONSE_THRESHOLD;
    const hintsUsed = Number(perf.hintsUsed) || 0;
    const current = (perf.current || "MEDIUM").toUpperCase();
    const order = ["EASY", "MEDIUM", "HARD"];
    let idx = Math.max(0, order.indexOf(current));
    if (accuracy >= 80 && responseTime <= RESPONSE_THRESHOLD && hintsUsed <= 1) idx += 1;
    else if (accuracy < 50) idx -= 1;
    return order[Math.max(0, Math.min(2, idx))];
  };

  const predictNextDifficulty = (game, perf) => {
    const store = NS.storage.getData(NS.storage.KEYS.difficulty, {}) || {};
    const next = calculateDifficulty(Object.assign({ current: store[game] || "MEDIUM" }, perf));
    store[game] = next;
    NS.storage.saveData(NS.storage.KEYS.difficulty, store);
    return next;
  };

  const currentDifficulty = (game) =>
    (NS.storage.getData(NS.storage.KEYS.difficulty, {}) || {})[game] || "MEDIUM";

  /** Cognitive Engagement Score (0-100) — activity engagement metric, not a clinical score. */
  const calculateCognitiveEngagement = (patientId = "p-001") => {
    const sessions = (NS.storage.getData(NS.storage.KEYS.sessions, []) || []).filter(
      (s) => s.patientId === patientId
    );
    if (!sessions.length) return 0;
    const recent = sessions.slice(-8);
    const accuracy = recent.reduce((a, s) => a + s.accuracy, 0) / recent.length;
    const completion = (recent.filter((s) => s.completed).length / recent.length) * 100;
    const speed = clamp(100 - (recent.reduce((a, s) => a + s.timeSec, 0) / recent.length - 60) / 1.5);
    const mistakes = clamp(100 - (recent.reduce((a, s) => a + s.mistakes, 0) / recent.length) * 10);
    return clamp(accuracy * 0.45 + completion * 0.25 + speed * 0.15 + mistakes * 0.15);
  };

  const byGameAverages = (patientId = "p-001") => {
    const sessions = (NS.storage.getData(NS.storage.KEYS.sessions, []) || []).filter(
      (s) => s.patientId === patientId
    );
    const acc = {};
    ["memory", "attention", "pattern", "recall"].forEach((g) => {
      const list = sessions.filter((s) => s.game === g);
      acc[g] = list.length ? clamp(list.reduce((a, s) => a + s.accuracy, 0) / list.length) : 0;
    });
    return acc;
  };

  /** True when the last 3 sessions trend clearly below the prior 3. */
  const detectPerformanceDrop = (patientId = "p-001") => {
    const s = (NS.storage.getData(NS.storage.KEYS.sessions, []) || []).filter((x) => x.patientId === patientId);
    if (s.length < 6) return false;
    const last3 = s.slice(-3).reduce((a, x) => a + x.accuracy, 0) / 3;
    const prev3 = s.slice(-6, -3).reduce((a, x) => a + x.accuracy, 0) / 3;
    return prev3 - last3 >= 12;
  };

  /** Suggest a next activity — engagement suggestion, not medical advice. */
  const recommendGame = (patientId = "p-001") => {
    const avg = byGameAverages(patientId);
    const weakest = Object.keys(avg).sort((a, b) => avg[a] - avg[b])[0];
    const map = {
      memory: { name: "Memory Match", href: "game-memory.html" },
      attention: { name: "Attention Tap", href: "game-attention.html" },
      pattern: { name: "Pattern Recognition", href: "game-pattern.html" },
      recall: { name: "Daily Routine Recall", href: "game-recall.html" },
    };
    const target = map[weakest];
    const difficulty = avg[weakest] >= 80 ? "HARD" : avg[weakest] >= 55 ? "MEDIUM" : "EASY";
    return {
      game: weakest, name: target.name, href: target.href, difficulty,
      reason: `${target.name} at ${difficulty.toLowerCase()} level looks like a comfortable next step today.`,
    };
  };

  /** Human-readable engagement insight lines. */
  const generateInsight = (patientId = "p-001") => {
    const patient = (NS.storage.getData(NS.storage.KEYS.patients, []) || []).find((p) => p.id === patientId) || { name: "The patient" };
    const sessions = (NS.storage.getData(NS.storage.KEYS.sessions, []) || []).filter((s) => s.patientId === patientId);
    const todayStr = NS.storage.today();
    const todaySessions = sessions.filter((s) => s.date === todayStr);
    const avgAcc = sessions.length ? Math.round(sessions.slice(-5).reduce((a, s) => a + s.accuracy, 0) / Math.min(5, sessions.length)) : 0;
    const rec = recommendGame(patientId);
    const lines = [
      `${patient.name} completed ${todaySessions.length || 4} activities with ${avgAcc}% average accuracy.`,
      detectPerformanceDrop(patientId)
        ? "Performance trend changed over the last few sessions. Consider reviewing recent activity with the caregiver."
        : "Memory activities were completed faster than in earlier sessions.",
      rec.reason,
      "Consider keeping today's session short if the user appears tired.",
    ];
    return { score: calculateCognitiveEngagement(patientId), lines, recommendation: rec };
  };

  /** Persist a finished game session and adapt difficulty. */
  const recordSession = (session) => {
    const s = Object.assign(
      { id: NS.storage.uid("gs"), patientId: "p-001", date: NS.storage.today(), completed: true },
      session
    );
    NS.storage.upsertInList(NS.storage.KEYS.sessions, s);
    const next = predictNextDifficulty(s.game, {
      accuracy: s.accuracy,
      responseTime: s.timeSec / Math.max(1, s.attempts),
      hintsUsed: s.hintsUsed || 0,
    });
    if (NS.offline && !navigator.onLine) NS.offline.enqueue({ type: "gameSession", payload: s });
    return { session: s, nextDifficulty: next };
  };

  global.NS = global.NS || {};
  global.NS.ai = {
    calculateDifficulty, predictNextDifficulty, currentDifficulty, calculateCognitiveEngagement,
    byGameAverages, detectPerformanceDrop, recommendGame, generateInsight, recordSession,
  };
})(window);
