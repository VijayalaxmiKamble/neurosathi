import { Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useApp } from "@/context/app-context";
import { recordSession } from "@/lib/ai";
import { GAMES, roundCount } from "@/lib/games";
import { speakIfEnabled } from "@/lib/voice";
import type { Difficulty } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface GamePlayApi {
  difficulty: Difficulty;
  round: number;
  total: number;
  score: number;
  mistakes: number;
  attempts: number;
  streak: number;
  hints: number;
  elapsed: number;
  onCorrect: (msg?: string) => void;
  onWrong: (msg?: string) => void;
  onHint: () => void;
  nextRound: () => void;
  finish: () => void;
}

const LEVELS: Difficulty[] = ["BEGINNER", "EASY", "MEDIUM", "HARD"];

export function GameHost({
  gameId,
  children,
}: {
  gameId: string;
  children: (api: GamePlayApi & { playing: boolean; resetKey: number }) => React.ReactNode;
}) {
  const { t, settings } = useApp();
  const meta = GAMES.find((g) => g.id === gameId);
  const [phase, setPhase] = useState<"intro" | "play" | "results">("intro");
  const [difficulty, setDifficulty] = useState<Difficulty>("EASY");
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [streak, setStreak] = useState(0);
  const [hints, setHints] = useState(0);
  const [startedAt, setStartedAt] = useState(Date.now());
  const [elapsed, setElapsed] = useState(0);
  const [resetKey, setResetKey] = useState(0);
  const [nextLevel, setNextLevel] = useState<Difficulty>("EASY");
  const total = roundCount(difficulty);
  const statsRef = useRef({ score: 0, mistakes: 0, attempts: 0, hints: 0, streak: 0, startedAt: Date.now() });

  useEffect(() => {
    if (phase !== "play") return;
    const id = window.setInterval(() => setElapsed(Math.round((Date.now() - startedAt) / 1000)), 500);
    return () => window.clearInterval(id);
  }, [phase, startedAt]);

  const start = () => {
    setRound(1);
    setScore(0);
    setMistakes(0);
    setAttempts(0);
    setStreak(0);
    setHints(0);
    const now = Date.now();
    setStartedAt(now);
    statsRef.current = { score: 0, mistakes: 0, attempts: 0, hints: 0, streak: 0, startedAt: now };
    setElapsed(0);
    setResetKey((k) => k + 1);
    setPhase("play");
    speakIfEnabled(t("instructions"));
  };

  const finish = () => {
    const st = statsRef.current;
    const timeSec = Math.max(1, Math.round((Date.now() - st.startedAt) / 1000));
    const accuracy = Math.round((st.score / Math.max(1, st.score + st.mistakes)) * 100);
    const res = recordSession({
      game: gameId,
      accuracy,
      score: st.score,
      attempts: Math.max(1, st.attempts),
      timeSec,
      mistakes: st.mistakes,
      hintsUsed: st.hints,
      completed: true,
      difficulty,
      streak: st.streak,
    });
    setNextLevel(res.nextDifficulty);
    setElapsed(timeSec);
    setPhase("results");
    toast.success(t("complete"));
    speakIfEnabled(t("complete"));
  };

  const api: GamePlayApi = {
    difficulty,
    round,
    total,
    score,
    mistakes,
    attempts,
    streak,
    hints,
    elapsed,
    onCorrect: (msg) => {
      statsRef.current.score += 1;
      statsRef.current.attempts += 1;
      statsRef.current.streak += 1;
      setScore((s) => s + 1);
      setAttempts((a) => a + 1);
      setStreak((s) => s + 1);
      const m = msg ?? t("correct");
      toast.success(m);
      speakIfEnabled(m);
    },
    onWrong: (msg) => {
      statsRef.current.mistakes += 1;
      statsRef.current.attempts += 1;
      statsRef.current.streak = 0;
      setMistakes((s) => s + 1);
      setAttempts((a) => a + 1);
      setStreak(0);
      const m = msg ?? t("friendlyWrong");
      toast.message(m);
      speakIfEnabled(m);
    },
    onHint: () => {
      statsRef.current.hints += 1;
      setHints((h) => h + 1);
    },
    nextRound: () => {
      setRound((r) => {
        if (r >= total) {
          window.setTimeout(finish, 400);
          return r;
        }
        return r + 1;
      });
    },
    finish,
  };

  const hud = (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-6">
      {[
        [t("round"), `${round}/${total}`],
        [t("score"), String(score)],
        [t("attempts"), String(attempts)],
        [t("accuracy"), `${Math.round((score / Math.max(1, score + mistakes)) * 100)}%`],
        [t("streak"), String(streak)],
        [t("timer"), `${elapsed}s`],
      ].map(([l, v]) => (
        <div key={l} className="rounded-xl border bg-card p-3 text-center">
          <div className="text-2xl font-bold">{v}</div>
          <div className="text-sm text-muted-foreground">{l}</div>
        </div>
      ))}
    </div>
  );

  if (!meta) {
    return <p>{t("error")}</p>;
  }

  if (phase === "intro") {
    return (
      <div className="space-y-6">
        <div className="rounded-2xl border bg-card p-6 shadow-sm">
          <div className="text-5xl" aria-hidden>
            {meta.emoji}
          </div>
          <h2 className="mt-3 text-3xl font-bold">{t(meta.nameKey)}</h2>
          <p className="mt-2 text-lg text-muted-foreground">{t(meta.descKey)}</p>
          <p className="mt-4 text-lg">
            <strong>{t("instructions")}:</strong> {t(meta.descKey)} {t("chooseDifficulty")}.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {LEVELS.map((lv) => (
              <button
                key={lv}
                onClick={() => setDifficulty(lv)}
                className={cn(
                  "min-h-12 rounded-xl border px-4 text-base font-semibold",
                  difficulty === lv ? "bg-primary text-primary-foreground shadow-sm" : "bg-card",
                )}
              >
                {t(lv.toLowerCase())}
              </button>
            ))}
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button className="min-h-14 px-8 text-lg" onClick={start}>
              {t("start")}
            </Button>
            <Button variant="outline" className="min-h-14 text-lg" asChild>
              <Link to="/games">{t("exitGame")}</Link>
            </Button>
            {settings.voice ? (
              <Button variant="secondary" className="min-h-14 text-lg" onClick={() => speakIfEnabled(t(meta.descKey))}>
                {t("speak")}
              </Button>
            ) : null}
          </div>
        </div>
      </div>
    );
  }

  if (phase === "results") {
    const accuracy = Math.round((score / Math.max(1, score + mistakes)) * 100);
    return (
      <div className="rounded-2xl border bg-card p-6 text-center shadow-sm">
        <h2 className="text-3xl font-bold">{t("complete")}</h2>
        <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
          <div className="rounded-xl border border-primary/20 bg-secondary p-4 text-2xl font-bold">{accuracy}%</div>
          <div className="rounded-xl bg-muted p-4 text-2xl font-bold">{score}</div>
          <div className="rounded-xl bg-muted p-4 text-2xl font-bold">{elapsed}s</div>
          <div className="rounded-xl bg-muted p-4 text-2xl font-bold">{nextLevel}</div>
        </div>
        <p className="mt-4 text-muted-foreground">
          {t("accuracy")} · {t("score")} · {t("timer")} · {t("level")}
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Button className="min-h-14 text-lg" onClick={start}>
            {t("playAgain")}
          </Button>
          <Button variant="outline" className="min-h-14 text-lg" asChild>
            <Link to="/games">{t("navGames")}</Link>
          </Button>
          <Button variant="secondary" className="min-h-14 text-lg" asChild>
            <Link to="/progress">{t("navProgress")}</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {hud}
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" className="min-h-12" onClick={start}>
          {t("restart")}
        </Button>
        <Button variant="ghost" className="min-h-12" asChild>
          <Link to="/games">{t("exitGame")}</Link>
        </Button>
      </div>
      {children({ ...api, playing: true, resetKey })}
    </div>
  );
}
