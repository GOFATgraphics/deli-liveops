import { createFileRoute } from "@tanstack/react-router";
import { TrackPanel } from "@/components/send/track-panel";
import { SenderLayout } from "@/components/send/sender-shell";

export const Route = createFileRoute("/track")({
  component: TrackPage,
  head: () => ({
    meta: [{ title: "Deli — Tracking" }],
  }),
});

function TrackPage() {
  return (
    <SenderLayout>
      <TrackPanel />
    </SenderLayout>
  );
}
