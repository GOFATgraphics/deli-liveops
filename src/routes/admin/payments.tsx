import { createFileRoute } from "@tanstack/react-router";
import { PaymentsDesk } from "@/components/ops/payments-desk";
import { DeskSkeleton } from "@/components/ui/skeleton";

export const Route = createFileRoute("/admin/payments")({
  component: PaymentsDesk,
  pendingComponent: DeskSkeleton,
  head: () => ({
    meta: [{ title: "Deli Admin — Payments" }],
  }),
});
