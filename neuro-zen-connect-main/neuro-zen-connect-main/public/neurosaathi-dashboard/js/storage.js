/* storage.js — LocalStorage abstraction + mock data seeding.
   Swap the internals of these functions for Firebase Firestore calls later:
   saveData -> setDoc, getData -> getDoc, updateData -> updateDoc, removeData -> deleteDoc */
(function (global) {
  "use strict";
  const PREFIX = "ns:";
  const KEYS = {
    session: "session",
    patients: "patients",
    reminders: "reminders",
    appointments: "appointments",
    sessions: "gameSessions",
    routine: "routine",
    hydration: "hydration",
    medication: "medication",
    alerts: "alerts",
    settings: "settings",
    queue: "offlineQueue",
    difficulty: "difficulty",
    analytics: "analytics",
  };

  const saveData = (key, data) => {
    try {
      localStorage.setItem(PREFIX + key, JSON.stringify(data));
      return true;
    } catch (e) {
      console.warn("storage write failed", e);
      return false;
    }
  };
  const getData = (key, fallback = null) => {
    try {
      const raw = localStorage.getItem(PREFIX + key);
      return raw === null ? fallback : JSON.parse(raw);
    } catch (e) {
      return fallback;
    }
  };
  const removeData = (key) => localStorage.removeItem(PREFIX + key);
  const clearData = (key) => (key ? removeData(key) : Object.values(KEYS).forEach(removeData));
  const updateData = (key, patch) => {
    const current = getData(key);
    if (Array.isArray(current) && Array.isArray(patch)) return saveData(key, patch);
    const next = Object.assign({}, current || {}, patch || {});
    saveData(key, next);
    return next;
  };
  const upsertInList = (key, item, idField = "id") => {
    const list = getData(key, []) || [];
    const i = list.findIndex((x) => x[idField] === item[idField]);
    if (i >= 0) list[i] = Object.assign({}, list[i], item);
    else list.push(item);
    saveData(key, list);
    return list;
  };
  const removeFromList = (key, id, idField = "id") => {
    const list = (getData(key, []) || []).filter((x) => x[idField] !== id);
    saveData(key, list);
    return list;
  };
  const uid = (p = "id") => p + "-" + Math.random().toString(36).slice(2, 9);

  /* ---------- Mock data (mirrors /data/*.json, embedded so the app also works from file://) ---------- */
  const today = () => new Date().toISOString().slice(0, 10);
  const dateOffset = (d) => {
    const t = new Date();
    t.setDate(t.getDate() + d);
    return t.toISOString().slice(0, 10);
  };

  const MOCK = {
    patients: [
      {
        id: "p-001", name: "Mrs. Sharma", age: 78, gender: "Female", location: "Guwahati, Assam",
        language: "as", caregiver: "Ananya Sharma (daughter)", caregiverPhone: "+91 90000 00001",
        emergencyContact: "+91 90000 00002", hospital: "Assam Medical Center",
        status: "Active", lastActive: "9 min ago", engagement: 78, routine: 92,
        memory: 82, attention: 74, pattern: 80, recall: 76, alerts: 1, avatar: "MS",
      },
      {
        id: "p-002", name: "Mr. Boro", age: 82, gender: "Male", location: "Kokrajhar, Assam",
        language: "as", caregiver: "Rina Boro (niece)", caregiverPhone: "+91 90000 00003",
        emergencyContact: "+91 90000 00004", hospital: "Kokrajhar District Hospital",
        status: "Needs Attention", lastActive: "3 h ago", engagement: 54, routine: 61,
        memory: 58, attention: 49, pattern: 57, recall: 52, alerts: 2, avatar: "MB",
      },
      {
        id: "p-003", name: "Mrs. Lyngdoh", age: 74, gender: "Female", location: "Shillong, Meghalaya",
        language: "kha", caregiver: "Banri Lyngdoh (son)", caregiverPhone: "+91 90000 00005",
        emergencyContact: "+91 90000 00006", hospital: "Shillong Civil Hospital",
        status: "Inactive", lastActive: "2 days ago", engagement: 41, routine: 48,
        memory: 45, attention: 40, pattern: 43, recall: 38, alerts: 0, avatar: "ML",
      },
    ],
    reminders: [
      { id: "r-001", patientId: "p-001", title: "Donepezil (as prescribed)", type: "MEDICINE", time: "08:30", repeat: "Daily", status: "completed", priority: "high", enabled: true, notes: "Entered by caregiver" },
      { id: "r-002", patientId: "p-001", title: "Drink a glass of water", type: "HYDRATION", time: "10:00", repeat: "Daily", status: "completed", priority: "medium", enabled: true, notes: "" },
      { id: "r-003", patientId: "p-001", title: "Breakfast", type: "MEAL", time: "08:00", repeat: "Daily", status: "completed", priority: "medium", enabled: true, notes: "Jolpan with pitha" },
      { id: "r-004", patientId: "p-001", title: "Gentle yoga", type: "EXERCISE", time: "07:00", repeat: "Daily", status: "completed", priority: "low", enabled: true, notes: "" },
      { id: "r-005", patientId: "p-001", title: "Memory Match session", type: "COGNITIVE GAME", time: "09:00", repeat: "Daily", status: "pending", priority: "high", enabled: true, notes: "" },
      { id: "r-006", patientId: "p-001", title: "Afternoon water", type: "HYDRATION", time: "15:00", repeat: "Daily", status: "pending", priority: "medium", enabled: true, notes: "" },
      { id: "r-007", patientId: "p-001", title: "Evening medicine (as prescribed)", type: "MEDICINE", time: "20:00", repeat: "Daily", status: "pending", priority: "high", enabled: true, notes: "Entered by caregiver" },
      { id: "r-008", patientId: "p-001", title: "Check-up with Dr. Sharma", type: "APPOINTMENT", time: "14:30", repeat: "Weekly", status: "pending", priority: "high", enabled: true, notes: "Assam Medical Center" },
      { id: "r-009", patientId: "p-001", title: "Call family", type: "CUSTOM", time: "17:00", repeat: "Daily", status: "pending", priority: "low", enabled: true, notes: "Video call with grandson" },
      { id: "r-010", patientId: "p-001", title: "Sleep routine", type: "SLEEP", time: "21:30", repeat: "Daily", status: "pending", priority: "medium", enabled: true, notes: "" },
    ],
    appointments: [
      { id: "a-001", patientId: "p-001", doctor: "Dr. Sharma", hospital: "Assam Medical Center", date: dateOffset(2), time: "14:30", purpose: "Routine review", location: "Dibrugarh, Assam", status: "Confirmed", notes: "Bring previous reports" },
      { id: "a-002", patientId: "p-001", doctor: "Dr. Kalita", hospital: "GMCH", date: dateOffset(9), time: "11:00", purpose: "Physiotherapy", location: "Guwahati, Assam", status: "Pending", notes: "" },
      { id: "a-003", patientId: "p-002", doctor: "Dr. Basumatary", hospital: "Kokrajhar District Hospital", date: dateOffset(4), time: "10:15", purpose: "General check-up", location: "Kokrajhar, Assam", status: "Confirmed", notes: "" },
      { id: "a-004", patientId: "p-003", doctor: "Dr. Marbaniang", hospital: "Shillong Civil Hospital", date: dateOffset(6), time: "09:30", purpose: "Follow-up", location: "Shillong, Meghalaya", status: "Confirmed", notes: "" },
      { id: "a-005", patientId: "p-001", doctor: "Dr. Sharma", hospital: "Assam Medical Center", date: dateOffset(-12), time: "15:00", purpose: "Previous review", location: "Dibrugarh, Assam", status: "Completed", notes: "" },
    ],
    routine: [
      { id: "t-1", time: "07:00", label: "Gentle Yoga", icon: "🧘", status: "completed" },
      { id: "t-2", time: "08:00", label: "Breakfast", icon: "🍵", status: "completed" },
      { id: "t-3", time: "09:00", label: "Cognitive Games", icon: "🧠", status: "now" },
      { id: "t-4", time: "10:30", label: "Garden Relaxation", icon: "🌿", status: "upcoming" },
      { id: "t-5", time: "12:30", label: "Lunch", icon: "🍚", status: "upcoming" },
      { id: "t-6", time: "14:30", label: "Rest", icon: "🛏️", status: "upcoming" },
      { id: "t-7", time: "17:00", label: "Family Interaction", icon: "👨‍👩‍👧", status: "upcoming" },
      { id: "t-8", time: "19:30", label: "Dinner", icon: "🍲", status: "upcoming" },
    ],
    hydration: { date: today(), goal: 6, current: 5 },
    medication: [
      { id: "m-1", label: "Morning Medicine", medicine: "Donepezil", time: "08:30", status: "taken" },
      { id: "m-2", label: "Afternoon Medicine", medicine: "Vitamin B12", time: "13:30", status: "taken" },
      { id: "m-3", label: "Evening Medicine", medicine: "Memantine", time: "20:00", status: "taken" },
    ],
    alerts: [
      { id: "al-1", patientId: "p-002", patient: "Mr. Boro", severity: "HIGH", category: "Missed medication reminder", message: "Mr. Boro has not confirmed the morning medicine reminder.", time: "2 h ago", acknowledged: false },
      { id: "al-2", patientId: "p-001", patient: "Mrs. Sharma", severity: "MEDIUM", category: "Missed hydration reminder", message: "Mrs. Sharma has missed two hydration reminders today.", time: "40 min ago", acknowledged: false },
      { id: "al-3", patientId: "p-003", patient: "Mrs. Lyngdoh", severity: "MEDIUM", category: "Long inactivity", message: "No activity recorded for 2 days. A friendly check-in may help.", time: "1 day ago", acknowledged: false },
      { id: "al-4", patientId: "p-001", patient: "Mrs. Sharma", severity: "LOW", category: "Appointment approaching", message: "Appointment with Dr. Sharma in 2 days.", time: "3 h ago", acknowledged: true },
    ],
    settings: {
      language: "en", textSize: "normal", contrast: "normal", motion: "normal",
      notifications: true, voice: true, dataSharing: false, consent: true,
    },
  };

  const buildGameSessions = () => {
    const games = ["memory", "pattern", "attention", "recall"];
    const out = [];
    for (let i = 0; i < 20; i++) {
      const day = dateOffset(-Math.floor(i / 3));
      const game = games[i % games.length];
      const accuracy = 55 + ((i * 7) % 40);
      out.push({
        id: "gs-" + (i + 1), patientId: "p-00" + (1 + (i % 3)), game, date: day,
        accuracy, attempts: 10 + (i % 12), timeSec: 60 + ((i * 13) % 120),
        mistakes: i % 5, hintsUsed: i % 3, completed: i % 9 !== 0,
        difficulty: accuracy >= 80 ? "HARD" : accuracy >= 55 ? "MEDIUM" : "EASY",
      });
    }
    return out;
  };

  /** Seed mock data once (idempotent). Later: replace with Firestore initial fetch. */
  const seed = (force = false) => {
    if (force || getData(KEYS.patients) === null) saveData(KEYS.patients, MOCK.patients);
    if (force || getData(KEYS.reminders) === null) saveData(KEYS.reminders, MOCK.reminders);
    if (force || getData(KEYS.appointments) === null) saveData(KEYS.appointments, MOCK.appointments);
    if (force || getData(KEYS.sessions) === null) saveData(KEYS.sessions, buildGameSessions());
    if (force || getData(KEYS.routine) === null) saveData(KEYS.routine, MOCK.routine);
    if (force || getData(KEYS.medication) === null) saveData(KEYS.medication, MOCK.medication);
    if (force || getData(KEYS.alerts) === null) saveData(KEYS.alerts, MOCK.alerts);
    if (force || getData(KEYS.settings) === null) saveData(KEYS.settings, MOCK.settings);
    if (force || getData(KEYS.queue) === null) saveData(KEYS.queue, []);
    const hyd = getData(KEYS.hydration);
    if (force || !hyd || hyd.date !== today()) saveData(KEYS.hydration, Object.assign({}, MOCK.hydration, { date: today() }));
  };

  global.NS = global.NS || {};
  global.NS.storage = {
    KEYS, saveData, getData, removeData, updateData, clearData,
    upsertInList, removeFromList, uid, seed, MOCK, buildGameSessions, today, dateOffset,
  };
})(window);
