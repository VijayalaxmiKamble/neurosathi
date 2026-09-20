import { createFileRoute } from "@tanstack/react-router";
import { DailyChallengePage } from "@/components/pages/feature-pages";
function RouteComponent() { return <DailyChallengePage />; }
export const Route = createFileRoute("/daily-challenge/")({ component: RouteComponent });
