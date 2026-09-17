/* login.js — login page behaviour. */
(function () {
  "use strict";
  let role = "patient";
  const form = document.getElementById("login-form");
  const err = document.getElementById("login-error");
  const langSel = document.getElementById("login-lang");

  langSel.innerHTML = NS.i18n.LANGUAGES.map((l) => `<option value="${l.code}">${l.label}</option>`).join("");
  langSel.value = NS.i18n.getLang();
  langSel.addEventListener("change", () => NS.i18n.setLang(langSel.value));

  if (NS.auth.isAuthenticated()) location.href = NS.auth.homeFor(NS.auth.getSession().role);

  document.querySelectorAll(".tab").forEach((tab) => {
    tab.addEventListener("click", () => {
      document.querySelectorAll(".tab").forEach((t) => {
        t.classList.remove("active");
        t.setAttribute("aria-selected", "false");
      });
      tab.classList.add("active");
      tab.setAttribute("aria-selected", "true");
      role = tab.dataset.role;
      document.getElementById("auth-title").textContent = role === "caregiver" ? "Caregiver sign in" : "Patient sign in";
      document.getElementById("auth-sub").textContent = role === "caregiver"
        ? "Monitor routines, alerts and engagement for everyone in your care."
        : "Large text, big buttons and voice support are on by default.";
    });
  });

  const fill = (u, p, r) => {
    document.getElementById("username").value = u;
    document.getElementById("password").value = p;
    const tab = document.querySelector(`.tab[data-role="${r}"]`);
    if (tab) tab.click();
  };
  document.getElementById("fill-patient").addEventListener("click", () => fill("patient", "patient123", "patient"));
  document.getElementById("fill-caregiver").addEventListener("click", () => fill("caregiver", "care123", "caregiver"));
  document.getElementById("demo-mode").addEventListener("click", () => {
    NS.storage.seed(true);
    NS.auth.login("patient", "patient123", "patient");
    NS.showToast("Sample data loaded.", "success", "Demo mode");
    setTimeout(() => (location.href = "patient.html"), 600);
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    err.textContent = "";
    const u = document.getElementById("username").value;
    const p = document.getElementById("password").value;
    if (!u || !p) { err.textContent = "Please enter both username and password."; return; }
    const res = NS.auth.login(u, p, role);
    if (!res.ok) { err.textContent = res.error; return; }
    NS.storage.updateData(NS.storage.KEYS.settings, { language: langSel.value });
    location.href = NS.auth.homeFor(res.session.role);
  });
})();
