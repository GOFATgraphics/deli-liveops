import { useState } from "react";
import { CartoConnect } from "@/components/ops/carto-connect";
import { HubMap } from "@/components/ops/hub-map";
import { usePartners } from "@/lib/store";

export function MapDesk() {
  const partners = usePartners((s) => s.partners);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3">
        <div>
          <h1 className="font-display text-xl tracking-tight">Map</h1>
          <p className="text-sm text-muted">Kano coverage and hubs</p>
        </div>
        <CartoConnect />
      </div>
      <div className="relative min-h-0 flex-1">
        <HubMap
          className="absolute inset-0 h-full"
          partners={partners}
          selectedId={selectedId}
          draft={null}
          pickMode={false}
          onSelect={setSelectedId}
          onPick={() => undefined}
        />
      </div>
    </div>
  );
}
