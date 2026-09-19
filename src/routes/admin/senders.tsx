import { createFileRoute } from "@tanstack/react-router";
import { SendersDesk } from "@/components/ops/senders-desk";
import { DeskSkeleton } from "@/components/ui/skeleton";

export const Route = createFileRoute("/admin/senders")({
  component: SendersDesk,
  pendingComponent: DeskSkeleton,
  head: () => ({
    meta: [{ title: "Deli Admin — Senders" }],
  }),
});
