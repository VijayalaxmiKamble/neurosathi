import type {
  AlertItem,
  Appointment,
  AppSettings,
  GameSession,
  Hydration,
  Medication,
  MemoryItem,
  Patient,
  Reminder,
  RoutineItem,
  UserAccount,
} from "./types";

const PREFIX = "ns:";

export const KEYS = {
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
  memories: "memories",
  users: "users",
  gameStats: "gameStats",
} as const;

export function today(): string {
  return new Date().toISOString().slice(0, 10);
}

export function dateOffset(d: number): string {
  const t = new Date();
  t.setDate(t.getDate() + d);
  return t.toISOString().slice(0, 10);
}

export function saveData(key: string, data: unknown): boolean {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(data));
    return true;
  } catch {
    return false;
  }
}

export function getData<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(PREFIX + key);
    return raw === null ? fallback : (JSON.parse(raw) as T);
  } catch {
    return fallback;
  }
}

export function removeData(key: string): void {
  localStorage.removeItem(PREFIX + key);
}

export function clearAll(): void {
  Object.values(KEYS).forEach((k) => removeData(k));
}

export function updateData<T extends object>(key: string, patch: Partial<T>): T {
  const current = getData<T>(key, {} as T);
  const next = { ...current, ...patch };
  saveData(key, next);
  return next;
}

export function upsertInList<T extends object>(
  key: string,
  item: T,
  idField: keyof T = "id" as keyof T,
): T[] {
  const list = getData<T[]>(key, []);
  const i = list.findIndex((x) => x[idField] === item[idField]);
  if (i >= 0) {
    const prev = list[i];
    list[i] = { ...(prev as T), ...item };
  } else {
    list.push(item);
  }
  saveData(key, list);
  return list;
}

export function removeFromList<T extends object>(
  key: string,
  id: string,
  idField: keyof T = "id" as keyof T,
): T[] {
  const list = getData<T[]>(key, []).filter((x) => String(x[idField]) !== id);
  saveData(key, list);
  return list;
}

export function uid(p = "id"): string {
  return `${p}-${Math.random().toString(36).slice(2, 9)}`;
}

const MOCK_PATIENTS: Patient[] = [
  {
    id: "p-001",
    name: "Mrs. Sharma",
    age: 78,
    gender: "Female",
    location: "Guwahati, Assam",
    language: "hi",
    caregiver: "Ananya Sharma (daughter)",
    caregiverPhone: "+91 90000 00001",
    emergencyContact: "+91 90000 00002",
    hospital: "Assam Medical Center",
    status: "Active",
    lastActive: "9 min ago",
    engagement: 78,
    routine: 92,
    memory: 82,
    attention: 74,
    pattern: 80,
    recall: 76,
    alerts: 1,
    avatar: "MS",
  },
  {
    id: "p-002",
    name: "Mr. Boro",
    age: 82,
    gender: "Male",
    location: "Kokrajhar, Assam",
    language: "as",
    caregiver: "Rina Boro (niece)",
    caregiverPhone: "+91 90000 00003",
    emergencyContact: "+91 90000 00004",
    hospital: "Kokrajhar District Hospital",
    status: "Needs Attention",
    lastActive: "3 h ago",
    engagement: 54,
    routine: 61,
    memory: 58,
    attention: 49,
    pattern: 57,
    recall: 52,
    alerts: 2,
    avatar: "MB",
  },
  {
    id: "p-003",
    name: "Mrs. Lyngdoh",
    age: 74,
    gender: "Female",
    location: "Shillong, Meghalaya",
    language: "en",
    caregiver: "Banri Lyngdoh (son)",
    caregiverPhone: "+91 90000 00005",
    emergencyContact: "+91 90000 00006",
    hospital: "Shillong Civil Hospital",
    status: "Inactive",
    lastActive: "2 days ago",
    engagement: 41,
    routine: 48,
    memory: 45,
    attention: 40,
    pattern: 43,
    recall: 38,
    alerts: 0,
    avatar: "ML",
  },
];

function mockReminders(): Reminder[] {
  return [
    { id: "r-001", patientId: "p-001", title: "Morning medicine (as prescribed)", type: "MEDICINE", time: "08:30", repeat: "Daily", status: "completed", priority: "high", enabled: true, notes: "Entered by caregiver" },
    { id: "r-002", patientId: "p-001", title: "Drink a glass of water", type: "HYDRATION", time: "10:00", repeat: "Daily", status: "completed", priority: "medium", enabled: true, notes: "" },
    { id: "r-003", patientId: "p-001", title: "Breakfast", type: "MEAL", time: "08:00", repeat: "Daily", status: "completed", priority: "medium", enabled: true, notes: "" },
    { id: "r-004", patientId: "p-001", title: "Gentle walk", type: "EXERCISE", time: "07:00", repeat: "Daily", status: "completed", priority: "low", enabled: true, notes: "" },
    { id: "r-005", patientId: "p-001", title: "Memory Match session", type: "COGNITIVE GAME", time: "09:00", repeat: "Daily", status: "pending", priority: "high", enabled: true, notes: "" },
    { id: "r-006", patientId: "p-001", title: "Afternoon water", type: "HYDRATION", time: "15:00", repeat: "Daily", status: "pending", priority: "medium", enabled: true, notes: "" },
    { id: "r-007", patientId: "p-001", title: "Evening medicine (as prescribed)", type: "MEDICINE", time: "20:00", repeat: "Daily", status: "pending", priority: "high", enabled: true, notes: "Entered by caregiver" },
    { id: "r-008", patientId: "p-001", title: "Check-up with Dr. Sharma", type: "APPOINTMENT", time: "14:30", repeat: "Weekly", status: "pending", priority: "high", enabled: true, notes: "Assam Medical Center" },
    { id: "r-009", patientId: "p-001", title: "Call family", type: "FAMILY", time: "17:00", repeat: "Daily", status: "pending", priority: "low", enabled: true, notes: "Video call with grandson" },
    { id: "r-010", patientId: "p-001", title: "Sleep routine", type: "PERSONAL", time: "21:30", repeat: "Daily", status: "pending", priority: "medium", enabled: true, notes: "" },
  ];
}

function mockAppointments(): Appointment[] {
  return [
    { id: "a-001", patientId: "p-001", doctor: "Dr. Sharma", hospital: "Assam Medical Center", date: dateOffset(2), time: "14:30", purpose: "Routine review", location: "Dibrugarh, Assam", status: "Confirmed", notes: "Bring previous reports" },
    { id: "a-002", patientId: "p-001", doctor: "Dr. Kalita", hospital: "GMCH", date: dateOffset(9), time: "11:00", purpose: "Physiotherapy", location: "Guwahati, Assam", status: "Pending", notes: "" },
    { id: "a-003", patientId: "p-002", doctor: "Dr. Basumatary", hospital: "Kokrajhar District Hospital", date: dateOffset(4), time: "10:15", purpose: "General check-up", location: "Kokrajhar, Assam", status: "Confirmed", notes: "" },
    { id: "a-004", patientId: "p-003", doctor: "Dr. Marbaniang", hospital: "Shillong Civil Hospital", date: dateOffset(6), time: "09:30", purpose: "Follow-up", location: "Shillong, Meghalaya", status: "Confirmed", notes: "" },
    { id: "a-005", patientId: "p-001", doctor: "Dr. Sharma", hospital: "Assam Medical Center", date: dateOffset(-12), time: "15:00", purpose: "Previous review", location: "Dibrugarh, Assam", status: "Completed", notes: "" },
  ];
}

const MOCK_ROUTINE: RoutineItem[] = [
  { id: "t-1", time: "07:00", label: "Gentle Yoga", icon: "🧘", status: "completed" },
  { id: "t-2", time: "08:00", label: "Breakfast", icon: "🍵", status: "completed" },
  { id: "t-3", time: "09:00", label: "Cognitive Games", icon: "🧠", status: "now" },
  { id: "t-4", time: "10:30", label: "Garden Relaxation", icon: "🌿", status: "upcoming" },
  { id: "t-5", time: "12:30", label: "Lunch", icon: "🍚", status: "upcoming" },
  { id: "t-6", time: "14:30", label: "Rest", icon: "🛏️", status: "upcoming" },
  { id: "t-7", time: "17:00", label: "Family Interaction", icon: "👨‍👩‍👧", status: "upcoming" },
  { id: "t-8", time: "19:30", label: "Dinner", icon: "🍲", status: "upcoming" },
];

function mockMemories(): MemoryItem[] {
  return [
    {
      id: "mem-1",
      patientId: "p-001",
      title: "Family picnic at the river",
      description: "We sat under the trees and shared homemade snacks. The grandchildren sang a song.",
      date: dateOffset(-40),
      category: "Family",
      tags: ["family", "outdoors"],
    },
    {
      id: "mem-2",
      patientId: "p-001",
      title: "Temple visit with Ananya",
      description: "A quiet morning visit. The bells and flowers felt familiar and calming.",
      date: dateOffset(-12),
      category: "Important Places",
      tags: ["places", "calm"],
    },
    {
      id: "mem-3",
      patientId: "p-001",
      title: "Grandson's school day",
      description: "He showed his drawing of our house. We put it on the fridge.",
      date: dateOffset(-5),
      category: "Events",
      tags: ["family", "school"],
    },
  ];
}

function buildGameSessions(): GameSession[] {
  const games = ["memory", "pattern", "attention", "recall", "numbers", "words"];
  const out: GameSession[] = [];
  for (let i = 0; i < 20; i++) {
    const day = dateOffset(-Math.floor(i / 3));
    const game = games[i % games.length] ?? "memory";
    const accuracy = 55 + ((i * 7) % 40);
    out.push({
      id: `gs-${i + 1}`,
      patientId: `p-00${1 + (i % 3)}`,
      game,
      date: day,
      accuracy,
      attempts: 10 + (i % 12),
      timeSec: 60 + ((i * 13) % 120),
      mistakes: i % 5,
      hintsUsed: i % 3,
      completed: i % 9 !== 0,
      difficulty: accuracy >= 80 ? "HARD" : accuracy >= 55 ? "MEDIUM" : "EASY",
    });
  }
  return out;
}

const DEFAULT_SETTINGS: AppSettings = {
  language: "en",
  textSize: "large",
  contrast: "normal",
  motion: "normal",
  theme: "light",
  notifications: true,
  voice: false,
  dataSharing: false,
  consent: true,
};

export function seed(force = false): void {
  if (typeof window === "undefined") return;
  if (force || getData(KEYS.patients, null as unknown as Patient[] | null) === null) saveData(KEYS.patients, MOCK_PATIENTS);
  if (force || getData(KEYS.reminders, null as unknown as Reminder[] | null) === null) saveData(KEYS.reminders, mockReminders());
  if (force || getData(KEYS.appointments, null as unknown as Appointment[] | null) === null) saveData(KEYS.appointments, mockAppointments());
  if (force || getData(KEYS.sessions, null as unknown as GameSession[] | null) === null) saveData(KEYS.sessions, buildGameSessions());
  if (force || getData(KEYS.routine, null as unknown as RoutineItem[] | null) === null) saveData(KEYS.routine, MOCK_ROUTINE);
  if (force || getData(KEYS.medication, null as unknown as Medication[] | null) === null) {
    saveData(KEYS.medication, [
      { id: "m-1", label: "Morning Medicine", medicine: "As prescribed", time: "08:30", status: "taken" },
      { id: "m-2", label: "Afternoon Medicine", medicine: "As prescribed", time: "13:30", status: "taken" },
      { id: "m-3", label: "Evening Medicine", medicine: "As prescribed", time: "20:00", status: "pending" },
    ] satisfies Medication[]);
  }
  if (force || getData(KEYS.alerts, null as unknown as AlertItem[] | null) === null) {
    saveData(KEYS.alerts, [
      { id: "al-1", patientId: "p-002", patient: "Mr. Boro", severity: "HIGH", category: "Missed medication reminder", message: "Mr. Boro has not confirmed the morning medicine reminder.", time: "2 h ago", acknowledged: false },
      { id: "al-2", patientId: "p-001", patient: "Mrs. Sharma", severity: "MEDIUM", category: "Missed hydration reminder", message: "Mrs. Sharma has missed two hydration reminders today.", time: "40 min ago", acknowledged: false },
      { id: "al-3", patientId: "p-003", patient: "Mrs. Lyngdoh", severity: "MEDIUM", category: "Long inactivity", message: "No activity recorded for 2 days. A friendly check-in may help.", time: "1 day ago", acknowledged: false },
      { id: "al-4", patientId: "p-001", patient: "Mrs. Sharma", severity: "LOW", category: "Appointment approaching", message: "Appointment with Dr. Sharma in 2 days.", time: "3 h ago", acknowledged: true },
    ] satisfies AlertItem[]);
  }
  if (force || getData(KEYS.settings, null as unknown as AppSettings | null) === null) saveData(KEYS.settings, DEFAULT_SETTINGS);
  if (force || getData(KEYS.queue, null as unknown as unknown[] | null) === null) saveData(KEYS.queue, []);
  if (force || getData(KEYS.memories, null as unknown as MemoryItem[] | null) === null) saveData(KEYS.memories, mockMemories());
  if (force || getData(KEYS.users, null as unknown as UserAccount[] | null) === null) saveData(KEYS.users, []);
  if (force || getData(KEYS.gameStats, null as unknown as Record<string, unknown> | null) === null) saveData(KEYS.gameStats, {});
  const hyd = getData<Hydration | null>(KEYS.hydration, null);
  if (force || !hyd || hyd.date !== today()) {
    saveData(KEYS.hydration, { date: today(), goal: 6, current: 3 } satisfies Hydration);
  }
}

export function getSettings(): AppSettings {
  return { ...DEFAULT_SETTINGS, ...getData<Partial<AppSettings>>(KEYS.settings, {}) };
}

export function applyDocumentSettings(settings: AppSettings): void {
  if (typeof document === "undefined") return;
  const r = document.documentElement;
  r.dataset["textSize"] = settings.textSize;
  r.dataset["contrast"] = settings.contrast;
  r.dataset["motion"] = settings.motion;
  r.dataset["theme"] = settings.theme;
  r.lang = settings.language || "en";
  r.classList.toggle("dark", settings.theme === "dark");
  r.classList.toggle("high-contrast", settings.contrast === "high");
  r.classList.toggle("reduce-motion", settings.motion === "reduced");
}
