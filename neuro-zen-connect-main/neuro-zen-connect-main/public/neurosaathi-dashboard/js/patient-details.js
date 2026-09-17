/* patient-details.js — one patient: profile, engagement charts, routine and activity log. */
window.PAGE_INIT = function () {
  "use strict";
  const S = NS.storage;
  const GAMES = { memory: "Memory Match", attention: "Attention Tap", pattern: "Pattern Recognition", recall: "Routine Recall" };
  const id = new URLSearchParams(location.search).get("id") || "p-001";
  const patients = S.getData(S.KEYS.patients, []) || [];
  const p = patients.find((x) => x.id === id) || patients[0];
  const root = document.getElementById("pd-root");

  const sessions = (S.getData(S.KEYS.sessions, []) || [])
    .filter((s) => s.patientId === p.id).sort((a, b) => (a.date < b.date ? 1 : -1));
  const avg = NS.ai.byGameAverages(p.id);
  const score = NS.ai.calculateCognitiveEngagement(p.id);
  const ins = NS.ai.generateInsight(p.id);
  const reminders = (S.getData(S.KEYS.reminders, []) || []).filter((r) => r.patientId === p.id);
  const appts = (S.getData(S.KEYS.appointments, []) || []).filter((a) => a.patientId === p.id);

  /** Small SVG bar chart of the last 10 sessions. */
  const spark = () => {
    const list = sessions.slice(0, 10).reverse();
    if (!list.length) return `<p class="muted">No activity recorded yet.</p>`;
    const w = 480, h = 180, pad = 28, bw = (w - pad * 2) / list.length - 8;
    return `<svg class="chart" viewBox="0 0 ${w} ${h}" role="img" aria-label="Accuracy of recent activities">
      <line x1="${pad}" y1="${h - pad}" x2="${w - pad}" y2="${h - pad}" stroke="var(--border)"/>
      ${list.map((s, i) => {
        const bh = (s.accuracy / 100) * (h - pad * 2);
        const x = pad + i * (bw + 8);
        return `<rect x="${x}" y="${h - pad - bh}" width="${bw}" height="${bh}" rx="5" fill="var(--blue)">
          <title>${s.date} · ${GAMES[s.game]} · ${s.accuracy}%</title></rect>`;
      }).join("")}
    </svg>`;
  };

  root.innerHTML = `
    <div class="card" style="margin-bottom:18px">
      <div class="card-head">
        <div class="row" style="gap:12px"><div class="brand-mark" aria-hidden="true">${p.avatar}</div>
          <div><h2 style="margin:0">${p.name}</h2>
            <div class="meta">${p.age} yrs · ${p.gender || ""} · ${p.location} · last active ${p.lastActive}</div></div></div>
        <div class="row" style="flex:0;gap:8px">
          <a class="btn btn-sm btn-outline" href="tel:${(p.emergencyContact || "").replace(/\s/g, "")}">📞 Call caregiver</a>
          <a class="btn btn-sm btn-secondary" href="alerts.html">Alerts</a></div>
      </div>
      <div class="facts"><span>Caregiver: ${p.caregiver}</span><span>Hospital: ${p.hospital}</span>
        <span>Status: ${p.status}</span></div>
    </div>

    <div class="grid grid-4" style="margin-bottom:18px">
      ${[{ v: score, l: "Cognitive Engagement Score" },
         { v: sessions.length, l: "Activities recorded" },
         { v: reminders.filter((r) => r.status === "completed").length + "/" + reminders.length, l: "Reminders completed" },
         { v: appts.length, l: "Appointments" }]
        .map((c) => `<div class="card stat"><span class="value">${c.v}</span><span class="label">${c.l}</span></div>`).join("")}
    </div>

    <div class="grid grid-2" style="margin-bottom:18px">
      <div class="card"><h2>Recent activity accuracy</h2><div class="chart-box">${spark()}</div>
        <p class="small muted">Performance trend only — not a medical assessment.</p></div>
      <div class="card"><h2>Activity balance</h2>
        ${Object.keys(GAMES).map((g) => `<div style="margin-bottom:14px">
          <div class="row" style="justify-content:space-between"><strong>${GAMES[g]}</strong>
            <span class="badge info">${avg[g]}%</span></div>
          <div class="bar"><span style="width:${avg[g]}%"></span></div></div>`).join("")}
      </div>
    </div>

    <div class="grid grid-2" style="margin-bottom:18px">
      <div class="insight"><div class="card-head"><h2>Engagement insight</h2>
        <span class="badge info">Score ${ins.score}</span></div>
        <ul>${ins.lines.map((l) => `<li>${l}</li>`).join("")}</ul>
        <p class="small muted">This platform does not provide medical diagnosis.</p></div>
      <div class="card"><h2>Upcoming appointments</h2><div class="list">
        ${appts.length ? appts.map((a) => `<div class="list-item"><div><strong>${a.doctor}</strong>
          <div class="meta">${a.date} ${a.time} · ${a.hospital}</div></div>
          <span class="badge info">${a.status}</span></div>`).join("")
        : `<p class="muted">No appointments recorded.</p>`}
      </div></div>
    </div>

    <div class="card"><h2>Activity log</h2><div class="list">
      ${sessions.slice(0, 12).map((s) => `<div class="list-item">
        <div><strong>${GAMES[s.game]}</strong>
          <div class="meta">${s.date} · ${s.difficulty} · ${Math.round(s.timeSec / 60)} min · ${s.mistakes} mistakes</div></div>
        <span class="badge ${s.accuracy >= 75 ? "ok" : s.accuracy >= 50 ? "warn" : "info"}">${s.accuracy}%</span>
      </div>`).join("") || `<p class="muted">No sessions yet.</p>`}
    </div></div>`;
};
