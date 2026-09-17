/* patients.js — patient list with search, status filter and add/edit. */
window.PAGE_INIT = function () {
  "use strict";
  const S = NS.storage;
  const search = document.getElementById("p-search");
  const status = document.getElementById("p-status");

  const all = () => S.getData(S.KEYS.patients, []) || [];

  const filtered = () => {
    const q = search.value.trim().toLowerCase();
    return all().filter((p) => {
      const matchQ = !q || p.name.toLowerCase().includes(q) || p.location.toLowerCase().includes(q);
      const matchS = status.value === "all" || p.status === status.value;
      return matchQ && matchS;
    });
  };

  const badge = (s) => (s === "Active" ? "ok" : s === "Needs Attention" ? "warn" : "info");

  const render = () => {
    const list = filtered();
    const root = document.getElementById("patient-cards");
    if (!list.length) { root.innerHTML = `<p class="muted">No patients match this search.</p>`; return; }
    root.innerHTML = list.map((p) => `
      <div class="card">
        <div class="card-head">
          <div class="row" style="gap:10px"><div class="brand-mark" aria-hidden="true">${p.avatar}</div>
            <div><strong>${p.name}</strong><div class="meta">${p.age} yrs · ${p.location}</div></div></div>
          <span class="badge ${badge(p.status)}">${p.status}</span>
        </div>
        <div class="bar" aria-label="Engagement ${NS.ai.calculateCognitiveEngagement(p.id)} of 100">
          <span style="width:${NS.ai.calculateCognitiveEngagement(p.id)}%"></span></div>
        <div class="meta" style="margin:8px 0 12px">Engagement ${NS.ai.calculateCognitiveEngagement(p.id)} · caregiver ${p.caregiver}</div>
        <div class="row" style="gap:8px">
          <a class="btn btn-sm" href="patient-details.html?id=${p.id}">View activity</a>
          <button class="btn btn-sm btn-secondary" data-edit="${p.id}">Edit</button>
          <a class="btn btn-sm btn-outline" href="tel:${p.emergencyContact.replace(/\s/g, "")}">📞 Call</a>
        </div>
      </div>`).join("");
    root.querySelectorAll("[data-edit]").forEach((b) =>
      b.addEventListener("click", () => form(all().find((p) => p.id === b.dataset.edit))));
  };

  const form = (p) => {
    const v = p || { id: S.uid("p"), name: "", age: 70, location: "", caregiver: "", caregiverPhone: "", emergencyContact: "", hospital: "", status: "Active", language: "as", avatar: "NS", engagement: 60, routine: 60, memory: 60, attention: 60, pattern: 60, recall: 60, alerts: 0, lastActive: "just now" };
    NS.openModal(p ? "Edit patient" : "Add patient", `
      <form id="pform">
        <div class="field"><label for="f-name">Name</label><input id="f-name" value="${v.name}" required></div>
        <div class="field"><label for="f-age">Age</label><input id="f-age" type="number" min="1" max="120" value="${v.age}" required></div>
        <div class="field"><label for="f-loc">Location</label><input id="f-loc" value="${v.location}" required></div>
        <div class="field"><label for="f-care">Caregiver</label><input id="f-care" value="${v.caregiver}"></div>
        <div class="field"><label for="f-phone">Emergency contact</label><input id="f-phone" value="${v.emergencyContact}"></div>
        <div class="field"><label for="f-status">Status</label><select id="f-status">
          ${["Active", "Needs Attention", "Inactive"].map((s) => `<option ${s === v.status ? "selected" : ""}>${s}</option>`).join("")}
        </select></div>
        <div class="row"><button class="btn btn-block" type="submit">Save</button>
          <button class="btn btn-secondary btn-block" type="button" data-close>Cancel</button></div>
      </form>`, (body) => {
      body.querySelector("#pform").addEventListener("submit", (e) => {
        e.preventDefault();
        const name = body.querySelector("#f-name").value.trim();
        if (!name) return NS.showToast("Please enter a name.", "warning");
        S.upsertInList(S.KEYS.patients, Object.assign({}, v, {
          name, age: Number(body.querySelector("#f-age").value),
          location: body.querySelector("#f-loc").value.trim(),
          caregiver: body.querySelector("#f-care").value.trim(),
          emergencyContact: body.querySelector("#f-phone").value.trim(),
          status: body.querySelector("#f-status").value,
          avatar: name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase(),
        }));
        if (!navigator.onLine) NS.offline.enqueue({ type: "patient", payload: { id: v.id } });
        NS.closeModal();
        NS.showToast("Patient saved.", "success");
        render();
      });
    });
  };

  document.getElementById("add-patient").addEventListener("click", () => form(null));
  search.addEventListener("input", render);
  status.addEventListener("change", render);
  render();
};
