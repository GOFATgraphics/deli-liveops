import { createFileRoute } from "@tanstack/react-router";
import { Overview } from "@/components/ops/overview";

export const Route = createFileRoute("/admin/")({
  component: Overview,
  head: () => ({
    meta: [{ title: "Deli Admin — Overview" }],
  }),
});
