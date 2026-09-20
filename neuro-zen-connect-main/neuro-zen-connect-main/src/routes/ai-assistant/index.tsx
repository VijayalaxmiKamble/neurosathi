import { createFileRoute } from "@tanstack/react-router";
import { AIAssistantPage } from "@/components/pages/feature-pages";
function RouteComponent() { return <AIAssistantPage />; }
export const Route = createFileRoute("/ai-assistant/")({ component: RouteComponent });
