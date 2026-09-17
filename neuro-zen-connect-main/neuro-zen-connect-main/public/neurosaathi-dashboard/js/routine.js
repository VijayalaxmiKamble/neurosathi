/* routine.js — daily routine timeline with editing. */
window.PAGE_INIT = function () {
  "use strict";
  const S = NS.storage;
  const wrap = document.getElementById("routine-full");

  const save = (list) => { S.saveData(S.KEYS.routine, list); render(); };
  const get = () => S.getData(S.KEYS.routine, []) || [];

  const render = () => {
    const list = get().slice().sort((a, b) => a.time.localeCompare(b.time));
    const done = list.filter((x) => x.status === "completed").length;
    const pct = list.length ? Math.round((done / list.length) * 100) : 0;
    document.getElementById("routine-pct").textContent = pct + "%";
    document.getElementById("routine-bar").style.width = pct + "%";
    wrap.innerHTML = list.map((t) => `
      <div class="tl-item ${t.status === "completed" ? "done" : t.status === "now" ? "now" : ""}">
        <div class="tl-time">${t.time}</div>
        <div class="tl-body">
          <div class="tl-title"><span aria-hidden="true">${t.icon}</span>${t.label}
            ${t.status === "now" ? '<span class="badge info">Now</span>' : ""}</div>
          <div class="tl-actions">
            ${t.status === "completed"
              ? `<span class="badge ok">✓ Done</span><button class="btn btn-sm btn-outline" data-undo="${t.id}">Undo</button>`
              : `<button class="btn btn-sm btn-teal" data-done="${t.id}">Mark done</button>`}
            <button class="icon-btn" data-edit="${t.id}" aria-label="Edit ${t.label}">✏️</button>
            <button class="icon-btn" data-del="${t.id}" aria-label="Remove ${t.label}">🗑️</button>
          </div>
        </div></div>`).join("") || `<p class="muted">No activities yet. Add the first one.</p>`;

    wrap.querySelectorAll("[data-done]").forEach((b) => b.addEventListener("click", () => {
      save(get().map((x) => (x.id === b.dataset.done ? Object.assign({}, x, { status: "completed" }) : x)));
      NS.showToast("Activity completed. Great going!", "success");
    }));
    wrap.querySelectorAll("[data-undo]").forEach((b) => b.addEventListener("click", () =>
      save(get().map((x) => (x.id === b.dataset.undo ? Object.assign({}, x, { status: "upcoming" }) : x)))));
    wrap.querySelectorAll("[data-del]").forEach((b) => b.addEventListener("click", () => {
      save(get().filter((x) => x.id !== b.dataset.del));
      NS.showToast("Activity removed.", "info");
    }));
    wrap.querySelectorAll("[data-edit]").forEach((b) => b.addEventListener("click", () =>
      form(get().find((x) => x.id === b.dataset.edit))));
  };

  const form = (item) => {
    const it = item || { id: "", time: "09:00", label: "", icon: "🧠" };
    NS.openModal(item ? "Edit activity" : "Add activity", `
      <div class="field"><label for="f-label">Activity name</label><input id="f-label" value="${it.label}"></div>
      <div class="row">
        <div class="field"><label for="f-time">Time</label><input id="f-time" type="time" value="${it.time}"></div>
        <div class="field"><label for="f-icon">Icon</label>
          <select id="f-icon">${["🧘","🍵","🧠","🌿","🍚","🛏️","👨‍👩‍👧","🍲","💊","🚶"].map((e) => `<option ${e === it.icon ? "selected" : ""}>${e}</option>`).join("")}</select></div>
      </div>
      <button class="btn btn-lg btn-block" id="f-save">Save activity</button>`, (body) => {
      body.querySelector("#f-save").addEventListener("click", () => {
        const label = body.querySelector("#f-label").value.trim();
        if (!label) { NS.showToast("Please enter an activity name.", "warning"); return; }
        const next = {
          id: it.id || S.uid("t"), label, time: body.querySelector("#f-time").value,
          icon: body.querySelector("#f-icon").value, status: item ? it.status : "upcoming",
        };
        S.upsertInList(S.KEYS.routine, next);
        NS.closeModal(); render();
        NS.showToast(item ? "Activity updated." : "Activity added.", "success");
      });
    });
  };

  document.getElementById("add-activity").addEventListener("click", () => form(null));
  document.getElementById("reset-day").addEventListener("click", () => {
    save(get().map((x) => Object.assign({}, x, { status: "upcoming" })));
    NS.showToast("Day reset. All activities are pending again.", "info");
  });
  render();
};
