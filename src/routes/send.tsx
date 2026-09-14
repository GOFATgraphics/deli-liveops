import { createFileRoute } from "@tanstack/react-router";
import { SenderApp } from "@/components/send/sender-app";

export const Route = createFileRoute("/send")({
  component: SendPage,
  head: () => ({
    meta: [{ title: "Deli — Send" }],
  }),
});

function SendPage() {
  return <SenderApp />;
}
