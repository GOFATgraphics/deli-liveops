import { createFileRoute } from "@tanstack/react-router";
import { MapDesk } from "@/components/ops/map-desk";
import { DeskSkeleton } from "@/components/ui/skeleton";

export const Route = createFileRoute("/admin/map")({
  component: MapDesk,
  pendingComponent: DeskSkeleton,
  head: () => ({
    meta: [{ title: "Deli Admin — Map" }],
  }),
});
