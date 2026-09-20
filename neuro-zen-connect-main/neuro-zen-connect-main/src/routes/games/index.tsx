import { createFileRoute } from "@tanstack/react-router";
import { GamesHubPage } from "@/components/pages/games-hub-page";

export const Route = createFileRoute("/games/")({
  component: GamesHubPage,
});
