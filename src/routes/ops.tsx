import { createFileRoute } from "@tanstack/react-router";
import { OpsApp } from "@/components/ops/ops-app";

export const Route = createFileRoute("/ops")({
  component: OpsPage,
  head: () => ({
    meta: [
      { title: "Deli Admin" },
      {
        name: "description",
        content: "Register fleets, quote jobs, and run deliveries from the LiveOps desk.",
      },
    ],
  }),
});

function OpsPage() {
  return <OpsApp />;
}
