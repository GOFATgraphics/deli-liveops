import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { PlaceSearch } from "@/components/ops/place-search";
import { RouteMap } from "@/components/send/route-map";
import { useSenderSession } from "@/components/send/sender-shell";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createSenderJob } from "@/lib/sender-data";

function kmBetween(aLat: number, aLng: number, bLat: number, bLng: number) {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(bLat - aLat);
  const dLng = toRad(bLng - aLng);
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(aLat)) * Math.cos(toRad(bLat)) * Math.sin(dLng / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(s), Math.sqrt(1 - s));
}

export function RequestForm() {
  const navigate = useNavigate();
  const { refresh } = useSenderSession();
  const [pickup, setPickup] = useState("");
  const [dropoff, setDropoff] = useState("");
  const [pickupPin, setPickupPin] = useState<{ lat: number; lng: number } | null>(null);
  const [dropoffPin, setDropoffPin] = useState<{ lat: number; lng: number } | null>(null);
  const [goods, setGoods] = useState("");
  const [constraints, setConstraints] = useState("");
  const [busy, setBusy] = useState(false);
  const km =
    pickupPin && dropoffPin
      ? Math.round(kmBetween(pickupPin.lat, pickupPin.lng, dropoffPin.lat, dropoffPin.lng) * 10) / 10
      : null;

  async function submit() {
    if (!pickupPin || !dropoffPin || km == null) {
      toast.error("Find both landmarks.");
      return;
    }
    if (km < 0.1) {
      toast.error("Pickup and dropoff need to be different places.");
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
          distanceKm: km,
          goods,
          constraints,
        },
      });
      toast.success(`${job.publicId} requested`);
      await refresh();
      await navigate({ to: "/job/$jobId", params: { jobId: job.id } });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not request");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="h-full overflow-y-auto overflow-x-hidden">
      <div className="mx-auto flex w-full max-w-xl flex-col gap-4 p-4 md:p-6">
        <div>
          <p className="text-xs font-medium tracking-[0.16em] text-subtle uppercase">New request</p>
          <h1 className="font-display mt-1 text-2xl tracking-tight">Pickup and dropoff</h1>
          <p className="mt-1 text-sm text-muted">Landmarks in Kano. The desk sends a price; you pay; the receiver gets a code.</p>
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
        {pickupPin && dropoffPin ? (
          <>
            <RouteMap
              className="h-48"
              pickup={{ ...pickupPin, label: pickup }}
              dropoff={{ ...dropoffPin, label: dropoff }}
            />
            <p className="text-sm text-muted tabular-nums">{km} km</p>
          </>
        ) : null}
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
          <Button type="button" variant="secondary" onClick={() => void navigate({ to: "/" })}>
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}
