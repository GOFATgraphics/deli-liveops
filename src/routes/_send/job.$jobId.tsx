import { createFileRoute } from "@tanstack/react-router";
import { JobsBoard } from "@/components/send/jobs-board";

export const Route = createFileRoute("/_send/job/$jobId")({
  component: JobPage,
  head: () => ({
    meta: [{ title: "Deli — Job" }],
  }),
});

function JobPage() {
  const { jobId } = Route.useParams();
  return <JobsBoard openJobId={jobId} />;
}
