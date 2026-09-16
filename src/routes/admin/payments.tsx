import { createFileRoute } from "@tanstack/react-router";
import { PaymentsDesk } from "@/components/ops/payments-desk";

export const Route = createFileRoute("/admin/payments")({
  component: PaymentsDesk,
  head: () => ({
    meta: [{ title: "Deli Admin — Payments" }],
  }),
});
