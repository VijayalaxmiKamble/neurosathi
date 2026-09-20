import { activityStreak, calculateCognitiveEngagement } from "./ai";
import { getData, KEYS, saveData, today, uid } from "./storage";
import type { GameSession, Reminder } from "./types";

export type Difficulty = "Easy" | "Medium" | "Hard";

export interface LearningActivity {
  id: string;
  title: string;
  category: "Reading" | "Vocabulary" | "Memory" | "Focus";
  description: string;
  difficulty: Difficulty;
  minutes: number;
  progress: number;
}

export interface DailyTask {
  id: string;
  title: string;
  kind: "Goal" | "Game" | "Learning" | "Reminder";
  priority: "Low" | "Medium" | "High";
  completed: boolean;
  date: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  target: number;
  progress: number;
  earnedAt?: string;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  category: "Achievement" | "Reminder" | "Progress" | "System";
  read: boolean;
  createdAt: string;
}

export interface DailyChallengeState {
  date: string;
  completed: boolean;
  progress: number;
  points: number;
}

export interface ResourceItem {
  id: string;
  title: string;
  category: "Learning tips" | "Memory tips" | "Focus tips" | "Reading exercises" | "Guides";
  description: string;
  readTime: string;
}

export const LEARNING_ACTIVITIES: LearningActivity[] = [
  { id: "reading-1", title: "Read and recall", category: "Reading", description: "Read a short passage and answer three gentle questions.", difficulty: "Easy", minutes: 5, progress: 72 },
  { id: "reading-2", title: "Story sequence", category: "Reading", description: "Put a familiar story's key moments in the right order.", difficulty: "Medium", minutes: 8, progress: 35 },
  { id: "words-1", title: "Word connections", category: "Vocabulary", description: "Match everyday words with related ideas and objects.", difficulty: "Easy", minutes: 4, progress: 58 },
  { id: "words-2", title: "New words in context", category: "Vocabulary", description: "Explore useful words through short, meaningful examples.", difficulty: "Hard", minutes: 10, progress: 18 },
  { id: "memory-1", title: "Everyday details", category: "Memory", description: "Practice remembering names, places, and small daily details.", difficulty: "Medium", minutes: 6, progress: 46 },
  { id: "memory-2", title: "Routine recall", category: "Memory", description: "Build a simple sequence from a familiar daily routine.", difficulty: "Easy", minutes: 5, progress: 81 },
  { id: "focus-1", title: "Calm focus", category: "Focus", description: "Try a short visual attention exercise at your own pace.", difficulty: "Easy", minutes: 3, progress: 64 },
  { id: "focus-2", title: "Focused reading", category: "Focus", description: "Use a paced reading activity to practice sustained attention.", difficulty: "Medium", minutes: 7, progress: 22 },
];

export const RESOURCES: ResourceItem[] = [
  { id: "resource-1", title: "Small steps for learning", category: "Learning tips", description: "A calm, repeatable approach to building a daily learning habit.", readTime: "4 min read" },
  { id: "resource-2", title: "Remembering names and faces", category: "Memory tips", description: "Simple association techniques for everyday conversations.", readTime: "5 min read" },
  { id: "resource-3", title: "A focused five-minute reset", category: "Focus tips", description: "A short routine for returning attention to one activity.", readTime: "3 min read" },
  { id: "resource-4", title: "Reading for enjoyment", category: "Reading exercises", description: "Gentle prompts that make reading feel active and rewarding.", readTime: "6 min read" },
  { id: "resource-5", title: "Planning a comfortable practice session", category: "Guides", description: "Choose a time, difficulty, and stopping point that feels right.", readTime: "7 min read" },
  { id: "resource-6", title: "Using repetition well", category: "Memory tips", description: "How spaced practice can make familiar information easier to retrieve.", readTime: "5 min read" },
];

export const ASSESSMENT_QUESTIONS = [
  { id: "q1", category: "Memory", prompt: "Which item was mentioned first in the short list?", options: ["Garden", "Morning tea", "Notebook", "Music"], answer: 1 },
  { id: "q2", category: "Focus", prompt: "Which number comes next: 2, 4, 6, 8, ...?", options: ["9", "10", "11", "12"], answer: 1 },
  { id: "q3", category: "Vocabulary", prompt: "Which word is closest in meaning to 'calm'?", options: ["Peaceful", "Noisy", " hurried", "Bright"], answer: 0 },
  { id: "q4", category: "Planning", prompt: "What is a helpful way to begin a new activity?", options: ["Skip instructions", "Choose a comfortable level", "Rush through it", "Avoid breaks"], answer: 1 },
];

export function patientId(): string {
  return getData<{ patientId?: string } | null>(KEYS.session, null)?.patientId ?? "p-001";
}

export function getLearning(): LearningActivity[] {
  return getData<LearningActivity[]>(KEYS.learning, LEARNING_ACTIVITIES);
}

export function updateLearningProgress(id: string, progress: number): LearningActivity[] {
  const next = getLearning().map((item) => item.id === id ? { ...item, progress: Math.min(100, Math.max(item.progress, progress)) } : item);
  saveData(KEYS.learning, next);
  return next;
}

export function getDailyTasks(): DailyTask[] {
  const stored = getData<DailyTask[]>(KEYS.dailyTasks, []);
  const current = stored.filter((task) => task.date === today());
  if (current.length) return current;
  const reminders = getData<Reminder[]>(KEYS.reminders, []).filter((item) => item.patientId === patientId()).slice(0, 3);
  const seeded: DailyTask[] = [
    { id: "goal-focus", title: "Take a comfortable learning break", kind: "Goal", priority: "Medium", completed: false, date: today() },
    { id: "game-memory", title: "Play Memory Match", kind: "Game", priority: "High", completed: false, date: today() },
    { id: "learn-reading", title: "Read and recall", kind: "Learning", priority: "Medium", completed: false, date: today() },
    ...reminders.map((item) => ({ id: `reminder-${item.id}`, title: item.title, kind: "Reminder" as const, priority: item.priority === "high" ? "High" as const : item.priority === "low" ? "Low" as const : "Medium" as const, completed: item.status === "completed", date: today() })),
  ];
  saveData(KEYS.dailyTasks, seeded);
  return seeded;
}

export function saveDailyTasks(tasks: DailyTask[]): void {
  const otherDays = getData<DailyTask[]>(KEYS.dailyTasks, []).filter((task) => task.date !== today());
  saveData(KEYS.dailyTasks, [...otherDays, ...tasks]);
}

export function getChallenge(): DailyChallengeState {
  const stored = getData<DailyChallengeState | null>(KEYS.dailyChallenge, null);
  if (stored?.date === today()) return stored;
  const fresh = { date: today(), completed: false, progress: 0, points: 25 };
  saveData(KEYS.dailyChallenge, fresh);
  return fresh;
}

export function saveChallenge(state: DailyChallengeState): void {
  saveData(KEYS.dailyChallenge, state);
}

export function getAchievements(): Achievement[] {
  const sessions = getData<GameSession[]>(KEYS.sessions, []).filter((item) => item.patientId === patientId() && item.completed);
  const learning = getLearning();
  const streak = activityStreak(patientId());
  const definitions = [
    ["first-activity", "First Activity", "Complete your first practice activity.", "sparkles", 1, sessions.length],
    ["first-game", "First Game Completed", "Finish your first cognitive game.", "gamepad", 1, sessions.length],
    ["seven-streak", "7-Day Streak", "Practice across seven days.", "flame", 7, streak],
    ["thirty-streak", "30-Day Streak", "Keep a month-long practice rhythm.", "calendar", 30, streak],
    ["fifty-games", "50 Games Completed", "Complete fifty cognitive game sessions.", "trophy", 50, sessions.length],
    ["hundred-activities", "100 Activities Completed", "Complete one hundred activities.", "medal", 100, sessions.length + learning.filter((item) => item.progress >= 100).length],
    ["accuracy", "90% Accuracy", "Reach 90% accuracy in a completed game.", "target", 90, sessions.length ? Math.max(...sessions.map((item) => item.accuracy)) : 0],
    ["learning-master", "Learning Master", "Complete every learning category once.", "book-open", 4, new Set(learning.filter((item) => item.progress >= 100).map((item) => item.category)).size],
    ["memory-master", "Memory Master", "Complete three memory activities.", "brain", 3, learning.filter((item) => item.category === "Memory" && item.progress >= 100).length],
    ["focus-master", "Focus Master", "Complete three focus activities.", "focus", 3, learning.filter((item) => item.category === "Focus" && item.progress >= 100).length],
  ] as const;
  return definitions.map(([id, title, description, icon, target, progress]) => ({ id, title, description, icon, target, progress: Math.min(target, progress), ...(progress >= target ? { earnedAt: today() } : {}) }));
}

export function getNotifications(): AppNotification[] {
  const stored = getData<AppNotification[]>(KEYS.notifications, []);
  if (stored.length) return stored;
  const seeded: AppNotification[] = [
    { id: uid("notification"), title: "Your daily challenge is ready", message: "Take a few minutes for today's focused activity.", category: "Progress", read: false, createdAt: today() },
    { id: uid("notification"), title: "Keep your rhythm going", message: "A short practice session can count toward your progress.", category: "Reminder", read: false, createdAt: today() },
  ];
  saveData(KEYS.notifications, seeded);
  return seeded;
}

export function performanceSummary() {
  const sessions = getData<GameSession[]>(KEYS.sessions, []).filter((item) => item.patientId === patientId());
  const completed = sessions.filter((item) => item.completed);
  const learning = getLearning();
  const tasks = getDailyTasks();
  const accuracy = completed.length ? Math.round(completed.reduce((sum, item) => sum + item.accuracy, 0) / completed.length) : 0;
  return { sessions, completed, learning, tasks, accuracy, streak: activityStreak(patientId()), score: calculateCognitiveEngagement(patientId()), time: completed.reduce((sum, item) => sum + item.timeSec, 0) };
}