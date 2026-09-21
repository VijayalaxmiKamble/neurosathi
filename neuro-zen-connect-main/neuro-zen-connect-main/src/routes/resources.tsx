import { createFileRoute } from "@tanstack/react-router";
import { BookOpen, Heart, Sparkles, Stethoscope } from "lucide-react";

import { AppShell } from "@/components/layout/app-shell";
import { useApp } from "@/context/app-context";

function ResourcesPageComponent() {
  const { t } = useApp();

  const items = [
    {
      icon: Sparkles,
      title: "Daily wellbeing",
      description: "Light movement, hydration reminders, and a calm routine can support memory and confidence throughout the day.",
    },
    {
      icon: Heart,
      title: "Emotional support",
      description: "Gentle conversations, familiar music, and social check-ins can reduce stress and improve mood.",
    },
    {
      icon: Stethoscope,
      title: "Care plan",
      description: "Keep appointments, medication checks, and follow-up notes in one place for easier care coordination.",
    },
  ];

  return (
    <AppShell title={t("navResources")}>
      <div className="space-y-6">
        <div className="rounded-2xl border bg-card p-6">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-teal-100 px-3 py-1 text-sm font-medium text-teal-900 dark:bg-teal-900 dark:text-teal-100">
            <BookOpen className="size-4" />
            {t("navResources")}
          </div>
          <h2 className="text-2xl font-bold">Helpful routines and support</h2>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            Small, consistent habits can make a meaningful difference. Use this page for gentle reminders, wellbeing ideas, and support tools that fit daily life.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {items.map(({ icon: Icon, title, description }) => (
            <div key={title} className="rounded-2xl border bg-card p-5 shadow-sm">
              <div className="mb-4 inline-flex rounded-xl bg-primary/10 p-3 text-primary">
                <Icon className="size-5" />
              </div>
              <h3 className="text-lg font-semibold">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{description}</p>
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  );
}

export const Route = createFileRoute("/resources")({
  component: ResourcesPageComponent,
});
