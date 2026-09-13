import { Bike, Car, Phone, Truck } from "lucide-react";
import { useState } from "react";
import { PartnerPhoto } from "@/components/ops/partner-photo";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Partner } from "@/lib/types";
import { formatRadius, VEHICLE_LABEL } from "@/lib/types";

type PartnerPreviewProps = {
  partner: Partner;
  onEdit: () => void;
  onToggleStatus: () => void;
  onRemove: () => void;
  onClose: () => void;
};

export function PartnerPreview({
  partner,
  onEdit,
  onToggleStatus,
  onRemove,
  onClose,
}: PartnerPreviewProps) {
  const [confirming, setConfirming] = useState(false);

  return (
    <div className="flex flex-col gap-4 p-4">
      <PartnerPhoto
        src={partner.image}
        alt={partner.name}
        className="h-40 w-full rounded-lg"
      />

      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium tracking-[0.16em] text-subtle uppercase">Partner</p>
          <h2 className="font-display mt-1 text-xl tracking-tight">{partner.name}</h2>
        </div>
        <Badge tone={partner.status === "active" ? "live" : "paused"}>
          {partner.status === "active" ? "Live" : "Paused"}
        </Badge>
      </div>

      <p className="text-sm text-muted">{partner.address}</p>

      <a
        href={`tel:${partner.phone.replace(/\s+/g, "")}`}
        className="inline-flex h-11 items-center gap-2 text-sm font-medium text-fg"
      >
        <Phone className="size-4 text-muted" />
        {partner.phone}
      </a>

      <div className="flex flex-wrap gap-2 text-sm text-muted">
        {partner.vehicles.map((vehicle) => {
          const Icon = vehicle === "bike" ? Bike : vehicle === "car" ? Car : Truck;
          return (
            <span
              key={vehicle}
              className="inline-flex items-center gap-1.5 rounded-full bg-fg/5 px-2.5 py-1"
            >
              <Icon className="size-3.5" />
              {VEHICLE_LABEL[vehicle]}
            </span>
          );
        })}
        <span className="inline-flex items-center rounded-full bg-fg/5 px-2.5 py-1 tabular-nums">
          {formatRadius(partner.radiusKm)}
        </span>
      </div>

      {partner.notes ? (
        <p className="rounded-md bg-fg/4 px-3 py-2.5 text-sm leading-relaxed text-muted">
          {partner.notes}
        </p>
      ) : null}

      {confirming ? (
        <div className="rounded-md bg-fg/8 px-3 py-3">
          <p className="text-sm text-fg">Remove this partner from the registry?</p>
          <div className="mt-3 flex gap-2">
            <Button
              type="button"
              variant="danger"
              size="sm"
              onClick={() => {
                onRemove();
                setConfirming(false);
              }}
            >
              Remove
            </Button>
            <Button type="button" variant="ghost" size="sm" onClick={() => setConfirming(false)}>
              Keep
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex flex-wrap gap-2">
          <Button type="button" onClick={onEdit} className="flex-1">
            Edit
          </Button>
          <Button type="button" variant="secondary" onClick={onToggleStatus}>
            {partner.status === "active" ? "Pause" : "Set live"}
          </Button>
          <Button type="button" variant="ghost" onClick={() => setConfirming(true)}>
            Remove
          </Button>
        </div>
      )}

      <button
        type="button"
        onClick={onClose}
        className="self-start text-sm text-muted hover:text-fg md:hidden"
      >
        Back to list
      </button>
    </div>
  );
}
