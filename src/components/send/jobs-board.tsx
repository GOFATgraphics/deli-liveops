import { Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { DeliveryTrack } from "@/components/send/delivery-track";
import { MotionItem, MotionList } from "@/components/fm";
import { RouteMap } from "@/components/send/route-map";
import { useSenderSession } from "@/components/send/sender-shell";
import { Button } from "@/components/ui/button";
import { acceptAndPay, startPaystackCheckout } from "@/lib/payment-data";
import { goToPaystack } from "@/lib/paystack-redirect";
import { cancelMyJob, rejectMyQuote, type SenderJob } from "@/lib/sender-data";
import { canCancelSenderJob, CODE_STATUSES, needsSenderAction, senderStatus } from "@/lib/sender-status";
import { cn } from "@/lib/utils";

function money(n: number) {
  return `₦${n.toLocaleString("en-NG")}`;
}

export function JobsBoard({ openJobId }: { openJobId?: string }) {
  const { jobs, refresh } = useSenderSession();
  const selected = jobs.find((job) => job.id === openJobId) ?? null;
  const actionJobs = jobs.filter((job) => needsSenderAction(job.status));
  const rest = jobs.filter((job) => !needsSenderAction(job.status));
  const ordered = [...actionJobs, ...rest];

  return (
    <div className="grid h-full min-h-0 min-w-0 overflow-x-hidden md:grid-cols-[minmax(260px,340px)_minmax(0,1fr)]">
      <aside
        className={cn(
          "min-h-0 overflow-hidden border-b border-border md:border-r md:border-b-0",
          selected ? "hidden md:flex md:flex-col" : "flex flex-col",
        )}
      >
        <div className="flex items-end justify-between gap-3 px-4 py-4">
          <div>
            <p className="text-xs font-medium tracking-[0.16em] text-subtle uppercase">Kano</p>
            <h1 className="font-display mt-1 text-2xl tracking-tight">Your jobs</h1>
          </div>
          <Button type="button" size="sm" asChild>
            <Link to="/request">New</Link>
          </Button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-2 pb-4">
          {ordered.length === 0 ? (
            <div className="mx-2 rounded-xl bg-raised px-4 py-10 text-center shadow-[var(--shadow-hairline)]">
              <p className="text-sm text-muted">No jobs yet. File a pickup and dropoff in Kano.</p>
              <Button type="button" className="mt-4" asChild>
                <Link to="/request">New request</Link>
              </Button>
            </div>
          ) : (
            <MotionList className="flex flex-col gap-1">
              {ordered.map((job) => (
                <MotionItem key={job.id}>
                  <JobCard job={job} selected={job.id === openJobId} />
                </MotionItem>
              ))}
            </MotionList>
          )}
        </div>
      </aside>

      <section className={cn("min-h-0 overflow-y-auto bg-raised", selected ? "block" : "hidden md:block")}>
        {selected ? (
          <JobDetail job={selected} onChanged={() => void refresh()} />
        ) : (
          <div className="grid h-full place-items-center p-8">
            <div className="max-w-xs text-center">
              <p className="font-display text-xl tracking-tight">Select a job</p>
              <p className="mt-2 text-sm text-muted">Prices, payment, and the receiver code live on the job.</p>
              <Button type="button" className="mt-5" asChild>
                <Link to="/request">New request</Link>
              </Button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

function JobCard({ job, selected }: { job: SenderJob; selected: boolean }) {
  const status = senderStatus(job.status);
  const action = needsSenderAction(job.status);
  return (
    <Link
      to="/job/$jobId"
      params={{ jobId: job.id }}
      className={cn(
        "flex w-full flex-col gap-1 rounded-lg px-3 py-3",
        "transition-[background-color,box-shadow,transform] duration-150 ease-out",
        selected ? "bg-raised shadow-[var(--shadow-hairline)]" : "hover:bg-fg/4",
      )}
    >
      <span className="flex items-center justify-between gap-2">
        <span className="font-mono text-sm">{job.publicId}</span>
        <span className={cn("text-xs tracking-wide uppercase", action ? "text-fg" : "text-subtle")}>
          {status.label}
        </span>
      </span>
      <span className="text-sm text-muted">
        {job.pickupLandmark} → {job.dropoffLandmark}
      </span>
      {job.quoteTotalNgn != null ? (
        <span className="text-sm tabular-nums">{money(job.quoteTotalNgn)}</span>
      ) : null}
    </Link>
  );
}

function JobDetail({ job, onChanged }: { job: SenderJob; onChanged: () => void }) {
  const navigate = useNavigate();
  const waitingToPay = job.status === "accepted" || job.status === "payment_pending";
  const [payOpen, setPayOpen] = useState(waitingToPay);
  const [busy, setBusy] = useState(false);
  const paid = CODE_STATUSES.includes(job.status);
  const status = senderStatus(job.status);
  const cancellable = canCancelSenderJob(job.status);

  useEffect(() => {
    if (waitingToPay) setPayOpen(true);
    if (paid) setPayOpen(false);
  }, [waitingToPay, paid]);

  const showCode = paid && Boolean(job.deliveryCode) && !payOpen;
  const canDecide = job.status === "quoted" && Boolean(job.quoteId) && job.quoteTotalNgn != null && !payOpen;

  async function payNow() {
    const started = await startPaystackCheckout({ data: { jobId: job.id, origin: window.location.origin } });
    goToPaystack(started.authorizationUrl);
  }

  async function decide(kind: "accept" | "reject") {
    if (!job.quoteId) return;
    setBusy(true);
    try {
      if (kind === "accept") {
        const started = await acceptAndPay({
          data: { jobId: job.id, quoteId: job.quoteId, origin: window.location.origin },
        });
        goToPaystack(started.authorizationUrl);
        return;
      }
      await rejectMyQuote({ data: { jobId: job.id, quoteId: job.quoteId } });
      toast.success("Price rejected. We’ll get another one.");
      onChanged();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not update");
    } finally {
      setBusy(false);
    }
  }

  async function removeJob() {
    if (!window.confirm("Delete this unpaid request? It leaves the desk too.")) return;
    setBusy(true);
    try {
      await cancelMyJob({ data: { jobId: job.id } });
      toast.success("Request deleted");
      onChanged();
      void navigate({ to: "/" });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not delete");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto flex max-w-xl flex-col gap-5 p-4 md:p-6">
      <div className="flex items-start gap-3">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="md:hidden"
          aria-label="Back to jobs"
          onClick={() => void navigate({ to: "/" })}
        >
          <ArrowLeft />
        </Button>
        <div className="min-w-0 flex-1">
          <p className="font-mono text-sm">{job.publicId}</p>
          <h2 className="font-display mt-1 text-2xl tracking-tight">{status.label}</h2>
          {status.hint ? <p className="mt-1 text-sm text-muted">{status.hint}</p> : null}
        </div>
      </div>

      <div className="rounded-xl bg-bg p-4 shadow-[var(--shadow-hairline)]">
        <p className="text-xs font-medium tracking-[0.16em] text-subtle uppercase">Tracking</p>
        <div className="mt-3">
          <DeliveryTrack status={job.status} />
        </div>
      </div>

      <RouteMap
        className="h-48 overflow-hidden rounded-xl"
        pickup={{ lat: job.pickupLat, lng: job.pickupLng, label: job.pickupLandmark }}
        dropoff={{ lat: job.dropoffLat, lng: job.dropoffLng, label: job.dropoffLandmark }}
      />

      <div className="rounded-xl bg-bg p-4 shadow-[var(--shadow-hairline)]">
        <p className="text-sm font-medium">
          {job.pickupLandmark} → {job.dropoffLandmark}
        </p>
        <p className="mt-1 text-sm text-muted">
          {job.distanceKm} km · {job.goods}
          {job.fleetName ? ` · ${job.fleetName}` : ""}
        </p>
        {job.constraints ? <p className="mt-2 text-sm text-muted">{job.constraints}</p> : null}
      </div>

      {canDecide ? (
        <div className="rounded-xl bg-bg p-4 shadow-[var(--shadow-hairline)]">
          <p className="text-xs font-medium tracking-[0.16em] text-subtle uppercase">Price from the desk</p>
          <p className="mt-2 text-lg tabular-nums">
            {job.quoteTotalNgn != null ? money(job.quoteTotalNgn) : "—"}
            {job.quoteEtaMinutes ? ` · about ${job.quoteEtaMinutes} min` : ""}
          </p>
          <p className="mt-2 text-sm text-muted">Accept opens Paystack. The receiver code comes after you pay.</p>
          <div className="mt-3 flex gap-2">
            <Button type="button" className="flex-1" disabled={busy} onClick={() => void decide("accept")}>
              Accept and pay
            </Button>
            <Button type="button" variant="secondary" className="flex-1" disabled={busy} onClick={() => void decide("reject")}>
              Reject
            </Button>
          </div>
        </div>
      ) : null}

      {payOpen && !showCode ? (
        <div className="rounded-xl bg-bg p-4 shadow-[var(--shadow-hairline)]">
          <p className="text-sm text-muted">Paystack checkout — card, bank, USSD, or OPay. No code until that payment lands.</p>
          <Button
            type="button"
            className="mt-3 w-full"
            disabled={busy}
            onClick={() => {
              setBusy(true);
              void payNow().catch((error) => {
                toast.error(error instanceof Error ? error.message : "Could not start payment");
                setBusy(false);
              });
            }}
          >
            Pay {job.quoteTotalNgn != null ? money(job.quoteTotalNgn) : "now"}
          </Button>
        </div>
      ) : null}

      {showCode ? (
        <div className="rounded-xl bg-bg p-4 shadow-[var(--shadow-hairline)]">
          <p className="text-xs font-medium tracking-[0.16em] text-subtle uppercase">Receiver code</p>
          <p className="font-display mt-1 text-3xl tracking-[0.28em] tabular-nums">{job.deliveryCode}</p>
          <p className="mt-2 text-sm text-muted">
            Send this to the person receiving. They show it to the rider. We match it before we pay the fleet.
          </p>
        </div>
      ) : null}

      {cancellable ? (
        <Button type="button" variant="secondary" disabled={busy} onClick={() => void removeJob()}>
          Delete unpaid request
        </Button>
      ) : null}
    </div>
  );
}
