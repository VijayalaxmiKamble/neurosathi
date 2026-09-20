import { createFileRoute } from "@tanstack/react-router";
import { FamilyDashboardPage } from "@/components/pages/feature-pages";
function RouteComponent() { return <FamilyDashboardPage />; }
export const Route = createFileRoute("/family-dashboard/")({ component: RouteComponent });
