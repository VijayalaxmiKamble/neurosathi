/* auth.js — mock authentication using LocalStorage.
   Firebase later: replace validate() with signInWithEmailAndPassword(),
   getSession() with onAuthStateChanged(), logout() with signOut(). */
(function (global) {
  "use strict";
  const KEY = NS.storage.KEYS.session;

  /** Demo accounts. Replace with a real user collection later. */
  const USERS = [
    { username: "patient", password: "patient123", role: "patient", name: "Mrs. Sharma", patientId: "p-001" },
    { username: "caregiver", password: "care123", role: "caregiver", name: "Ananya Sharma", patientId: "p-001" },
  ];

  const getSession = () => NS.storage.getData(KEY, null);
  const isAuthenticated = () => !!getSession();

  const login = (username, password, role) => {
    const u = USERS.find(
      (x) => x.username === String(username || "").trim().toLowerCase() && x.password === password
    );
    if (!u) return { ok: false, error: "Username or password is not correct. Try the demo credentials below." };
    if (role && u.role !== role) return { ok: false, error: "These credentials belong to the " + u.role + " account. Switch the tab above." };
    const session = { username: u.username, role: u.role, name: u.name, patientId: u.patientId, at: Date.now() };
    NS.storage.saveData(KEY, session);
    return { ok: true, session };
  };

  const logout = () => {
    NS.storage.removeData(KEY);
    location.href = "index.html";
  };

  const homeFor = (role) => (role === "caregiver" ? "caregiver.html" : "patient.html");

  /** Redirect to login when signed out; caregiver pages stay caregiver-only. */
  const requireAuth = (role) => {
    const s = getSession();
    if (!s) { location.href = "index.html"; return null; }
    if (role && s.role !== role && role === "caregiver") { location.href = homeFor(s.role); return null; }
    return s;
  };

  global.NS = global.NS || {};
  global.NS.auth = { USERS, getSession, isAuthenticated, login, logout, requireAuth, homeFor };
})(window);
