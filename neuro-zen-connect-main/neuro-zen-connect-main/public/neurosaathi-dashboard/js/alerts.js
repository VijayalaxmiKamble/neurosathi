/* alerts.js — caregiver alert centre. Alerts are engagement signals, never medical decisions. */
window.PAGE_INIT = function () {
  "use strict";
  const S = NS.storage;
  const sev = document.getElementById("a-sev");
  const state = document.getElementById("a-state");

  const all = () => S.getData(S.KEYS.alerts, []) || [];
  const patientOf = (id) => (S.getData(S.KEYS.patients, []) || []).find((p) => p.id === id) || {};

  const filtered = () => all().filter((a) => {
    const okSev = sev.value === "all" || a.severity === sev.value;
    const okState = state.value === "all" || (state.value === "ack" ? a.acknowledged : !a.acknowledged);
    return okSev && okState;
  });

  const badge = (s) => (s === "HIGH" ? "danger" : s === "MEDIUM" ? "warn" : "info");

  const render = () => {
    const list = filtered();
    const root = document.getElementById("alert-list");
    if (!list.length) { root.innerHTML = `<p class="muted">Nothing here — no alerts match these filters.</p>`; return; }
    root.innerHTML = list.map((a) => {
      const p = patientOf(a.patientId);
      return `<div class="alert-item ${a.severity.toLowerCase()}">
        <div><strong>${a.category}</strong>
          <div class="meta">${a.patient} · ${a.time}${a.acknowledged ? " · acknowledged" : ""}</div>
          <div class="small">${a.message}</div></div>
        <div class="row" style="flex:0;gap:8px;flex-wrap:wrap">
          <span class="badge ${badge(a.severity)}">${a.severity}</span>
          ${a.acknowledged ? "" : `<button class="btn btn-sm" data-ack="${a.id}">✓ Acknowledge</button>`}
          <a class="btn btn-sm btn-outline" href="tel:${(p.emergencyContact || "").replace(/\s/g, "")}">📞 Call</a>
          <a class="btn btn-sm btn-secondary" href="patient-details.html?id=${a.patientId}">View patient</a>
        </div></div>`;
    }).join("");
    root.querySelectorAll("[data-ack]").forEach((b) =>
      b.addEventListener("click", () => {
        S.saveData(S.KEYS.alerts, all().map((x) => (x.id === b.dataset.ack ? Object.assign({}, x, { acknowledged: true }) : x)));
        if (!navigator.onLine) NS.offline.enqueue({ type: "alertAck", payload: { id: b.dataset.ack } });
        NS.showToast("Alert acknowledged.", "success");
        render();
      }));
  };

  document.getElementById("ack-all").addEventListener("click", () => {
    S.saveData(S.KEYS.alerts, all().map((x) => Object.assign({}, x, { acknowledged: true })));
    NS.showToast("All alerts acknowledged.", "success");
    render();
  });
  sev.addEventListener("change", render);
  state.addEventListener("change", render);
  render();
};
