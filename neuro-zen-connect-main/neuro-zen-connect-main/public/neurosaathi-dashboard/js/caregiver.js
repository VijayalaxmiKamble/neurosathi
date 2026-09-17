/* caregiver.js — caregiver overview dashboard. */
window.PAGE_INIT = function () {
  "use strict";
  const S = NS.storage;
  const patients = S.getData(S.KEYS.patients, []) || [];

  const renderStats = () => {
    const alerts = (S.getData(S.KEYS.alerts, []) || []).filter((a) => !a.acknowledged);
    const reminders = S.getData(S.KEYS.reminders, []) || [];
    const avg = Math.round(patients.reduce((a, p) => a + NS.ai.calculateCognitiveEngagement(p.id), 0) / Math.max(1, patients.length));
    const cards = [
      { v: patients.length, l: "Patients in your care" },
      { v: alerts.length, l: "Open alerts" },
      { v: avg, l: "Average engagement" },
      { v: reminders.filter((r) => r.status === "completed").length + "/" + reminders.length, l: "Reminders done today" },
    ];
    document.getElementById("care-stats").innerHTML = cards
      .map((c) => `<div class="card stat"><span class="value">${c.v}</span><span class="label">${c.l}</span></div>`).join("");
  };

  const statusClass = (s) => (s === "Active" ? "ok" : s === "Needs Attention" ? "warn" : "info");

  const renderPatients = () => {
    document.getElementById("care-patients").innerHTML = patients.map((p) => `
      <div class="list-item">
        <div><strong>${p.name}</strong>
          <div class="meta">${p.age} yrs · ${p.location} · active ${p.lastActive}</div></div>
        <div class="row" style="flex:0;gap:8px">
          <span class="badge ${statusClass(p.status)}">${p.status}</span>
          <span class="badge info">${NS.ai.calculateCognitiveEngagement(p.id)}</span>
          <a class="btn btn-sm btn-secondary" href="patient-details.html?id=${p.id}">View</a>
        </div>
      </div>`).join("");
  };

  const renderAlerts = () => {
    const list = (S.getData(S.KEYS.alerts, []) || []).slice(0, 4);
    document.getElementById("care-alerts").innerHTML = list.length
      ? list.map((a) => `<div class="alert-item ${a.severity.toLowerCase()}">
          <div><strong>${a.category}</strong><div class="meta">${a.patient} · ${a.time}</div>
          <div class="small">${a.message}</div></div>
          <span class="badge ${a.severity === "HIGH" ? "danger" : a.severity === "MEDIUM" ? "warn" : "info"}">${a.severity}</span>
        </div>`).join("")
      : `<p class="muted">No alerts right now.</p>`;
  };

  const renderInsight = () => {
    const ins = NS.ai.generateInsight("p-001");
    document.getElementById("care-insight").innerHTML = `
      <div class="card-head"><h2>Engagement insight</h2><span class="badge info">Score ${ins.score}</span></div>
      <ul>${ins.lines.map((l) => `<li>${l}</li>`).join("")}</ul>
      <a class="btn btn-secondary" style="margin-top:12px" href="progress.html#reports">📄 Open reports</a>
      <p class="small muted" style="margin-top:10px">This platform does not provide medical diagnosis.</p>`;
  };

  const renderReminders = () => {
    const rem = (S.getData(S.KEYS.reminders, []) || []).slice(0, 6);
    document.getElementById("care-reminders").innerHTML = rem.map((r) => `
      <div class="list-item"><div><strong>${r.title}</strong>
        <div class="meta">${r.type} · ${r.time}</div></div>
        <span class="badge ${r.status === "completed" ? "ok" : "warn"}">${r.status === "completed" ? "✓ Done" : "Pending"}</span>
      </div>`).join("");
  };

  renderStats(); renderPatients(); renderAlerts(); renderInsight(); renderReminders();
};
