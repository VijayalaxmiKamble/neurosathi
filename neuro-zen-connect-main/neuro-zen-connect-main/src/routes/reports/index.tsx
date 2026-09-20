import { createFileRoute } from "@tanstack/react-router";
import { ReportsOverviewPage } from "@/components/pages/feature-pages";
function RouteComponent() { return <ReportsOverviewPage />; }
export const Route = createFileRoute("/reports/")({ component: RouteComponent });
