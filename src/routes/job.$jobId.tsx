import { createFileRoute } from "@tanstack/react-router";
import { JobsBoard } from "@/components/send/jobs-board";
import { SenderLayout } from "@/components/send/sender-shell";

export const Route = createFileRoute("/job/$jobId")({
  component: JobPage,
  head: () => ({
    meta: [{ title: "Deli — Job" }],
  }),
});

function JobPage() {
  const { jobId } = Route.useParams();
  return (
    <SenderLayout>
      <JobsBoard openJobId={jobId} />
    </SenderLayout>
  );
}
