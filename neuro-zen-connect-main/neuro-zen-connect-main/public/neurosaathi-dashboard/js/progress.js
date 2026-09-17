/* progress.js — engagement trends, activity balance and exportable reports.
   Charts are hand-drawn SVG: no external chart library. */
window.PAGE_INIT = function () {
  "use strict";
  const S = NS.storage;
  const GAMES = { memory: "Memory Match", attention: "Attention Tap", pattern: "Pattern Recognition", recall: "Routine Recall" };

  const patients = S.getData(S.KEYS.patients, []) || [];
  const sel = document.getElementById("patient-select");
  const range = document.getElementById("range");
  const session = NS.auth.getSession() || {};
  const isCaregiver = session.role === "caregiver";

  sel.innerHTML = (isCaregiver ? patients : patients.slice(0, 1))
    .map((p) => `<option value="${p.id}">${p.name}</option>`).join("");
  if (!isCaregiver) sel.disabled = true;

  const current = () => ({ pid: sel.value || "p-001", days: Number(range.value) });

  const sessionsFor = (pid, days) => {
    const from = S.dateOffset(-days);
    return (S.getData(S.KEYS.sessions, []) || [])
      .filter((s) => s.patientId === pid && s.date >= from)
      .sort((a, b) => (a.date < b.date ? -1 : 1));
  };

  const renderStats = (list, pid) => {
    const avg = list.length ? Math.round(list.reduce((a, s) => a + s.accuracy, 0) / list.length) : 0;
    const done = list.filter((s) => s.completed).length;
    const mins = Math.round(list.reduce((a, s) => a + s.timeSec, 0) / 60);
    const cards = [
      { v: NS.ai.calculateCognitiveEngagement(pid), l: "Cognitive Engagement Score" },
      { v: avg + "%", l: "Average accuracy" },
      { v: done, l: "Activities completed" },
      { v: mins + " min", l: "Time engaged" },
    ];
    document.getElementById("progress-stats").innerHTML = cards
      .map((c) => `<div class="card stat"><span class="value">${c.v}</span><span class="label">${c.l}</span></div>`).join("");
  };

  /** Simple responsive SVG line chart of accuracy over time. */
  const renderLine = (list) => {
    const box = document.getElementById("chart-line");
    if (!list.length) { box.innerHTML = `<p class="muted">No activity recorded in this period yet.</p>`; return; }
    const w = 520, h = 220, pad = 34;
    const pts = list.map((s, i) => {
      const x = pad + (i * (w - pad * 2)) / Math.max(1, list.length - 1);
      const y = h - pad - (s.accuracy / 100) * (h - pad * 2);
      return { x, y, s };
    });
    const path = pts.map((p, i) => `${i ? "L" : "M"}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");
    const grid = [0, 25, 50, 75, 100].map((v) => {
      const y = h - pad - (v / 100) * (h - pad * 2);
      return `<line x1="${pad}" y1="${y}" x2="${w - pad}" y2="${y}" stroke="var(--border)"></line>
        <text x="6" y="${y + 4}" font-size="11" fill="var(--muted)">${v}</text>`;
    }).join("");
    box.innerHTML = `<svg class="chart" viewBox="0 0 ${w} ${h}" role="img"
        aria-label="Accuracy trend across recorded activities">
      ${grid}
      <path d="${path}" fill="none" stroke="var(--blue)" stroke-width="3" stroke-linejoin="round"/>
      ${pts.map((p) => `<circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="4" fill="var(--teal)"><title>${p.s.date} · ${GAMES[p.s.game]} · ${p.s.accuracy}%</title></circle>`).join("")}
    </svg>
    <p class="small muted">Performance trend across ${list.length} recorded activities. Engagement signals only — not a medical assessment.</p>`;
  };

  const renderBars = (pid) => {
    const avg = NS.ai.byGameAverages(pid);
    document.getElementById("game-bars").innerHTML = Object.keys(GAMES).map((g) => `
      <div style="margin-bottom:14px">
        <div class="row" style="justify-content:space-between"><strong>${GAMES[g]}</strong><span class="badge info">${avg[g]}%</span></div>
        <div class="bar"><span style="width:${avg[g]}%"></span></div>
      </div>`).join("");
  };

  const renderReport = (list, pid) => {
    const p = patients.find((x) => x.id === pid) || {};
    const ins = NS.ai.generateInsight(pid);
    document.getElementById("report-summary").innerHTML = `
      <h3>${p.name} — engagement summary</h3>
      <ul>${ins.lines.map((l) => `<li>${l}</li>`).join("")}</ul>
      <p class="small muted">${list.length} activities in the selected period. This platform does not provide medical diagnosis.</p>`;
  };

  const download = (name, text, mime) => {
    const url = URL.createObjectURL(new Blob([text], { type: mime }));
    const a = document.createElement("a");
    a.href = url; a.download = name; a.click();
    URL.revokeObjectURL(url);
    NS.showToast("Report downloaded.", "success");
  };

  const draw = () => {
    const { pid, days } = current();
    const list = sessionsFor(pid, days);
    renderStats(list, pid); renderLine(list); renderBars(pid); renderReport(list, pid);
  };

  document.getElementById("export-json").addEventListener("click", () => {
    const { pid, days } = current();
    download(`neurosaathi-report-${pid}.json`, JSON.stringify({
      patient: patients.find((p) => p.id === pid), rangeDays: days,
      engagementScore: NS.ai.calculateCognitiveEngagement(pid),
      byActivity: NS.ai.byGameAverages(pid), sessions: sessionsFor(pid, days),
      disclaimer: "Engagement insights only. This platform does not provide medical diagnosis.",
    }, null, 2), "application/json");
  });

  document.getElementById("export-csv").addEventListener("click", () => {
    const { pid, days } = current();
    const rows = [["date", "activity", "accuracy", "attempts", "mistakes", "seconds", "difficulty", "completed"]]
      .concat(sessionsFor(pid, days).map((s) => [s.date, GAMES[s.game], s.accuracy, s.attempts, s.mistakes, s.timeSec, s.difficulty, s.completed]));
    download(`neurosaathi-report-${pid}.csv`, rows.map((r) => r.join(",")).join("\n"), "text/csv");
  });

  document.getElementById("print-report").addEventListener("click", () => window.print());
  range.addEventListener("change", draw);
  sel.addEventListener("change", draw);
  draw();
  if (location.hash === "#reports") document.getElementById("reports").focus();
};
