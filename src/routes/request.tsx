import { createFileRoute } from "@tanstack/react-router";
import { RequestForm } from "@/components/send/request-form";
import { SenderLayout } from "@/components/send/sender-shell";

export const Route = createFileRoute("/request")({
  component: RequestPage,
  head: () => ({
    meta: [{ title: "Deli — New request" }],
  }),
});

function RequestPage() {
  return (
    <SenderLayout>
      <RequestForm />
    </SenderLayout>
  );
}
