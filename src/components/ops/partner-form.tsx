import { Bike, Car, ImagePlus, LoaderCircle, MapPin, Truck } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { PartnerPhoto } from "@/components/ops/partner-photo";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { searchPlaces } from "@/lib/geocode";
import { fileToImageDataUrl } from "@/lib/image";
import {
  CITYWIDE_KM,
  RADIUS_OPTIONS,
  VEHICLE_LABEL,
  VEHICLES,
  type PartnerDraft,
  type Vehicle,
} from "@/lib/types";
import { cn } from "@/lib/utils";

type PartnerFormProps = {
  draft: PartnerDraft;
  isNew: boolean;
  onChange: (patch: Partial<PartnerDraft>) => void;
  onSave: () => void;
  onCancel: () => void;
};

export function PartnerForm({ draft, isNew, onChange, onSave, onCancel }: PartnerFormProps) {
  const [placeQuery, setPlaceQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const fileRef = useRef<HTMLInputElement>(null);

  async function findPlace() {
    const q = placeQuery.trim() || draft.address.trim();
    if (q.length < 2) return;
    setSearching(true);
    try {
      const hits = await searchPlaces(q);
      const hit = hits[0];
      if (!hit) {
        toast.error("No place found. Drop a pin on the map.");
        return;
      }
      onChange({ lat: hit.lat, lng: hit.lng, address: draft.address.trim() || hit.label });
      toast.success("Hub pin dropped from search");
    } catch {
      toast.error("Search unavailable. Click the map instead.");
    } finally {
      setSearching(false);
    }
  }

  async function onPhoto(file: File | undefined) {
    if (!file) return;
    try {
      const image = await fileToImageDataUrl(file);
      onChange({ image });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not read photo");
    }
  }

  function toggleVehicle(vehicle: Vehicle) {
    const next = draft.vehicles.includes(vehicle)
      ? draft.vehicles.filter((item) => item !== vehicle)
      : [...draft.vehicles, vehicle];
    onChange({ vehicles: next.length ? next : draft.vehicles });
  }

  function submit() {
    const nextErrors: Record<string, string> = {};
    if (draft.name.trim().length < 2) nextErrors.name = "Name the business.";
    if (draft.phone.trim().length < 7) nextErrors.phone = "Add a working phone.";
    if (draft.lat == null || draft.lng == null) nextErrors.hub = "Click the map to set the hub.";
    if (draft.vehicles.length === 0) nextErrors.vehicles = "Pick at least one vehicle.";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;
    onSave();
  }

  return (
    <div className="ops-panel flex flex-col gap-4">
      <div>
        <p className="text-xs font-medium tracking-[0.16em] text-subtle uppercase">
          {isNew ? "Register partner" : "Edit partner"}
        </p>
        <h2 className="font-display mt-1 text-xl tracking-tight">
          {isNew ? "New delivery business" : draft.name || "Partner"}
        </h2>
      </div>

      <Field label="Business photo">
        <div className="flex items-center gap-3">
          <PartnerPhoto
            src={draft.image}
            alt={draft.name || "Partner photo"}
            className="size-16 rounded-lg"
          />
          <div className="flex min-w-0 flex-1 flex-col gap-2">
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={(event) => {
                void onPhoto(event.target.files?.[0]);
                event.target.value = "";
              }}
            />
            <Button type="button" variant="secondary" onClick={() => fileRef.current?.click()}>
              <ImagePlus />
              {draft.image ? "Replace photo" : "Add photo"}
            </Button>
            {draft.image ? (
              <button
                type="button"
                className="self-start text-sm text-muted hover:text-fg"
                onClick={() => onChange({ image: "" })}
              >
                Remove photo
              </button>
            ) : null}
          </div>
        </div>
      </Field>

      <Field label="Business name" error={errors.name}>
        <Input
          value={draft.name}
          onChange={(event) => onChange({ name: event.target.value })}
          placeholder="SwiftWheel Couriers"
          autoComplete="organization"
        />
      </Field>

      <Field label="Phone / WhatsApp" error={errors.phone}>
        <Input
          type="tel"
          value={draft.phone}
          onChange={(event) => onChange({ phone: event.target.value })}
          placeholder="+234 800 000 0000"
        />
      </Field>

      <Field label="Hub address">
        <div className="flex gap-2">
          <Input
            value={draft.address}
            onChange={(event) => {
              onChange({ address: event.target.value });
              setPlaceQuery(event.target.value);
            }}
            placeholder="Street, area — Kano"
          />
          <Button type="button" variant="secondary" onClick={() => void findPlace()} disabled={searching}>
            {searching ? <LoaderCircle className="animate-spin" /> : "Find"}
          </Button>
        </div>
      </Field>

      <div
        className={cn(
          "flex items-start gap-2 rounded-md bg-fg/4 px-3 py-2.5 text-sm",
          errors.hub ? "text-danger" : "text-muted",
        )}
      >
        <MapPin className="mt-0.5 size-4 shrink-0" />
        <span>
          {draft.lat != null && draft.lng != null ? (
            <>
              Hub pin set
              <span className="mt-0.5 block font-mono text-xs text-subtle tabular-nums">
                {draft.lat.toFixed(5)}, {draft.lng.toFixed(5)}
              </span>
            </>
          ) : (
            "Click the map to drop the hub pin."
          )}
        </span>
      </div>

      <Field label="Coverage">
        <div className="flex flex-wrap gap-1.5">
          {RADIUS_OPTIONS.map((km) => (
            <button
              key={km}
              type="button"
              onClick={() => onChange({ radiusKm: km })}
              className={cn(
                "h-11 min-w-11 rounded-md px-3 text-sm font-medium tabular-nums transition-colors duration-150",
                draft.radiusKm === km
                  ? "bg-accent text-accent-fg"
                  : "bg-raised text-fg shadow-[var(--shadow-hairline)] hover:bg-surface",
              )}
            >
              {km >= CITYWIDE_KM ? "City" : `${km} km`}
            </button>
          ))}
        </div>
      </Field>

      <Field label="Vehicles" error={errors.vehicles}>
        <div className="flex flex-wrap gap-1.5">
          {VEHICLES.map((vehicle) => {
            const selected = draft.vehicles.includes(vehicle);
            const Icon = vehicle === "bike" ? Bike : vehicle === "car" ? Car : Truck;
            return (
              <button
                key={vehicle}
                type="button"
                onClick={() => toggleVehicle(vehicle)}
                className={cn(
                  "inline-flex h-11 items-center gap-2 rounded-md px-3 text-sm font-medium transition-colors duration-150",
                  selected
                    ? "bg-accent text-accent-fg"
                    : "bg-raised text-fg shadow-[var(--shadow-hairline)] hover:bg-surface",
                )}
              >
                <Icon className="size-4" />
                {VEHICLE_LABEL[vehicle]}
              </button>
            );
          })}
        </div>
      </Field>

      <Field label="How we reach them">
        <Textarea
          value={draft.notes}
          onChange={(event) => onChange({ notes: event.target.value })}
          placeholder="WhatsApp first, call the desk, night cutoff…"
        />
      </Field>

      <Field label="Status">
        <div className="flex gap-1.5">
          {(["active", "paused"] as const).map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => onChange({ status })}
              className={cn(
                "h-11 flex-1 rounded-md text-sm font-medium capitalize transition-colors duration-150",
                draft.status === status
                  ? "bg-accent text-accent-fg"
                  : "bg-raised text-fg shadow-[var(--shadow-hairline)] hover:bg-surface",
              )}
            >
              {status === "active" ? "Live" : "Paused"}
            </button>
          ))}
        </div>
      </Field>

      <div className="flex gap-2 pt-1">
        <Button type="button" className="flex-1" onClick={submit}>
          {isNew ? "Save partner" : "Save changes"}
        </Button>
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </div>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label>{label}</Label>
      {children}
      {error ? <span className="text-xs text-danger">{error}</span> : null}
    </div>
  );
}
