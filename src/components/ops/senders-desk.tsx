import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { PartnerPhoto } from "@/components/ops/partner-photo";
import {
  getDeskSenderJobs,
  getDeskSenders,
  type DeskSenderJob,
  type DeskSenderRow,
} from "@/lib/desk-data";
import { cn, naira } from "@/lib/utils";

function statusLabel(status: string) {
  return status.replaceAll("_", " ");
}

export function SendersDesk() {
  const [rows, setRows] = useState<DeskSenderRow[] | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [jobs, setJobs] = useState<DeskSenderJob[]>([]);

  useEffect(() => {
    void getDeskSenders()
      .then((next) => {
        setRows(next);
        setSelectedId((current) => current ?? next[0]?.userId ?? null);
      })
      .catch((error) => toast.error(error instanceof Error ? error.message : "Could not load"));
  }, []);

  useEffect(() => {
    if (!selectedId) {
      setJobs([]);
      return;
    }
    void getDeskSenderJobs({ data: { userId: selectedId } })
      .then(setJobs)
      .catch((error) => toast.error(error instanceof Error ? error.message : "Could not load jobs"));
  }, [selectedId]);

  if (!rows) {
    return <div className="m-4 h-40 animate-pulse rounded-xl bg-raised" />;
  }

  const selected = rows.find((row) => row.userId === selectedId) ?? null;

  return (
    <div className="grid h-full min-h-0 md:grid-cols-[minmax(260px,340px)_minmax(0,1fr)]">
      <aside className="min-h-0 overflow-hidden border-b border-border md:border-r md:border-b-0">
        <div className="px-4 py-4">
          <p className="text-xs font-medium tracking-[0.16em] text-subtle uppercase">Customers</p>
          <h1 className="font-display mt-1 text-2xl tracking-tight">Senders</h1>
          <p className="mt-1 text-sm text-muted tabular-nums">{rows.length} accounts</p>
        </div>
        <div className="min-h-0 overflow-y-auto px-2 pb-4">
          {rows.length === 0 ? (
            <p className="px-3 py-10 text-center text-sm text-muted">No sender accounts yet.</p>
          ) : (
            <ul className="flex flex-col gap-1">
              {rows.map((sender) => (
                <li key={sender.userId}>
                  <button
                    type="button"
                    onClick={() => setSelectedId(sender.userId)}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left",
                      selectedId === sender.userId ? "bg-raised shadow-[var(--shadow-hairline)]" : "hover:bg-fg/4",
                    )}
                  >
                    <PartnerPhoto src={sender.logo} alt="" className="size-9 shrink-0 rounded-md" />
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center justify-between gap-2">
                        <span className="truncate text-sm font-medium">{sender.name || "Unnamed"}</span>
                        <span className="text-sm tabular-nums">{naira(sender.spentNgn)}</span>
                      </span>
                      <span className="text-sm text-muted">
                        {sender.phone}
                        {sender.paidJobs > 0 ? ` · ${sender.paidJobs} paid` : ""}
                      </span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </aside>

      <section className="min-h-0 overflow-y-auto bg-raised">
        {selected ? (
          <div className="mx-auto flex max-w-xl flex-col gap-6 p-4 md:p-6">
            <div className="flex items-start gap-3">
              <PartnerPhoto src={selected.logo} alt="" className="size-12 shrink-0 rounded-lg" />
              <div className="min-w-0">
              <p className="text-xs font-medium tracking-[0.16em] text-subtle uppercase">Sender</p>
              <h2 className="font-display mt-1 text-2xl tracking-tight">{selected.name || "Unnamed"}</h2>
              <p className="mt-1 text-sm text-muted">{selected.phone}</p>
              {selected.email ? <p className="text-sm text-muted">{selected.email}</p> : null}
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <Mini label="Jobs" value={String(selected.jobs)} />
              <Mini label="Paid" value={String(selected.paidJobs)} />
              <Mini label="Spent" value={naira(selected.spentNgn)} />
            </div>
            <div>
              <h3 className="font-display text-xl tracking-tight">Jobs</h3>
              {jobs.length === 0 ? (
                <p className="mt-3 text-sm text-muted">No jobs from this sender.</p>
              ) : (
                <ul className="mt-3 flex flex-col gap-1">
                  {jobs.map((job) => (
                    <li key={job.id}>
                      <Link
                        to="/admin/jobs"
                        search={{ job: job.id }}
                        className="flex flex-col gap-1 rounded-lg px-3 py-3 hover:bg-fg/4"
                      >
                        <span className="flex items-center justify-between gap-2">
                          <span className="font-mono text-sm">{job.publicId}</span>
                          <span className="text-xs tracking-wide text-subtle uppercase">{statusLabel(job.status)}</span>
                        </span>
                        <span className="text-sm text-muted">
                          {job.pickup} → {job.dropoff}
                        </span>
                        {job.paidNgn != null ? (
                          <span className="text-sm tabular-nums">{naira(job.paidNgn)}</span>
                        ) : null}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        ) : (
          <p className="p-8 text-sm text-muted">Select a sender.</p>
        )}
      </section>
    </div>
  );
}

function Mini({ label, value }: { label: string; value: string }) {
  return (
    <article className="rounded-lg bg-bg p-3 shadow-[var(--shadow-hairline)]">
      <p className="text-[10px] font-medium tracking-[0.14em] text-subtle uppercase">{label}</p>
      <p className="font-display mt-1 text-xl tabular-nums tracking-tight">{value}</p>
    </article>
  );
}
