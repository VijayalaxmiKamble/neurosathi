import { Link } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/app-shell";
import { useApp } from "@/context/app-context";
import { byGameAverages, calculateCognitiveEngagement } from "@/lib/ai";
import { getData, KEYS } from "@/lib/storage";
import type { AlertItem, GameSession, Patient, Reminder } from "@/lib/types";
import { gameName } from "@/lib/games";
import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export function CaregiverPage() {
  const { t } = useApp();
  const patients = getData<Patient[]>(KEYS.patients, []);
  const alerts = getData<AlertItem[]>(KEYS.alerts, []).filter((a) => !a.acknowledged);
  const reminders = getData<Reminder[]>(KEYS.reminders, []);
  const sessions = getData<GameSession[]>(KEYS.sessions, []);
  const avg = Math.round(patients.reduce((a, p) => a + calculateCognitiveEngagement(p.id), 0) / Math.max(1, patients.length));
  const byDay = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const key = d.toISOString().slice(0, 10);
    const list = sessions.filter((s) => s.date === key);
    return {
      day: d.toLocaleDateString(undefined, { weekday: "short" }),
      games: list.length,
      accuracy: list.length ? Math.round(list.reduce((a, s) => a + s.accuracy, 0) / list.length) : 0,
    };
  });
  const avgs = byGameAverages("p-001");
  const gameBars = Object.entries(avgs).map(([k, v]) => ({ name: gameName(k), accuracy: v }));

  return (
    <AppShell title={t("navDashboard")}>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          [t("connectedUsers"), String(patients.length)],
          [t("navAlerts"), String(alerts.length)],
          [t("todayActivity"), String(avg)],
          [t("navReminders"), `${reminders.filter((r) => r.status === "completed").length}/${reminders.length}`],
        ].map(([l, v]) => (
          <div key={l} className="rounded-2xl border bg-card p-5">
            <div className="text-3xl font-bold">{v}</div>
            <div className="text-muted-foreground">{l}</div>
          </div>
        ))}
      </div>
      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <section className="rounded-2xl border bg-card p-5">
          <h2 className="text-2xl font-bold">{t("connectedUsers")}</h2>
          {patients.map((p) => (
            <div key={p.id} className="mt-3 flex flex-wrap items-center justify-between gap-2 rounded-xl border p-3">
              <div>
                <div className="font-semibold">{p.name}</div>
                <div className="text-sm text-muted-foreground">{p.location} · {p.status}</div>
              </div>
              <Link className="min-h-11 rounded-lg bg-primary px-4 py-2 text-primary-foreground" to="/users">
                {t("overview")}
              </Link>
            </div>
          ))}
        </section>
        <section className="rounded-2xl border bg-card p-5">
          <h2 className="text-2xl font-bold">{t("navAlerts")}</h2>
          {alerts.length ? alerts.slice(0, 4).map((a) => (
            <div key={a.id} className="mt-2 rounded-xl border p-3">
              <strong>{a.category}</strong>
              <p className="text-sm text-muted-foreground">{a.message}</p>
            </div>
          )) : <p className="mt-2 text-muted-foreground">{t("empty")}</p>}
        </section>
        <section className="h-80 rounded-2xl border bg-card p-5">
          <h2 className="mb-2 text-xl font-bold">{t("recentActivity")}</h2>
          <ResponsiveContainer width="100%" height="85%">
            <LineChart data={byDay}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="accuracy" stroke="#0f766e" strokeWidth={3} name={t("accuracy")} />
            </LineChart>
          </ResponsiveContainer>
        </section>
        <section className="h-80 rounded-2xl border bg-card p-5">
          <h2 className="mb-2 text-xl font-bold">{t("navGames")}</h2>
          <ResponsiveContainer width="100%" height="85%">
            <BarChart data={gameBars}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" hide />
              <YAxis />
              <Tooltip />
              <Bar dataKey="accuracy" fill="#1d4ed8" name={t("accuracy")} />
            </BarChart>
          </ResponsiveContainer>
        </section>
      </div>
    </AppShell>
  );
}
