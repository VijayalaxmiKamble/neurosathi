import { AppShell } from "@/components/layout/app-shell";
import { PlayableGame } from "@/components/games/playable-games";
import { useApp } from "@/context/app-context";
import { GAMES } from "@/lib/games";

export function GamePlayPage({ gameId }: { gameId: string }) {
  const { t } = useApp();
  const meta = GAMES.find((g) => g.id === gameId);
  return (
    <AppShell title={meta ? t(meta.nameKey) : t("navGames")}>
      <PlayableGame gameId={gameId} />
    </AppShell>
  );
}
