import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/app-shell";
import { useApp } from "@/context/app-context";

function HelpPageComponent() {
  const { t } = useApp();
  return (
    <AppShell title={t("navHelp")}>
      <div className="max-w-2xl space-y-4 rounded-2xl border bg-card p-6">
        <h2 className="text-2xl font-bold">{t("navHelp")}</h2>
        <p className="text-muted-foreground">{t("tagline")}</p>
        <div className="space-y-3">
          <div className="rounded-xl border p-4">
            <h3 className="font-bold">🧠 Cognitive Games</h3>
            <p className="text-sm text-muted-foreground">Practice memory, pattern matching, and focus with adaptive difficulty levels.</p>
          </div>
          <div className="rounded-xl border p-4">
            <h3 className="font-bold">⏰ Reminders & Routine</h3>
            <p className="text-sm text-muted-foreground">Keep track of daily medications, hydration, and appointments effortlessly.</p>
          </div>
          <div className="rounded-xl border p-4">
            <h3 className="font-bold">👥 Caregiver Support</h3>
            <p className="text-sm text-muted-foreground">Caregivers can view patient activity trends, receive alert notifications, and generate reports.</p>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

export const Route = createFileRoute("/help")({
  component: HelpPageComponent,
});
