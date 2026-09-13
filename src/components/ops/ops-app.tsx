import { MapPinned, Plus, Radio, Users } from "lucide-react";
import { type ReactNode, useEffect, useMemo, useState } from "react";
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
type StatusFilter = "all" | "active" | "paused";

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

export function OpsApp() {
  const partners = usePartners((s) => s.partners);
  const hydrate = usePartners((s) => s.hydrate);
  const upsert = usePartners((s) => s.upsert);
  const setStatus = usePartners((s) => s.setStatus);
  const remove = usePartners((s) => s.remove);

  const isMd = useIsMd();
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
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
    const list = partners.filter((p) => {
      const matchesQuery =
        !q || `${p.name} ${p.address} ${p.phone} ${p.notes}`.toLowerCase().includes(q);
      return matchesQuery && (statusFilter === "all" || p.status === statusFilter);
    });
    return [...list].sort((a, b) => {
      if (a.status !== b.status) return a.status === "active" ? -1 : 1;
      return a.name.localeCompare(b.name);
    });
  }, [partners, query, statusFilter]);

  const liveCount = partners.filter((p) => p.status === "active").length;
  const pausedCount = partners.length - liveCount;

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
    <div className="flex h-dvh flex-col overflow-hidden bg-bg">
      <header className="border-b border-border bg-raised px-4 py-3 md:px-6">
        <div className="mx-auto flex max-w-[1800px] items-center justify-between gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-3">
              <span className="font-display text-3xl leading-none tracking-tight">Deli</span>
              <span className="rounded-full border border-border bg-surface px-2.5 py-1 text-[10px] font-semibold tracking-[0.18em] text-muted uppercase">
                Operations desk
              </span>
            </div>
            <p className="mt-1.5 text-sm text-muted">Kano partner coverage, live at a glance.</p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <CartoConnect />
            <Button
            type="button"
            onClick={() => setPanel({ kind: "form", id: "new", draft: { ...EMPTY_DRAFT } })}
            className="shrink-0"
          >
            <Plus />
            <span className="hidden sm:inline">Add partner</span>
            <span className="sm:hidden">Register</span>
            </Button>
          </div>
        </div>
      </header>

      <section className="border-b border-border bg-surface px-4 py-3 md:px-6">
        <div className="mx-auto grid max-w-[1800px] grid-cols-3 gap-2 md:gap-3">
          <Metric icon={<Users />} label="Partners" value={partners.length} detail="registered" />
          <Metric icon={<Radio />} label="Live now" value={liveCount} detail="ready to serve" tone="live" />
          <Metric icon={<MapPinned />} label="Paused" value={pausedCount} detail="needs review" tone="alert" />
        </div>
      </section>

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
          <aside className="order-2 flex min-h-0 flex-col overflow-hidden border-t border-border bg-raised md:order-1 md:border-t-0 md:border-r">
            <div className="border-b border-border px-4 py-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold tracking-[0.14em] text-subtle uppercase">Partner queue</p>
                  <p className="mt-1 text-sm text-muted">{filtered.length} of {partners.length} shown</p>
                </div>
                <button type="button" onClick={() => { setStatusFilter("all"); setQuery(""); }} className="text-xs font-medium text-muted hover:text-fg">Reset</button>
              </div>
              <div className="mt-3 flex gap-1 overflow-x-auto">
                {([
                  ["all", "All", partners.length],
                  ["active", "Live", liveCount],
                  ["paused", "Paused", pausedCount],
                ] as const).map(([value, label, count]) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setStatusFilter(value)}
                    aria-pressed={statusFilter === value}
                    className={cn(
                      "rounded-full border px-2.5 py-1 text-xs font-medium transition-colors",
                      statusFilter === value ? "border-fg bg-fg text-accent-fg" : "border-border bg-raised text-muted hover:text-fg",
                    )}
                  >
                    {label} <span className="ml-1 tabular-nums opacity-75">{count}</span>
                  </button>
                ))}
              </div>
            </div>
            <div className="min-h-0 flex-1 overflow-hidden">
            <PartnerList
              partners={filtered}
              selectedId={selectedId}
              query={query}
              onQuery={setQuery}
              onSelect={(id) => setPanel({ kind: "preview", id })}
            />
            </div>
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
            onPick={(lat, lng) => patchDraft({ lat, lng })}
          />

        </section>

        {inspector ? (
          <aside className="order-3 flex min-h-0 flex-col overflow-hidden border-t border-border bg-raised md:border-t-0 md:border-l">
            <div className="border-b border-border px-5 py-3 text-xs font-semibold tracking-[0.14em] text-subtle uppercase">
              {panel.kind === "form" ? (panel.id === "new" ? "New partner" : "Edit partner") : "Partner details"}
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto">{inspector}</div>
          </aside>
        ) : null}
      </div>
    </div>
  );
}


function Metric({
  icon,
  label,
  value,
  detail,
  tone = "default",
}: {
  icon: ReactNode;
  label: string;
  value: number;
  detail: string;
  tone?: "default" | "live" | "alert";
}) {
  return (
    <div className={cn("flex min-w-0 items-center gap-2 rounded-lg border px-3 py-2.5 md:gap-3 md:px-4", tone === "live" ? "border-fg/20 bg-raised" : "border-border bg-raised")}>
      <span className={cn("hidden size-8 shrink-0 items-center justify-center rounded-md md:flex", tone === "live" ? "bg-fg text-accent-fg" : "bg-surface text-muted")}>{icon}</span>
      <div className="min-w-0">
        <p className="truncate text-[10px] font-semibold tracking-[0.12em] text-subtle uppercase md:text-xs">{label}</p>
        <div className="mt-0.5 flex items-baseline gap-1.5">
          <span className="text-lg font-semibold tabular-nums md:text-xl">{value}</span>
          <span className="hidden truncate text-xs text-muted md:inline">{detail}</span>
        </div>
      </div>
    </div>
  );
}
