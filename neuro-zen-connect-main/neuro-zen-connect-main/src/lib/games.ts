import type { GameMeta } from "./types";
import { t } from "./i18n";

export const GAMES: GameMeta[] = [
  { id: "memory", nameKey: "gameMemory", descKey: "gameMemoryDesc", skillKey: "catMemory", category: "memory", emoji: "🃏", minutes: 4 },
  { id: "pictures", nameKey: "gamePictures", descKey: "gamePicturesDesc", skillKey: "catMemory", category: "memory", emoji: "🖼️", minutes: 3 },
  { id: "numbers", nameKey: "gameNumbers", descKey: "gameNumbersDesc", skillKey: "catNumbers", category: "numbers", emoji: "🔢", minutes: 3 },
  { id: "pattern", nameKey: "gamePattern", descKey: "gamePatternDesc", skillKey: "catPattern", category: "pattern", emoji: "🔷", minutes: 3 },
  { id: "words", nameKey: "gameWords", descKey: "gameWordsDesc", skillKey: "catWords", category: "words", emoji: "🔤", minutes: 3 },
  { id: "different", nameKey: "gameDifferent", descKey: "gameDifferentDesc", skillKey: "catVisual", category: "visual", emoji: "🔍", minutes: 3 },
  { id: "attention", nameKey: "gameAttention", descKey: "gameAttentionDesc", skillKey: "catFocus", category: "focus", emoji: "🎯", minutes: 3 },
  { id: "recall", nameKey: "gameRecall", descKey: "gameRecallDesc", skillKey: "catMemory", category: "memory", emoji: "🗂️", minutes: 4 },
];

export const CATEGORIES = ["memory", "focus", "pattern", "numbers", "words", "visual"] as const;

export function gameName(id: string): string {
  const g = GAMES.find((x) => x.id === id);
  return g ? t(g.nameKey) : id;
}

export function pairCount(difficulty: string): number {
  if (difficulty === "BEGINNER") return 3;
  if (difficulty === "EASY") return 4;
  if (difficulty === "HARD") return 8;
  return 6;
}

export function roundCount(difficulty: string): number {
  if (difficulty === "BEGINNER") return 4;
  if (difficulty === "EASY") return 5;
  if (difficulty === "HARD") return 8;
  return 6;
}

export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const tmp = a[i];
    a[i] = a[j] as T;
    a[j] = tmp as T;
  }
  return a;
}
