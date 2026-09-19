import { useEffect, useMemo, useState } from "react";
import { GameHost, type GamePlayApi } from "./game-host";
import { pairCount, shuffle } from "@/lib/games";
import { getData, KEYS } from "@/lib/storage";
import type { RoutineItem } from "@/lib/types";
import { useApp } from "@/context/app-context";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const ICONS = ["🍵", "🌿", "🐘", "🎋", "🥁", "🌸", "🐟", "☂️", "🪔", "🧺", "🏠", "🌞"];
const OBJECTS = ["🍎", "🔑", "☕", "🕰️", "📕", "🧢", "🪑", "🧦", "🌂", "🔔", "🍌", "🪥"];
const PICTURES = ["🐘", "🌸", "🏠", "🛶", "🪔", "🥁", "🐟", "🌴", "🚲", "🫖", "📚", "🪁"];
const SETS = [
  ["🔵", "🟡"],
  ["🌸", "🍃"],
  ["⭐", "🌙"],
  ["🔺", "🔷"],
  ["🥁", "🎺"],
];
const WORDS: { prompt: string; answer: string; options: string[] }[] = [
  { prompt: "Tea", answer: "Cup", options: ["Cup", "Shoe", "Cloud", "Hammer"] },
  { prompt: "Rain", answer: "Umbrella", options: ["Umbrella", "Pencil", "Chair", "Bell"] },
  { prompt: "Garden", answer: "Flower", options: ["Flower", "Keyboard", "Engine", "Clock"] },
  { prompt: "Family", answer: "Home", options: ["Home", "Voltage", "Cement", "Pixel"] },
  { prompt: "Morning", answer: "Sunrise", options: ["Sunrise", "Tunnel", "Battery", "Folder"] },
  { prompt: "Doctor", answer: "Hospital", options: ["Hospital", "Guitar", "Ocean", "Ticket"] },
  { prompt: "Book", answer: "Read", options: ["Read", "Tire", "Magnet", "Ladder"] },
  { prompt: "Sleep", answer: "Bed", options: ["Bed", "Stamp", "Cable", "Brick"] },
];

function MemoryBoard({ api }: { api: GamePlayApi & { resetKey: number } }) {
  const { t } = useApp();
  const count = pairCount(api.difficulty);
  const [deck, setDeck] = useState<string[]>([]);
  const [flipped, setFlipped] = useState<number[]>([]);
  const [matched, setMatched] = useState<number[]>([]);
  const [lock, setLock] = useState(false);
  const [pairs, setPairs] = useState(0);

  useEffect(() => {
    const d = shuffle(ICONS.slice(0, count).flatMap((i) => [i, i]));
    setDeck(d);
    setFlipped([]);
    setMatched([]);
    setLock(false);
    setPairs(0);
  }, [api.resetKey, count]);

  const flip = (i: number) => {
    if (lock || matched.includes(i) || flipped.includes(i)) return;
    const next = [...flipped, i];
    setFlipped(next);
    if (next.length === 2) {
      const [a, b] = next;
      const ia = a ?? -1;
      const ib = b ?? -1;
      setLock(true);
      if (deck[ia] === deck[ib]) {
        api.onCorrect(t("correct"));
        setMatched((m) => [...m, ia, ib]);
        const np = pairs + 1;
        setPairs(np);
        setFlipped([]);
        setLock(false);
        if (np === count) window.setTimeout(() => api.finish(), 600);
      } else {
        api.onWrong(t("friendlyWrong"));
        window.setTimeout(() => {
          setFlipped([]);
          setLock(false);
        }, 900);
      }
    }
  };

  return (
    <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
      {deck.map((icon, i) => {
        const open = flipped.includes(i) || matched.includes(i);
        return (
          <button
            key={`${api.resetKey}-${i}`}
            className={cn(
              "flex aspect-square items-center justify-center rounded-2xl border text-4xl shadow-sm transition",
              open ? "bg-teal-50 dark:bg-teal-950" : "bg-card",
              matched.includes(i) && "ring-4 ring-teal-500",
            )}
            onClick={() => flip(i)}
            aria-label={open ? `Card ${icon}` : `Card ${i + 1} face down`}
          >
            {open ? icon : "?"}
          </button>
        );
      })}
    </div>
  );
}

function Pictures({ api }: { api: GamePlayApi & { resetKey: number } }) {
  const { t } = useApp();
  const n = api.difficulty === "BEGINNER" ? 2 : api.difficulty === "HARD" ? 5 : api.difficulty === "EASY" ? 3 : 4;
  const [shown, setShown] = useState<string[]>([]);
  const [choices, setChoices] = useState<string[]>([]);
  const [picked, setPicked] = useState<string[]>([]);
  const [reveal, setReveal] = useState(true);

  useEffect(() => {
    const s = shuffle(PICTURES).slice(0, n);
    const rest = shuffle(PICTURES.filter((p) => !s.includes(p))).slice(0, 4);
    setShown(s);
    setChoices(shuffle([...s, ...rest]));
    setPicked([]);
    setReveal(true);
    const id = window.setTimeout(() => setReveal(false), api.difficulty === "BEGINNER" ? 5000 : 3500);
    return () => window.clearTimeout(id);
  }, [api.resetKey, api.round, n, api.difficulty]);

  if (reveal) {
    return (
      <div className="space-y-4">
        <p className="text-xl">{t("instructions")}: look, then remember.</p>
        <div className="flex flex-wrap justify-center gap-3 text-5xl">
          {shown.map((p) => (
            <span key={p} className="rounded-2xl border bg-card p-6">
              {p}
            </span>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-xl">Tap the pictures you just saw.</p>
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
        {choices.map((c) => (
          <button
            key={c}
            className={cn("min-h-20 rounded-2xl border text-4xl", picked.includes(c) && "ring-4 ring-teal-600")}
            onClick={() => setPicked((p) => (p.includes(c) ? p.filter((x) => x !== c) : [...p, c]))}
          >
            {c}
          </button>
        ))}
      </div>
      <Button
        className="min-h-14 text-lg"
        onClick={() => {
          const ok = shown.every((s) => picked.includes(s)) && picked.length === shown.length;
          if (ok) api.onCorrect();
          else api.onWrong();
          api.nextRound();
        }}
      >
        {t("next")}
      </Button>
    </div>
  );
}

function Numbers({ api }: { api: GamePlayApi & { resetKey: number } }) {
  const { t } = useApp();
  const puzzle = useMemo(() => {
    const step = api.difficulty === "HARD" ? 4 : api.difficulty === "BEGINNER" ? 1 : 2;
    const start = 2 + Math.floor(Math.random() * 6);
    const seq = Array.from({ length: 4 }, (_, i) => start + i * step);
    const answer = start + 4 * step;
    const opts = shuffle([answer, answer + step, answer - step, answer + 3]);
    return { seq, answer, opts };
  }, [api.round, api.resetKey, api.difficulty]);

  return (
    <div className="space-y-4">
      <p className="text-xl">What number comes next?</p>
      <div className="flex flex-wrap gap-3 text-3xl font-bold">
        {puzzle.seq.map((n) => (
          <span key={n} className="rounded-xl border bg-card px-5 py-3">
            {n}
          </span>
        ))}
        <span className="rounded-xl border border-dashed px-5 py-3">?</span>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {puzzle.opts.map((o) => (
          <Button
            key={o}
            variant="outline"
            className="min-h-16 text-2xl"
            onClick={() => {
              if (o === puzzle.answer) api.onCorrect();
              else api.onWrong();
              api.nextRound();
            }}
          >
            {o}
          </Button>
        ))}
      </div>
    </div>
  );
}

function Pattern({ api }: { api: GamePlayApi & { resetKey: number } }) {
  const { t } = useApp();
  const puzzle = useMemo(() => {
    const set = SETS[Math.floor(Math.random() * SETS.length)] ?? ["🔵", "🟡"];
    const period = api.difficulty === "HARD" ? 3 : 2;
    const symbols = period === 3 ? [set[0], set[1], "🟣"] : set;
    const length = api.difficulty === "HARD" ? 7 : api.difficulty === "BEGINNER" ? 4 : 6;
    const seq = Array.from({ length }, (_, i) => symbols[i % symbols.length] ?? "🔵");
    const answer = symbols[length % symbols.length] ?? "🔵";
    const opts = shuffle(Array.from(new Set([answer, ...symbols, "🔶", "🍀"]))).slice(0, 4);
    return { seq, answer, opts };
  }, [api.round, api.resetKey, api.difficulty]);

  return (
    <div className="space-y-4">
      <p className="text-xl">{t("gamePatternDesc")}</p>
      <div className="flex flex-wrap gap-2 text-4xl">
        {puzzle.seq.map((s, i) => (
          <span key={i} className="rounded-xl border bg-card p-3">
            {s}
          </span>
        ))}
        <span className="rounded-xl border border-dashed p-3">❓</span>
      </div>
      <div className="flex flex-wrap gap-3">
        {puzzle.opts.map((o) => (
          <button
            key={o}
            className="min-h-16 min-w-16 rounded-2xl border text-4xl"
            onClick={() => {
              if (o === puzzle.answer) api.onCorrect();
              else api.onWrong();
              api.nextRound();
            }}
          >
            {o}
          </button>
        ))}
      </div>
    </div>
  );
}

function Words({ api }: { api: GamePlayApi & { resetKey: number } }) {
  const { t } = useApp();
  const item = useMemo(() => WORDS[(api.round + api.resetKey) % WORDS.length] ?? WORDS[0]!, [api.round, api.resetKey]);
  const opts = useMemo(() => shuffle(item.options), [item, api.resetKey, api.round]);
  return (
    <div className="space-y-4">
      <p className="text-xl">Which word belongs with:</p>
      <div className="rounded-2xl border bg-card p-6 text-center text-3xl font-bold">{item.prompt}</div>
      <div className="grid gap-3 sm:grid-cols-2">
        {opts.map((o) => (
          <Button
            key={o}
            variant="outline"
            className="min-h-16 text-xl"
            onClick={() => {
              if (o === item.answer) api.onCorrect();
              else api.onWrong();
              api.nextRound();
            }}
          >
            {o}
          </Button>
        ))}
      </div>
    </div>
  );
}

function Different({ api }: { api: GamePlayApi & { resetKey: number } }) {
  const { t } = useApp();
  const puzzle = useMemo(() => {
    const base = OBJECTS[Math.floor(Math.random() * OBJECTS.length)] ?? "🍎";
    let odd = OBJECTS[Math.floor(Math.random() * OBJECTS.length)] ?? "🔑";
    if (odd === base) odd = "🔔";
    const size = api.difficulty === "HARD" ? 12 : api.difficulty === "BEGINNER" ? 6 : 9;
    const oddAt = Math.floor(Math.random() * size);
    const cells = Array.from({ length: size }, (_, i) => (i === oddAt ? odd : base));
    return { cells, odd };
  }, [api.round, api.resetKey, api.difficulty]);

  return (
    <div className="space-y-4">
      <p className="text-xl">{t("gameDifferentDesc")}</p>
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
        {puzzle.cells.map((c, i) => (
          <button
            key={i}
            className="min-h-20 rounded-2xl border text-4xl"
            onClick={() => {
              if (c === puzzle.odd) api.onCorrect();
              else api.onWrong();
              api.nextRound();
            }}
          >
            {c}
          </button>
        ))}
      </div>
    </div>
  );
}

function Attention({ api }: { api: GamePlayApi & { resetKey: number } }) {
  const { t } = useApp();
  const puzzle = useMemo(() => {
    const count = api.difficulty === "BEGINNER" ? 6 : api.difficulty === "HARD" ? 12 : 9;
    const pool = shuffle(OBJECTS).slice(0, count);
    const target = pool[Math.floor(Math.random() * pool.length)] ?? "🍎";
    return { pool, target };
  }, [api.round, api.resetKey, api.difficulty]);

  return (
    <div className="space-y-4">
      <p className="text-2xl font-semibold">Tap the {puzzle.target} only</p>
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
        {puzzle.pool.map((o, i) => (
          <button
            key={`${o}-${i}`}
            className="min-h-20 rounded-2xl border text-4xl"
            onClick={() => {
              if (o === puzzle.target) {
                api.onCorrect();
                api.nextRound();
              } else api.onWrong();
            }}
          >
            {o}
          </button>
        ))}
      </div>
    </div>
  );
}

function Recall({ api }: { api: GamePlayApi & { resetKey: number } }) {
  const { t } = useApp();
  const n = api.difficulty === "BEGINNER" ? 4 : api.difficulty === "HARD" ? 8 : 6;
  const [items, setItems] = useState<RoutineItem[]>([]);
  const [solution, setSolution] = useState<RoutineItem[]>([]);

  useEffect(() => {
    const routine = getData<RoutineItem[]>(KEYS.routine, []).slice(0, n);
    setSolution(routine);
    setItems(shuffle(routine));
  }, [api.resetKey, n]);

  const move = (i: number, d: number) => {
    const j = i + d;
    if (j < 0 || j >= items.length) return;
    const next = [...items];
    const a = next[i];
    const b = next[j];
    if (!a || !b) return;
    next[i] = b;
    next[j] = a;
    setItems(next);
  };

  return (
    <div className="space-y-4">
      <p className="text-xl">{t("gameRecallDesc")}</p>
      <div className="space-y-2">
        {items.map((it, i) => (
          <div key={it.id} className="flex items-center gap-3 rounded-xl border bg-card p-3">
            <span className="w-8 text-xl font-bold">{i + 1}</span>
            <span className="flex-1 text-lg">
              {it.icon} {it.label}
            </span>
            <button className="min-h-12 min-w-12 rounded-lg border" disabled={i === 0} onClick={() => move(i, -1)} aria-label="Move up">
              ▲
            </button>
            <button
              className="min-h-12 min-w-12 rounded-lg border"
              disabled={i === items.length - 1}
              onClick={() => move(i, 1)}
              aria-label="Move down"
            >
              ▼
            </button>
          </div>
        ))}
      </div>
      <Button
        className="min-h-14 text-lg"
        onClick={() => {
          const right = items.filter((it, i) => it.id === solution[i]?.id).length;
          if (right === items.length) api.onCorrect();
          else api.onWrong(`${right} / ${items.length}`);
          api.finish();
        }}
      >
        Check order
      </Button>
    </div>
  );
}

const MAP: Record<string, (api: GamePlayApi & { resetKey: number }) => React.ReactNode> = {
  memory: (api) => <MemoryBoard api={api} />,
  pictures: (api) => <Pictures api={api} />,
  numbers: (api) => <Numbers api={api} />,
  pattern: (api) => <Pattern api={api} />,
  words: (api) => <Words api={api} />,
  different: (api) => <Different api={api} />,
  attention: (api) => <Attention api={api} />,
  recall: (api) => <Recall api={api} />,
};

export function PlayableGame({ gameId }: { gameId: string }) {
  return (
    <GameHost gameId={gameId}>
      {(api) => MAP[gameId]?.(api) ?? <p>Unknown game</p>}
    </GameHost>
  );
}
