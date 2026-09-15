import { createFileRoute } from "@tanstack/react-router";
import { JobBoard } from "@/components/ops/job-board";

export const Route = createFileRoute("/admin/jobs")({
  validateSearch: (search: Record<string, unknown>) => ({
    job: typeof search.job === "string" && search.job.length > 0 ? search.job : undefined,
  }),
  component: JobsPage,
  head: () => ({
    meta: [{ title: "Deli Admin — Jobs" }],
  }),
});

function JobsPage() {
  const { job } = Route.useSearch();
  return (
    <div className="flex h-full min-h-0 flex-col">
      <JobBoard openJobId={job} />
    </div>
  );
}
