/* patient.js — patient home dashboard. */
window.PAGE_INIT = function () {
  "use strict";
  const S = NS.storage;
  const patient = (S.getData(S.KEYS.patients, []) || [])[0];

  const greet = () => {
    const h = new Date().getHours();
    return h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening";
  };

  const renderGreeting = () => {
    const dateStr = new Date().toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "long", year: "numeric" });
    document.getElementById("greeting").innerHTML = `
      <div>
        <h1>${greet()}, ${patient.name.split(" ").slice(-1)[0]} 🌞</h1>
        <div class="facts"><span>${dateStr}</span><span>Age ${patient.age}</span><span>${patient.location}</span></div>
      </div>
      <div class="ring teal" style="--p:${NS.ai.calculateCognitiveEngagement(patient.id)}">
        <div class="inner"><b>${NS.ai.calculateCognitiveEngagement(patient.id)}</b><small>engagement</small></div>
      </div>`;
  };

  const renderStats = () => {
    const routine = S.getData(S.KEYS.routine, []) || [];
    const done = routine.filter((r) => r.status === "completed").length;
    const hyd = S.getData(S.KEYS.hydration, { goal: 6, current: 0 });
    const meds = S.getData(S.KEYS.medication, []) || [];
    const sessions = (S.getData(S.KEYS.sessions, []) || []).filter((s) => s.patientId === patient.id && s.date === S.today());
    const cards = [
      { v: `${done}/${routine.length}`, l: "Routine steps done" },
      { v: `${hyd.current}/${hyd.goal}`, l: "Glasses of water" },
      { v: `${meds.filter((m) => m.status === "taken").length}/${meds.length}`, l: "Medicines taken" },
      { v: sessions.length, l: "Activities today" },
    ];
    document.getElementById("quick-stats").innerHTML = cards
      .map((c) => `<div class="card stat"><span class="value">${c.v}</span><span class="label">${c.l}</span></div>`)
      .join("");
  };

  const renderRoutine = () => {
    const routine = S.getData(S.KEYS.routine, []) || [];
    document.getElementById("routine-timeline").innerHTML = routine
      .slice(0, 5)
      .map((t) => `<div class="tl-item ${t.status === "completed" ? "done" : t.status === "now" ? "now" : ""}">
        <div class="tl-time">${t.time}</div>
        <div class="tl-body">
          <div class="tl-title"><span aria-hidden="true">${t.icon}</span>${t.label}</div>
          <div class="tl-actions">
            ${t.status === "completed"
              ? `<span class="badge ok">✓ Done</span>`
              : `<button class="btn btn-sm btn-teal" data-done="${t.id}">Mark done</button>`}
          </div>
        </div></div>`)
      .join("");
    document.querySelectorAll("[data-done]").forEach((b) =>
      b.addEventListener("click", () => {
        const list = (S.getData(S.KEYS.routine, []) || []).map((x) =>
          x.id === b.dataset.done ? Object.assign({}, x, { status: "completed" }) : x);
        S.saveData(S.KEYS.routine, list);
        if (!navigator.onLine) NS.offline.enqueue({ type: "routine", payload: { id: b.dataset.done } });
        NS.showToast("Well done! Activity marked complete.", "success");
        renderRoutine(); renderStats();
      }));
  };

  const renderHydration = () => {
    const hyd = S.getData(S.KEYS.hydration, { date: S.today(), goal: 6, current: 0 });
    document.getElementById("hydration-badge").textContent = `${hyd.current} of ${hyd.goal}`;
    document.getElementById("glasses").innerHTML = Array.from({ length: hyd.goal })
      .map((_, i) => `<button class="glass ${i < hyd.current ? "filled" : ""}" data-i="${i}"
        aria-label="Glass ${i + 1}${i < hyd.current ? ", already recorded" : ""}">💧</button>`).join("");
    document.querySelectorAll(".glass").forEach((g) =>
      g.addEventListener("click", () => {
        const i = Number(g.dataset.i);
        const next = i < hyd.current ? i : i + 1;
        S.saveData(S.KEYS.hydration, Object.assign({}, hyd, { current: next }));
        NS.showToast(next > hyd.current ? "Water recorded. Stay hydrated!" : "Water count updated.", "success");
        renderHydration(); renderStats();
      }));
  };

  const renderMeds = () => {
    const meds = S.getData(S.KEYS.medication, []) || [];
    document.getElementById("medication-list").innerHTML = meds
      .map((m) => `<div class="list-item"><div><strong>${m.label}</strong>
        <div class="meta">${m.medicine} · ${m.time}</div></div>
        ${m.status === "taken"
          ? `<span class="badge ok">✓ Taken</span>`
          : `<button class="btn btn-sm" data-med="${m.id}">Mark taken</button>`}</div>`)
      .join("");
    document.querySelectorAll("[data-med]").forEach((b) =>
      b.addEventListener("click", () => {
        S.saveData(S.KEYS.medication, meds.map((m) => (m.id === b.dataset.med ? Object.assign({}, m, { status: "taken" }) : m)));
        NS.showToast("Medicine check-in saved.", "success");
        renderMeds(); renderStats();
      }));
  };

  const renderInsight = () => {
    const ins = NS.ai.generateInsight(patient.id);
    document.getElementById("ai-insight").innerHTML = `
      <div class="card-head"><h2>Today's suggestion</h2><span class="badge info">Engagement ${ins.score}</span></div>
      <ul>${ins.lines.map((l) => `<li>${l}</li>`).join("")}</ul>
      <a class="btn btn-teal btn-lg" style="margin-top:14px" href="${ins.recommendation.href}">▶ Start ${ins.recommendation.name}</a>
      <p class="small muted" style="margin-top:10px">Engagement signals only — not a medical assessment.</p>`;
  };

  const renderActions = () => {
    const acts = [
      { icon: "🧠", label: "Play a game", href: "games.html" },
      { icon: "⏰", label: "My reminders", href: "reminders.html" },
      { icon: "🏥", label: "Appointments", href: "appointments.html" },
      { icon: "📈", label: "My progress", href: "progress.html" },
    ];
    document.getElementById("quick-actions").innerHTML = acts
      .map((a) => `<a class="btn btn-lg btn-secondary" href="${a.href}">${a.icon} ${a.label}</a>`).join("");
  };

  renderGreeting(); renderStats(); renderRoutine(); renderHydration(); renderMeds(); renderInsight(); renderActions();
  if (NS.voice) NS.voice.init();
  NS.requestNotificationPermission();
  if (location.hash === "#voice") document.getElementById("voice").focus();
};
