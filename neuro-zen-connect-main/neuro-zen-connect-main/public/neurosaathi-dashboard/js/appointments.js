/* appointments.js — appointment list, add/edit, reminders. */
window.PAGE_INIT = function () {
  "use strict";
  const S = NS.storage;
  const session = NS.auth.getSession() || {};
  const listEl = document.getElementById("appointment-list");
  const filter = document.getElementById("appt-filter");

  const get = () => S.getData(S.KEYS.appointments, []) || [];

  const render = () => {
    const today = S.today();
    const mode = filter.value;
    const rows = get()
      .filter((a) => (mode === "all" ? true : mode === "upcoming" ? a.date >= today : a.date < today))
      .sort((a, b) => (mode === "past" ? b.date.localeCompare(a.date) : a.date.localeCompare(b.date)));

    listEl.innerHTML = rows.length ? rows.map((a) => {
      const days = Math.round((new Date(a.date) - new Date(today)) / 86400000);
      return `<div class="card">
        <div class="card-head"><h3>${a.doctor}</h3>
          <span class="badge ${a.status === "Confirmed" ? "ok" : a.status === "Completed" ? "info" : "warn"}">${a.status}</span></div>
        <p class="muted">${a.purpose}</p>
        <div class="list">
          <div class="list-item"><div><strong>${new Date(a.date).toLocaleDateString(undefined, { weekday: "short", day: "numeric", month: "short", year: "numeric" })} · ${a.time}</strong>
            <div class="meta">${days >= 0 ? (days === 0 ? "Today" : `In ${days} day${days === 1 ? "" : "s"}`) : `${Math.abs(days)} days ago`}</div></div></div>
          <div class="list-item"><div><strong>${a.hospital}</strong><div class="meta">${a.location}</div></div></div>
          ${a.notes ? `<div class="list-item"><div><strong>Notes</strong><div class="meta">${a.notes}</div></div></div>` : ""}
        </div>
        <div class="row" style="margin-top:12px">
          <button class="btn btn-sm btn-secondary" data-remind="${a.id}">🔔 Add reminder</button>
          <button class="btn btn-sm btn-outline" data-edit="${a.id}">✏️ Edit</button>
          <button class="btn btn-sm btn-outline" data-del="${a.id}">🗑️ Remove</button>
        </div></div>`;
    }).join("") : `<p class="muted">No appointments in this view.</p>`;

    listEl.querySelectorAll("[data-remind]").forEach((b) => b.addEventListener("click", () => {
      const a = get().find((x) => x.id === b.dataset.remind);
      S.upsertInList(S.KEYS.reminders, {
        id: S.uid("r"), patientId: a.patientId, title: `Appointment with ${a.doctor}`,
        type: "APPOINTMENT", time: a.time, repeat: "Once", status: "pending",
        priority: "high", enabled: true, notes: `${a.hospital}, ${a.date}`,
      });
      NS.showToast("Reminder created for this appointment.", "success");
    }));
    listEl.querySelectorAll("[data-del]").forEach((b) => b.addEventListener("click", () => {
      S.removeFromList(S.KEYS.appointments, b.dataset.del);
      NS.showToast("Appointment removed.", "info"); render();
    }));
    listEl.querySelectorAll("[data-edit]").forEach((b) => b.addEventListener("click", () =>
      form(get().find((x) => x.id === b.dataset.edit))));
  };

  const form = (item) => {
    const a = item || { id: "", patientId: session.patientId || "p-001", doctor: "", hospital: "", date: S.dateOffset(3), time: "10:00", purpose: "", location: "", status: "Pending", notes: "" };
    NS.openModal(item ? "Edit appointment" : "Add appointment", `
      <div class="row">
        <div class="field"><label for="a-doc">Doctor</label><input id="a-doc" value="${a.doctor}"></div>
        <div class="field"><label for="a-hosp">Hospital / clinic</label><input id="a-hosp" value="${a.hospital}"></div>
      </div>
      <div class="row">
        <div class="field"><label for="a-date">Date</label><input id="a-date" type="date" value="${a.date}"></div>
        <div class="field"><label for="a-time">Time</label><input id="a-time" type="time" value="${a.time}"></div>
      </div>
      <div class="field"><label for="a-purpose">Purpose</label><input id="a-purpose" value="${a.purpose}"></div>
      <div class="field"><label for="a-loc">Location</label><input id="a-loc" value="${a.location}"></div>
      <div class="row">
        <div class="field"><label for="a-status">Status</label><select id="a-status">${["Pending", "Confirmed", "Completed"].map((s) => `<option ${s === a.status ? "selected" : ""}>${s}</option>`).join("")}</select></div>
        <div class="field"><label for="a-notes">Notes</label><input id="a-notes" value="${a.notes || ""}"></div>
      </div>
      <button class="btn btn-lg btn-block" id="a-save">Save appointment</button>`, (body) => {
      body.querySelector("#a-save").addEventListener("click", () => {
        const doctor = body.querySelector("#a-doc").value.trim();
        if (!doctor) { NS.showToast("Please enter the doctor's name.", "warning"); return; }
        S.upsertInList(S.KEYS.appointments, {
          id: a.id || S.uid("a"), patientId: a.patientId, doctor,
          hospital: body.querySelector("#a-hosp").value, date: body.querySelector("#a-date").value,
          time: body.querySelector("#a-time").value, purpose: body.querySelector("#a-purpose").value,
          location: body.querySelector("#a-loc").value, status: body.querySelector("#a-status").value,
          notes: body.querySelector("#a-notes").value,
        });
        NS.closeModal(); render();
        NS.showToast(item ? "Appointment updated." : "Appointment added.", "success");
      });
    });
  };

  document.getElementById("add-appointment").addEventListener("click", () => form(null));
  filter.addEventListener("change", render);
  render();
};
