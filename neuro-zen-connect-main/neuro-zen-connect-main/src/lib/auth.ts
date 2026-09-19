import type { Role, Session, UserAccount } from "./types";
import { getData, KEYS, saveData, uid } from "./storage";

export const DEMO_USERS: UserAccount[] = [
  { username: "patient", password: "patient123", role: "patient", name: "Mrs. Sharma", patientId: "p-001" },
  { username: "caregiver", password: "care123", role: "caregiver", name: "Ananya Sharma", patientId: "p-001" },
];

function allUsers(): UserAccount[] {
  return [...DEMO_USERS, ...getData<UserAccount[]>(KEYS.users, [])];
}

export function getSession(): Session | null {
  return getData<Session | null>(KEYS.session, null);
}

export function isAuthenticated(): boolean {
  return !!getSession();
}

export function login(
  username: string,
  password: string,
  role?: Role,
): { ok: true; session: Session } | { ok: false; error: string } {
  const u = allUsers().find(
    (x) => x.username === String(username || "").trim().toLowerCase() && x.password === password,
  );
  if (!u) return { ok: false, error: "Username or password is not correct. Try the demo credentials below." };
  if (role && u.role !== role) {
    return { ok: false, error: `These credentials belong to the ${u.role} account. Switch the tab above.` };
  }
  const session: Session = {
    username: u.username,
    role: u.role,
    name: u.name,
    patientId: u.patientId,
    at: Date.now(),
  };
  saveData(KEYS.session, session);
  return { ok: true, session };
}

export function register(input: {
  name: string;
  username: string;
  password: string;
  role: Role;
}): { ok: true } | { ok: false; error: string } {
  const username = input.username.trim().toLowerCase();
  const name = input.name.trim();
  if (!name || !username || !input.password) return { ok: false, error: "Please fill in every field." };
  if (input.password.length < 6) return { ok: false, error: "Please choose a password with at least 6 characters." };
  if (allUsers().some((u) => u.username === username)) return { ok: false, error: "That username is already used." };
  const users = getData<UserAccount[]>(KEYS.users, []);
  users.push({
    username,
    password: input.password,
    role: input.role,
    name,
    patientId: input.role === "patient" ? uid("p") : "p-001",
  });
  saveData(KEYS.users, users);
  return { ok: true };
}

export function logout(): void {
  localStorage.removeItem(`ns:${KEYS.session}`);
}

export function homeFor(role: Role): "/home" | "/caregiver" {
  return role === "caregiver" ? "/caregiver" : "/home";
}
