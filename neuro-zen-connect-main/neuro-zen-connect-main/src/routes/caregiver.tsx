import { createFileRoute } from "@tanstack/react-router";
import { CaregiverPage } from "@/components/pages/caregiver-page";

export const Route = createFileRoute("/caregiver")({
  component: CaregiverPage,
});
