import { createFileRoute } from "@tanstack/react-router";
import { JobsBoard } from "@/components/send/jobs-board";

export const Route = createFileRoute("/_send/")({
  component: JobsHome,
  head: () => ({
    meta: [{ title: "Deli — Jobs" }],
  }),
});

function JobsHome() {
  return <JobsBoard />;
}
