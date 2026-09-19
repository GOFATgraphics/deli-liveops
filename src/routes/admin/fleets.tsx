import { createFileRoute } from "@tanstack/react-router";
import { FleetDesk } from "@/components/ops/fleet-desk";
import { DeskSkeleton } from "@/components/ui/skeleton";

export const Route = createFileRoute("/admin/fleets")({
  component: FleetDesk,
  pendingComponent: DeskSkeleton,
  head: () => ({
    meta: [{ title: "Deli Admin — Fleets" }],
  }),
});
