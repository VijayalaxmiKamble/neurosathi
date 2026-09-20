import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { useApp } from "@/context/app-context";
import { getData, KEYS, upsertInList } from "@/lib/storage";
import type { Patient } from "@/lib/types";

function ProfilePageComponent() {
  const { t, session } = useApp();
  const patient = getData<Patient[]>(KEYS.patients, []).find((item) => item.id === session?.patientId)
    ?? getData<Patient[]>(KEYS.patients, [])[0];
  const [form, setForm] = useState(() => ({
    name: patient?.name ?? "",
    age: patient?.age ?? 0,
    location: patient?.location ?? "",
    caregiver: patient?.caregiver ?? "",
    caregiverPhone: patient?.caregiverPhone ?? "",
    emergencyContact: patient?.emergencyContact ?? "",
    hospital: patient?.hospital ?? "",
  }));

  if (!patient) {
    return <AppShell title={t("profile")}><p className="text-muted-foreground">{t("empty")}</p></AppShell>;
  }

  const update = (field: keyof typeof form, value: string) => {
    setForm((current) => ({ ...current, [field]: field === "age" ? Number(value) : value }));
  };

  const save = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    upsertInList<Patient>(KEYS.patients, { ...patient, ...form, age: Number(form.age) });
    toast.success("Profile saved.");
  };

  return (
    <AppShell title={t("profile")}>
      <div className="grid gap-6 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
        <section className="rounded-2xl border bg-card p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="grid size-16 shrink-0 place-items-center rounded-2xl bg-primary text-xl font-bold text-primary-foreground shadow-sm">
              {patient.avatar}
            </div>
            <div className="min-w-0">
              <h2 className="truncate text-2xl font-bold">{patient.name}</h2>
              <p className="text-muted-foreground">{patient.age} · {patient.gender}</p>
              <p className="text-sm text-muted-foreground">{patient.location}</p>
            </div>
          </div>
          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
            {[
              ["Status", patient.status],
              ["Last active", patient.lastActive],
              ["Caregiver", patient.caregiver],
              ["Hospital", patient.hospital],
            ].map(([label, value]) => (
              <div key={label} className="rounded-xl border bg-muted/50 p-3">
                <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</div>
                <div className="mt-1 font-medium">{value}</div>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border bg-card p-6 shadow-sm">
          <div className="mb-5">
            <h2 className="text-2xl font-bold">Personal details</h2>
            <p className="mt-1 text-muted-foreground">Keep the details used for reminders and emergency support up to date.</p>
          </div>
          <form className="grid gap-4 sm:grid-cols-2" onSubmit={save}>
            <label className="block text-sm font-semibold">Name<input className="mt-1 min-h-12 w-full rounded-xl border px-3 text-base" value={form.name} onChange={(event) => update("name", event.target.value)} required /></label>
            <label className="block text-sm font-semibold">Age<input className="mt-1 min-h-12 w-full rounded-xl border px-3 text-base" type="number" min="1" max="120" value={form.age} onChange={(event) => update("age", event.target.value)} required /></label>
            <label className="block text-sm font-semibold sm:col-span-2">Location<input className="mt-1 min-h-12 w-full rounded-xl border px-3 text-base" value={form.location} onChange={(event) => update("location", event.target.value)} /></label>
            <label className="block text-sm font-semibold">Caregiver<input className="mt-1 min-h-12 w-full rounded-xl border px-3 text-base" value={form.caregiver} onChange={(event) => update("caregiver", event.target.value)} /></label>
            <label className="block text-sm font-semibold">Caregiver phone<input className="mt-1 min-h-12 w-full rounded-xl border px-3 text-base" type="tel" value={form.caregiverPhone} onChange={(event) => update("caregiverPhone", event.target.value)} /></label>
            <label className="block text-sm font-semibold">Emergency contact<input className="mt-1 min-h-12 w-full rounded-xl border px-3 text-base" type="tel" value={form.emergencyContact} onChange={(event) => update("emergencyContact", event.target.value)} /></label>
            <label className="block text-sm font-semibold">Hospital<input className="mt-1 min-h-12 w-full rounded-xl border px-3 text-base" value={form.hospital} onChange={(event) => update("hospital", event.target.value)} /></label>
            <div className="sm:col-span-2"><Button className="min-h-12" type="submit">{t("save")}</Button></div>
          </form>
        </section>
      </div>
    </AppShell>
  );
}

export const Route = createFileRoute("/profile")({
  component: ProfilePageComponent,
});