import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import {
  Activity,
  Bell,
  BellRing,
  BarChart3,
  Brain,
  Calendar,
  CalendarDays,
  ChevronDown,
  ClipboardCheck,
  FileText,
  GraduationCap,
  HelpCircle,
  Home,
  Library,
  LogOut,
  Menu,
  MessageCircle,
  Settings,
  Moon,
  Sun,
  Target,
  Trophy,
  UserRound,
  Users,
  Volume2,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useApp } from "@/context/app-context";
import { getSession, homeFor, logout } from "@/lib/auth";
import { getData, KEYS } from "@/lib/storage";
import { getNotifications } from "@/lib/feature-data";
import type { AlertItem, Patient } from "@/lib/types";
import { speakIfEnabled } from "@/lib/voice";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const PATIENT_NAV = [
  { label: "Main", items: [{ to: "/home", key: "navHome", icon: Home }, { to: "/learning", key: "learningHub", icon: GraduationCap }, { to: "/games", key: "navGames", icon: Brain }, { to: "/daily-challenge", key: "dailyChallenge", icon: Target }, { to: "/daily-plan", key: "dailyPlan", icon: CalendarDays }] },
  { label: "Progress", items: [{ to: "/progress", key: "navProgress", icon: FileText }, { to: "/analytics", key: "analytics", icon: BarChart3 }, { to: "/achievements", key: "achievements", icon: Trophy }, { to: "/reports", key: "navReports", icon: FileText }] },
  { label: "Personal", items: [{ to: "/memories", key: "navMemories", icon: Activity }, { to: "/reminders", key: "navReminders", icon: Bell }, { to: "/notifications", key: "notifications", icon: BellRing }, { to: "/profile", key: "profile", icon: UserRound }] },
  { label: "Support & Learning", items: [{ to: "/assessment", key: "assessment", icon: ClipboardCheck }, { to: "/resources", key: "resources", icon: Library }, { to: "/ai-assistant", key: "aiAssistant", icon: MessageCircle }, { to: "/family-dashboard", key: "familyDashboard", icon: Users }, { to: "/help", key: "navHelp", icon: HelpCircle }, { to: "/settings", key: "navSettings", icon: Settings }] },
] as const;

const CAREGIVER_NAV = [
  { label: "Main", items: [{ to: "/caregiver", key: "navDashboard", icon: Home }, { to: "/learning", key: "learningHub", icon: GraduationCap }, { to: "/games", key: "navGames", icon: Brain }, { to: "/daily-challenge", key: "dailyChallenge", icon: Target }, { to: "/daily-plan", key: "dailyPlan", icon: CalendarDays }] },
  { label: "Progress", items: [{ to: "/progress", key: "navProgress", icon: FileText }, { to: "/analytics", key: "analytics", icon: BarChart3 }, { to: "/achievements", key: "achievements", icon: Trophy }, { to: "/reports", key: "navReports", icon: FileText }] },
  { label: "Personal", items: [{ to: "/users", key: "navUsers", icon: Users }, { to: "/memories", key: "navMemories", icon: Activity }, { to: "/reminders", key: "navReminders", icon: Bell }, { to: "/notifications", key: "notifications", icon: BellRing }, { to: "/profile", key: "profile", icon: UserRound }, { to: "/alerts", key: "navAlerts", icon: Bell }] },
  { label: "Support & Learning", items: [{ to: "/assessment", key: "assessment", icon: ClipboardCheck }, { to: "/resources", key: "resources", icon: Library }, { to: "/ai-assistant", key: "aiAssistant", icon: MessageCircle }, { to: "/family-dashboard", key: "familyDashboard", icon: Users }, { to: "/help", key: "navHelp", icon: HelpCircle }, { to: "/settings", key: "navSettings", icon: Settings }] },
] as const;

export function AppShell({ children, title }: { children: React.ReactNode; title?: string }) {
  const { t, session, online, settings, setSettings, ready } = useApp();
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
  const unreadNotifications = getNotifications().filter((item) => !item.read).length;

  const displayName = session?.name ?? patient?.name ?? "NeuroSathi";

  const emergency = () => {
    toast.message(patient?.caregiver ?? t("emergency"), {
      description: `${patient?.caregiverPhone ?? ""} · ${patient?.hospital ?? ""}`,
    });
    speakIfEnabled(`${t("emergency")}. ${patient?.caregiver ?? ""}. ${patient?.caregiverPhone ?? ""}`);
  };

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
      {open ? <button className="fixed inset-0 z-30 bg-foreground/35 md:hidden" aria-label="Close menu" onClick={() => setOpen(false)} /> : null}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex w-70 flex-col gap-3 bg-sidebar p-4 text-sidebar-foreground shadow-xl transition-transform md:static md:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full md:translate-x-0",
        )}
      >
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <div className="grid size-11 place-items-center rounded-xl bg-sidebar-primary text-xl text-sidebar-primary-foreground shadow-sm" aria-hidden>
              🧠
            </div>
            <div>
              <div className="text-lg font-bold">{t("appName")}</div>
              <div className="text-xs text-sidebar-foreground/70">{t("tagline")}</div>
            </div>
          </div>
          <button className="md:hidden" onClick={() => setOpen(false)} aria-label="Close">
            <X />
          </button>
        </div>
        <div className="rounded-xl border border-sidebar-border bg-sidebar-accent/70 p-3">
          <div className="font-semibold">{displayName}</div>
          <div className="text-sm text-sidebar-foreground/70">{online ? t("online") : t("offline")}</div>
        </div>
        <nav className="flex flex-1 flex-col gap-2 overflow-y-auto" aria-label="Main">
          {nav.map((group) => <details key={group.label} open className="group/nav">
            <summary className="flex cursor-pointer list-none items-center justify-between rounded-lg px-3 py-2 text-xs font-bold uppercase tracking-[0.14em] text-sidebar-foreground/55 [&::-webkit-details-marker]:hidden">
              {group.label}<ChevronDown className="size-4 transition-transform group-open/nav:rotate-180" />
            </summary>
            <div className="mt-1 space-y-1">
              {group.items.map((item) => {
                const active = location.pathname === item.to || location.pathname.startsWith(`${item.to}/`);
                const Icon = item.icon;
                return <Link key={item.to} to={item.to} onClick={() => setOpen(false)} className={cn("flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-medium", active ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-sm" : "text-sidebar-foreground/90 hover:bg-sidebar-accent")} aria-current={active ? "page" : undefined}><Icon className="size-4" />{t(item.key)}</Link>;
              })}
            </div>
          </details>)}
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
            <Button
              variant="outline"
              size="icon"
              className="size-10 rounded-full"
              onClick={() => setSettings({ theme: settings.theme === "dark" ? "light" : "dark" })}
              aria-label={settings.theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
              title={settings.theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
            >
              {settings.theme === "dark" ? <Sun /> : <Moon />}
            </Button>
            {settings.voice ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-3 py-1 text-sm text-secondary-foreground">
                <Volume2 className="size-4" /> {t("voice")}
              </span>
            ) : null}
            <Button variant="outline" className="min-h-12" onClick={() => void navigate({ to: "/notifications" })}>
              <Bell className="size-5" /> {unreadNotifications}
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
