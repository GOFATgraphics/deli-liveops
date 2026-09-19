import { useEffect, useState } from "react";
import { toast } from "sonner";
import { MotionItem, MotionList } from "@/components/fm";
import { DeskSkeleton } from "@/components/ui/skeleton";
import { getDeskRecords, type DeskRecordTables } from "@/lib/desk-data";

export function Records() {
  const [data, setData] = useState<DeskRecordTables | null>(null);

  useEffect(() => {
    void getDeskRecords()
      .then(setData)
      .catch((error) => toast.error(error instanceof Error ? error.message : "Could not load"));
  }, []);

  if (!data) {
    return <DeskSkeleton />;
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="mx-auto flex max-w-5xl flex-col gap-8 px-4 py-6 md:px-8 md:py-8">
        <div>
          <p className="text-xs font-medium tracking-[0.18em] text-subtle uppercase">Database</p>
          <h1 className="font-display mt-1 text-3xl tracking-tight">Records</h1>
          <p className="mt-2 text-sm text-muted">
            Source is {data.source === "neon" ? "Neon Postgres (live)" : "this preview’s scratch database, not Neon"}.
          </p>
        </div>

        <section>
          <h2 className="font-display text-xl tracking-tight">Tables</h2>
          <MotionList className="mt-3 overflow-hidden rounded-xl bg-raised shadow-[var(--shadow-hairline)]" fast>
            {data.tables.map((table, index) => (
              <MotionItem
                key={table.name}
                className={`flex items-center justify-between px-4 py-3 text-sm ${index > 0 ? "border-t border-border" : ""}`}
              >
                <span className="font-mono">{table.name}</span>
                <span className="tabular-nums text-muted">{table.rows}</span>
              </MotionItem>
            ))}
          </MotionList>
        </section>

        <section>
          <h2 className="font-display text-xl tracking-tight">Senders</h2>
          {data.senders.length === 0 ? (
            <p className="mt-3 rounded-xl bg-raised px-4 py-8 text-center text-sm text-muted shadow-[var(--shadow-hairline)]">
              No sender accounts on this database yet.
            </p>
          ) : (
            <ul className="mt-3 overflow-hidden rounded-xl bg-raised shadow-[var(--shadow-hairline)]">
              {data.senders.map((sender, index) => (
                <li
                  key={sender.userId}
                  className={`flex flex-col gap-0.5 px-4 py-3 transition-colors duration-150 hover:bg-fg/4 md:flex-row md:items-center md:justify-between ${index > 0 ? "border-t border-border" : ""}`}
                >
                  <div>
                    <p className="text-sm font-medium">{sender.name || "Unnamed"}</p>
                    <p className="font-mono text-xs text-subtle">{sender.userId}</p>
                  </div>
                  <p className="text-sm text-muted">{sender.phone}</p>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section>
          <h2 className="font-display text-xl tracking-tight">Operators</h2>
          <ul className="mt-3 overflow-hidden rounded-xl bg-raised shadow-[var(--shadow-hairline)]">
            {data.operators.map((op, index) => (
              <li
                key={op.userId}
                className={`px-4 py-3 transition-colors duration-150 hover:bg-fg/4 ${index > 0 ? "border-t border-border" : ""}`}
              >
                <p className="font-mono text-sm">{op.userId}</p>
                <p className="text-xs text-subtle">Staff desk</p>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
