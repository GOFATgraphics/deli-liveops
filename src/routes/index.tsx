import { createFileRoute } from "@tanstack/react-router";
import { SenderApp } from "@/components/send/sender-app";

export const Route = createFileRoute("/")({
  component: Home,
  head: () => ({
    meta: [
      { title: "Deli" },
      { name: "description", content: "Request a pickup and dropoff in Kano." },
    ],
  }),
});

function Home() {
  return <SenderApp />;
}
