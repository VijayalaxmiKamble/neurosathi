import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { useApp } from "@/context/app-context";
import { getData, KEYS, upsertInList } from "@/lib/storage";
import type { AlertItem } from "@/lib/types";

function AlertsPageComponent() {
  const { t } = useApp();
  const alerts = getData<AlertItem[]>(KEYS.alerts, []);

  return (
    <AppShell title={t("navAlerts")}>
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">{t("navAlerts")}</h2>
        {alerts.length === 0 ? (
          <p className="text-muted-foreground">{t("empty")}</p>
        ) : (
          <div className="space-y-3">
            {alerts.map((a) => (
              <div key={a.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border bg-card p-4">
                <div>
                  <div className="flex items-center gap-2 font-bold">
                    <span className={`inline-block size-3 rounded-full ${a.severity === "HIGH" ? "bg-destructive" : "bg-warning"}`} />
                    {a.category} · {a.patient}
                  </div>
                  <p className="text-muted-foreground">{a.message}</p>
                  <span className="text-xs text-muted-foreground">{a.time}</span>
                </div>
                {!a.acknowledged ? (
                  <Button
                    onClick={() => {
                      upsertInList(KEYS.alerts, { id: a.id, acknowledged: true });
                      window.location.reload();
                    }}
                  >
                    Acknowledge
                  </Button>
                ) : (
                  <span className="text-sm text-success">✓ Acknowledged</span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}

export const Route = createFileRoute("/alerts")({
  component: AlertsPageComponent,
});
