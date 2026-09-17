/* reminders.js — reminder CRUD, filters, snooze and scheduled notifications. */
window.PAGE_INIT = function () {
  "use strict";
  const S = NS.storage;
  const TYPES = ["MEDICINE", "MEAL", "HYDRATION", "EXERCISE", "COGNITIVE GAME", "APPOINTMENT", "SLEEP", "CUSTOM"];
  const pid = (NS.auth.getSession() || {}).patientId || "p-001";
  const listEl = document.getElementById("reminder-list");
  const typeSel = document.getElementById("filter-type");
  typeSel.innerHTML = `<option value="all">All types</option>` + TYPES.map((t) => `<option>${t}</option>`).join("");

  const get = () => (S.getData(S.KEYS.reminders, []) || []).filter((r) => r.patientId === pid);

  const stats = () => {
    const all = get();
    const cards = [
      { v: all.length, l: "Total reminders" },
      { v: all.filter((r) => r.status === "completed").length, l: "Completed today" },
      { v: all.filter((r) => r.status === "pending").length, l: "Still pending" },
      { v: all.filter((r) => r.status === "missed").length, l: "Missed" },
    ];
    document.getElementById("reminder-stats").innerHTML = cards
      .map((c) => `<div class="card stat"><span class="value">${c.v}</span><span class="label">${c.l}</span></div>`).join("");
  };

  const render = () => {
    const type = typeSel.value, status = document.getElementById("filter-status").value;
    const q = document.getElementById("filter-search").value.trim().toLowerCase();
    const rows = get()
      .filter((r) => (type === "all" || r.type === type) && (status === "all" || r.status === status))
      .filter((r) => !q || (r.title + r.notes).toLowerCase().includes(q))
      .sort((a, b) => a.time.localeCompare(b.time));

    listEl.innerHTML = rows.length ? rows.map((r) => `
      <div class="list-item alert-item ${r.priority === "high" ? "HIGH" : r.priority === "medium" ? "MEDIUM" : "LOW"}">
        <div>
          <strong>${r.time} · ${r.title}</strong>
          <div class="meta">${r.type} · ${r.repeat} · ${r.priority} priority${r.notes ? " · " + r.notes : ""}</div>
        </div>
        <div class="tl-actions">
          <span class="badge ${r.status === "completed" ? "ok" : r.status === "missed" ? "danger" : "warn"}">${r.status}</span>
          ${r.status !== "completed" ? `<button class="btn btn-sm btn-teal" data-done="${r.id}">Done</button>
          <button class="btn btn-sm btn-secondary" data-snooze="${r.id}">Snooze 10m</button>` : ""}
          <button class="icon-btn" data-edit="${r.id}" aria-label="Edit ${r.title}">✏️</button>
          <button class="icon-btn" data-del="${r.id}" aria-label="Delete ${r.title}">🗑️</button>
        </div>
      </div>`).join("") : `<p class="muted">No reminders match these filters.</p>`;

    listEl.querySelectorAll("[data-done]").forEach((b) => b.addEventListener("click", () => {
      S.upsertInList(S.KEYS.reminders, { id: b.dataset.done, status: "completed" });
      if (!navigator.onLine) NS.offline.enqueue({ type: "reminder", payload: { id: b.dataset.done } });
      NS.showToast("Reminder marked complete.", "success"); refresh();
    }));
    listEl.querySelectorAll("[data-snooze]").forEach((b) => b.addEventListener("click", () => {
      const r = get().find((x) => x.id === b.dataset.snooze);
      const [h, m] = r.time.split(":").map(Number);
      const d = new Date(); d.setHours(h, m + 10, 0, 0);
      S.upsertInList(S.KEYS.reminders, { id: r.id, time: String(d.getHours()).padStart(2, "0") + ":" + String(d.getMinutes()).padStart(2, "0") });
      NS.showToast("Snoozed by 10 minutes.", "info"); refresh();
    }));
    listEl.querySelectorAll("[data-del]").forEach((b) => b.addEventListener("click", () => {
      S.removeFromList(S.KEYS.reminders, b.dataset.del);
      NS.showToast("Reminder deleted.", "info"); refresh();
    }));
    listEl.querySelectorAll("[data-edit]").forEach((b) => b.addEventListener("click", () =>
      form(get().find((x) => x.id === b.dataset.edit))));
  };

  const refresh = () => { stats(); render(); };

  const form = (item) => {
    const r = item || { id: "", title: "", type: "MEDICINE", time: "09:00", repeat: "Daily", priority: "medium", notes: "", status: "pending", enabled: true };
    NS.openModal(item ? "Edit reminder" : "Add reminder", `
      <div class="field"><label for="r-title">Title</label><input id="r-title" value="${r.title}"></div>
      <div class="row">
        <div class="field"><label for="r-type">Type</label><select id="r-type">${TYPES.map((t) => `<option ${t === r.type ? "selected" : ""}>${t}</option>`).join("")}</select></div>
        <div class="field"><label for="r-time">Time</label><input id="r-time" type="time" value="${r.time}"></div>
      </div>
      <div class="row">
        <div class="field"><label for="r-repeat">Repeat</label><select id="r-repeat">${["Once", "Daily", "Weekly"].map((x) => `<option ${x === r.repeat ? "selected" : ""}>${x}</option>`).join("")}</select></div>
        <div class="field"><label for="r-priority">Priority</label><select id="r-priority">${["low", "medium", "high"].map((x) => `<option ${x === r.priority ? "selected" : ""}>${x}</option>`).join("")}</select></div>
      </div>
      <div class="field"><label for="r-notes">Notes</label><input id="r-notes" value="${r.notes || ""}"></div>
      <p class="small muted">Medicine names and doses are entered by the caregiver. NeuroSaathi never suggests medication.</p>
      <button class="btn btn-lg btn-block" id="r-save">Save reminder</button>`, (body) => {
      body.querySelector("#r-save").addEventListener("click", () => {
        const title = body.querySelector("#r-title").value.trim();
        if (!title) { NS.showToast("Please enter a title.", "warning"); return; }
        S.upsertInList(S.KEYS.reminders, {
          id: r.id || S.uid("r"), patientId: pid, title,
          type: body.querySelector("#r-type").value, time: body.querySelector("#r-time").value,
          repeat: body.querySelector("#r-repeat").value, priority: body.querySelector("#r-priority").value,
          notes: body.querySelector("#r-notes").value, status: r.status, enabled: true,
        });
        NS.closeModal(); refresh();
        NS.showToast(item ? "Reminder updated." : "Reminder added.", "success");
      });
    });
  };

  document.getElementById("add-reminder").addEventListener("click", () => form(null));
  ["filter-type", "filter-status", "filter-search"].forEach((id) =>
    document.getElementById(id).addEventListener("input", render));

  /** Check every 30s and fire a notification when a pending reminder is due. */
  const fired = {};
  setInterval(() => {
    const now = new Date();
    const hhmm = String(now.getHours()).padStart(2, "0") + ":" + String(now.getMinutes()).padStart(2, "0");
    get().filter((r) => r.status === "pending" && r.time === hhmm && !fired[r.id]).forEach((r) => {
      fired[r.id] = true;
      NS.notify("Reminder: " + r.title, `${r.type} at ${r.time}`);
      if (NS.voice) NS.voice.speakIfEnabled("Reminder: " + r.title);
    });
  }, 30000);

  NS.requestNotificationPermission();
  refresh();
};
