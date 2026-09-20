import { createFileRoute } from "@tanstack/react-router";
import { AchievementsPage } from "@/components/pages/feature-pages";
function RouteComponent() { return <AchievementsPage />; }
export const Route = createFileRoute("/achievements/")({ component: RouteComponent });
