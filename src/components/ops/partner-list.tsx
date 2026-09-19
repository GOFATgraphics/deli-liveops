import { Bike, Car, Search, Truck } from "lucide-react";
import { PartnerPhoto } from "@/components/ops/partner-photo";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import type { Partner, Vehicle } from "@/lib/types";
import { formatRadius, VEHICLE_LABEL } from "@/lib/types";
import { cn } from "@/lib/utils";

const VEHICLE_ICON = {
  bike: Bike,
  car: Car,
  van: Truck,
} as const;

type PartnerListProps = {
  partners: Partner[];
  selectedId: string | null;
  query: string;
  onQuery: (value: string) => void;
  onSelect: (id: string) => void;
};

export function PartnerList({ partners, selectedId, query, onQuery, onSelect }: PartnerListProps) {
  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="relative px-4 pb-3 pt-4">
        <Search className="pointer-events-none absolute top-7 left-7 size-4 text-subtle" />
        <Input
          value={query}
          onChange={(event) => onQuery(event.target.value)}
          placeholder="Search name, area, phone"
          className="pl-9"
          aria-label="Search partners"
        />
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto px-2 pb-4">
        {partners.length === 0 ? (
          <p className="px-3 py-10 text-center text-sm text-muted">
            No delivery businesses match that search.
          </p>
        ) : (
          <ul className="flex flex-col gap-1">
            {partners.map((partner) => (
              <li key={partner.id}>
                <button
                  type="button"
                  onClick={() => onSelect(partner.id)}
                  className={cn(
                    "flex w-full items-start gap-3 rounded-lg px-3 py-3 text-left transition-colors duration-150",
                    "focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:outline-none",
                    selectedId === partner.id ? "bg-accent text-accent-fg" : "hover:bg-fg/5",
                  )}
                >
                  <PartnerPhoto
                    src={partner.image}
                    alt={partner.name}
                    className="size-12 shrink-0 rounded-md"
                  />
                  <span className="min-w-0 flex-1">
                    <span className="flex items-start justify-between gap-2">
                      <span className="font-medium tracking-tight">{partner.name}</span>
                      <Badge
                        tone={partner.status === "active" ? "live" : "paused"}
                        className={cn(
                          selectedId === partner.id &&
                            partner.status === "active" &&
                            "bg-accent-fg/15 text-accent-fg",
                          selectedId === partner.id &&
                            partner.status === "paused" &&
                            "bg-accent-fg/12 text-accent-fg",
                        )}
                      >
                        {partner.status === "active" ? "Live" : "Paused"}
                      </Badge>
                    </span>
                    <span
                      className={cn(
                        "mt-0.5 block truncate text-sm",
                        selectedId === partner.id ? "text-accent-fg/75" : "text-muted",
                      )}
                    >
                      {partner.address}
                    </span>
                    <span
                      className={cn(
                        "mt-1 flex flex-wrap items-center gap-2 text-xs",
                        selectedId === partner.id ? "text-accent-fg/70" : "text-subtle",
                      )}
                    >
                      {partner.vehicles.map((vehicle) => (
                        <VehicleChip key={vehicle} vehicle={vehicle} />
                      ))}
                      <span className="tabular-nums">{formatRadius(partner.radiusKm)}</span>
                    </span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function VehicleChip({ vehicle }: { vehicle: Vehicle }) {
  const Icon = VEHICLE_ICON[vehicle];
  return (
    <span className="inline-flex items-center gap-1">
      <Icon className="size-3.5" />
      {VEHICLE_LABEL[vehicle]}
    </span>
  );
}
