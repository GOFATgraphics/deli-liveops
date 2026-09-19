import { createFileRoute } from "@tanstack/react-router";
import { Overview } from "@/components/ops/overview";
import { DeskSkeleton } from "@/components/ui/skeleton";

export const Route = createFileRoute("/admin/")({
  component: Overview,
  pendingComponent: DeskSkeleton,
  head: () => ({
    meta: [{ title: "Deli Admin — Overview" }],
  }),
});
