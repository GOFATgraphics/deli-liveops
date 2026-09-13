import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { cartoStatus } from "@/lib/carto";
import { cn } from "@/lib/utils";

export function CartoConnect() {
  const [configured, setConfigured] = useState<boolean | null>(null);

  useEffect(() => {
    void cartoStatus().then((status) => setConfigured(status.configured));
  }, []);

  return (
    <Button type="button" variant="secondary" className="pointer-events-none">
      <span
        className={cn(
          "size-1.5 rounded-full",
          configured ? "bg-fg" : configured === false ? "bg-subtle" : "bg-border",
        )}
        aria-hidden
      />
      <span className="hidden sm:inline">{configured ? "Map live" : "Map"}</span>
      <span className="sm:hidden">Map</span>
    </Button>
  );
}
