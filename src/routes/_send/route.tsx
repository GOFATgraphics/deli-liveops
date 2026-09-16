import { createFileRoute } from "@tanstack/react-router";
import { SenderLayout } from "@/components/send/sender-shell";

export const Route = createFileRoute("/_send")({
  component: SenderLayout,
  head: () => ({
    meta: [
      { title: "Deli" },
      { name: "description", content: "Request a pickup and dropoff in Kano." },
    ],
  }),
});
