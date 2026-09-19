import { Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { MotionCard, Stagger, motion } from "@/components/fm";
import { DeskSkeleton } from "@/components/ui/skeleton";
import { getDeskPayments, type DeskPayment } from "@/lib/desk-data";
import { cn, naira } from "@/lib/utils";

function providerLabel(provider: string) {
  if (provider === "paystack") return "Paystack";
  if (provider === "desk_transfer") return "Desk";
  return provider.replaceAll("_", " ");
}

type StatusFilter = "all" | "paid" | "pending";
type RangeFilter = "all" | "today" | "yesterday" | "7" | "15" | "30" | "60";

const STATUS_FILTERS: { id: StatusFilter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "paid", label: "Paid" },
  { id: "pending", label: "Pending" },
];

const RANGE_FILTERS: { id: RangeFilter; label: string }[] = [
  { id: "all", label: "Any time" },
  { id: "today", label: "Today" },
  { id: "yesterday", label: "Yesterday" },
  { id: "7", label: "7 days" },
  { id: "15", label: "15 days" },
  { id: "30", label: "30 days" },
  { id: "60", label: "60 days" },
];

function inRange(iso: string | null, range: RangeFilter) {
  if (range === "all") return true;
  const t = new Date(iso ?? 0).getTime();
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const day = 86_400_000;
  if (range === "today") return t >= startOfToday;
  if (range === "yesterday") return t >= startOfToday - day && t < startOfToday;
  const days = Number(range);
  return t >= startOfToday - days * day;
}

export function PaymentsDesk() {
  const [rows, setRows] = useState<DeskPayment[] | null>(null);
  const [status, setStatus] = useState<StatusFilter>("all");
  const [range, setRange] = useState<RangeFilter>("all");

  useEffect(() => {
    void getDeskPayments()
      .then(setRows)
      .catch((error) => toast.error(error instanceof Error ? error.message : "Could not load"));
  }, []);

  const filtered = useMemo(() => {
    if (!rows) return [];
    return rows.filter((row) => {
      if (status !== "all" && row.status !== status) return false;
      return inRange(row.paidAt ?? row.createdAt, range);
    });
  }, [rows, status, range]);

  const totals = useMemo(() => {
    const paid = filtered.filter((row) => row.status === "paid");
    const pending = filtered.filter((row) => row.status === "pending");
    return {
      count: filtered.length,
      paid: paid.length,
      pending: pending.length,
      collected: paid.reduce((sum, row) => sum + row.amountNgn, 0),
      take: paid.reduce((sum, row) => sum + row.deliFeeNgn, 0),
      fleet: paid.reduce((sum, row) => sum + row.fleetPayoutNgn, 0),
      waiting: pending.reduce((sum, row) => sum + row.amountNgn, 0),
    };
  }, [filtered]);

  if (!rows) {
    return <DeskSkeleton />;
  }

  return (
    <div className="h-full overflow-y-auto overflow-x-hidden">
      <div className="mx-auto flex max-w-5xl flex-col gap-8 px-4 py-6 md:px-8 md:py-8">
        <div>
          <p className="text-xs font-medium tracking-[0.18em] text-subtle uppercase">Money</p>
          <h1 className="font-display mt-1 text-3xl tracking-tight">Payments</h1>
          <p className="mt-2 text-sm text-muted">
            Every Paystack checkout and desk mark. Filter by paid, pending, and date.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <ChipRow
            label="Status"
            items={STATUS_FILTERS}
            value={status}
            onChange={setStatus}
          />
          <ChipRow
            label="When"
            items={RANGE_FILTERS}
            value={range}
            onChange={setRange}
          />
        </div>

        <Stagger className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <Stat label="Transactions" value={String(totals.count)} hint={`${totals.paid} paid`} />
          <Stat label="Collected" value={naira(totals.collected)} hint={naira(totals.waiting) + " pending"} />
          <Stat label="Deli take" value={naira(totals.take)} hint="Fee on paid jobs" />
          <Stat label="Fleet due" value={naira(totals.fleet)} hint="Payout on paid jobs" />
        </Stagger>

        {filtered.length === 0 ? (
          <p className="rounded-xl bg-raised px-4 py-10 text-center text-sm text-muted shadow-[var(--shadow-hairline)]">
            No transactions in this filter.
          </p>
        ) : (
          <ul className="overflow-hidden rounded-xl bg-raised shadow-[var(--shadow-hairline)]">
            {filtered.map((pay, index) => (
              <li key={pay.id} className={cn("transition-colors duration-150", index > 0 && "border-t border-border")}>
                <Link
                  to="/admin/jobs"
                  search={{ job: pay.jobId }}
                  className="flex flex-col gap-2 px-4 py-3 transition-colors duration-150 hover:bg-fg/4 focus-visible:bg-fg/4 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring/40 focus-visible:outline-none md:flex-row md:items-center md:justify-between"
                >
                  <div className="min-w-0">
                    <p className="font-mono text-sm">{pay.publicId}</p>
                    <p className="truncate text-sm text-muted">
                      {pay.senderName || "Sender"}
                      {pay.fleetName ? ` · ${pay.fleetName}` : ""}
                    </p>
                    {pay.providerRef ? (
                      <p className="mt-0.5 truncate font-mono text-xs text-subtle">{pay.providerRef}</p>
                    ) : null}
                  </div>
                  <div className="flex shrink-0 flex-wrap items-center gap-x-3 gap-y-1 text-sm">
                    <span className="tabular-nums">{naira(pay.amountNgn)}</span>
                    <span className="text-muted">{providerLabel(pay.provider)}</span>
                    <span className="uppercase tracking-wide text-subtle">{pay.status}</span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function ChipRow<T extends string>({
  label,
  items,
  value,
  onChange,
}: {
  label: string;
  items: { id: T; label: string }[];
  value: T;
  onChange: (next: T) => void;
}) {
  return (
    <div>
      <p className="mb-2 text-[10px] font-medium tracking-[0.16em] text-subtle uppercase">{label}</p>
      <div className="flex flex-wrap gap-2">
        {items.map((item) => {
          const active = item.id === value;
          return (
            <motion.button
              key={item.id}
              type="button"
              onClick={() => onChange(item.id)}
              whileTap={{ scale: 0.96 }}
              className={cn(
                "h-11 rounded-full px-3 text-sm",
                "transition-[background-color,color,box-shadow] duration-150 ease-out",
                "focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:outline-none",
                active ? "bg-fg text-accent-fg" : "bg-raised text-muted shadow-[var(--shadow-hairline)] hover:text-fg",
              )}
            >
              {item.label}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

function Stat({ label, value, hint }: { label: string; value: string; hint: string }) {
  return (
    <MotionCard className="rounded-xl bg-raised p-4 shadow-[var(--shadow-hairline)]">
      <p className="text-xs font-medium tracking-[0.14em] text-subtle uppercase">{label}</p>
      <p className="font-display mt-2 text-2xl tracking-tight tabular-nums">{value}</p>
      <p className="mt-1 text-sm text-muted">{hint}</p>
    </MotionCard>
  );
}
