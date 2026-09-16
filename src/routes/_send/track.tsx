import { createFileRoute } from "@tanstack/react-router";
import { TrackPanel } from "@/components/send/track-panel";

export const Route = createFileRoute("/_send/track")({
  component: TrackPage,
  head: () => ({
    meta: [{ title: "Deli — Tracking" }],
  }),
});

function TrackPage() {
  return <TrackPanel />;
}
