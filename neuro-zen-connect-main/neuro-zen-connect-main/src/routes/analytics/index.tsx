import { createFileRoute } from "@tanstack/react-router";
import { AnalyticsPage } from "@/components/pages/feature-pages";
function RouteComponent() { return <AnalyticsPage />; }
export const Route = createFileRoute("/analytics/")({ component: RouteComponent });
