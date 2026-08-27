import GameShell from "@/components/game/GameShell";

// The whole game is client-side: no server state, no network, works offline
// once loaded. This page is just the mount point.
export default function Page() {
  return <GameShell />;
}
