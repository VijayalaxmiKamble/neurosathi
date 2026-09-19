import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { useApp } from "@/context/app-context";
import { activityStreak, calculateCognitiveEngagement } from "@/lib/ai";
import { GAMES, gameName } from "@/lib/games";
import { getRecommendations, type Recommendation } from "@/lib/recommendations";
import { getData, KEYS, saveData, today } from "@/lib/storage";
import type { GameSession, Hydration, Medication, MemoryItem, Patient, Reminder, RoutineItem } from "@/lib/types";

export function HomePage() {
  const { t, session } = useApp();
  const [, bump] = useState(0);
  const patient = getData<Patient[]>(KEYS.patients, []).find((p) => p.id === session?.patientId) ?? getData<Patient[]>(KEYS.patients, [])[0];
  const pid = patient?.id ?? "p-001";
  const hours = new Date().getHours();
  const greet = hours < 12 ? t("goodMorning") : hours < 17 ? t("goodAfternoon") : t("goodEvening");
  const sessions = getData<GameSession[]>(KEYS.sessions, []).filter((s) => s.patientId === pid);
  const todayGames = sessions.filter((s) => s.date === today() && s.completed);
  const reminders = getData<Reminder[]>(KEYS.reminders, []).filter((r) => r.patientId === pid && r.status === "pending");
  const memories = getData<MemoryItem[]>(KEYS.memories, []).filter((m) => m.patientId === pid).slice(0, 3);
  const routine = getData<RoutineItem[]>(KEYS.routine, []);
  const hyd = getData<Hydration>(KEYS.hydration, { date: today(), goal: 6, current: 0 });
  const meds = getData<Medication[]>(KEYS.medication, []);
  const [recs, setRecs] = useState<Recommendation[]>([]);

  useEffect(() => {
    void getRecommendations(pid).then(setRecs);
  }, [pid]);

  const refresh = () => bump((n) => n + 1);

  return (
    <AppShell title={`${greet}, ${patient?.name.split(" ").slice(-1)[0] ?? ""}`}>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          [t("todayActivity"), `${calculateCognitiveEngagement(pid)}`],
          [t("gamesToday"), String(todayGames.length)],
          [t("streak"), String(activityStreak(pid))],
          [t("dailyProgress"), `${routine.filter((r) => r.status === "completed").length}/${routine.length}`],
        ].map(([l, v]) => (
          <div key={l} className="rounded-2xl border bg-card p-5 shadow-sm">
            <div className="text-3xl font-bold">{v}</div>
            <div className="text-muted-foreground">{l}</div>
          </div>
        ))}
      </div>
      <div className="mt-4 flex flex-wrap gap-3">
        <Button className="min-h-14 text-lg" asChild>
          <Link to="/games">{t("quickGame")}</Link>
        </Button>
        <Button variant="secondary" className="min-h-14 text-lg" asChild>
          <Link to="/memories">{t("quickMemory")}</Link>
        </Button>
        <Button variant="outline" className="min-h-14 text-lg" asChild>
          <Link to="/reminders">{t("quickReminder")}</Link>
        </Button>
      </div>
      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <section className="rounded-2xl border bg-card p-5">
          <h2 className="text-2xl font-bold">{t("recommended")}</h2>
          {recs.length ? (
            recs.map((r) => (
              <div key={r.id} className="mt-3 rounded-xl bg-teal-50 p-4 dark:bg-teal-950">
                <p className="text-lg font-semibold">{r.title}</p>
                <p className="text-muted-foreground">{r.detail}</p>
                <Button className="mt-3 min-h-12" asChild>
                  <Link to="/games/$gameId" params={{ gameId: r.gameId }}>
                    {t("play")} {gameName(r.gameId)}
                  </Link>
                </Button>
              </div>
            ))
          ) : (
            <p className="mt-2 text-muted-foreground">{t("loading")}</p>
          )}
        </section>
        <section className="rounded-2xl border bg-card p-5">
          <h2 className="text-2xl font-bold">{t("upcoming")}</h2>
          {reminders.length ? (
            reminders.slice(0, 5).map((r) => (
              <div key={r.id} className="mt-2 flex items-center justify-between gap-2 rounded-xl border p-3">
                <div>
                  <div className="font-semibold">{r.title}</div>
                  <div className="text-sm text-muted-foreground">{r.time} · {r.type}</div>
                </div>
              </div>
            ))
          ) : (
            <p className="mt-2 text-muted-foreground">{t("noReminders")}</p>
          )}
        </section>
        <section className="rounded-2xl border bg-card p-5">
          <h2 className="text-2xl font-bold">{t("recentScores")}</h2>
          {todayGames.length === 0 && sessions.slice(-4).length === 0 ? (
            <p className="mt-2 text-muted-foreground">{t("noGamesToday")}</p>
          ) : (
            sessions.slice(-5).reverse().map((s) => (
              <div key={s.id} className="mt-2 flex justify-between rounded-xl border p-3">
                <span>{gameName(s.game)}</span>
                <strong>{s.accuracy}%</strong>
              </div>
            ))
          )}
        </section>
        <section className="rounded-2xl border bg-card p-5">
          <h2 className="text-2xl font-bold">{t("memoryReminders")}</h2>
          {memories.length ? memories.map((m) => (
            <div key={m.id} className="mt-2 rounded-xl border p-3">
              <div className="font-semibold">{m.title}</div>
              <div className="text-sm text-muted-foreground">{m.category} · {m.date}</div>
            </div>
          )) : <p className="mt-2 text-muted-foreground">{t("noMemories")}</p>}
        </section>
      </div>
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <section className="rounded-2xl border bg-card p-5">
          <h2 className="text-2xl font-bold">Water · {hyd.current}/{hyd.goal}</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {Array.from({ length: hyd.goal }).map((_, i) => (
              <button
                key={i}
                className={`min-h-12 min-w-12 rounded-xl border text-xl ${i < hyd.current ? "bg-sky-200" : ""}`}
                onClick={() => {
                  saveData(KEYS.hydration, { ...hyd, current: i < hyd.current ? i : i + 1 });
                  refresh();
                }}
                aria-label={`Glass ${i + 1}`}
              >
                💧
              </button>
            ))}
          </div>
        </section>
        <section className="rounded-2xl border bg-card p-5">
          <h2 className="text-2xl font-bold">Medicine check-in</h2>
          {meds.map((m) => (
            <div key={m.id} className="mt-2 flex items-center justify-between rounded-xl border p-3">
              <div>
                <div className="font-semibold">{m.label}</div>
                <div className="text-sm text-muted-foreground">{m.time}</div>
              </div>
              {m.status === "taken" ? (
                <span className="text-teal-700">✓</span>
              ) : (
                <Button
                  className="min-h-11"
                  onClick={() => {
                    saveData(KEYS.medication, meds.map((x) => (x.id === m.id ? { ...x, status: "taken" as const } : x)));
                    refresh();
                  }}
                >
                  {t("markDone")}
                </Button>
              )}
            </div>
          ))}
        </section>
      </div>
      <p className="mt-4 text-sm text-muted-foreground">{GAMES.length} {t("navGames").toLowerCase()} · {t("disclaimer")}</p>
    </AppShell>
  );
}
