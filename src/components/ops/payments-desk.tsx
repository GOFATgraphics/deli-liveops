import { Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { getDeskPayments, type DeskPayment } from "@/lib/desk-data";
import { cn, naira } from "@/lib/utils";

function providerLabel(provider: string) {
  if (provider === "paystack") return "Paystack";
  if (provider === "desk_transfer") return "Desk";
  return provider.replaceAll("_", " ");
}

export function PaymentsDesk() {
  const [rows, setRows] = useState<DeskPayment[] | null>(null);

  useEffect(() => {
    void getDeskPayments()
      .then(setRows)
      .catch((error) => toast.error(error instanceof Error ? error.message : "Could not load"));
  }, []);

  const totals = useMemo(() => {
    if (!rows) return null;
    const paid = rows.filter((row) => row.status === "paid");
    const pending = rows.filter((row) => row.status === "pending");
    return {
      count: rows.length,
      paid: paid.length,
      pending: pending.length,
      collected: paid.reduce((sum, row) => sum + row.amountNgn, 0),
      take: paid.reduce((sum, row) => sum + row.deliFeeNgn, 0),
      fleet: paid.reduce((sum, row) => sum + row.fleetPayoutNgn, 0),
      waiting: pending.reduce((sum, row) => sum + row.amountNgn, 0),
    };
  }, [rows]);

  if (!rows || !totals) {
    return <div className="m-4 h-40 animate-pulse rounded-xl bg-raised" />;
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="mx-auto flex max-w-5xl flex-col gap-8 px-4 py-6 md:px-8 md:py-8">
        <div>
          <p className="text-xs font-medium tracking-[0.18em] text-subtle uppercase">Money</p>
          <h1 className="font-display mt-1 text-3xl tracking-tight">Payments</h1>
          <p className="mt-2 text-sm text-muted">
            Every Paystack checkout and desk mark. Paid orders are the ones with a successful transaction.
          </p>
        </div>

        <section className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <Stat label="Transactions" value={String(totals.count)} hint={`${totals.paid} paid`} />
          <Stat label="Collected" value={naira(totals.collected)} hint={naira(totals.waiting) + " pending"} />
          <Stat label="Deli take" value={naira(totals.take)} hint="Fee on paid jobs" />
          <Stat label="Fleet due" value={naira(totals.fleet)} hint="Payout on paid jobs" />
        </section>

        {rows.length === 0 ? (
          <p className="rounded-xl bg-raised px-4 py-10 text-center text-sm text-muted shadow-[var(--shadow-hairline)]">
            No transactions yet. When a sender pays, the row lands here.
          </p>
        ) : (
          <ul className="overflow-hidden rounded-xl bg-raised shadow-[var(--shadow-hairline)]">
            {rows.map((pay, index) => (
              <li key={pay.id} className={cn(index > 0 && "border-t border-border")}>
                <Link
                  to="/admin/jobs"
                  search={{ job: pay.jobId }}
                  className="flex flex-col gap-2 px-4 py-3 hover:bg-fg/4 md:flex-row md:items-center md:justify-between"
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

function Stat({ label, value, hint }: { label: string; value: string; hint: string }) {
  return (
    <article className="rounded-xl bg-raised p-4 shadow-[var(--shadow-hairline)]">
      <p className="text-xs font-medium tracking-[0.14em] text-subtle uppercase">{label}</p>
      <p className="font-display mt-2 text-2xl tracking-tight tabular-nums">{value}</p>
      <p className="mt-1 text-sm text-muted">{hint}</p>
    </article>
  );
}
