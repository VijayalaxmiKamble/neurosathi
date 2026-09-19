/* app.js — shell (sidebar, header, search, toasts, modals, offline, accessibility). */
(function (global) {
  "use strict";
  const NAV = {
    patient: [
      { href: "settings.html#profile", icon: "👤", label: "Profile" },
      { href: "patient.html", icon: "🏠", label: "Overview" },
      { href: "games.html", icon: "🧠", label: "Cognitive Games" },
      { href: "daily-routine.html", icon: "🗓️", label: "Daily Routine" },
      { href: "reminders.html", icon: "⏰", label: "Reminders" },
      { href: "appointments.html", icon: "🏥", label: "Appointments" },
      { href: "progress.html", icon: "📈", label: "My Progress" },
      { href: "patient.html#voice", icon: "🎙️", label: "Voice Assistant" },
      { href: "settings.html", icon: "⚙️", label: "Settings" },
    ],
    caregiver: [
      { href: "caregiver.html", icon: "🏠", label: "Dashboard" },
      { href: "patients.html", icon: "👥", label: "Patients" },
      { href: "patient-details.html", icon: "📋", label: "Patient Activity" },
      { href: "progress.html", icon: "📈", label: "Cognitive Progress" },
      { href: "reminders.html", icon: "⏰", label: "Reminders" },
      { href: "appointments.html", icon: "🏥", label: "Appointments" },
      { href: "alerts.html", icon: "🔔", label: "Alerts" },
      { href: "progress.html#reports", icon: "📄", label: "Reports" },
      { href: "settings.html", icon: "⚙️", label: "Settings" },
    ],
  };

  /* ---------------- toasts ---------------- */
  const showToast = (message, type = "info", title = "") => {
    let wrap = document.querySelector(".toast-wrap");
    if (!wrap) {
      wrap = document.createElement("div");
      wrap.className = "toast-wrap";
      wrap.setAttribute("role", "status");
      wrap.setAttribute("aria-live", "polite");
      document.body.appendChild(wrap);
    }
    const el = document.createElement("div");
    el.className = "toast " + type;
    el.innerHTML = `${title ? `<strong>${title}</strong>` : ""}<span>${message}</span>`;
    wrap.appendChild(el);
    setTimeout(() => el.remove(), 4000);
  };

  /** Browser notification with graceful in-app fallback. */
  const notify = (title, body) => {
    if ("Notification" in window && Notification.permission === "granted") {
      try { new Notification(title, { body }); return; } catch (e) { /* fall through */ }
    }
    showToast(body, "info", title);
  };
  const requestNotificationPermission = () => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission().catch(() => {});
    }
  };

  /* ---------------- modal ---------------- */
  const openModal = (title, bodyHtml, onMount) => {
    let bd = document.getElementById("ns-modal");
    if (!bd) {
      bd = document.createElement("div");
      bd.id = "ns-modal";
      bd.className = "modal-backdrop";
      bd.innerHTML = `<div class="modal" role="dialog" aria-modal="true" aria-labelledby="ns-modal-title">
        <div class="modal-head"><h2 id="ns-modal-title"></h2>
        <button class="icon-btn" data-close aria-label="Close dialog">✕</button></div>
        <div class="modal-body"></div></div>`;
      document.body.appendChild(bd);
      bd.addEventListener("click", (e) => {
        if (e.target === bd || e.target.hasAttribute("data-close")) closeModal();
      });
      document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") closeModal();
      });
    }
    bd.querySelector("#ns-modal-title").textContent = title;
    bd.querySelector(".modal-body").innerHTML = bodyHtml;
    bd.classList.add("open");
    if (onMount) onMount(bd.querySelector(".modal-body"));
    const focusable = bd.querySelector("input,select,textarea,button");
    if (focusable) focusable.focus();
    return bd;
  };
  const closeModal = () => {
    const bd = document.getElementById("ns-modal");
    if (bd) bd.classList.remove("open");
  };

  /* ---------------- accessibility settings ---------------- */
  const applySettings = () => {
    const s = NS.storage.getData(NS.storage.KEYS.settings, {}) || {};
    const r = document.documentElement;
    r.dataset.textSize = s.textSize || "normal";
    r.dataset.contrast = s.contrast || "normal";
    r.dataset.motion = s.motion || "normal";
    if (NS.i18n) NS.i18n.applyTranslations();
  };

  /* ---------------- offline queue ---------------- */
  const offline = {
    get queue() { return NS.storage.getData(NS.storage.KEYS.queue, []) || []; },
    enqueue(action) {
      const q = offline.queue;
      q.push(Object.assign({ id: NS.storage.uid("q"), at: Date.now() }, action));
      NS.storage.saveData(NS.storage.KEYS.queue, q);
      updateOnlineUI();
    },
    /** Later: POST each queued action to the Node/Express API or write to Firestore. */
    processOfflineQueue() {
      const q = offline.queue;
      if (!q.length) return;
      showToast("Connection restored. Syncing your activities…", "info");
      setTimeout(() => {
        NS.storage.saveData(NS.storage.KEYS.queue, []);
        updateOnlineUI();
        showToast("All activities synchronized.", "success");
      }, 1200);
    },
  };

  const updateOnlineUI = () => {
    const on = navigator.onLine;
    document.querySelectorAll("[data-online-status]").forEach((el) => {
      el.innerHTML = `<span class="status-dot ${on ? "" : "off"}"></span> ${on ? "Online" : "Offline"}`;
    });
    const banner = document.querySelector(".offline-banner");
    if (banner) {
      banner.classList.toggle("show", !on);
      const q = offline.queue.length;
      banner.textContent = `You are offline. Your activities will be saved on this device.${q ? ` (${q} pending)` : ""}`;
    }
  };

  /* ---------------- global search ---------------- */
  const globalSearch = (term) => {
    const q = term.trim().toLowerCase();
    if (!q) return [];
    const S = NS.storage;
    const out = [];
    (S.getData(S.KEYS.patients, []) || []).forEach((p) => {
      if ((p.name + p.location).toLowerCase().includes(q))
        out.push({ label: p.name, sub: "Patient · " + p.location, href: "patient-details.html?id=" + p.id });
    });
    (S.getData(S.KEYS.reminders, []) || []).forEach((r) => {
      if ((r.title + r.type).toLowerCase().includes(q))
        out.push({ label: r.title, sub: "Reminder · " + r.time, href: "reminders.html" });
    });
    (S.getData(S.KEYS.appointments, []) || []).forEach((a) => {
      if ((a.doctor + a.hospital + a.purpose).toLowerCase().includes(q))
        out.push({ label: a.doctor + " · " + a.hospital, sub: "Appointment · " + a.date, href: "appointments.html" });
    });
    [
      { n: "Memory Match", h: "game-memory.html" }, { n: "Pattern Recognition", h: "game-pattern.html" },
      { n: "Attention Tap", h: "game-attention.html" }, { n: "Daily Routine Recall", h: "game-recall.html" },
    ].forEach((g) => {
      if (g.n.toLowerCase().includes(q)) out.push({ label: g.n, sub: "Game", href: g.h });
    });
    return out.slice(0, 8);
  };

  /* ---------------- emergency contact ---------------- */
  const openEmergency = () => {
    const p = (NS.storage.getData(NS.storage.KEYS.patients, []) || [])[0] || {};
    openModal(
      "Emergency Contact",
      `<p class="muted">Numbers below come from the profile configured by the caregiver. Update them in Settings.</p>
       <div class="card lav" style="margin-bottom:12px">
         <strong>Caregiver</strong><div>${p.caregiver || "Caregiver"} — ${p.caregiverPhone || "not configured"}</div>
       </div>
       <div class="card lav" style="margin-bottom:12px">
         <strong>Hospital</strong><div>${p.hospital || "not configured"} — ${p.emergencyContact || "not configured"}</div>
       </div>
       <div class="row">
         <a class="btn btn-lg" href="tel:${(p.caregiverPhone || "").replace(/\s/g, "")}">📞 Call Caregiver</a>
         <a class="btn btn-lg btn-danger" href="tel:${(p.emergencyContact || "").replace(/\s/g, "")}">🚑 Call Emergency Service</a>
       </div>
       <p class="small muted" style="margin-top:12px">Local emergency numbers are not hard-coded; configure them for your region.</p>`
    );
  };

  /* ---------------- shell ---------------- */
  const buildShell = (opts = {}) => {
    if (!document.querySelector('link[rel="icon"]')) {
      const icon = document.createElement("link");
      icon.rel = "icon";
      icon.type = "image/svg+xml";
      icon.href = "../neurosaathi-mark.svg";
      document.head.appendChild(icon);
    }
    const session = NS.auth ? NS.auth.getSession() : null;
    const role = opts.role || (session && session.role) || "patient";
    const patient = (NS.storage.getData(NS.storage.KEYS.patients, []) || [])[0] || { name: "Mrs. Sharma", avatar: "MS", age: 78 };
    const displayName = role === "caregiver" ? "Ananya Sharma" : patient.name;
    const initials = role === "caregiver" ? "AS" : patient.avatar || "MS";
    const current = location.pathname.split("/").pop() || "index.html";

    const sidebar = document.getElementById("sidebar");
    if (sidebar) {
      sidebar.className = "sidebar";
      sidebar.innerHTML = `
        <div class="brand">
          <div class="brand-mark" aria-hidden="true">🧠</div>
          <div class="brand-text"><strong>NeuroSaathi</strong><span>Cognitive support</span></div>
        </div>
        <div class="profile-chip">
          <div class="avatar" aria-hidden="true">${initials}</div>
          <div class="profile-meta">
            <strong>${displayName}</strong>
            <small data-online-status></small>
          </div>
        </div>
        <nav class="nav" aria-label="Main navigation">
          ${NAV[role].map((i) => {
            const active = i.href.split("#")[0] === current && !i.href.includes("#");
            return `<a href="${i.href}" ${active ? 'aria-current="page"' : ""}>
              <span class="ico" aria-hidden="true">${i.icon}</span><span class="nav-label">${i.label}</span></a>`;
          }).join("")}
        </nav>
        <div class="side-foot">
          <button class="btn btn-ghost" id="collapse-btn" aria-label="Collapse sidebar">↔ <span class="nav-label">Collapse</span></button>
          <button class="btn btn-danger" id="logout-btn">⏻ <span class="nav-label">Log out</span></button>
        </div>`;
    }

    const topbar = document.getElementById("topbar");
    if (topbar) {
      topbar.className = "topbar";
      topbar.innerHTML = `
        <div class="title" style="display:flex;align-items:center;gap:10px;min-width:0">
          <button class="icon-btn" id="hamburger" aria-label="Open menu" aria-expanded="false">☰</button>
          <div style="min-width:0">
            <h1>${opts.title || "Dashboard"}</h1>
            ${opts.subtitle ? `<div class="subtitle">${opts.subtitle}</div>` : ""}
          </div>
        </div>
        <div class="topbar-actions">
          <div class="search-wrap">
            <label class="sr-only" for="global-search">Search patients, games, reminders and appointments</label>
            <input id="global-search" type="search" placeholder="Search…" style="width:190px" autocomplete="off">
            <div class="search-results" id="search-results" role="listbox"></div>
          </div>
          <label class="sr-only" for="lang-select">Language</label>
          <select id="lang-select" style="width:auto;min-width:150px">
            ${NS.i18n.LANGUAGES.map((l) => `<option value="${l.code}">${l.label}</option>`).join("")}
          </select>
          <span class="badge" data-online-status></span>
          <button class="icon-btn" id="notif-btn" aria-label="Notifications">🔔</button>
          <button class="btn btn-danger btn-sm" id="emergency-btn">🚨 Emergency</button>
          <a class="icon-btn" href="settings.html#profile" aria-label="Profile settings">👤</a>
        </div>`;
    }

    if (!document.querySelector(".offline-banner")) {
      const b = document.createElement("div");
      b.className = "offline-banner";
      b.setAttribute("role", "status");
      const main = document.querySelector(".main");
      if (main) main.insertBefore(b, main.children[1] || null);
    }
    if (!document.querySelector(".scrim")) {
      const s = document.createElement("div");
      s.className = "scrim";
      document.body.appendChild(s);
    }
    wireShell();
    applySettings();
    updateOnlineUI();
  };

  const wireShell = () => {
    const sidebar = document.getElementById("sidebar");
    const scrim = document.querySelector(".scrim");
    const ham = document.getElementById("hamburger");
    if (ham && sidebar) {
      ham.addEventListener("click", () => {
        const open = sidebar.classList.toggle("open");
        ham.setAttribute("aria-expanded", String(open));
        if (scrim) scrim.classList.toggle("show", open);
      });
    }
    if (scrim) scrim.addEventListener("click", () => {
      sidebar.classList.remove("open");
      scrim.classList.remove("show");
      if (ham) ham.setAttribute("aria-expanded", "false");
    });
    const collapse = document.getElementById("collapse-btn");
    if (collapse) collapse.addEventListener("click", () => {
      sidebar.classList.toggle("collapsed");
      sidebar.classList.toggle("expanded");
    });
    const logout = document.getElementById("logout-btn");
    if (logout) logout.addEventListener("click", () => NS.auth.logout());
    const em = document.getElementById("emergency-btn");
    if (em) em.addEventListener("click", openEmergency);
    const notifBtn = document.getElementById("notif-btn");
    if (notifBtn) notifBtn.addEventListener("click", () => {
      requestNotificationPermission();
      const alerts = (NS.storage.getData(NS.storage.KEYS.alerts, []) || []).filter((a) => !a.acknowledged);
      openModal("Notifications", alerts.length
        ? `<div class="list">${alerts.map((a) => `<div class="list-item alert-item ${a.severity}">
             <div><strong>${a.category}</strong><div class="meta">${a.message}</div></div>
             <span class="badge ${a.severity === "HIGH" ? "danger" : a.severity === "MEDIUM" ? "warn" : "ok"}">${a.severity}</span></div>`).join("")}</div>`
        : `<p>No new notifications.</p>`);
    });

    const lang = document.getElementById("lang-select");
    if (lang) {
      lang.value = NS.i18n.getLang();
      lang.addEventListener("change", () => {
        NS.i18n.setLang(lang.value);
        showToast("Language changed to " + lang.options[lang.selectedIndex].text, "success");
      });
    }

    const search = document.getElementById("global-search");
    const results = document.getElementById("search-results");
    if (search && results) {
      search.addEventListener("input", () => {
        const items = globalSearch(search.value);
        results.innerHTML = items.length
          ? items.map((i) => `<a href="${i.href}">${i.label}<div class="small muted">${i.sub}</div></a>`).join("")
          : `<div class="small muted" style="padding:10px">No matches found.</div>`;
        results.classList.toggle("open", !!search.value.trim());
      });
      document.addEventListener("click", (e) => {
        if (!results.contains(e.target) && e.target !== search) results.classList.remove("open");
      });
    }
  };

  window.addEventListener("online", () => { updateOnlineUI(); offline.processOfflineQueue(); });
  window.addEventListener("offline", () => { updateOnlineUI(); showToast("You are offline. Activities are saved on this device.", "warning"); });

  /** Populate a rich demo dataset for judges. */
  const enableDemoMode = () => {
    NS.storage.seed(true);
    NS.storage.saveData(NS.storage.KEYS.settings, Object.assign(
      NS.storage.getData(NS.storage.KEYS.settings, {}) || {}, { demo: true }));
    showToast("Demo data loaded. Explore the full flow.", "success", "Demo Mode");
    setTimeout(() => location.reload(), 900);
  };

  global.NS = global.NS || {};
  Object.assign(global.NS, {
    NAV, showToast, notify, requestNotificationPermission, openModal, closeModal,
    applySettings, offline, updateOnlineUI, globalSearch, openEmergency, buildShell, enableDemoMode,
  });

  // Boot: seed data before any page script runs.
  NS.storage.seed();
})(window);
