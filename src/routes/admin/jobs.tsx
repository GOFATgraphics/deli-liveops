import { createFileRoute } from "@tanstack/react-router";
import { JobBoard } from "@/components/ops/job-board";

export const Route = createFileRoute("/admin/jobs")({
  component: JobsPage,
  head: () => ({
    meta: [{ title: "Deli Admin — Jobs" }],
  }),
});

function JobsPage() {
  return (
    <div className="flex h-full min-h-0 flex-col">
      <JobBoard />
    </div>
  );
}
