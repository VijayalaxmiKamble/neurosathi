import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { AppSettings, Session } from "@/lib/types";
import { applyDocumentSettings, getSettings, KEYS, seed, updateData } from "@/lib/storage";
import { getSession } from "@/lib/auth";
import { t as i18nT } from "@/lib/i18n";

interface AppState {
  ready: boolean;
  session: Session | null;
  settings: AppSettings;
  online: boolean;
  setSettings: (patch: Partial<AppSettings>) => void;
  refreshSession: () => void;
  t: (key: string, vars?: Record<string, string | number>) => string;
}

const Ctx = createContext<AppState | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const [settings, setSettingsState] = useState<AppSettings>(() =>
    typeof window === "undefined"
      ? {
          language: "en",
          textSize: "large",
          contrast: "normal",
          motion: "normal",
          theme: "light",
          notifications: true,
          voice: false,
          dataSharing: false,
          consent: true,
        }
      : getSettings(),
  );
  const [online, setOnline] = useState(typeof navigator === "undefined" ? true : navigator.onLine);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    seed();
    setSession(getSession());
    const s = getSettings();
    setSettingsState(s);
    applyDocumentSettings(s);
    setReady(true);
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    return () => {
      window.removeEventListener("online", on);
      window.removeEventListener("offline", off);
    };
  }, []);

  const setSettings = useCallback((patch: Partial<AppSettings>) => {
    const next = updateData<AppSettings>(KEYS.settings, patch);
    setSettingsState(next);
    applyDocumentSettings(next);
    setTick((n) => n + 1);
  }, []);

  const refreshSession = useCallback(() => {
    setSession(getSession());
    setTick((n) => n + 1);
  }, []);

  const t = useCallback(
    (key: string, vars?: Record<string, string | number>) => i18nT(key, vars),
    [settings.language, tick],
  );

  const value = useMemo(
    () => ({ ready, session, settings, online, setSettings, refreshSession, t }),
    [ready, session, settings, online, setSettings, refreshSession, t],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useApp(): AppState {
  const v = useContext(Ctx);
  if (!v) throw new Error("useApp must be used within AppProvider");
  return v;
}
