import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import {
  Activity,
  Bell,
  Brain,
  Calendar,
  FileText,
  HelpCircle,
  Home,
  LogOut,
  Menu,
  Settings,
  Users,
  Volume2,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { useApp } from "@/context/app-context";
import { getSession, homeFor, logout } from "@/lib/auth";
import { getData, KEYS } from "@/lib/storage";
import type { AlertItem, Patient } from "@/lib/types";
import { speakIfEnabled } from "@/lib/voice";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const PATIENT_NAV = [
  { to: "/home", key: "navHome", icon: Home },
  { to: "/games", key: "navGames", icon: Brain },
  { to: "/memories", key: "navMemories", icon: Activity },
  { to: "/reminders", key: "navReminders", icon: Bell },
  { to: "/progress", key: "navProgress", icon: FileText },
  { to: "/help", key: "navHelp", icon: HelpCircle },
  { to: "/settings", key: "navSettings", icon: Settings },
] as const;

const CAREGIVER_NAV = [
  { to: "/caregiver", key: "navDashboard", icon: Home },
  { to: "/users", key: "navUsers", icon: Users },
  { to: "/games", key: "navGames", icon: Brain },
  { to: "/memories", key: "navMemories", icon: Activity },
  { to: "/reminders", key: "navReminders", icon: Bell },
  { to: "/reports", key: "navReports", icon: FileText },
  { to: "/alerts", key: "navAlerts", icon: Bell },
  { to: "/settings", key: "navSettings", icon: Settings },
] as const;

export function AppShell({ children, title }: { children: React.ReactNode; title?: string }) {
  const { t, session, online, settings, ready } = useApp();
  const location = useLocation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!ready) return;
    const s = getSession();
    if (!s) {
      void navigate({ to: "/" });
    }
  }, [ready, navigate]);

  const nav = session?.role === "caregiver" ? CAREGIVER_NAV : PATIENT_NAV;
  const patient = getData<Patient[]>(KEYS.patients, [])[0];
  const alerts = getData<AlertItem[]>(KEYS.alerts, []).filter((a) => !a.acknowledged);

  const displayName = session?.name ?? patient?.name ?? "NeuroSathi";

  const emergency = () => {
    toast.message(patient?.caregiver ?? t("emergency"), {
      description: `${patient?.caregiverPhone ?? ""} · ${patient?.hospital ?? ""}`,
    });
    speakIfEnabled(`${t("emergency")}. ${patient?.caregiver ?? ""}. ${patient?.caregiverPhone ?? ""}`);
  };

  const items = useMemo(() => nav, [nav]);

  if (!ready || !session) {
    return (
      <div className="flex min-h-dvh items-center justify-center text-lg text-muted-foreground">{t("loading")}</div>
    );
  }

  return (
    <div className="flex min-h-dvh bg-background">
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:bg-primary focus:p-3 focus:text-primary-foreground">
        {t("skip")}
      </a>
      {open ? <button className="fixed inset-0 z-30 bg-black/40 md:hidden" aria-label="Close menu" onClick={() => setOpen(false)} /> : null}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex w-[280px] flex-col gap-3 bg-[oklch(0.28_0.05_250)] p-4 text-white transition-transform md:static md:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full md:translate-x-0",
        )}
      >
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <div className="grid size-11 place-items-center rounded-xl bg-teal-600 text-xl" aria-hidden>
              🧠
            </div>
            <div>
              <div className="text-lg font-bold">{t("appName")}</div>
              <div className="text-xs text-white/70">{t("tagline")}</div>
            </div>
          </div>
          <button className="md:hidden" onClick={() => setOpen(false)} aria-label="Close">
            <X />
          </button>
        </div>
        <div className="rounded-xl bg-white/10 p-3">
          <div className="font-semibold">{displayName}</div>
          <div className="text-sm text-white/70">{online ? t("online") : t("offline")}</div>
        </div>
        <nav className="flex flex-1 flex-col gap-1" aria-label="Main">
          {items.map((item) => {
            const active = location.pathname === item.to || location.pathname.startsWith(`${item.to}/`);
            const Icon = item.icon;
            return (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setOpen(false)}
                className={cn(
                  "flex min-h-12 items-center gap-3 rounded-xl px-3 text-base font-medium",
                  active ? "bg-white text-[oklch(0.28_0.05_250)]" : "text-white/90 hover:bg-white/10",
                )}
                aria-current={active ? "page" : undefined}
              >
                <Icon className="size-5" />
                {t(item.key)}
              </Link>
            );
          })}
        </nav>
        <Button
          variant="destructive"
          className="min-h-12 text-base"
          onClick={() => {
            logout();
            void navigate({ to: "/" });
          }}
        >
          <LogOut className="size-5" /> {t("logout")}
        </Button>
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex flex-wrap items-center justify-between gap-3 border-b bg-card px-4 py-3">
          <div className="flex min-w-0 items-center gap-2">
            <button className="grid size-12 place-items-center rounded-xl border md:hidden" onClick={() => setOpen(true)} aria-label="Open menu">
              <Menu />
            </button>
            <div>
              <h1 className="truncate text-xl font-bold md:text-2xl">{title ?? t("appName")}</h1>
              {!online ? <p className="text-sm text-amber-700 dark:text-amber-300">{t("offline")}</p> : null}
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {settings.voice ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-teal-100 px-3 py-1 text-sm text-teal-900 dark:bg-teal-900 dark:text-teal-100">
                <Volume2 className="size-4" /> {t("voice")}
              </span>
            ) : null}
            <Button variant="outline" className="min-h-12" onClick={() => void navigate({ to: "/alerts" })}>
              <Bell className="size-5" /> {alerts.length}
            </Button>
            <Button variant="destructive" className="min-h-12" onClick={emergency}>
              {t("emergency")}
            </Button>
            <Link to="/appointments" className="hidden min-h-12 items-center gap-2 rounded-md border px-3 md:inline-flex">
              <Calendar className="size-5" /> {t("navAppointments")}
            </Link>
          </div>
        </header>
        <main id="main" className="mx-auto w-full max-w-6xl flex-1 p-4 md:p-6" tabIndex={-1}>
          {children}
          <p className="mt-8 text-sm text-muted-foreground">{t("disclaimer")}</p>
        </main>
      </div>
    </div>
  );
}
