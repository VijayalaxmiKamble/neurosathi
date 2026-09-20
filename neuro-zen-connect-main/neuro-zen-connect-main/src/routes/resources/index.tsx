import { createFileRoute } from "@tanstack/react-router";
import { ResourcesPage } from "@/components/pages/feature-pages";
function RouteComponent() { return <ResourcesPage />; }
export const Route = createFileRoute("/resources/")({ component: RouteComponent });
