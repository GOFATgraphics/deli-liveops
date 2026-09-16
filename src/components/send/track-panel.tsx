import { Link } from "@tanstack/react-router";
import { DeliveryTrack } from "@/components/send/delivery-track";
import { useSenderSession } from "@/components/send/sender-shell";
import { isLiveTrack, senderStatus } from "@/lib/sender-status";

export function TrackPanel() {
  const { jobs } = useSenderSession();
  const live = jobs.filter((job) => isLiveTrack(job.status));

  return (
    <div className="h-full overflow-y-auto overflow-x-hidden">
      <div className="mx-auto flex w-full max-w-xl flex-col gap-5 p-4 md:p-6">
        <div>
          <p className="text-xs font-medium tracking-[0.16em] text-subtle uppercase">Live</p>
          <h1 className="font-display mt-1 text-2xl tracking-tight">Tracking</h1>
          <p className="mt-1 text-sm text-muted">Pickup, in transit, and delivery update here after you pay.</p>
        </div>

        {live.length === 0 ? (
          <p className="rounded-xl bg-raised px-4 py-10 text-center text-sm text-muted shadow-[var(--shadow-hairline)]">
            No live deliveries. Tracking starts once a job is paid.
          </p>
        ) : (
          <ul className="flex flex-col gap-3">
            {live.map((job) => {
              const status = senderStatus(job.status);
              return (
                <li key={job.id}>
                  <Link
                    to="/job/$jobId"
                    params={{ jobId: job.id }}
                    className="block rounded-xl bg-raised p-4 shadow-[var(--shadow-hairline)]"
                  >
                    <p className="font-mono text-sm">{job.publicId}</p>
                    <p className="mt-1 truncate text-sm text-muted">
                      {job.pickupLandmark} → {job.dropoffLandmark}
                    </p>
                    <p className="mt-1 text-sm font-medium">{status.label}</p>
                    <div className="mt-4">
                      <DeliveryTrack status={job.status} />
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
