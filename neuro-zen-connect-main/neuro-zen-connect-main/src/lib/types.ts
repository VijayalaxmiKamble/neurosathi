export type Role = "patient" | "caregiver";
export type Difficulty = "BEGINNER" | "EASY" | "MEDIUM" | "HARD";
export type LangCode = "en" | "hi" | "mr" | "as" | "bn";
export type ThemeMode = "light" | "dark";
export type FontSize = "normal" | "large" | "xlarge";
export type ContrastMode = "normal" | "high";
export type MotionMode = "normal" | "reduced";

export interface Session {
  username: string;
  role: Role;
  name: string;
  patientId: string;
  at: number;
}

export interface UserAccount {
  username: string;
  password: string;
  role: Role;
  name: string;
  patientId: string;
}

export interface Patient {
  id: string;
  name: string;
  age: number;
  gender: string;
  location: string;
  language: string;
  caregiver: string;
  caregiverPhone: string;
  emergencyContact: string;
  hospital: string;
  status: string;
  lastActive: string;
  engagement: number;
  routine: number;
  memory: number;
  attention: number;
  pattern: number;
  recall: number;
  alerts: number;
  avatar: string;
}

export interface Reminder {
  id: string;
  patientId: string;
  title: string;
  type: string;
  time: string;
  date?: string;
  repeat: string;
  status: "pending" | "completed" | "missed";
  priority: "low" | "medium" | "high";
  enabled: boolean;
  notes: string;
}

export interface Appointment {
  id: string;
  patientId: string;
  doctor: string;
  hospital: string;
  date: string;
  time: string;
  purpose: string;
  location: string;
  status: string;
  notes: string;
}

export interface GameSession {
  id: string;
  patientId: string;
  game: string;
  date: string;
  accuracy: number;
  score?: number;
  attempts: number;
  timeSec: number;
  mistakes: number;
  hintsUsed: number;
  completed: boolean;
  difficulty: Difficulty | string;
  streak?: number;
}

export interface RoutineItem {
  id: string;
  time: string;
  label: string;
  icon: string;
  status: "completed" | "now" | "upcoming";
}

export interface Hydration {
  date: string;
  goal: number;
  current: number;
}

export interface Medication {
  id: string;
  label: string;
  medicine: string;
  time: string;
  status: "taken" | "pending";
}

export interface AlertItem {
  id: string;
  patientId: string;
  patient: string;
  severity: "HIGH" | "MEDIUM" | "LOW";
  category: string;
  message: string;
  time: string;
  acknowledged: boolean;
}

export interface AppSettings {
  language: LangCode | string;
  textSize: FontSize;
  contrast: ContrastMode;
  motion: MotionMode;
  theme: ThemeMode;
  notifications: boolean;
  voice: boolean;
  dataSharing: boolean;
  consent: boolean;
  demo?: boolean;
}

export interface MemoryItem {
  id: string;
  patientId: string;
  title: string;
  description: string;
  date: string;
  category: string;
  tags: string[];
  imageDataUrl?: string;
}

export interface GameMeta {
  id: string;
  nameKey: string;
  descKey: string;
  skillKey: string;
  category: "memory" | "focus" | "pattern" | "numbers" | "words" | "visual";
  emoji: string;
  minutes: number;
}

export interface GameStats {
  bestScore: number;
  lastPlayed: string | null;
  plays: number;
}
