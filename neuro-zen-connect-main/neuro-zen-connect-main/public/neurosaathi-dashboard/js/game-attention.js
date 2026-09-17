/* game-attention.js — Attention Tap: tap only the requested object. */
window.PAGE_INIT = function () {
  "use strict";
  const OBJECTS = ["🍎", "🔑", "☕", "🕰️", "📕", "🧢", "🪑", "🧦", "🌂", "🔔", "🍌", "🪥"];
  const gridEl = document.getElementById("object-grid");
  const prompt = document.getElementById("attn-prompt");
  let target = null;

  const round = () => {
    const st = NS.game.state;
    if (st.round >= st.total) { NS.game.finish(); return; }
    st.round += 1;
    NS.game.renderHud();
    const count = st.difficulty === "EASY" ? 6 : st.difficulty === "HARD" ? 12 : 9;
    const pool = [...OBJECTS].sort(() => Math.random() - 0.5).slice(0, count);
    target = pool[Math.floor(Math.random() * pool.length)];
    prompt.textContent = `Tap the ${target} only`;
    gridEl.innerHTML = pool.map((o) => `<button class="obj" data-v="${o}" aria-label="Object ${o}">${o}</button>`).join("");
    gridEl.querySelectorAll(".obj").forEach((b) => b.addEventListener("click", () => pick(b)));
    NS.game.feedback("Take your time and look carefully.", "muted");
  };

  const pick = (btn) => {
    if (btn.dataset.v === target) {
      btn.classList.add("picked");
      NS.game.correct("Yes, that is the " + target + ".");
      setTimeout(round, 700);
    } else {
      NS.game.wrong("That is the " + btn.dataset.v + ". Look for the " + target + ".");
    }
  };

  document.getElementById("hint-btn").addEventListener("click", () => {
    NS.game.hint("The item you need is " + target + ".");
    const t = [...gridEl.querySelectorAll(".obj")].find((b) => b.dataset.v === target);
    if (t) { t.classList.add("picked"); setTimeout(() => t.classList.remove("picked"), 900); }
  });
  document.getElementById("restart-btn").addEventListener("click", () => location.reload());
  NS.game.start({ game: "attention", name: "Attention Tap", total: 8 });
  round();
};
