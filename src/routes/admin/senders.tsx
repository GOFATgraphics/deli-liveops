import { createFileRoute } from "@tanstack/react-router";
import { SendersDesk } from "@/components/ops/senders-desk";

export const Route = createFileRoute("/admin/senders")({
  component: SendersDesk,
  head: () => ({
    meta: [{ title: "Deli Admin — Senders" }],
  }),
});
