import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/app-shell";
import { useApp } from "@/context/app-context";
import { getData, KEYS } from "@/lib/storage";
import type { GameSession } from "@/lib/types";
import { gameName } from "@/lib/games";

function ProgressPageComponent() {
  const { t, session } = useApp();
  const pid = session?.patientId ?? "p-001";
  const sessions = getData<GameSession[]>(KEYS.sessions, []).filter((s) => s.patientId === pid);

  return (
    <AppShell title={t("navProgress")}>
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">{t("recentActivity")}</h2>
        {sessions.length === 0 ? (
          <p className="text-muted-foreground">{t("empty")}</p>
        ) : (
          <div className="grid gap-3">
            {sessions.slice(-10).reverse().map((s) => (
              <div key={s.id} className="flex items-center justify-between rounded-2xl border bg-card p-4">
                <div>
                  <div className="text-lg font-bold">{gameName(s.game)}</div>
                  <div className="text-sm text-muted-foreground">{s.date} · {s.difficulty} · {s.timeSec}s</div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-primary">{s.accuracy}%</div>
                  <div className="text-sm text-muted-foreground">{t("accuracy")}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}

export const Route = createFileRoute("/progress")({
  component: ProgressPageComponent,
});
