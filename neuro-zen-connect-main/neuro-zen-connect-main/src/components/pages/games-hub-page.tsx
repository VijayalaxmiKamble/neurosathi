import { Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { useApp } from "@/context/app-context";
import { currentDifficulty, getGameStats } from "@/lib/ai";
import { CATEGORIES, GAMES } from "@/lib/games";
import { getRecommendations } from "@/lib/recommendations";
import { useEffect } from "react";
import type { Recommendation } from "@/lib/recommendations";

export function GamesHubPage() {
  const { t, session } = useApp();
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<string>("all");
  const [recs, setRecs] = useState<Recommendation[]>([]);

  useEffect(() => {
    void getRecommendations(session?.patientId ?? "p-001").then(setRecs);
  }, [session?.patientId]);

  const list = useMemo(() => {
    return GAMES.filter((g) => (cat === "all" || g.category === cat) && (t(g.nameKey) + t(g.descKey)).toLowerCase().includes(q.toLowerCase()));
  }, [q, cat, t]);

  return (
    <AppShell title={t("navGames")}>
      {recs[0] ? (
        <div className="mb-5 rounded-2xl border border-primary/20 bg-secondary/60 p-5">
          <h2 className="text-xl font-bold">{t("recommended")}</h2>
          <p className="mt-1 text-lg">{recs[0].title}</p>
          <Button className="mt-3 min-h-12" asChild>
            <Link to="/games/$gameId" params={{ gameId: recs[0].gameId }}>
              {t("play")}
            </Link>
          </Button>
        </div>
      ) : null}
      <div className="mb-4 flex flex-col gap-3 md:flex-row">
        <input className="min-h-12 flex-1 rounded-xl border px-3 text-lg" placeholder={t("search")} value={q} onChange={(e) => setQ(e.target.value)} />
        <select className="min-h-12 rounded-xl border px-3 text-lg" value={cat} onChange={(e) => setCat(e.target.value)}>
          <option value="all">{t("all")}</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {t(`cat${c[0]?.toUpperCase()}${c.slice(1)}`)}
            </option>
          ))}
        </select>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {list.map((g) => {
          const st = getGameStats(g.id);
          return (
            <article key={g.id} className="flex flex-col rounded-2xl border bg-card p-5 shadow-sm">
              <div className="text-4xl">{g.emoji}</div>
              <h3 className="mt-2 text-2xl font-bold">{t(g.nameKey)}</h3>
              <p className="mt-1 flex-1 text-muted-foreground">{t(g.descKey)}</p>
              <p className="mt-2 text-sm">
                {t("skill")}: {t(g.skillKey)} · {t("estTime", { n: g.minutes })} · {t("level")} {currentDifficulty(g.id)}
              </p>
              <p className="text-sm text-muted-foreground">
                {t("bestScore")}: {st.bestScore || "—"} · {t("lastPlayed")}: {st.lastPlayed ?? "—"}
              </p>
              <Button className="mt-4 min-h-12 text-lg" asChild>
                <Link to="/games/$gameId" params={{ gameId: g.id }}>
                  {t("play")}
                </Link>
              </Button>
            </article>
          );
        })}
      </div>
      {list.length === 0 ? <p className="mt-6 text-muted-foreground">{t("empty")}</p> : null}
    </AppShell>
  );
}
