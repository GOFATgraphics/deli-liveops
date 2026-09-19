import { Plus } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { AnimatePresence, OpsPanel } from "@/components/fm";
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

function useIsMd() {
  const [md, setMd] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const sync = () => setMd(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);
  return md;
}

export function FleetDesk() {
  const partners = usePartners((s) => s.partners);
  const upsert = usePartners((s) => s.upsert);
  const setStatus = usePartners((s) => s.setStatus);
  const remove = usePartners((s) => s.remove);
  const isMd = useIsMd();
  const [query, setQuery] = useState("");
  const [panel, setPanel] = useState<Panel>({ kind: "none" });

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

  const selectedId =
    panel.kind === "preview" ? panel.id : panel.kind === "form" && panel.id !== "new" ? panel.id : null;
  const draft = panel.kind === "form" ? panel.draft : null;
  const preview = panel.kind === "preview" ? partners.find((p) => p.id === panel.id) : undefined;
  const panelOpen = panel.kind !== "none";
  const showList = isMd || panel.kind === "none";

  function patchDraft(patch: Partial<PartnerDraft>) {
    setPanel((current) =>
      current.kind === "form" ? { ...current, draft: { ...current.draft, ...patch } } : current,
    );
  }

  async function saveDraft() {
    if (panel.kind !== "form") return;
    try {
      const existing = panel.id === "new" ? undefined : partners.find((p) => p.id === panel.id);
      const partner = partnerFromDraft(panel.draft, existing);
      await upsert(partner);
      toast.success(panel.id === "new" ? "Partner registered" : "Partner updated");
      setPanel({ kind: "preview", id: partner.id });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not save");
    }
  }

  const inspector =
    panel.kind === "form" ? (
      <PartnerForm
        draft={panel.draft}
        isNew={panel.id === "new"}
        onChange={patchDraft}
        onSave={saveDraft}
        onCancel={() =>
          setPanel(panel.id === "new" ? { kind: "none" } : { kind: "preview", id: panel.id })
        }
      />
    ) : preview ? (
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
    ) : null;

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3">
        <div>
          <h1 className="font-display text-xl tracking-tight">Fleets</h1>
          <p className="text-sm text-muted">
            <span className="tabular-nums">{partners.length}</span> partners
          </p>
        </div>
        <Button
          type="button"
          onClick={() => setPanel({ kind: "form", id: "new", draft: { ...EMPTY_DRAFT } })}
        >
          <Plus />
          Register
        </Button>
      </div>
      <div
        className={cn(
          "grid min-h-0 flex-1 md:grid-rows-none",
          panelOpen && !isMd
            ? "grid-rows-[36vh_minmax(0,1fr)]"
            : "grid-rows-[minmax(42vh,1fr)_minmax(0,1fr)]",
          panelOpen
            ? "md:grid-cols-[minmax(240px,300px)_minmax(0,1fr)_minmax(320px,400px)]"
            : "md:grid-cols-[minmax(260px,340px)_minmax(0,1fr)]",
        )}
      >
        {showList ? (
          <aside className="order-2 min-h-0 overflow-hidden border-t border-border md:order-1 md:border-t-0 md:border-r">
            <PartnerList
              partners={filtered}
              selectedId={selectedId}
              query={query}
              onQuery={setQuery}
              onSelect={(id) => setPanel({ kind: "preview", id })}
            />
          </aside>
        ) : null}
        <section className="relative order-1 min-h-0 md:order-2">
          <HubMap
            className="h-full min-h-0 md:absolute md:inset-0"
            partners={partners}
            selectedId={selectedId}
            draft={draft}
            pickMode={panel.kind === "form"}
            onSelect={(id) => setPanel({ kind: "preview", id })}
            onPick={(lat, lng, address) => {
              patchDraft({ lat, lng, ...(address ? { address } : {}) });
            }}
          />
        </section>
        {inspector ? (
          <aside className="order-3 flex min-h-0 flex-col overflow-hidden border-t border-border bg-raised md:border-t-0 md:border-l">
            <AnimatePresence mode="wait" initial={false}>
              <OpsPanel key={panel.kind === "form" ? `form-${panel.id}` : panel.kind === "preview" ? panel.id : "none"} id="fleet-panel" className="min-h-0 flex-1 overflow-y-auto">
                {inspector}
              </OpsPanel>
            </AnimatePresence>
          </aside>
        ) : null}
      </div>
    </div>
  );
}
