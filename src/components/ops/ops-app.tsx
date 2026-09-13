import { Plus } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { CartoConnect } from "@/components/ops/carto-connect";
import { HubMap } from "@/components/ops/hub-map";
import { PartnerForm } from "@/components/ops/partner-form";
import { PartnerList } from "@/components/ops/partner-list";
import { PartnerPreview } from "@/components/ops/partner-preview";
import { Button } from "@/components/ui/button";
import { usePartners } from "@/lib/store";
import {
  EMPTY_DRAFT,
  draftFromPartner,
  partnerFromDraft,
  type PartnerDraft,
} from "@/lib/types";
import { cn } from "@/lib/utils";

type Panel =
  | { kind: "none" }
  | { kind: "preview"; id: string }
  | { kind: "form"; id: "new" | string; draft: PartnerDraft };

export function OpsApp() {
  const partners = usePartners((s) => s.partners);
  const hydrate = usePartners((s) => s.hydrate);
  const upsert = usePartners((s) => s.upsert);
  const setStatus = usePartners((s) => s.setStatus);
  const remove = usePartners((s) => s.remove);

  const [query, setQuery] = useState("");
  const [panel, setPanel] = useState<Panel>({ kind: "none" });

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setPanel({ kind: "none" });
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = q
      ? partners.filter((p) =>
          `${p.name} ${p.address} ${p.phone} ${p.notes}`.toLowerCase().includes(q),
        )
      : partners;
    return [...list].sort((a, b) => {
      if (a.status !== b.status) return a.status === "active" ? -1 : 1;
      return a.name.localeCompare(b.name);
    });
  }, [partners, query]);

  const liveCount = partners.filter((p) => p.status === "active").length;
  const pausedCount = partners.length - liveCount;

  const selectedId =
    panel.kind === "preview" ? panel.id : panel.kind === "form" && panel.id !== "new" ? panel.id : null;
  const draft = panel.kind === "form" ? panel.draft : null;
  const preview = panel.kind === "preview" ? partners.find((p) => p.id === panel.id) : undefined;
  const showListOnMobile = panel.kind === "none";

  function patchDraft(patch: Partial<PartnerDraft>) {
    setPanel((current) =>
      current.kind === "form" ? { ...current, draft: { ...current.draft, ...patch } } : current,
    );
  }

  function saveDraft() {
    if (panel.kind !== "form") return;
    try {
      const existing = panel.id === "new" ? undefined : partners.find((p) => p.id === panel.id);
      const partner = partnerFromDraft(panel.draft, existing);
      upsert(partner);
      toast.success(panel.id === "new" ? "Partner registered" : "Partner updated");
      setPanel({ kind: "preview", id: partner.id });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not save");
    }
  }

  return (
    <div className="flex h-dvh flex-col bg-bg">
      <header className="flex items-center justify-between gap-3 border-b border-border px-4 py-3 md:px-5">
        <div className="min-w-0">
          <div className="flex items-baseline gap-2.5">
            <span className="font-display text-2xl leading-none tracking-tight">Deli</span>
            <span className="text-xs font-medium tracking-[0.18em] text-subtle uppercase">
              LiveOps
            </span>
          </div>
          <p className="mt-1 text-sm text-muted">
            <span className="tabular-nums">{partners.length}</span> partners
            <span className="text-subtle"> · </span>
            <span className="tabular-nums">{liveCount}</span> live
            {pausedCount > 0 ? (
              <>
                <span className="text-subtle"> · </span>
                <span className="tabular-nums">{pausedCount}</span> paused
              </>
            ) : null}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <CartoConnect />
          <Button
            type="button"
            onClick={() => setPanel({ kind: "form", id: "new", draft: { ...EMPTY_DRAFT } })}
            className="shrink-0"
          >
            <Plus />
            <span className="hidden sm:inline">Register partner</span>
            <span className="sm:hidden">Register</span>
          </Button>
        </div>
      </header>

      <div className="grid min-h-0 flex-1 grid-rows-[minmax(46vh,1fr)_minmax(0,1fr)] md:grid-rows-none md:grid-cols-[minmax(280px,360px)_1fr]">
        <aside
          className={cn(
            "order-2 min-h-0 overflow-hidden border-t border-border md:order-1 md:border-t-0 md:border-r",
            showListOnMobile ? "block" : "hidden md:block",
          )}
        >
          <PartnerList
            partners={filtered}
            selectedId={selectedId}
            query={query}
            onQuery={setQuery}
            onSelect={(id) => setPanel({ kind: "preview", id })}
          />
        </aside>

        <section className="relative order-1 flex min-h-0 flex-col md:order-2">
          <HubMap
            className="h-full min-h-[46vh] md:absolute md:inset-0 md:min-h-0"
            partners={partners}
            selectedId={selectedId}
            draft={draft}
            pickMode={panel.kind === "form"}
            onSelect={(id) => setPanel({ kind: "preview", id })}
            onPick={(lat, lng) => patchDraft({ lat, lng })}
          />

          {panel.kind === "form" ? (
            <OverlayCard>
              <PartnerForm
                draft={panel.draft}
                isNew={panel.id === "new"}
                onChange={patchDraft}
                onSave={saveDraft}
                onCancel={() =>
                  setPanel(panel.id === "new" ? { kind: "none" } : { kind: "preview", id: panel.id })
                }
              />
            </OverlayCard>
          ) : preview ? (
            <OverlayCard>
              <PartnerPreview
                partner={preview}
                onEdit={() => setPanel({ kind: "form", id: preview.id, draft: draftFromPartner(preview) })}
                onToggleStatus={() => {
                  const next = preview.status === "active" ? "paused" : "active";
                  setStatus(preview.id, next);
                  toast.success(next === "paused" ? "Partner paused" : "Partner is live");
                }}
                onRemove={() => {
                  remove(preview.id);
                  setPanel({ kind: "none" });
                  toast.success("Partner removed");
                }}
                onClose={() => setPanel({ kind: "none" })}
              />
            </OverlayCard>
          ) : (
            <div className="pointer-events-none absolute inset-x-0 top-3 hidden justify-center md:flex">
              <p className="rounded-full bg-raised/90 px-3 py-1.5 text-sm text-muted shadow-[var(--shadow-card)]">
                Select a partner or register a new one
              </p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function OverlayCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 flex max-h-[55%] justify-center p-3 md:inset-y-4 md:right-4 md:left-auto md:max-h-none md:w-96 md:p-0">
      <div className="ops-panel pointer-events-auto w-full overflow-auto rounded-xl bg-raised shadow-[var(--shadow-card)]">
        {children}
      </div>
    </div>
  );
}
