import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { getDeskOverview, type DeskOverview } from "@/lib/desk-data";
import { cn } from "@/lib/utils";

function statusLabel(status: string) {
  return status.replaceAll("_", " ");
}

export function Overview() {
  const [data, setData] = useState<DeskOverview | null>(null);

  useEffect(() => {
    void getDeskOverview()
      .then(setData)
      .catch((error) => toast.error(error instanceof Error ? error.message : "Could not load"));
  }, []);

  if (!data) {
    return (
      <div className="grid gap-3 p-4 md:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-24 animate-pulse rounded-xl bg-raised" />
        ))}
      </div>
    );
  }

  const stats = [
    { label: "Open jobs", value: data.openJobs, hint: `${data.jobs} total` },
    { label: "Live fleets", value: data.liveFleets, hint: `${data.pausedFleets} paused` },
    { label: "Waiting on quote", value: data.quotePending, hint: "requested / pending" },
    { label: "On the road", value: data.inTransit, hint: "picked up / in transit" },
    { label: "To settle", value: data.delivered, hint: "delivered, payout due" },
    { label: "Settled", value: data.settled, hint: "paid out" },
    { label: "Senders", value: data.senders, hint: "signed-up businesses" },
    { label: "Operators", value: data.operators, hint: "staff desk access" },
  ];

  return (
    <div className="h-full overflow-y-auto">
      <div className="mx-auto flex max-w-5xl flex-col gap-8 px-4 py-6 md:px-8 md:py-8">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs font-medium tracking-[0.18em] text-subtle uppercase">Kano</p>
            <h1 className="font-display mt-1 text-3xl tracking-tight">Overview</h1>
          </div>
          <p className="text-sm text-muted">
            Database{" "}
            <span className="font-medium text-fg">{data.source === "neon" ? "Neon" : "preview"}</span>
          </p>
        </div>

        <section className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {stats.map((stat) => (
            <article key={stat.label} className="rounded-xl bg-raised p-4 shadow-[var(--shadow-hairline)]">
              <p className="text-xs font-medium tracking-[0.14em] text-subtle uppercase">{stat.label}</p>
              <p className="font-display mt-2 text-3xl tabular-nums tracking-tight">{stat.value}</p>
              <p className="mt-1 text-sm text-muted">{stat.hint}</p>
            </article>
          ))}
        </section>

        <section>
          <div className="mb-3 flex items-baseline justify-between gap-3">
            <h2 className="font-display text-xl tracking-tight">Recent jobs</h2>
            <Link to="/admin/jobs" className="text-sm text-muted underline-offset-4 hover:text-fg hover:underline">
              Open jobs
            </Link>
          </div>
          {data.recent.length === 0 ? (
            <p className="rounded-xl bg-raised px-4 py-10 text-center text-sm text-muted shadow-[var(--shadow-hairline)]">
              No jobs yet. Senders file pickups; they land here.
            </p>
          ) : (
            <ul className="overflow-hidden rounded-xl bg-raised shadow-[var(--shadow-hairline)]">
              {data.recent.map((job, index) => (
                <li
                  key={job.id}
                  className={cn("flex flex-col gap-1 px-4 py-3 md:flex-row md:items-center md:justify-between", index > 0 && "border-t border-border")}
                >
                  <div className="min-w-0">
                    <p className="font-mono text-sm">{job.publicId}</p>
                    <p className="truncate text-sm text-muted">
                      {job.pickup} → {job.dropoff}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-3 text-sm">
                    <span className="text-muted">{job.sender}</span>
                    <span className="capitalize text-fg">{statusLabel(job.status)}</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
