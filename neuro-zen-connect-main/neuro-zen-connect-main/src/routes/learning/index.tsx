import { createFileRoute } from "@tanstack/react-router";
import { LearningHubPage } from "@/components/pages/feature-pages";
function RouteComponent() { return <LearningHubPage />; }
export const Route = createFileRoute("/learning/")({ component: RouteComponent });
