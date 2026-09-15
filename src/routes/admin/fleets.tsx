import { createFileRoute } from "@tanstack/react-router";
import { FleetDesk } from "@/components/ops/fleet-desk";

export const Route = createFileRoute("/admin/fleets")({
  component: FleetDesk,
  head: () => ({
    meta: [{ title: "Deli Admin — Fleets" }],
  }),
});
