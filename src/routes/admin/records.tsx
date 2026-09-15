import { createFileRoute } from "@tanstack/react-router";
import { Records } from "@/components/ops/records";

export const Route = createFileRoute("/admin/records")({
  component: Records,
  head: () => ({
    meta: [{ title: "Deli Admin — Records" }],
  }),
});
