import { createFileRoute } from "@tanstack/react-router";
import { NotificationsPage } from "@/components/pages/feature-pages";
function RouteComponent() { return <NotificationsPage />; }
export const Route = createFileRoute("/notifications/")({ component: RouteComponent });
