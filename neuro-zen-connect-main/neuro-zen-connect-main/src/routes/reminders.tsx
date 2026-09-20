import { createFileRoute } from "@tanstack/react-router";
import { RemindersPage } from "@/components/pages/reminders-page";

export const Route = createFileRoute("/reminders")({
  component: RemindersPage,
});
