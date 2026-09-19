import { createFileRoute } from "@tanstack/react-router";
import { Records } from "@/components/ops/records";
import { DeskSkeleton } from "@/components/ui/skeleton";

export const Route = createFileRoute("/admin/records")({
  component: Records,
  pendingComponent: DeskSkeleton,
  head: () => ({
    meta: [{ title: "Deli Admin — Records" }],
  }),
});
