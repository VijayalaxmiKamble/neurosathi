import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { useApp } from "@/context/app-context";
import { LANGUAGES } from "@/lib/i18n";
import type { ContrastMode, FontSize, MotionMode, ThemeMode } from "@/lib/types";

function SettingsPageComponent() {
  const { t, settings, setSettings } = useApp();

  return (
    <AppShell title={t("navSettings")}>
      <div className="max-w-2xl space-y-6 rounded-2xl border bg-card p-6">
        <h2 className="text-2xl font-bold">{t("navSettings")}</h2>

        <div className="space-y-4">
          <div>
            <label className="block text-base font-semibold">{t("language")}</label>
            <select
              className="mt-1 min-h-12 w-full rounded-xl border px-3 text-base"
              value={settings.language}
              onChange={(e) => setSettings({ language: e.target.value })}
            >
              {LANGUAGES.map((l) => (
                <option key={l.code} value={l.code}>{l.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-base font-semibold">Text Size</label>
            <div className="mt-2 flex flex-wrap gap-2">
              {(["normal", "large", "xlarge"] as FontSize[]).map((size) => (
                <Button
                  key={size}
                  variant={settings.textSize === size ? "default" : "outline"}
                  className="min-h-12"
                  onClick={() => setSettings({ textSize: size })}
                >
                  {size.toUpperCase()}
                </Button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-base font-semibold">Contrast</label>
            <div className="mt-2 flex flex-wrap gap-2">
              {(["normal", "high"] as ContrastMode[]).map((c) => (
                <Button
                  key={c}
                  variant={settings.contrast === c ? "default" : "outline"}
                  className="min-h-12"
                  onClick={() => setSettings({ contrast: c })}
                >
                  {c.toUpperCase()}
                </Button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-base font-semibold">Motion</label>
            <div className="mt-2 flex flex-wrap gap-2">
              {(["normal", "reduced"] as MotionMode[]).map((m) => (
                <Button
                  key={m}
                  variant={settings.motion === m ? "default" : "outline"}
                  className="min-h-12"
                  onClick={() => setSettings({ motion: m })}
                >
                  {m.toUpperCase()}
                </Button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-base font-semibold">Theme</label>
            <div className="mt-2 flex flex-wrap gap-2">
              {(["light", "dark"] as ThemeMode[]).map((th) => (
                <Button
                  key={th}
                  variant={settings.theme === th ? "default" : "outline"}
                  className="min-h-12"
                  onClick={() => setSettings({ theme: th })}
                >
                  {th.toUpperCase()}
                </Button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between rounded-xl border p-4">
            <span className="font-semibold">{t("voice")}</span>
            <Button
              variant={settings.voice ? "default" : "outline"}
              className="min-h-12"
              onClick={() => setSettings({ voice: !settings.voice })}
            >
              {settings.voice ? "Enabled" : "Disabled"}
            </Button>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

export const Route = createFileRoute("/settings")({
  component: SettingsPageComponent,
});
