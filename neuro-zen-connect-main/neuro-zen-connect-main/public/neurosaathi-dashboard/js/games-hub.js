/* games-hub.js — game selection screen. */
window.PAGE_INIT = function () {
  "use strict";
  const S = NS.storage;
  const pid = (NS.auth.getSession() || {}).patientId || "p-001";
  const GAMES = [
    { key: "memory", name: "Memory Match", emoji: "🃏", href: "game-memory.html", desc: "Find the matching pairs of familiar objects. Builds short-term recall." },
    { key: "pattern", name: "Pattern Recognition", emoji: "🔷", href: "game-pattern.html", desc: "Spot what comes next in a simple repeating sequence." },
    { key: "attention", name: "Attention Tap", emoji: "🎯", href: "game-attention.html", desc: "Find and tap only the object that is asked for." },
    { key: "recall", name: "Daily Routine Recall", emoji: "🗂️", href: "game-recall.html", desc: "Put the day's activities back into the right order." },
  ];

  const rec = NS.ai.recommendGame(pid);
  document.getElementById("recommendation").innerHTML = `
    <div class="card-head"><h2>Suggested for today</h2><span class="badge info">${rec.difficulty}</span></div>
    <p>${rec.reason}</p>
    <a class="btn btn-lg btn-teal" href="${rec.href}">▶ Start ${rec.name}</a>`;

  const avg = NS.ai.byGameAverages(pid);
  document.getElementById("game-list").innerHTML = GAMES.map((g) => `
    <div class="card game-card">
      <span class="emoji" aria-hidden="true">${g.emoji}</span>
      <h3>${g.name}</h3>
      <p class="muted">${g.desc}</p>
      <div class="metric-row"><span>Average accuracy</span><span>${avg[g.key]}%</span></div>
      <div class="bar teal"><span style="width:${avg[g.key]}%"></span></div>
      <div class="btns">
        <a class="btn" href="${g.href}">▶ Play</a>
        <span class="badge">Level: ${NS.ai.currentDifficulty(g.key)}</span>
      </div>
    </div>`).join("");

  const sessions = (S.getData(S.KEYS.sessions, []) || []).filter((s) => s.patientId === pid).slice(-8).reverse();
  document.getElementById("recent-sessions").innerHTML = `
    <thead><tr><th>Date</th><th>Activity</th><th>Accuracy</th><th>Time</th><th>Level</th></tr></thead>
    <tbody>${sessions.length ? sessions.map((s) => `<tr><td>${s.date}</td>
      <td>${(GAMES.find((g) => g.key === s.game) || {}).name || s.game}</td>
      <td>${s.accuracy}%</td><td>${s.timeSec}s</td><td>${s.difficulty}</td></tr>`).join("")
      : `<tr><td colspan="5" class="muted">No sessions recorded yet. Start a game above.</td></tr>`}</tbody>`;
};
