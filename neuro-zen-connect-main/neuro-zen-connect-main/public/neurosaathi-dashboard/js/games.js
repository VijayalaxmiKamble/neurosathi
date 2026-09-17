/* games.js — shared engine for all cognitive activities (HUD, scoring, results, adaptive difficulty). */
(function (global) {
  "use strict";
  const state = {};

  const LEVELS = { EASY: 1, MEDIUM: 2, HARD: 3 };

  const start = (cfg) => {
    Object.assign(state, {
      game: cfg.game,
      name: cfg.name,
      total: cfg.total || 6,
      round: 0,
      score: 0,
      mistakes: 0,
      hints: 0,
      attempts: 0,
      difficulty: NS.ai.currentDifficulty(cfg.game),
      startedAt: Date.now(),
    });
    renderHud();
    return state;
  };

  const renderHud = () => {
    const el = document.getElementById("game-hud");
    if (!el) return;
    el.innerHTML = `
      <span>${state.round}/${state.total}<small>Round</small></span>
      <span>${state.score}<small>Correct</small></span>
      <span>${state.mistakes}<small>Mistakes</small></span>
      <span>${state.difficulty}<small>Level</small></span>
      <span>${Math.round((Date.now() - state.startedAt) / 1000)}s<small>Time</small></span>`;
  };

  const feedback = (msg, kind = "ok") => {
    const el = document.getElementById("feedback");
    if (!el) return;
    el.textContent = msg;
    el.style.color = kind === "ok" ? "var(--teal)" : kind === "bad" ? "var(--orange)" : "var(--muted)";
    if (NS.voice && NS.voice.speakIfEnabled) NS.voice.speakIfEnabled(msg);
  };

  const correct = (msg = "Correct. Well done!") => {
    state.score += 1; state.attempts += 1; feedback(msg, "ok"); renderHud();
  };
  const wrong = (msg = "Not quite — try the next one.") => {
    state.mistakes += 1; state.attempts += 1; feedback(msg, "bad"); renderHud();
  };
  const hint = (msg) => { state.hints += 1; feedback("💡 " + msg, "muted"); renderHud(); };

  /** Finish a session: persist it, adapt difficulty and show the result panel. */
  const finish = () => {
    const timeSec = Math.max(1, Math.round((Date.now() - state.startedAt) / 1000));
    const accuracy = Math.round((state.score / Math.max(1, state.score + state.mistakes)) * 100);
    const { nextDifficulty } = NS.ai.recordSession({
      game: state.game, accuracy, attempts: Math.max(1, state.attempts),
      timeSec, mistakes: state.mistakes, hintsUsed: state.hints, completed: true,
      difficulty: state.difficulty,
    });
    const panel = document.getElementById("result-panel");
    const area = document.getElementById("game-area");
    if (area) area.style.display = "none";
    if (!panel) return;
    panel.classList.add("show");
    panel.innerHTML = `
      <h2>Session complete 🎉</h2>
      <p class="muted">Thank you for practising today. Every session counts.</p>
      <div class="result-grid">
        <div><b>${accuracy}%</b>Accuracy</div>
        <div><b>${state.score}</b>Correct</div>
        <div><b>${state.mistakes}</b>Mistakes</div>
        <div><b>${timeSec}s</b>Time taken</div>
        <div><b>${nextDifficulty}</b>Next level</div>
      </div>
      <p>Next time this activity will start at the <strong>${nextDifficulty.toLowerCase()}</strong> level.</p>
      <div class="row" style="justify-content:center">
        <button class="btn btn-lg btn-teal" id="play-again">🔄 Play again</button>
        <a class="btn btn-lg btn-secondary" href="games.html">Other games</a>
        <a class="btn btn-lg btn-outline" href="progress.html">See my progress</a>
      </div>`;
    document.getElementById("play-again").addEventListener("click", () => location.reload());
    NS.showToast(`${state.name}: ${accuracy}% accuracy recorded.`, "success", "Session saved");
    if (!navigator.onLine) NS.showToast("Saved on this device. It will sync when you are online.", "warning");
  };

  const levelValue = () => LEVELS[state.difficulty] || 2;

  global.NS = global.NS || {};
  global.NS.game = { state, start, renderHud, feedback, correct, wrong, hint, finish, levelValue };
})(window);
