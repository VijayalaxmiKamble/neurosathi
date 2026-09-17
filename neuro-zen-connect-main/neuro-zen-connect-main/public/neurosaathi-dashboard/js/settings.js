/* settings.js — profile, accessibility, notifications and data controls.
   All preferences persist in LocalStorage; later they move to the user document in Firestore. */
window.PAGE_INIT = function () {
  "use strict";
  const S = NS.storage;
  const get = () => S.getData(S.KEYS.settings, {}) || {};
  const patch = (o) => { S.saveData(S.KEYS.settings, Object.assign({}, get(), o)); NS.applySettings(); };

  const patient = (S.getData(S.KEYS.patients, []) || [])[0] || {};
  const session = NS.auth.getSession() || {};

  /* ---------- profile ---------- */
  document.getElementById("profile-form").innerHTML = `
    <div class="field"><label for="s-name">Name</label><input id="s-name" value="${patient.name || session.name || ""}"></div>
    <div class="field"><label for="s-age">Age</label><input id="s-age" type="number" value="${patient.age || ""}"></div>
    <div class="field"><label for="s-loc">Location</label><input id="s-loc" value="${patient.location || ""}"></div>
    <div class="field"><label for="s-care">Caregiver contact</label><input id="s-care" value="${patient.caregiverPhone || ""}"></div>
    <button class="btn" id="save-profile">Save profile</button>`;
  document.getElementById("save-profile").addEventListener("click", () => {
    S.upsertInList(S.KEYS.patients, {
      id: patient.id, name: document.getElementById("s-name").value.trim(),
      age: Number(document.getElementById("s-age").value),
      location: document.getElementById("s-loc").value.trim(),
      caregiverPhone: document.getElementById("s-care").value.trim(),
    });
    NS.showToast("Profile saved.", "success");
  });

  /* ---------- accessibility ---------- */
  const s = get();
  const langs = NS.i18n.LANGUAGES;
  document.getElementById("a11y-form").innerHTML = `
    <div class="field"><label for="s-lang">Language</label><select id="s-lang">
      ${Object.keys(langs).map((k) => `<option value="${k}" ${s.language === k ? "selected" : ""}>${langs[k]}</option>`).join("")}
    </select></div>
    <div class="field"><label for="s-text">Text size</label><select id="s-text">
      ${["normal", "large", "xlarge"].map((v) => `<option value="${v}" ${s.textSize === v ? "selected" : ""}>${v}</option>`).join("")}
    </select></div>
    <div class="field"><label for="s-contrast">Contrast</label><select id="s-contrast">
      ${["normal", "high"].map((v) => `<option value="${v}" ${s.contrast === v ? "selected" : ""}>${v}</option>`).join("")}
    </select></div>
    <div class="field"><label for="s-motion">Animation</label><select id="s-motion">
      ${["normal", "reduced"].map((v) => `<option value="${v}" ${s.motion === v ? "selected" : ""}>${v}</option>`).join("")}
    </select></div>`;
  document.getElementById("s-lang").addEventListener("change", (e) => {
    NS.i18n.setLang(e.target.value); NS.showToast("Language updated.", "success");
  });
  document.getElementById("s-text").addEventListener("change", (e) => { patch({ textSize: e.target.value }); NS.showToast("Text size updated.", "success"); });
  document.getElementById("s-contrast").addEventListener("change", (e) => { patch({ contrast: e.target.value }); });
  document.getElementById("s-motion").addEventListener("change", (e) => { patch({ motion: e.target.value }); });

  /* ---------- notifications & voice ---------- */
  document.getElementById("notif-form").innerHTML = `
    <label class="row" style="gap:10px"><input type="checkbox" id="s-notif" ${s.notifications ? "checked" : ""}>
      <span>Reminder notifications</span></label>
    <label class="row" style="gap:10px"><input type="checkbox" id="s-voice" ${s.voice ? "checked" : ""}>
      <span>Voice assistant and spoken feedback</span></label>
    <button class="btn btn-secondary" id="test-notif" style="margin-top:12px">Send a test notification</button>
    <p class="small muted" style="margin-top:10px">Voice uses your device's built-in speech support. If it is unavailable, on-screen messages are used instead.</p>`;
  document.getElementById("s-notif").addEventListener("change", (e) => {
    patch({ notifications: e.target.checked });
    if (e.target.checked) NS.requestNotificationPermission();
  });
  document.getElementById("s-voice").addEventListener("change", (e) => patch({ voice: e.target.checked }));
  document.getElementById("test-notif").addEventListener("click", () =>
    NS.notify("NeuroSaathi", "This is how a reminder will appear."));

  /* ---------- data & privacy ---------- */
  document.getElementById("data-form").innerHTML = `
    <label class="row" style="gap:10px"><input type="checkbox" id="s-share" ${s.dataSharing ? "checked" : ""}>
      <span>Share engagement summaries with the caregiver</span></label>
    <p class="small muted">Data stays on this device until a backend is connected. No medical records are stored.</p>
    <div class="row" style="gap:8px;flex-wrap:wrap;margin-top:12px">
      <button class="btn btn-secondary" id="export-all">⬇️ Export my data</button>
      <button class="btn btn-secondary" id="reset-demo">♻️ Reset demo data</button>
      <button class="btn btn-outline" id="clear-all">🗑️ Clear all data</button>
      <button class="btn" id="do-logout">Log out</button>
    </div>`;
  document.getElementById("s-share").addEventListener("change", (e) => patch({ dataSharing: e.target.checked }));
  document.getElementById("export-all").addEventListener("click", () => {
    const dump = {};
    Object.values(S.KEYS).forEach((k) => { dump[k] = S.getData(k); });
    const url = URL.createObjectURL(new Blob([JSON.stringify(dump, null, 2)], { type: "application/json" }));
    const a = document.createElement("a");
    a.href = url; a.download = "neurosaathi-data.json"; a.click();
    URL.revokeObjectURL(url);
    NS.showToast("Your data has been downloaded.", "success");
  });
  document.getElementById("reset-demo").addEventListener("click", () => {
    S.seed(true); NS.showToast("Demo data restored.", "success");
    setTimeout(() => location.reload(), 700);
  });
  document.getElementById("clear-all").addEventListener("click", () => {
    NS.openModal("Clear all data?", `<p>This removes every reminder, activity record and setting stored on this device. It cannot be undone.</p>
      <div class="row" style="margin-top:14px"><button class="btn btn-block" id="yes-clear">Yes, clear it</button>
      <button class="btn btn-secondary btn-block" data-close>Cancel</button></div>`, (body) => {
      body.querySelector("#yes-clear").addEventListener("click", () => {
        S.clearData(); NS.closeModal(); location.href = "index.html";
      });
    });
  });
  document.getElementById("do-logout").addEventListener("click", () => NS.auth.logout());
};
