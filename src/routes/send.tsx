import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/send")({
  beforeLoad: () => {
    throw redirect({ to: "/" });
  },
});
