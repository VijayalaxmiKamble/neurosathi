import { createFileRoute } from "@tanstack/react-router";
import { DailyPlanPage } from "@/components/pages/feature-pages";
function RouteComponent() { return <DailyPlanPage />; }
export const Route = createFileRoute("/daily-plan/")({ component: RouteComponent });
