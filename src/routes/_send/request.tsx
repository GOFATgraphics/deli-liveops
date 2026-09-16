import { createFileRoute } from "@tanstack/react-router";
import { RequestForm } from "@/components/send/request-form";

export const Route = createFileRoute("/_send/request")({
  component: RequestPage,
  head: () => ({
    meta: [{ title: "Deli — New request" }],
  }),
});

function RequestPage() {
  return <RequestForm />;
}
