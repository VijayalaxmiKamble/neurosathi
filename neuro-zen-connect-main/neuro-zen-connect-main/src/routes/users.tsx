import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/app-shell";
import { useApp } from "@/context/app-context";
import { getData, KEYS } from "@/lib/storage";
import type { Patient } from "@/lib/types";

function UsersPageComponent() {
  const { t } = useApp();
  const patients = getData<Patient[]>(KEYS.patients, []);

  return (
    <AppShell title={t("connectedUsers")}>
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">{t("connectedUsers")}</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {patients.map((p) => (
            <div key={p.id} className="rounded-2xl border bg-card p-5 space-y-2 shadow-sm">
              <h3 className="text-xl font-bold">{p.name}</h3>
              <p className="text-sm text-muted-foreground">{p.location} · {p.age} years old · {p.gender}</p>
              <div className="text-sm">
                <p><strong>Caregiver:</strong> {p.caregiver} ({p.caregiverPhone})</p>
                <p><strong>Hospital:</strong> {p.hospital}</p>
                <p><strong>Status:</strong> {p.status}</p>
                <p><strong>Last Active:</strong> {p.lastActive}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  );
}

export const Route = createFileRoute("/users")({
  component: UsersPageComponent,
});
