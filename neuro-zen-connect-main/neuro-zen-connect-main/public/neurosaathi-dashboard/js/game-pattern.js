/* game-pattern.js — Pattern Recognition: choose the item that continues the sequence. */
window.PAGE_INIT = function () {
  "use strict";
  const SETS = [
    ["🔵", "🟡"], ["🌸", "🍃"], ["⭐", "🌙"], ["🔺", "🔷"], ["🥁", "🎺"],
  ];
  const strip = document.getElementById("seq-strip");
  const choices = document.getElementById("choice-row");
  let answer = null;

  const round = () => {
    const st = NS.game.state;
    if (st.round >= st.total) { NS.game.finish(); return; }
    st.round += 1;
    NS.game.renderHud();
    const set = SETS[Math.floor(Math.random() * SETS.length)];
    const period = st.difficulty === "EASY" ? 2 : st.difficulty === "HARD" ? 3 : 2;
    const symbols = period === 3 ? [set[0], set[1], "🟣"] : set;
    const length = st.difficulty === "HARD" ? 7 : st.difficulty === "MEDIUM" ? 6 : 4;
    const seq = Array.from({ length }, (_, i) => symbols[i % symbols.length]);
    answer = symbols[length % symbols.length];
    strip.innerHTML = seq.map((s) => `<span>${s}</span>`).join("") + `<span aria-label="missing item">❓</span>`;
    const opts = Array.from(new Set([answer, ...symbols, "🔶", "🍀"])).slice(0, 4).sort(() => Math.random() - 0.5);
    choices.innerHTML = opts.map((o) => `<button class="choice" data-v="${o}" aria-label="Choose ${o}">${o}</button>`).join("");
    choices.querySelectorAll(".choice").forEach((b) => b.addEventListener("click", () => pick(b.dataset.v)));
    NS.game.feedback("Which one comes next?", "muted");
  };

  const pick = (v) => {
    if (v === answer) NS.game.correct("Correct! The pattern continues with " + v + ".");
    else NS.game.wrong("The next one was " + answer + ".");
    setTimeout(round, 900);
  };

  const begin = () => {
    NS.game.start({ game: "pattern", name: "Pattern Recognition", total: 6 });
    round();
  };
  document.getElementById("hint-btn").addEventListener("click", () =>
    NS.game.hint("Look at how the first few items repeat in order."));
  document.getElementById("restart-btn").addEventListener("click", () => location.reload());
  begin();
};
