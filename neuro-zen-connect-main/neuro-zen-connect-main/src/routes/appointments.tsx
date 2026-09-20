import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/app-shell";
import { useApp } from "@/context/app-context";
import { getData, KEYS } from "@/lib/storage";
import type { Appointment } from "@/lib/types";

function AppointmentsPageComponent() {
  const { t } = useApp();
  const appts = getData<Appointment[]>(KEYS.appointments, []);

  return (
    <AppShell title={t("navAppointments")}>
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">{t("navAppointments")}</h2>
        {appts.length === 0 ? (
          <p className="text-muted-foreground">{t("empty")}</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {appts.map((a) => (
              <div key={a.id} className="rounded-2xl border bg-card p-5 space-y-2 shadow-sm">
                <h3 className="text-xl font-bold">{a.doctor}</h3>
                <p className="text-muted-foreground">{a.hospital} · {a.location}</p>
                <div className="text-sm">
                  <p><strong>Date & Time:</strong> {a.date} at {a.time}</p>
                  <p><strong>Purpose:</strong> {a.purpose}</p>
                  <p><strong>Status:</strong> {a.status}</p>
                  {a.notes ? <p><strong>Notes:</strong> {a.notes}</p> : null}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}

export const Route = createFileRoute("/appointments")({
  component: AppointmentsPageComponent,
});
