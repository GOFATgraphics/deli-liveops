import { LoaderCircle, MapPinned, Search } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { searchPlaces, type GeoHit } from "@/lib/geocode";
import { cn } from "@/lib/utils";

type PlaceSearchProps = {
  value?: string;
  placeholder?: string;
  onQuery?: (value: string) => void;
  onSelect: (hit: GeoHit) => void;
  className?: string;
};

export function PlaceSearch({
  value,
  placeholder = "Search address, area, landmark",
  onQuery,
  onSelect,
  className,
}: PlaceSearchProps) {
  const listId = useId();
  const [query, setQuery] = useState(value ?? "");
  const [hits, setHits] = useState<GeoHit[]>([]);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [active, setActive] = useState(0);
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (value != null && value !== query) setQuery(value);
    // Intentionally not syncing every parent keystroke back into local typing.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  useEffect(() => {
    const q = query.trim();
    if (q.length < 2) {
      setHits([]);
      setBusy(false);
      return;
    }
    let cancelled = false;
    setBusy(true);
    const timer = window.setTimeout(() => {
      void searchPlaces(q)
        .then((next) => {
          if (cancelled) return;
          setHits(next);
          setActive(0);
          setOpen(true);
        })
        .catch(() => {
          if (!cancelled) setHits([]);
        })
        .finally(() => {
          if (!cancelled) setBusy(false);
        });
    }, 220);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [query]);

  useEffect(() => {
    function onDoc(event: MouseEvent) {
      if (!boxRef.current?.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  function pick(hit: GeoHit) {
    setQuery(hit.label);
    onQuery?.(hit.label);
    setOpen(false);
    onSelect(hit);
  }

  return (
    <div ref={boxRef} className={cn("relative", className)}>
      <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-subtle" />
      <Input
        value={query}
        role="combobox"
        aria-expanded={open && hits.length > 0}
        aria-controls={listId}
        aria-autocomplete="list"
        autoComplete="off"
        placeholder={placeholder}
        className="bg-raised/95 pr-9 pl-9 shadow-[var(--shadow-card)]"
        onChange={(event) => {
          setQuery(event.target.value);
          onQuery?.(event.target.value);
          setOpen(true);
        }}
        onFocus={() => {
          if (hits.length) setOpen(true);
        }}
        onKeyDown={(event) => {
          if (!open || !hits.length) return;
          if (event.key === "ArrowDown") {
            event.preventDefault();
            setActive((i) => (i + 1) % hits.length);
          } else if (event.key === "ArrowUp") {
            event.preventDefault();
            setActive((i) => (i - 1 + hits.length) % hits.length);
          } else if (event.key === "Enter") {
            event.preventDefault();
            const hit = hits[active];
            if (hit) pick(hit);
          } else if (event.key === "Escape") {
            setOpen(false);
          }
        }}
      />
      {busy ? (
        <LoaderCircle className="absolute top-1/2 right-3 size-4 -translate-y-1/2 animate-spin text-subtle" />
      ) : null}
      {open && hits.length > 0 ? (
        <ul
          id={listId}
          role="listbox"
          className="absolute top-[calc(100%+4px)] right-0 left-0 z-30 max-h-64 overflow-y-auto rounded-md bg-raised py-1 shadow-[var(--shadow-card)]"
        >
          {hits.map((hit, index) => (
            <li key={`${hit.label}-${hit.lat}`}>
              <button
                type="button"
                role="option"
                aria-selected={index === active}
                className={cn(
                  "flex w-full items-start gap-2 px-3 py-2.5 text-left text-sm",
                  index === active ? "bg-fg/6" : "hover:bg-fg/4",
                )}
                onMouseEnter={() => setActive(index)}
                onClick={() => pick(hit)}
              >
                <MapPinned className="mt-0.5 size-3.5 shrink-0 text-subtle" />
                <span className="min-w-0">
                  <span className="block text-fg">{hit.label}</span>
                  <span className="block font-mono text-[11px] text-subtle tabular-nums">
                    {hit.lat.toFixed(4)}, {hit.lng.toFixed(4)}
                  </span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
