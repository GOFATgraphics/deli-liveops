import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CARTO_KEY_URL, useCarto } from "@/lib/carto";
import { cn } from "@/lib/utils";

export function CartoConnect() {
  const apiKey = useCarto((s) => s.apiKey);
  const setApiKey = useCarto((s) => s.setApiKey);
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState("");

  useEffect(() => {
    if (open) setDraft(apiKey);
  }, [open, apiKey]);

  function save() {
    setApiKey(draft);
    setOpen(false);
    toast.success(draft.trim() ? "CARTO API connected" : "CARTO key cleared");
  }

  return (
    <div className="relative">
      <Button
        type="button"
        variant={apiKey ? "secondary" : "ghost"}
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
      >
        <span
          className={cn("size-1.5 rounded-full", apiKey ? "bg-fg" : "bg-subtle")}
          aria-hidden
        />
        {apiKey ? "CARTO" : (
          <>
            <span className="hidden sm:inline">Connect CARTO</span>
            <span className="sm:hidden">CARTO</span>
          </>
        )}
      </Button>

      {open ? (
        <div className="absolute top-12 right-0 z-30 w-80 rounded-xl bg-raised p-4 shadow-[var(--shadow-card)]">
          <p className="text-xs font-medium tracking-[0.16em] text-subtle uppercase">CARTO Basemaps API</p>
          <p className="mt-1 text-sm text-muted">
            Voyager tiles go out with your API key. Free for 5M requests a month — no CARTO account.
          </p>
          <div className="mt-3 flex flex-col gap-1.5">
            <Label htmlFor="carto-key">API key</Label>
            <Input
              id="carto-key"
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              placeholder="Paste key"
              autoComplete="off"
              spellCheck={false}
            />
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <Button type="button" onClick={save} className="flex-1">
              Save key
            </Button>
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
              Close
            </Button>
          </div>
          <a
            href={CARTO_KEY_URL}
            target="_blank"
            rel="noreferrer"
            className="mt-3 inline-block text-sm text-muted underline-offset-4 hover:text-fg hover:underline"
          >
            Get a free key
          </a>
        </div>
      ) : null}
    </div>
  );
}
