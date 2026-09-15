import { Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { PlaceSearch } from "@/components/ops/place-search";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  abortJob,
  addQuote,
  advanceJob,
  confirmDelivery,
  createJob,
  listJobEvents,
  listJobs,
  listQuotes,
  markPaid,
  recordPayout,
  type JobEventRow,
  type JobRow,
  type JobStatus,
  type QuoteRow,
} from "@/lib/ops-data";
import { usePartners } from "@/lib/store";
import { cn } from "@/lib/utils";

function kmBetween(aLat: number, aLng: number, bLat: number, bLng: number) {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(bLat - aLat);
  const dLng = toRad(bLng - aLng);
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(aLat)) * Math.cos(toRad(bLat)) * Math.sin(dLng / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(s), Math.sqrt(1 - s));
}

function money(n: number) {
  return `₦${n.toLocaleString("en-NG")}`;
}

export function JobBoard() {
  const fleets = usePartners((s) => s.partners);
  const [jobs, setJobs] = useState<JobRow[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [quotes, setQuotes] = useState<QuoteRow[]>([]);
  const [events, setEvents] = useState<JobEventRow[]>([]);
  const [composing, setComposing] = useState(false);

  async function refresh() {
    const next = await listJobs();
    setJobs(next);
    return next;
  }

  useEffect(() => {
    void refresh().catch((error) => toast.error(error instanceof Error ? error.message : "Jobs failed"));
  }, []);

  const selected = jobs.find((job) => job.id === selectedId) ?? null;

  useEffect(() => {
    if (!selectedId) {
      setQuotes([]);
      setEvents([]);
      return;
    }
    void Promise.all([listQuotes({ data: { jobId: selectedId } }), listJobEvents({ data: { jobId: selectedId } })])
      .then(([nextQuotes, nextEvents]) => {
        setQuotes(nextQuotes);
        setEvents(nextEvents);
      })
      .catch((error) => toast.error(error instanceof Error ? error.message : "Could not load job"));
  }, [selectedId]);

  return (
    <div className="grid min-h-0 flex-1 md:grid-cols-[minmax(260px,340px)_minmax(0,1fr)]">
      <aside className="min-h-0 overflow-hidden border-b border-border md:border-r md:border-b-0">
        <div className="flex items-center justify-between gap-2 px-4 py-3">
          <p className="text-xs font-medium tracking-[0.16em] text-subtle uppercase">Jobs</p>
          <Button type="button" size="sm" onClick={() => setComposing(true)}>
            <Plus />
            New job
          </Button>
        </div>
        <div className="min-h-0 overflow-y-auto px-2 pb-4">
          {jobs.length === 0 ? (
            <p className="px-3 py-10 text-center text-sm text-muted">No jobs yet. File one from the desk.</p>
          ) : (
            <ul className="flex flex-col gap-1">
              {jobs.map((job) => (
                <li key={job.id}>
                  <button
                    type="button"
                    onClick={() => {
                      setComposing(false);
                      setSelectedId(job.id);
                    }}
                    className={cn(
                      "flex w-full flex-col gap-1 rounded-lg px-3 py-3 text-left",
                      selectedId === job.id ? "bg-raised shadow-[var(--shadow-hairline)]" : "hover:bg-fg/4",
                    )}
                  >
                    <span className="flex items-center justify-between gap-2">
                      <span className="font-mono text-sm">{job.publicId}</span>
                      <span className="text-xs tracking-wide text-subtle uppercase">{job.status.replaceAll("_", " ")}</span>
                    </span>
                    <span className="text-sm text-muted">
                      {job.pickupLandmark} → {job.dropoffLandmark}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </aside>

      <section className="min-h-0 overflow-y-auto bg-raised">
        {composing ? (
          <NewJobForm
            onCancel={() => setComposing(false)}
            onCreated={async (job) => {
              await refresh();
              setComposing(false);
              setSelectedId(job.id);
            }}
          />
        ) : selected ? (
          <JobDetail
            job={selected}
            quotes={quotes}
            events={events}
            fleets={fleets.map((f) => ({ id: f.id, name: f.name, status: f.status, phone: f.phone }))}
            onChanged={async () => {
              const next = await refresh();
              const current = next.find((job) => job.id === selected.id);
              if (current) setSelectedId(current.id);
              const [nextQuotes, nextEvents] = await Promise.all([
                listQuotes({ data: { jobId: selected.id } }),
                listJobEvents({ data: { jobId: selected.id } }),
              ]);
              setQuotes(nextQuotes);
              setEvents(nextEvents);
            }}
          />
        ) : (
          <p className="p-8 text-sm text-muted">Select a job or file a new request.</p>
        )}
      </section>
    </div>
  );
}

function NewJobForm({
  onCancel,
  onCreated,
}: {
  onCancel: () => void;
  onCreated: (job: JobRow) => Promise<void>;
}) {
  const [senderName, setSenderName] = useState("");
  const [senderPhone, setSenderPhone] = useState("");
  const [pickup, setPickup] = useState("");
  const [dropoff, setDropoff] = useState("");
  const [pickupPin, setPickupPin] = useState<{ lat: number; lng: number } | null>(null);
  const [dropoffPin, setDropoffPin] = useState<{ lat: number; lng: number } | null>(null);
  const [goods, setGoods] = useState("");
  const [constraints, setConstraints] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit() {
    if (!pickupPin || !dropoffPin) {
      toast.error("Find both landmarks on the map.");
      return;
    }
    setBusy(true);
    try {
      const job = await createJob({
        data: {
          pickupLat: pickupPin.lat,
          pickupLng: pickupPin.lng,
          pickupLandmark: pickup,
          dropoffLat: dropoffPin.lat,
          dropoffLng: dropoffPin.lng,
          dropoffLandmark: dropoff,
          distanceKm: Math.round(kmBetween(pickupPin.lat, pickupPin.lng, dropoffPin.lat, dropoffPin.lng) * 10) / 10,
          goods,
          constraints,
          windowKind: "now",
          senderName,
          senderPhone,
        },
      });
      toast.success(`${job.publicId} filed`);
      await onCreated(job);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not file job");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto flex max-w-xl flex-col gap-4 p-4 md:p-6">
      <div>
        <p className="text-xs font-medium tracking-[0.16em] text-subtle uppercase">New job</p>
        <h2 className="font-display mt-1 text-xl tracking-tight">File a request</h2>
      </div>
      <Field label="Sender">
        <Input value={senderName} onChange={(e) => setSenderName(e.target.value)} placeholder="Shop name" />
      </Field>
      <Field label="Sender phone">
        <Input value={senderPhone} onChange={(e) => setSenderPhone(e.target.value)} placeholder="+234 …" />
      </Field>
      <Field label="Pickup landmark">
        <PlaceSearch
          value={pickup}
          placeholder="Sabon Gari market gate"
          onQuery={setPickup}
          onSelect={(hit) => {
            setPickup(hit.label);
            setPickupPin({ lat: hit.lat, lng: hit.lng });
          }}
        />
      </Field>
      <Field label="Dropoff landmark">
        <PlaceSearch
          value={dropoff}
          placeholder="Nassarawa GRA"
          onQuery={setDropoff}
          onSelect={(hit) => {
            setDropoff(hit.label);
            setDropoffPin({ lat: hit.lat, lng: hit.lng });
          }}
        />
      </Field>
      {pickupPin && dropoffPin ? (
        <p className="text-sm text-muted tabular-nums">
          {Math.round(kmBetween(pickupPin.lat, pickupPin.lng, dropoffPin.lat, dropoffPin.lng) * 10) / 10} km
        </p>
      ) : null}
      <Field label="Goods">
        <Input value={goods} onChange={(e) => setGoods(e.target.value)} placeholder="Two cartons, no fridge" />
      </Field>
      <Field label="Constraints">
        <Textarea value={constraints} onChange={(e) => setConstraints(e.target.value)} placeholder="Bike only, fragile excluded…" />
      </Field>
      <div className="flex gap-2">
        <Button type="button" className="flex-1" disabled={busy} onClick={() => void submit()}>
          File job
        </Button>
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </div>
  );
}

function waLink(phone: string) {
  let digits = phone.replace(/\D/g, "");
  if (digits.startsWith("0") && digits.length === 11) digits = `234${digits.slice(1)}`;
  return `https://wa.me/${digits}`;
}

const NEXT_LABEL: Partial<Record<JobStatus, string>> = {
  paid: "Assign to fleet",
  assigned: "Mark picked up",
  picked_up: "Mark in transit",
  in_transit: "Rider at dropoff",
};

function JobDetail({
  job,
  quotes,
  events,
  fleets,
  onChanged,
}: {
  job: JobRow;
  quotes: QuoteRow[];
  events: JobEventRow[];
  fleets: { id: string; name: string; status: string; phone: string }[];
  onChanged: () => Promise<void>;
}) {
  const [fleetId, setFleetId] = useState(fleets.find((f) => f.status === "active")?.id ?? "");
  const [total, setTotal] = useState("3500");
  const [fee, setFee] = useState("400");
  const [eta, setEta] = useState("45");
  const [terms, setTerms] = useState("Includes 10 min waiting. Cancel before pickup at no charge.");
  const [payRef, setPayRef] = useState("");
  const [code, setCode] = useState("");
  const [payoutNote, setPayoutNote] = useState("");
  const [abortReason, setAbortReason] = useState("");
  const [busy, setBusy] = useState(false);
  const selectedFleet = fleets.find((f) => f.id === fleetId);
  const selectedQuote = quotes.find((q) => q.id === job.selectedQuoteId) ?? quotes.find((q) => q.status === "accepted");
  const canQuote =
    job.status === "requested" || job.status === "quote_pending" || job.status === "quoted";
  const open = !["settled", "cancelled", "failed", "refunded", "delivered", "settlement_pending", "disputed"].includes(job.status);

  async function run(fn: () => Promise<unknown>, ok: string) {
    setBusy(true);
    try {
      await fn();
      toast.success(ok);
      await onChanged();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not update job");
    } finally {
      setBusy(false);
    }
  }

  async function submitQuote() {
    await run(
      () =>
        addQuote({
          data: {
            jobId: job.id,
            fleetId,
            totalNgn: Number(total),
            deliFeeNgn: Number(fee),
            etaMinutes: Number(eta),
            terms,
            hoursValid: 6,
          },
        }),
      "Price sent to sender",
    );
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6 p-4 md:p-6">
      <div>
        <p className="font-mono text-sm text-muted">{job.publicId}</p>
        <h2 className="font-display mt-1 text-2xl tracking-tight">
          {job.pickupLandmark} → {job.dropoffLandmark}
        </h2>
        <p className="mt-1 text-sm text-muted">
          {job.distanceKm} km · {job.goods} · {job.status.replaceAll("_", " ")}
        </p>
        {job.constraints ? <p className="mt-1 text-sm text-muted">{job.constraints}</p> : null}
      </div>

      <div className="rounded-xl bg-bg p-4">
        <p className="text-xs font-medium tracking-[0.16em] text-subtle uppercase">Sender</p>
        <p className="mt-2 text-sm font-medium">{job.senderName}</p>
        <p className="mt-1 font-mono text-sm">{job.senderPhone}</p>
        <div className="mt-3 flex gap-2">
          <a href={`tel:${job.senderPhone.replace(/\s/g, "")}`} className="text-sm underline-offset-4 hover:underline">
            Call
          </a>
          <a
            href={waLink(job.senderPhone)}
            target="_blank"
            rel="noreferrer"
            className="text-sm underline-offset-4 hover:underline"
          >
            WhatsApp
          </a>
        </div>
      </div>

      <div className="rounded-xl bg-bg p-4">
        <p className="text-xs font-medium tracking-[0.16em] text-subtle uppercase">Quotes</p>
        <p className="mt-2 text-sm text-muted">
          Call the fleet, get a price, then WhatsApp or send it here. Sender accepts or rejects.
        </p>
        {job.status === "quoted" ? (
          <p className="mt-2 text-sm font-medium">Waiting for the sender to accept or reject.</p>
        ) : null}
        {quotes.length === 0 ? (
          <p className="mt-2 text-sm text-muted">None yet. Log what the fleet said.</p>
        ) : (
          <ul className="mt-3 flex flex-col gap-2">
            {quotes.map((quote) => (
              <li key={quote.id} className="rounded-lg bg-raised p-3 shadow-[var(--shadow-hairline)]">
                <p className="flex items-center justify-between gap-2 text-sm">
                  <span className="font-medium">{quote.fleetName}</span>
                  <span className="tabular-nums">{money(quote.totalNgn)}</span>
                </p>
                <p className="mt-1 text-xs text-muted">
                  Fleet {money(quote.fleetPayoutNgn)} · Deli {money(quote.deliFeeNgn)} · {quote.etaMinutes} min · {quote.status}
                </p>
                {quote.terms ? <p className="mt-1 text-xs text-subtle">{quote.terms}</p> : null}
              </li>
            ))}
          </ul>
        )}

        {canQuote ? (
          <>
            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              <label className="flex flex-col gap-1.5 sm:col-span-2">
                <Label>Fleet</Label>
                <select
                  value={fleetId}
                  onChange={(e) => setFleetId(e.target.value)}
                  className="h-11 rounded-md bg-raised px-3 text-sm shadow-[var(--shadow-hairline)]"
                >
                  {fleets
                    .filter((f) => f.status === "active")
                    .map((fleet) => (
                      <option key={fleet.id} value={fleet.id}>
                        {fleet.name}
                      </option>
                    ))}
                </select>
                {selectedFleet?.phone ? (
                  <p className="text-sm text-muted">
                    <a href={waLink(selectedFleet.phone)} target="_blank" rel="noreferrer" className="underline-offset-4 hover:underline">
                      {selectedFleet.phone}
                    </a>
                  </p>
                ) : null}
              </label>
              <Field label="Total NGN">
                <Input value={total} onChange={(e) => setTotal(e.target.value)} inputMode="numeric" />
              </Field>
              <Field label="Deli fee NGN">
                <Input value={fee} onChange={(e) => setFee(e.target.value)} inputMode="numeric" />
              </Field>
              <Field label="ETA minutes">
                <Input value={eta} onChange={(e) => setEta(e.target.value)} inputMode="numeric" />
              </Field>
              <div className="sm:col-span-2">
                <Field label="Terms">
                  <Textarea value={terms} onChange={(e) => setTerms(e.target.value)} />
                </Field>
              </div>
            </div>
            <Button type="button" className="mt-3" onClick={() => void submitQuote()} disabled={!fleetId || busy}>
              Send price to sender
            </Button>
          </>
        ) : null}
      </div>

      {job.status === "accepted" ? (
        <div className="rounded-xl bg-bg p-4">
          <p className="text-xs font-medium tracking-[0.16em] text-subtle uppercase">Payment</p>
          <p className="mt-2 text-sm text-muted">
            Sender pays {selectedQuote ? money(selectedQuote.totalNgn) : "the accepted total"}. Hold it on the desk until delivery.
          </p>
          <Field label="Transfer reference">
            <Input value={payRef} onChange={(e) => setPayRef(e.target.value)} placeholder="Opay / bank ref" />
          </Field>
          <Button
            type="button"
            className="mt-3"
            disabled={busy || payRef.trim().length < 2}
            onClick={() => void run(() => markPaid({ data: { jobId: job.id, reference: payRef } }), "Marked paid")}
          >
            Mark paid
          </Button>
        </div>
      ) : null}

      {job.deliveryCode ? (
        <div className="rounded-xl bg-bg p-4">
          <p className="text-xs font-medium tracking-[0.16em] text-subtle uppercase">Receiver code</p>
          <p className="font-display mt-2 text-3xl tracking-[0.28em] tabular-nums">{job.deliveryCode}</p>
          <p className="mt-1 text-sm text-muted">
            Sender has this 4-digit code. Receiver shows it to the rider. Match it here before you pay the fleet.
          </p>
        </div>
      ) : null}

      {NEXT_LABEL[job.status] ? (
        <Button
          type="button"
          disabled={busy}
          onClick={() => void run(() => advanceJob({ data: { jobId: job.id } }), NEXT_LABEL[job.status] ?? "Updated")}
        >
          {NEXT_LABEL[job.status]}
        </Button>
      ) : null}

      {job.status === "delivery_confirmation_pending" || job.status === "in_transit" ? (
        <div className="rounded-xl bg-bg p-4">
          <p className="text-xs font-medium tracking-[0.16em] text-subtle uppercase">Confirm delivery</p>
          <Field label="Code from the rider">
            <Input value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 4))} inputMode="numeric" />
          </Field>
          <Button
            type="button"
            className="mt-3"
            disabled={busy || code.length !== 4}
            onClick={() => void run(() => confirmDelivery({ data: { jobId: job.id, code } }), "Delivered")}
          >
            Confirm delivery
          </Button>
        </div>
      ) : null}

      {job.status === "delivered" || job.status === "settlement_pending" ? (
        <div className="rounded-xl bg-bg p-4">
          <p className="text-xs font-medium tracking-[0.16em] text-subtle uppercase">Payout</p>
          <p className="mt-2 text-sm text-muted">
            Send {selectedQuote ? money(selectedQuote.fleetPayoutNgn) : "the fleet share"} to the partner, then log it.
          </p>
          <Field label="What you sent">
            <Input
              value={payoutNote}
              onChange={(e) => setPayoutNote(e.target.value)}
              placeholder="Sent to SwiftWheel, Opay 9:14pm"
            />
          </Field>
          <Button
            type="button"
            className="mt-3"
            disabled={busy || payoutNote.trim().length < 2}
            onClick={() =>
              void run(
                () =>
                  recordPayout({
                    data: {
                      jobId: job.id,
                      note: payoutNote,
                      amountNgn: selectedQuote?.fleetPayoutNgn ?? 1,
                    },
                  }),
                "Settled",
              )
            }
          >
            Record payout
          </Button>
        </div>
      ) : null}

      {job.payoutNote ? <p className="text-sm text-muted">Payout: {job.payoutNote}</p> : null}

      {open ? (
        <div className="rounded-xl bg-bg p-4">
          <p className="text-xs font-medium tracking-[0.16em] text-subtle uppercase">Stop this job</p>
          <Field label="Reason">
            <Input value={abortReason} onChange={(e) => setAbortReason(e.target.value)} placeholder="No rider / sender cancelled" />
          </Field>
          <div className="mt-3 flex gap-2">
            <Button
              type="button"
              variant="secondary"
              disabled={busy || abortReason.trim().length < 2}
              onClick={() =>
                void run(
                  () => abortJob({ data: { jobId: job.id, status: "cancelled", reason: abortReason } }),
                  "Cancelled",
                )
              }
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="danger"
              disabled={busy || abortReason.trim().length < 2}
              onClick={() =>
                void run(() => abortJob({ data: { jobId: job.id, status: "failed", reason: abortReason } }), "Failed")
              }
            >
              Failed
            </Button>
          </div>
        </div>
      ) : null}

      <div>
        <p className="text-xs font-medium tracking-[0.16em] text-subtle uppercase">Timeline</p>
        <ul className="mt-2 flex flex-col gap-1">
          {events.map((event) => (
            <li key={event.id} className="text-sm text-muted">
              <span className="font-mono text-xs text-subtle">{new Date(event.at).toLocaleString()}</span>
              {" · "}
              {event.kind}
              {event.toStatus ? ` → ${event.toStatus.replaceAll("_", " ")}` : ""}
              {" · "}
              {event.actor}
              {event.payload?.reason ? ` · ${String(event.payload.reason)}` : ""}
              {event.payload?.reference ? ` · ${String(event.payload.reference)}` : ""}
              {event.payload?.note ? ` · ${String(event.payload.note)}` : ""}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label>{label}</Label>
      {children}
    </div>
  );
}
