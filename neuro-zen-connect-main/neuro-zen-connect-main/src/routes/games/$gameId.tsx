import { createFileRoute } from "@tanstack/react-router";
import { GamePlayPage } from "@/components/pages/game-play-page";

function GameComponent() {
  const { gameId } = Route.useParams();
  return <GamePlayPage gameId={gameId} />;
}

export const Route = createFileRoute("/games/$gameId")({
  component: GameComponent,
});
