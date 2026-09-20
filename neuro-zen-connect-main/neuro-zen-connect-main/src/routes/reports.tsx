import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/app-shell";
import { useApp } from "@/context/app-context";
import { getData, KEYS } from "@/lib/storage";
import type { Patient, GameSession } from "@/lib/types";
import { calculateCognitiveEngagement } from "@/lib/ai";

function ReportsPageComponent() {
  const { t } = useApp();
  const patients = getData<Patient[]>(KEYS.patients, []);
  const sessions = getData<GameSession[]>(KEYS.sessions, []);

  return (
    <AppShell title={t("navReports")}>
      <div className="space-y-6">
        <h2 className="text-2xl font-bold">{t("navReports")}</h2>
        {patients.map((p) => {
          const pSessions = sessions.filter((s) => s.patientId === p.id);
          const score = calculateCognitiveEngagement(p.id);
          return (
            <div key={p.id} className="rounded-2xl border bg-card p-6 space-y-4 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b pb-4">
                <div>
                  <h3 className="text-2xl font-bold">{p.name}</h3>
                  <p className="text-muted-foreground">{p.location} · {p.caregiver}</p>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-teal-700">{score}</div>
                  <div className="text-sm text-muted-foreground">{t("todayActivity")}</div>
                </div>
              </div>
              <div>
                <h4 className="font-bold mb-2">Summary Statistics</h4>
                <p className="text-sm text-muted-foreground">Total Sessions Completed: {pSessions.length}</p>
                <p className="text-sm text-muted-foreground">Average Accuracy: {pSessions.length ? Math.round(pSessions.reduce((a, s) => a + s.accuracy, 0) / pSessions.length) : 0}%</p>
              </div>
            </div>
          );
        })}
      </div>
    </AppShell>
  );
}

export const Route = createFileRoute("/reports")({
  component: ReportsPageComponent,
});
