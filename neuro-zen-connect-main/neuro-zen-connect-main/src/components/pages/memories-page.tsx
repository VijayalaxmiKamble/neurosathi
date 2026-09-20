import { useMemo, useState } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { useApp } from "@/context/app-context";
import { getData, KEYS, removeFromList, saveData, today, uid, upsertInList } from "@/lib/storage";
import type { MemoryItem } from "@/lib/types";

const CATS = ["Family", "Friends", "Important Places", "Events", "Personal", "Daily Life"];

export function MemoriesPage() {
  const { t, session } = useApp();
  const pid = session?.patientId ?? "p-001";
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("all");
  const [editing, setEditing] = useState<Partial<MemoryItem> | null>(null);
  const [items, setItems] = useState<MemoryItem[]>(() => getData<MemoryItem[]>(KEYS.memories, []));
  const [detail, setDetail] = useState<MemoryItem | null>(null);

  const refresh = () => setItems(getData<MemoryItem[]>(KEYS.memories, []));

  const visible = useMemo(
    () =>
      items
        .filter((m) => m.patientId === pid)
        .filter((m) => cat === "all" || m.category === cat)
        .filter((m) => !q || (m.title + m.description + m.tags.join(" ")).toLowerCase().includes(q.toLowerCase())),
    [items, pid, cat, q],
  );

  const save = () => {
    if (!editing?.title?.trim()) return;
    upsertInList(KEYS.memories, {
      id: editing.id ?? uid("mem"),
      patientId: pid,
      title: editing.title.trim(),
      description: editing.description ?? "",
      date: editing.date ?? today(),
      category: editing.category ?? "Personal",
      tags: (editing.tags ?? []).filter(Boolean),
      imageDataUrl: editing.imageDataUrl,
    } as unknown as Record<string, unknown>);
    setEditing(null);
    refresh();
  };

  return (
    <AppShell title={t("navMemories")}>
      <div className="mb-4 flex flex-col gap-3 md:flex-row">
        <input className="min-h-12 flex-1 rounded-xl border px-3 text-lg" placeholder={t("search")} value={q} onChange={(e) => setQ(e.target.value)} />
        <select className="min-h-12 rounded-xl border px-3" value={cat} onChange={(e) => setCat(e.target.value)}>
          <option value="all">{t("all")}</option>
          {CATS.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
        <Button className="min-h-12" onClick={() => setEditing({ title: "", description: "", date: today(), category: "Family", tags: [] })}>
          {t("addMemory")}
        </Button>
      </div>
      {visible.length === 0 ? <p className="text-muted-foreground">{t("noMemories")}</p> : null}
      <div className="grid gap-4 sm:grid-cols-2">
        {visible.map((m) => (
          <article key={m.id} className="rounded-2xl border bg-card p-5 shadow-sm">
            {m.imageDataUrl ? <img src={m.imageDataUrl} alt="" className="mb-3 max-h-40 w-full rounded-xl object-cover" /> : null}
            <h3 className="text-xl font-bold">{m.title}</h3>
            <p className="text-sm text-muted-foreground">{m.category} · {m.date}</p>
            <p className="mt-2 line-clamp-3">{m.description}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Button variant="secondary" className="min-h-11" onClick={() => setDetail(m)}>{t("overview")}</Button>
              <Button variant="outline" className="min-h-11" onClick={() => setEditing(m)}>{t("edit")}</Button>
              <Button
                variant="destructive"
                className="min-h-11"
                onClick={() => {
                  if (confirm(t("confirmDelete"))) {
                    removeFromList(KEYS.memories, m.id);
                    refresh();
                  }
                }}
              >
                {t("delete")}
              </Button>
            </div>
          </article>
        ))}
      </div>
      {detail ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4" role="dialog">
          <div className="max-h-[90vh] w-full max-w-lg overflow-auto rounded-2xl bg-card p-6">
            <h3 className="text-2xl font-bold">{detail.title}</h3>
            <p className="text-muted-foreground">{detail.category} · {detail.date}</p>
            <p className="mt-3 text-lg">{detail.description}</p>
            {detail.tags.length ? <p className="mt-2 text-sm">{detail.tags.join(", ")}</p> : null}
            <Button className="mt-4 min-h-12" onClick={() => setDetail(null)}>{t("back")}</Button>
          </div>
        </div>
      ) : null}
      {editing ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4" role="dialog">
          <form
            className="w-full max-w-lg space-y-3 rounded-2xl bg-card p-6"
            onSubmit={(e) => {
              e.preventDefault();
              save();
            }}
          >
            <h3 className="text-2xl font-bold">{editing.id ? t("edit") : t("addMemory")}</h3>
            <input className="min-h-12 w-full rounded-xl border px-3" placeholder={t("title")} value={editing.title ?? ""} onChange={(e) => setEditing({ ...editing, title: e.target.value })} required />
            <textarea className="min-h-24 w-full rounded-xl border px-3 py-2" placeholder={t("description")} value={editing.description ?? ""} onChange={(e) => setEditing({ ...editing, description: e.target.value })} />
            <input className="min-h-12 w-full rounded-xl border px-3" type="date" value={editing.date ?? today()} onChange={(e) => setEditing({ ...editing, date: e.target.value })} />
            <select className="min-h-12 w-full rounded-xl border px-3" value={editing.category ?? "Personal"} onChange={(e) => setEditing({ ...editing, category: e.target.value })}>
              {CATS.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
            <input className="min-h-12 w-full rounded-xl border px-3" placeholder={t("tags")} value={(editing.tags ?? []).join(", ")} onChange={(e) => setEditing({ ...editing, tags: e.target.value.split(",").map((x) => x.trim()) })} />
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onload = () => setEditing({ ...editing, imageDataUrl: String(reader.result) });
                reader.readAsDataURL(file);
              }}
            />
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
void saveData;

