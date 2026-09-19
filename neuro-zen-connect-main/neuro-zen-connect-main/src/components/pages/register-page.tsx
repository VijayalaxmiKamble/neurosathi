import { Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useApp } from "@/context/app-context";
import { login, register } from "@/lib/auth";
import type { Role } from "@/lib/types";

export function RegisterPage() {
  const { t, refreshSession } = useApp();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Role>("patient");
  const [error, setError] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const res = register({ name, username, password, role });
    if (!res.ok) {
      setError(res.error);
      return;
    }
    const logged = login(username.trim().toLowerCase(), password);
    if (logged.ok) {
      refreshSession();
      void navigate({ to: logged.session.role === "caregiver" ? "/caregiver" : "/home" });
    }
  };

  return (
    <div className="mx-auto flex min-h-dvh max-w-lg flex-col justify-center p-6">
      <h1 className="text-3xl font-bold">{t("register")}</h1>
      <form className="mt-6 space-y-3" onSubmit={submit}>
        <label className="block font-semibold">
          {t("name")}
          <input className="mt-1 min-h-12 w-full rounded-xl border px-3" value={name} onChange={(e) => setName(e.target.value)} required />
        </label>
        <label className="block font-semibold">
          {t("username")}
          <input className="mt-1 min-h-12 w-full rounded-xl border px-3" value={username} onChange={(e) => setUsername(e.target.value)} required />
        </label>
        <label className="block font-semibold">
          {t("password")}
          <input className="mt-1 min-h-12 w-full rounded-xl border px-3" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </label>
        <label className="block font-semibold">
          {t("role")}
          <select className="mt-1 min-h-12 w-full rounded-xl border px-3" value={role} onChange={(e) => setRole(e.target.value as Role)}>
            <option value="patient">{t("elderly")}</option>
            <option value="caregiver">{t("caregiver")}</option>
          </select>
        </label>
        {error ? <p className="text-destructive">{error}</p> : null}
        <Button className="min-h-14 w-full text-lg" type="submit">
          {t("register")}
        </Button>
      </form>
      <p className="mt-4 text-center">
        {t("haveAccount")}{" "}
        <Link to="/" className="font-semibold underline">
          {t("signIn")}
        </Link>
      </p>
    </div>
  );
}
