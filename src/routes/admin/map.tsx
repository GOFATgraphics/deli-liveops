import { createFileRoute } from "@tanstack/react-router";
import { MapDesk } from "@/components/ops/map-desk";

export const Route = createFileRoute("/admin/map")({
  component: MapDesk,
  head: () => ({
    meta: [{ title: "Deli Admin — Map" }],
  }),
});
