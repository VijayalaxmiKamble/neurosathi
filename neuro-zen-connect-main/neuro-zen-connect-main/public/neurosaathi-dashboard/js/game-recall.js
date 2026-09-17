/* game-recall.js — Daily Routine Recall: reorder the day's activities. */
window.PAGE_INIT = function () {
  "use strict";
  const listEl = document.getElementById("order-list");
  let items = [], solution = [];

  const build = () => {
    const st = NS.game.start({ game: "recall", name: "Daily Routine Recall", total: 1 });
    const routine = (NS.storage.getData(NS.storage.KEYS.routine, []) || []).slice();
    const n = st.difficulty === "EASY" ? 4 : st.difficulty === "HARD" ? 8 : 6;
    solution = routine.slice(0, n);
    items = solution.slice().sort(() => Math.random() - 0.5);
    render();
    NS.game.feedback("Use the arrows to move each activity up or down.", "muted");
  };

  const render = () => {
    listEl.innerHTML = items.map((it, i) => `
      <div class="order-item">
        <span class="num">${i + 1}</span>
        <span>${it.icon} ${it.label}</span>
        <span class="ctrls">
          <button class="icon-btn" data-up="${i}" aria-label="Move ${it.label} up" ${i === 0 ? "disabled" : ""}>▲</button>
          <button class="icon-btn" data-down="${i}" aria-label="Move ${it.label} down" ${i === items.length - 1 ? "disabled" : ""}>▼</button>
        </span>
      </div>`).join("");
    listEl.querySelectorAll("[data-up]").forEach((b) => b.addEventListener("click", () => move(+b.dataset.up, -1)));
    listEl.querySelectorAll("[data-down]").forEach((b) => b.addEventListener("click", () => move(+b.dataset.down, 1)));
  };

  const move = (i, d) => {
    const j = i + d;
    if (j < 0 || j >= items.length) return;
    [items[i], items[j]] = [items[j], items[i]];
    render();
  };

  document.getElementById("check-order").addEventListener("click", () => {
    const right = items.filter((it, i) => it.id === solution[i].id).length;
    NS.game.state.score = right;
    NS.game.state.mistakes = items.length - right;
    NS.game.state.attempts = items.length;
    NS.game.state.round = 1;
    NS.game.renderHud();
    if (right === items.length) NS.game.feedback("Perfect order! Well remembered.", "ok");
    else NS.game.feedback(`${right} of ${items.length} activities are in the right place.`, "bad");
    setTimeout(NS.game.finish, 900);
  });

  document.getElementById("hint-btn").addEventListener("click", () =>
    NS.game.hint("The first activity of the day is " + solution[0].label + " at " + solution[0].time + "."));
  document.getElementById("restart-btn").addEventListener("click", build);
  build();
};
