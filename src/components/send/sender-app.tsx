import { useEffect, useState } from "react";
import { toast } from "sonner";
import { PlaceSearch } from "@/components/ops/place-search";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RedirectToSignIn, SignInGate, UserButton } from "@/lib/auth/gates";
import { useCurrentUser } from "@/lib/auth/use-current-user";
import { createSenderJob, getMySender, listMyJobs, saveMySender, rejectMyQuote, type SenderJob, type SenderProfile } from "@/lib/sender-data";
import { acceptAndPay, startPaystackCheckout } from "@/lib/payment-data";
import { goToPaystack } from "@/lib/paystack-redirect";
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

function moneyStatus(status: string) {
  return status.replaceAll("_", " ");
}

export function SenderApp() {
  return (
    <SignInGate fallback={<RedirectToSignIn />}>
      <SenderHome />
    </SignInGate>
  );
}

function SenderHome() {
  const user = useCurrentUser();
  const [profile, setProfile] = useState<SenderProfile | null | undefined>(undefined);
  const [jobs, setJobs] = useState<SenderJob[]>([]);
  const [composing, setComposing] = useState(false);

  async function refresh() {
    const [nextProfile, nextJobs] = await Promise.all([getMySender(), listMyJobs()]);
    setProfile(nextProfile);
    setJobs(nextJobs);
  }

  useEffect(() => {
    void refresh().catch((error) => {
      const message = error instanceof Error ? error.message : "Could not load";
      if (message === "Unauthorized") return;
      toast.error(message);
    });
  }, []);

  const needsPhone = profile !== undefined && (!profile || profile.phone.length < 7);

  return (
    <div className="flex min-h-dvh flex-col bg-bg">
      <header className="flex items-center justify-between gap-3 border-b border-border px-4 py-3 md:px-5">
        <div className="min-w-0">
          <div className="flex items-baseline gap-2.5">
            <span className="font-display text-2xl leading-none tracking-tight">Deli</span>
            <span className="text-xs font-medium tracking-[0.18em] text-subtle uppercase">Send</span>
          </div>
          <p className="mt-1 truncate text-sm text-muted">{user?.displayName ?? "Your jobs"}</p>
        </div>
        <div className="flex shrink-0 items-center gap-3">
          <UserButton />
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-6 p-4 md:p-6">
        {profile === undefined ? (
          <div className="h-32 animate-pulse rounded-xl bg-raised" />
        ) : needsPhone ? (
          <PhoneGate
            initialName={profile?.name || user?.displayName || ""}
            onSaved={() => void refresh()}
          />
        ) : composing ? (
          <RequestForm
            onCancel={() => setComposing(false)}
            onCreated={async () => {
              await refresh();
              setComposing(false);
            }}
          />
        ) : (
          <>
            <div className="flex items-end justify-between gap-3">
              <div>
                <h1 className="font-display text-2xl tracking-tight">Your jobs</h1>
                <p className="mt-1 text-sm text-muted">
                  Request a pickup. Accept the price — that opens Paystack. The 4-digit code comes after you pay.
                </p>
              </div>
              <Button type="button" onClick={() => setComposing(true)}>
                New request
              </Button>
            </div>
            {jobs.length === 0 ? (
              <p className="rounded-xl bg-raised px-4 py-10 text-center text-sm text-muted shadow-[var(--shadow-hairline)]">
                No jobs yet. File a pickup and dropoff in Kano.
              </p>
            ) : (
              <ul className="flex flex-col gap-2">
                {jobs.map((job) => (
                  <SenderJobCard key={job.id} job={job} onChanged={() => void refresh()} />
                ))}
              </ul>
            )}
          </>
        )}
      </main>
    </div>
  );
}

function money(n: number) {
  return `₦${n.toLocaleString("en-NG")}`;
}

const CODE_STATUSES = [
  "paid",
  "assigned",
  "picked_up",
  "in_transit",
  "delivery_confirmation_pending",
  "delivered",
  "settled",
];

function SenderJobCard({ job, onChanged }: { job: SenderJob; onChanged: () => void }) {
  const waitingToPay = job.status === "accepted" || job.status === "payment_pending";
  const [payOpen, setPayOpen] = useState(waitingToPay);
  const [busy, setBusy] = useState(false);
  const paid = CODE_STATUSES.includes(job.status);

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
      setBusy(false);
    }
  }

  return (
    <li className="rounded-xl bg-raised p-4 shadow-[var(--shadow-hairline)]">
      <p className="flex items-center justify-between gap-2">
        <span className="font-mono text-sm">{job.publicId}</span>
        <span className="text-xs tracking-wide text-subtle uppercase">
          {payOpen ? "pay now" : moneyStatus(job.status)}
        </span>
      </p>
      <p className="mt-2 text-sm font-medium">
        {job.pickupLandmark} → {job.dropoffLandmark}
      </p>
      <p className="mt-1 text-sm text-muted">
        {job.distanceKm} km · {job.goods}
        {job.fleetName ? ` · ${job.fleetName}` : ""}
      </p>

      {canDecide ? (
        <div className="mt-4 rounded-lg bg-bg p-3">
          <p className="text-xs font-medium tracking-[0.16em] text-subtle uppercase">Price from the desk</p>
          <p className="mt-2 text-sm">
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
        <div className="mt-4 rounded-lg bg-bg p-3">
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
        <div className="mt-4 rounded-lg bg-bg p-3">
          <p className="text-xs font-medium tracking-[0.16em] text-subtle uppercase">Receiver code</p>
          <p className={cn("font-display mt-1 text-3xl tracking-[0.28em] tabular-nums")}>{job.deliveryCode}</p>
          <p className="mt-2 text-sm text-muted">
            Send this to the person receiving. They show it to the rider. We match it before we pay the fleet.
          </p>
        </div>
      ) : null}
    </li>
  );
}

function PhoneGate({ initialName, onSaved }: { initialName: string; onSaved: () => void }) {
  const [name, setName] = useState(initialName);
  const [phone, setPhone] = useState("");
  const [busy, setBusy] = useState(false);

  async function save() {
    setBusy(true);
    try {
      await saveMySender({ data: { name, phone } });
      toast.success("Phone saved");
      onSaved();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not save");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="rounded-xl bg-raised p-5 shadow-[var(--shadow-hairline)]">
      <p className="text-xs font-medium tracking-[0.16em] text-subtle uppercase">Your number</p>
      <h2 className="font-display mt-1 text-xl tracking-tight">How do we reach you?</h2>
      <p className="mt-2 text-sm text-muted">
        The fleet only gets this after you pay. Add the WhatsApp or line you actually answer.
      </p>
      <div className="mt-4 flex flex-col gap-3">
        <label className="flex flex-col gap-1.5">
          <Label>Business name</Label>
          <Input value={name} onChange={(e) => setName(e.target.value)} />
        </label>
        <label className="flex flex-col gap-1.5">
          <Label>Phone</Label>
          <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+234 …" inputMode="tel" />
        </label>
        <Button type="button" disabled={busy || name.trim().length < 2 || phone.trim().length < 7} onClick={() => void save()}>
          Save and continue
        </Button>
      </div>
    </div>
  );
}

function RequestForm({ onCancel, onCreated }: { onCancel: () => void; onCreated: () => Promise<void> }) {
  const [pickup, setPickup] = useState("");
  const [dropoff, setDropoff] = useState("");
  const [pickupPin, setPickupPin] = useState<{ lat: number; lng: number } | null>(null);
  const [dropoffPin, setDropoffPin] = useState<{ lat: number; lng: number } | null>(null);
  const [goods, setGoods] = useState("");
  const [constraints, setConstraints] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit() {
    if (!pickupPin || !dropoffPin) {
      toast.error("Find both landmarks.");
      return;
    }
    setBusy(true);
    try {
      const job = await createSenderJob({
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
        },
      });
      toast.success(`${job.publicId} requested`);
      await onCreated();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not request");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <p className="text-xs font-medium tracking-[0.16em] text-subtle uppercase">New request</p>
        <h2 className="font-display mt-1 text-xl tracking-tight">Pickup and dropoff</h2>
      </div>
      <label className="flex flex-col gap-1.5">
        <Label>Pickup</Label>
        <PlaceSearch
          value={pickup}
          placeholder="Kantin Kwari, Fagge"
          onQuery={setPickup}
          onSelect={(hit) => {
            setPickup(hit.label);
            setPickupPin({ lat: hit.lat, lng: hit.lng });
          }}
        />
      </label>
      <label className="flex flex-col gap-1.5">
        <Label>Dropoff</Label>
        <PlaceSearch
          value={dropoff}
          placeholder="Kofar Waika, Dala"
          onQuery={setDropoff}
          onSelect={(hit) => {
            setDropoff(hit.label);
            setDropoffPin({ lat: hit.lat, lng: hit.lng });
          }}
        />
      </label>
      <label className="flex flex-col gap-1.5">
        <Label>Goods</Label>
        <Input value={goods} onChange={(e) => setGoods(e.target.value)} placeholder="Two cartons fabric" />
      </label>
      <label className="flex flex-col gap-1.5">
        <Label>Notes</Label>
        <Textarea value={constraints} onChange={(e) => setConstraints(e.target.value)} placeholder="Call before arrival" />
      </label>
      <div className="flex gap-2">
        <Button type="button" className="flex-1" disabled={busy} onClick={() => void submit()}>
          Request
        </Button>
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </div>
  );
}
