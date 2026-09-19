/* login.js — login page behaviour. */
(function () {
  "use strict";
  let role = "patient";
  const form = document.getElementById("login-form");
  const err = document.getElementById("login-error");
  const langSel = document.getElementById("login-lang");
  const usernameInput = document.getElementById("username");
  const passwordInput = document.getElementById("password");
  const submitButton = form.querySelector("button[type='submit']");
  const rememberToggle = document.getElementById("remember-me");
  const togglePasswordBtn = document.getElementById("toggle-password");
  const rememberKey = "ns:remembered-user";

  const setError = (message) => {
    err.textContent = message || "";
    err.style.opacity = message ? "1" : "0";
  };

  const updateSubmitState = () => {
    const hasValues = usernameInput.value.trim() && passwordInput.value.trim();
    submitButton.disabled = !hasValues;
    submitButton.style.opacity = hasValues ? "1" : "0.7";
  };

  const setRole = (nextRole) => {
    role = nextRole;
    document.querySelectorAll(".tab").forEach((tab) => {
      const active = tab.dataset.role === nextRole;
      tab.classList.toggle("active", active);
      tab.setAttribute("aria-selected", String(active));
      tab.tabIndex = active ? 0 : -1;
    });

    document.getElementById("auth-title").textContent =
      role === "caregiver" ? "Caregiver sign in" : "Patient sign in";
    document.getElementById("auth-sub").textContent =
      role === "caregiver"
        ? "Monitor routines, alerts and engagement for everyone in your care."
        : "Large text, big buttons and voice support are on by default.";
  };

  const buildLanguageOptions = () => {
    langSel.innerHTML = NS.i18n.LANGUAGES.map(
      (l) => `<option value="${l.code}">${l.label}</option>`,
    ).join("");
    const preferred = NS.i18n.getLang();
    langSel.value = preferred;
    document.documentElement.lang = preferred;
  };

  const setRememberedUser = () => {
    const remembered = localStorage.getItem(rememberKey);
    if (remembered) {
      try {
        const parsed = JSON.parse(remembered);
        if (parsed && parsed.username) {
          usernameInput.value = parsed.username;
          rememberToggle.checked = true;
        }
      } catch (e) {
        localStorage.removeItem(rememberKey);
      }
    }
  };

  const persistRememberedUser = () => {
    if (rememberToggle.checked && usernameInput.value.trim()) {
      localStorage.setItem(rememberKey, JSON.stringify({ username: usernameInput.value.trim() }));
    } else {
      localStorage.removeItem(rememberKey);
    }
  };

  buildLanguageOptions();
  NS.storage.seed(true);

  if (NS.auth.isAuthenticated()) {
    location.href = NS.auth.homeFor(NS.auth.getSession().role);
  }

  setRememberedUser();
  updateSubmitState();

  document.querySelectorAll(".tab").forEach((tab) => {
    tab.addEventListener("click", () => setRole(tab.dataset.role));
    tab.addEventListener("keydown", (event) => {
      if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
        event.preventDefault();
        const tabs = Array.from(document.querySelectorAll(".tab"));
        const idx = tabs.indexOf(tab);
        const next = tabs[(idx + (event.key === "ArrowRight" ? 1 : -1) + tabs.length) % tabs.length];
        next.focus();
        setRole(next.dataset.role);
      }
    });
  });

  const fill = (u, p, r) => {
    usernameInput.value = u;
    passwordInput.value = p;
    setRole(r);
    setError("");
    rememberToggle.checked = r === "patient" || u === "caregiver";
    persistRememberedUser();
    updateSubmitState();
  };

  usernameInput.addEventListener("input", () => {
    setError("");
    if (rememberToggle.checked) persistRememberedUser();
    updateSubmitState();
  });

  passwordInput.addEventListener("input", () => {
    setError("");
    updateSubmitState();
  });

  rememberToggle.addEventListener("change", () => {
    if (rememberToggle.checked && usernameInput.value.trim()) {
      persistRememberedUser();
    } else {
      localStorage.removeItem(rememberKey);
    }
  });

  togglePasswordBtn.addEventListener("click", () => {
    const isPassword = passwordInput.type === "password";
    passwordInput.type = isPassword ? "text" : "password";
    togglePasswordBtn.textContent = isPassword ? "Hide" : "Show";
    togglePasswordBtn.setAttribute("aria-label", isPassword ? "Hide password" : "Show password");
    togglePasswordBtn.setAttribute("aria-pressed", String(isPassword));
    passwordInput.focus();
  });

  langSel.addEventListener("change", () => {
    const nextLang = langSel.value;
    NS.i18n.setLang(nextLang);
    document.documentElement.lang = nextLang;
  });

  document.getElementById("fill-patient").addEventListener("click", () => fill("patient", "patient123", "patient"));
  document.getElementById("fill-caregiver").addEventListener("click", () => fill("caregiver", "care123", "caregiver"));

  document.getElementById("demo-mode").addEventListener("click", () => {
    NS.storage.seed(true);
    const session = NS.auth.login("patient", "patient123", "patient");
    if (session.ok) {
      NS.showToast("Sample data loaded.", "success", "Demo mode");
      setTimeout(() => (location.href = "patient.html"), 600);
    }
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const u = usernameInput.value.trim();
    const p = passwordInput.value;

    if (!u || !p) {
      setError("Please enter both username and password.");
      return;
    }

    const res = NS.auth.login(u, p, role);
    if (!res.ok) {
      setError(res.error);
      return;
    }

    persistRememberedUser();
    NS.storage.updateData(NS.storage.KEYS.settings, { language: langSel.value });
    setError("");
    location.href = NS.auth.homeFor(res.session.role);
  });
})();
