import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "NeuroSaathi — Cognitive Gaming & Memory Assistance for NER" },
      {
        name: "description",
        content:
          "NeuroSaathi is an offline-friendly cognitive gaming and memory assistance dashboard for elderly users and caregivers in the North Eastern Region.",
      },
      { property: "og:title", content: "NeuroSaathi — Cognitive Gaming & Memory Assistance" },
      {
        property: "og:description",
        content:
          "Offline-friendly cognitive gaming and memory assistance for elderly users and caregivers in the North Eastern Region.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  loader: () => {
    if (typeof window !== "undefined") {
      window.location.replace("/neurosaathi-dashboard/index.html");
      return new Promise(() => {});
    }
    throw redirect({ href: "/neurosaathi-dashboard/index.html" });
  },
  component: () => null,
});
