import { useMemo, useState } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { useApp } from "@/context/app-context";
import { getData, KEYS, removeFromList, today, uid, upsertInList } from "@/lib/storage";
import type { Reminder } from "@/lib/types";
import { speakIfEnabled } from "@/lib/voice";

const TYPES = ["MEDICINE", "APPOINTMENT", "FAMILY", "EXERCISE", "MEAL", "PERSONAL", "OTHER", "HYDRATION", "COGNITIVE GAME"];

export function RemindersPage() {
  const { t, session } = useApp();
  const pid = session?.patientId ?? "p-001";
  const [tab, setTab] = useState<"pending" | "completed">("pending");
  const [cat, setCat] = useState("all");
  const [items, setItems] = useState(() => getData<Reminder[]>(KEYS.reminders, []));
  const [editing, setEditing] = useState<Partial<Reminder> | null>(null);

  const refresh = () => setItems(getData<Reminder[]>(KEYS.reminders, []));
  const mine = items.filter((r) => r.patientId === pid);
  const visible = useMemo(
    () => mine.filter((r) => r.status === tab).filter((r) => cat === "all" || r.type === cat),
    [mine, tab, cat],
  );

  return (
    <AppShell title={t("navReminders")}>
      <div className="mb-4 flex flex-wrap gap-2">
        <Button className="min-h-12" variant={tab === "pending" ? "default" : "outline"} onClick={() => setTab("pending")}>{t("pending")}</Button>
        <Button className="min-h-12" variant={tab === "completed" ? "default" : "outline"} onClick={() => setTab("completed")}>{t("completed")}</Button>
        <select className="min-h-12 rounded-xl border px-3" value={cat} onChange={(e) => setCat(e.target.value)}>
          <option value="all">{t("all")}</option>
          {TYPES.map((x) => (
            <option key={x}>{x}</option>
          ))}
        </select>
        <Button className="min-h-12" onClick={() => setEditing({ title: "", type: "PERSONAL", time: "09:00", date: today(), repeat: "Daily", priority: "medium", notes: "", status: "pending", enabled: true })}>
          {t("addReminder")}
        </Button>
      </div>
      {visible.length === 0 ? <p className="text-muted-foreground">{t("noReminders")}</p> : null}
      <div className="space-y-3">
        {visible.map((r) => (
          <div key={r.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border bg-card p-4">
            <div>
              <div className="text-lg font-semibold">{r.time} · {r.title}</div>
              <div className="text-sm text-muted-foreground">{r.type} · {r.repeat}</div>
            </div>
            <div className="flex flex-wrap gap-2">
              {r.status !== "completed" ? (
                <Button
                  className="min-h-11"
                  onClick={() => {
                    upsertInList(KEYS.reminders, { id: r.id, status: "completed" } as unknown as Record<string, unknown>);
                    speakIfEnabled(r.title);
                    refresh();
                  }}
                >
                  {t("markDone")}
                </Button>
              ) : null}
              <Button variant="outline" className="min-h-11" onClick={() => setEditing(r)}>{t("edit")}</Button>
              <Button
                variant="destructive"
                className="min-h-11"
                onClick={() => {
                  if (confirm(t("confirmDelete"))) {
                    removeFromList(KEYS.reminders, r.id);
                    refresh();
                  }
                }}
              >
                {t("delete")}
              </Button>
            </div>
          </div>
        ))}
      </div>
      {editing ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4">
          <form
            className="w-full max-w-lg space-y-3 rounded-2xl bg-card p-6"
            onSubmit={(e) => {
              e.preventDefault();
              if (!editing.title?.trim()) return;
              upsertInList(KEYS.reminders, {
                id: editing.id ?? uid("r"),
                patientId: pid,
                title: editing.title.trim(),
                type: editing.type ?? "OTHER",
                time: editing.time ?? "09:00",
                date: editing.date,
                repeat: editing.repeat ?? "Daily",
                status: editing.status ?? "pending",
                priority: editing.priority ?? "medium",
                enabled: true,
                notes: editing.notes ?? "",
              } as unknown as Record<string, unknown>);
              setEditing(null);
              refresh();
            }}
          >
            <input className="min-h-12 w-full rounded-xl border px-3" placeholder={t("title")} value={editing.title ?? ""} onChange={(e) => setEditing({ ...editing, title: e.target.value })} required />
            <select className="min-h-12 w-full rounded-xl border px-3" value={editing.type} onChange={(e) => setEditing({ ...editing, type: e.target.value })}>
              {TYPES.map((x) => (
                <option key={x}>{x}</option>
              ))}
            </select>
            <input className="min-h-12 w-full rounded-xl border px-3" type="time" value={editing.time ?? "09:00"} onChange={(e) => setEditing({ ...editing, time: e.target.value })} />
            <input className="min-h-12 w-full rounded-xl border px-3" type="date" value={editing.date ?? today()} onChange={(e) => setEditing({ ...editing, date: e.target.value })} />
            <div className="flex gap-2">
              <Button className="min-h-12 flex-1" type="submit">{t("save")}</Button>
              <Button className="min-h-12" type="button" variant="outline" onClick={() => setEditing(null)}>{t("cancel")}</Button>
            </div>
          </form>
        </div>
      ) : null}
    </AppShell>
  );
}
