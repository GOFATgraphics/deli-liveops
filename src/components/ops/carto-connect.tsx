import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { cartoStatus, type CartoStatus } from "@/lib/carto";
import { cn } from "@/lib/utils";

export function CartoConnect() {
  const [status, setStatus] = useState<CartoStatus | null>(null);

  useEffect(() => {
    void cartoStatus().then(setStatus);
  }, []);

  const live = Boolean(status);
  const carto = status?.valid;

  return (
    <Button type="button" variant="secondary" className="pointer-events-none">
      <span
        className={cn("size-1.5 rounded-full", live ? "bg-fg" : "bg-border")}
        aria-hidden
      />
      <span className="hidden sm:inline">{carto ? "CARTO live" : "Map live"}</span>
      <span className="sm:hidden">Map</span>
    </Button>
  );
}
