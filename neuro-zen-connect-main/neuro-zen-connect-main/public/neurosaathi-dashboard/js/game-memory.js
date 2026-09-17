/* game-memory.js — Memory Match card game. */
window.PAGE_INIT = function () {
  "use strict";
  const ICONS = ["🍵", "🌿", "🐘", "🎋", "🥁", "🌸", "🐟", "☂️", "🪔", "🧺"];
  const grid = document.getElementById("memory-grid");
  let first = null, lock = false, pairs = 0, deck = [];

  const build = () => {
    const st = NS.game.start({ game: "memory", name: "Memory Match", total: 0 });
    const count = st.difficulty === "EASY" ? 4 : st.difficulty === "HARD" ? 8 : 6;
    NS.game.state.total = count;
    pairs = 0; first = null; lock = false;
    deck = ICONS.slice(0, count).flatMap((i) => [i, i]).sort(() => Math.random() - 0.5);
    grid.innerHTML = deck.map((icon, i) =>
      `<button class="mem-card" data-i="${i}" data-icon="${icon}" aria-label="Card ${i + 1}, face down">?</button>`).join("");
    grid.querySelectorAll(".mem-card").forEach((c) => c.addEventListener("click", () => flip(c)));
    NS.game.feedback("Find the matching pairs. Take your time.", "muted");
    NS.game.renderHud();
  };

  const flip = (card) => {
    if (lock || card.classList.contains("matched") || card === first) return;
    card.classList.add("flipped");
    card.textContent = card.dataset.icon;
    card.setAttribute("aria-label", "Card showing " + card.dataset.icon);
    if (!first) { first = card; return; }
    lock = true;
    if (first.dataset.icon === card.dataset.icon) {
      first.classList.add("matched"); card.classList.add("matched");
      pairs += 1; NS.game.state.round = pairs;
      NS.game.correct("Matched! " + card.dataset.icon);
      first = null; lock = false;
      if (pairs === NS.game.state.total) setTimeout(NS.game.finish, 700);
    } else {
      NS.game.wrong("Those two are different. Try again.");
      const a = first, b = card;
      first = null;
      setTimeout(() => {
        [a, b].forEach((x) => { x.classList.remove("flipped"); x.textContent = "?"; x.setAttribute("aria-label", "Card face down"); });
        lock = false;
      }, 900);
    }
  };

  document.getElementById("hint-btn").addEventListener("click", () => {
    const hidden = [...grid.querySelectorAll(".mem-card:not(.matched):not(.flipped)")];
    if (!hidden.length) return;
    const c = hidden[0];
    NS.game.hint("One card here is " + c.dataset.icon + ".");
    c.classList.add("flipped"); c.textContent = c.dataset.icon;
    setTimeout(() => { if (!c.classList.contains("matched")) { c.classList.remove("flipped"); c.textContent = "?"; } }, 1200);
  });
  document.getElementById("restart-btn").addEventListener("click", build);
  build();
};
