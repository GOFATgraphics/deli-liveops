import { createFileRoute } from "@tanstack/react-router";
import { JobsBoard } from "@/components/send/jobs-board";
import { SenderLayout } from "@/components/send/sender-shell";

export const Route = createFileRoute("/jobs")({
  component: JobsHome,
  head: () => ({
    meta: [{ title: "Deli — Jobs" }],
  }),
});

function JobsHome() {
  return (
    <SenderLayout>
      <JobsBoard />
    </SenderLayout>
  );
}
