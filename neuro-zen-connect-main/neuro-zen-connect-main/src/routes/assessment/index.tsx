import { createFileRoute } from "@tanstack/react-router";
import { AssessmentPage } from "@/components/pages/feature-pages";
function RouteComponent() { return <AssessmentPage />; }
export const Route = createFileRoute("/assessment/")({ component: RouteComponent });
