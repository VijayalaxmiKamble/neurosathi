import { Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useApp } from "@/context/app-context";
import { getSession, homeFor, login } from "@/lib/auth";
import { LANGUAGES } from "@/lib/i18n";
import { seed } from "@/lib/storage";
import type { Role } from "@/lib/types";

export function LoginPage() {
  const { t, setSettings, refreshSession, ready } = useApp();
  const navigate = useNavigate();
  const [role, setRole] = useState<Role>("patient");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [lang, setLang] = useState("en");

  useEffect(() => {
    if (!ready) return;
    const s = getSession();
    if (s) void navigate({ to: homeFor(s.role) });
  }, [ready, navigate]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      setError("Please enter both username and password.");
      return;
    }
    const res = login(username, password, role);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    setSettings({ language: lang });
    refreshSession();
    void navigate({ to: homeFor(res.session.role) });
  };

  return (
    <div className="min-h-dvh bg-[oklch(0.97_0.01_240)] dark:bg-background">
      <div className="mx-auto grid max-w-6xl gap-8 p-6 lg:grid-cols-2 lg:items-center">
        <section className="space-y-4">
          <div className="flex items-center gap-3 text-3xl font-bold">
            <span className="grid size-12 place-items-center rounded-xl bg-teal-600 text-white">🧠</span>
            {t("appName")}
          </div>
          <h1 className="text-3xl font-bold leading-tight md:text-4xl">{t("tagline")}</h1>
          <ul className="space-y-2 text-lg text-muted-foreground">
            <li>Large buttons, clear language, and calm feedback</li>
            <li>Playable cognitive games with scores you can track</li>
            <li>Memories, reminders, and caregiver overview</li>
            <li>Works on this device even when the internet is slow</li>
          </ul>
          <p className="text-sm text-muted-foreground">{t("disclaimer")}</p>
        </section>
        <section className="rounded-2xl border bg-card p-6 shadow-sm">
          <div className="mb-4 grid grid-cols-2 gap-2">
            {(["patient", "caregiver"] as const).map((r) => (
              <button
                key={r}
                type="button"
                className={`min-h-14 rounded-xl border text-lg font-semibold ${role === r ? "bg-teal-700 text-white" : ""}`}
                onClick={() => setRole(r)}
              >
                {r === "patient" ? t("elderly") : t("caregiver")}
              </button>
            ))}
          </div>
          <h2 className="text-2xl font-bold">{role === "caregiver" ? t("caregiverSignIn") : t("elderlySignIn")}</h2>
          <form className="mt-4 space-y-3" onSubmit={submit}>
            <label className="block text-base font-semibold">
              {t("username")}
              <input className="mt-1 min-h-12 w-full rounded-xl border px-3" value={username} onChange={(e) => setUsername(e.target.value)} autoComplete="username" />
            </label>
            <label className="block text-base font-semibold">
              {t("password")}
              <input className="mt-1 min-h-12 w-full rounded-xl border px-3" type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" />
            </label>
            <label className="block text-base font-semibold">
              {t("language")}
              <select
                className="mt-1 min-h-12 w-full rounded-xl border px-3"
                value={lang}
                onChange={(e) => {
                  setLang(e.target.value);
                  setSettings({ language: e.target.value });
                }}
              >
                {LANGUAGES.map((l) => (
                  <option key={l.code} value={l.code}>
                    {l.label}
                  </option>
                ))}
              </select>
            </label>
            {error ? <p className="text-destructive" role="alert">{error}</p> : null}
            <Button className="min-h-14 w-full text-lg" type="submit">
              {t("signIn")}
            </Button>
          </form>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button type="button" variant="secondary" className="min-h-12" onClick={() => { setUsername("patient"); setPassword("patient123"); setRole("patient"); }}>
              {t("demoPatient")}
            </Button>
            <Button type="button" variant="secondary" className="min-h-12" onClick={() => { setUsername("caregiver"); setPassword("care123"); setRole("caregiver"); }}>
              {t("demoCaregiver")}
            </Button>
          </div>
          <Button
            type="button"
            className="mt-3 min-h-14 w-full bg-teal-700 text-lg text-white hover:bg-teal-800"
            onClick={() => {
              seed(true);
              const res = login("patient", "patient123", "patient");
              if (res.ok) {
                refreshSession();
                toast.success("Sample data loaded.");
                void navigate({ to: "/home" });
              }
            }}
          >
            {t("demoMode")}
          </Button>
          <p className="mt-4 text-center text-base">
            {t("noAccount")}{" "}
            <Link to="/register" className="font-semibold text-teal-800 underline">
              {t("register")}
            </Link>
          </p>
          <div className="mt-4 rounded-xl bg-muted p-3 text-sm">
            <strong>Demo:</strong> patient / patient123 · caregiver / care123
          </div>
        </section>
      </div>
    </div>
  );
}
