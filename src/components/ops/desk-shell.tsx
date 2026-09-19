import { Link, Outlet, useRouterState } from "@tanstack/react-router";
import { Banknote, Bike, ClipboardList, Database, LayoutDashboard, Map, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { BrandMark } from "@/components/brand-mark";
import { OpsTransition } from "@/components/fm";
import { ThemeToggle } from "@/components/theme-toggle";
import { UserButton } from "@/lib/auth/gates";
import { getDeskNavCounts } from "@/lib/desk-data";
import { usePartners } from "@/lib/store";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/admin", label: "Overview", icon: LayoutDashboard, exact: true, group: "Desk", mobile: true },
  { to: "/admin/jobs", label: "Jobs", icon: ClipboardList, exact: false, group: "Desk", mobile: true },
  { to: "/admin/map", label: "Map", icon: Map, exact: false, group: "Desk", mobile: false },
  { to: "/admin/senders", label: "Senders", icon: Users, exact: false, group: "Network", mobile: true },
  { to: "/admin/fleets", label: "Fleets", icon: Bike, exact: false, group: "Network", mobile: true },
  { to: "/admin/payments", label: "Payments", icon: Banknote, exact: false, group: "Money", mobile: true },
  { to: "/admin/records", label: "Records", icon: Database, exact: false, group: "Money", mobile: false },
] as const;

const GROUPS = ["Desk", "Network", "Money"] as const;

function navActive(pathname: string, to: string, exact: boolean) {
  if (exact) return pathname === "/admin" || pathname === "/admin/";
  return pathname === to || pathname.startsWith(`${to}/`);
}

function pageTitle(pathname: string) {
  const hit = [...NAV].reverse().find((item) => navActive(pathname, item.to, item.exact));
  return hit?.label ?? "Overview";
}

function LivePulse() {
  return (
    <span className="relative flex size-2" aria-hidden>
      <span className="absolute inline-flex size-full rounded-full bg-fg/35 motion-safe:animate-ping" />
      <span className="relative inline-flex size-2 rounded-full bg-fg" />
    </span>
  );
}

function CountBadge({ count }: { count: number }) {
  if (count <= 0) return null;
  return (
    <span className="ml-auto grid min-w-5 place-items-center rounded-full bg-fg px-1.5 py-px text-[10px] font-medium tabular-nums text-accent-fg">
      {count > 99 ? "99+" : count}
    </span>
  );
}

export function DeskShell() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const hydrate = usePartners((s) => s.hydrate);
  const [counts, setCounts] = useState({ openJobs: 0, quotePending: 0, pendingPayments: 0 });

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    let alive = true;
    async function load() {
      try {
        const next = await getDeskNavCounts();
        if (alive) setCounts(next);
      } catch {
        /* desk counts are decorative */
      }
    }
    void load();
    const id = window.setInterval(() => void load(), 20000);
    return () => {
      alive = false;
      window.clearInterval(id);
    };
  }, []);

  const title = pageTitle(pathname);
  const onJobs = pathname.startsWith("/admin/jobs");

  return (
    <div className="flex h-dvh max-w-[100vw] flex-col overflow-x-hidden bg-bg md:flex-row">
      <a
        href="#ops-main"
        className="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-50 focus:rounded-md focus:bg-raised focus:px-3 focus:py-2 focus:text-fg focus:shadow-[var(--shadow-card)]"
      >
        Skip to desk
      </a>
      <aside className="hidden w-60 shrink-0 flex-col border-r border-border bg-raised md:flex">
        <div className="flex items-center gap-3 border-b border-border px-4 py-4">
          <BrandMark className="size-9" />
          <div className="min-w-0">
            <p className="font-display text-xl leading-none tracking-tight">Deli</p>
            <p className="mt-1 flex items-center gap-1.5 text-[11px] font-medium tracking-[0.16em] text-subtle uppercase">
              <LivePulse />
              LiveOps
            </p>
          </div>
        </div>

        <nav className="flex flex-1 flex-col gap-5 overflow-y-auto px-2 py-4" aria-label="Desk">
          {GROUPS.map((group) => (
            <div key={group}>
              <p className="px-3 pb-1.5 text-[10px] font-medium tracking-[0.18em] text-subtle uppercase">
                {group}
              </p>
              <div className="flex flex-col gap-0.5">
                {NAV.filter((item) => item.group === group).map((item) => {
                  const active = navActive(pathname, item.to, item.exact);
                  const jobs = item.to === "/admin/jobs";
                  const payments = item.to === "/admin/payments";
                  return (
                    <Link
                      key={item.to}
                      to={item.to}
                      search={jobs ? { job: undefined } : undefined}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "relative flex h-10 items-center gap-2.5 rounded-md px-3 text-sm font-medium",
                        "before:absolute before:inset-y-1.5 before:left-0 before:w-0.5 before:origin-center before:rounded-full before:bg-fg",
                        "before:transition-transform before:duration-200 before:ease-[cubic-bezier(0.22,1,0.36,1)]",
                        "transition-[background-color,color] duration-150 ease-[cubic-bezier(0.22,1,0.36,1)]",
                        "focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:outline-none",
                        active
                          ? "bg-fg/[0.06] text-fg before:scale-y-100"
                          : "text-muted before:scale-y-0 hover:bg-fg/[0.04] hover:text-fg",
                      )}
                    >
                      <item.icon className="size-4 shrink-0" />
                      {item.label}
                      {jobs ? <CountBadge count={counts.openJobs} /> : null}
                      {payments ? <CountBadge count={counts.pendingPayments} /> : null}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className="mt-auto border-t border-border px-3 py-3">
          <p className="mb-3 flex items-center gap-2 px-1 text-xs text-muted">
            <LivePulse />
            <span>
              Kano desk
              {counts.quotePending > 0 ? (
                <span className="text-subtle"> · {counts.quotePending} waiting</span>
              ) : null}
            </span>
          </p>
          {onJobs ? (
            <p className="mb-3 px-1 font-mono text-[10px] tracking-wide text-subtle uppercase">
              J/K · N new · Esc
            </p>
          ) : null}
          <div className="flex items-center gap-1">
            <ThemeToggle />
            <div className="min-w-0 flex-1">
              <UserButton />
            </div>
          </div>
        </div>
      </aside>

      <div id="ops-main" tabIndex={-1} className="flex min-h-0 min-w-0 flex-1 flex-col outline-none">
        <header className="flex items-center justify-between gap-3 border-b border-border bg-raised/90 px-4 py-2.5 backdrop-blur-md md:hidden">
          <div className="flex min-w-0 items-center gap-2.5">
            <BrandMark className="size-8" />
            <div className="min-w-0">
              <p className="font-display text-lg leading-none tracking-tight">Deli</p>
              <p className="mt-0.5 text-[11px] font-medium tracking-[0.16em] text-subtle uppercase">
                {title}
              </p>
            </div>
          </div>
          <div className="flex shrink-0 items-center">
            <ThemeToggle />
            <UserButton compact />
          </div>
        </header>
        <OpsTransition
          id={pathname}
          className="min-h-0 flex-1 overflow-hidden pb-[calc(3.75rem+env(safe-area-inset-bottom))] md:pb-0"
        >
          <Outlet />
        </OpsTransition>
      </div>

      <nav
        className="fixed inset-x-0 bottom-0 z-20 border-t border-border bg-raised/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md md:hidden"
        aria-label="Desk"
      >
        <div className="flex">
          {NAV.filter((item) => item.mobile).map((item) => {
            const active = navActive(pathname, item.to, item.exact);
            const jobs = item.to === "/admin/jobs";
            const payments = item.to === "/admin/payments";
            return (
              <Link
                key={item.to}
                to={item.to}
                search={jobs ? { job: undefined } : undefined}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "relative flex h-14 min-w-0 flex-1 flex-col items-center justify-center gap-0.5 text-[10px] font-medium",
                  "transition-colors duration-150 ease-[cubic-bezier(0.22,1,0.36,1)]",
                  "focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring/40",
                  active ? "text-fg" : "text-subtle",
                )}
              >
                <span
                  className={cn(
                    "absolute inset-x-4 top-0 h-0.5 origin-center rounded-full bg-fg",
                    "transition-transform duration-200 ease-[cubic-bezier(0.22,1,0.36,1)]",
                    active ? "scale-x-100" : "scale-x-0",
                  )}
                  aria-hidden
                />
                <span className="relative">
                  <item.icon className="size-[18px]" />
                  {jobs && counts.openJobs > 0 ? (
                    <span className="absolute -top-1 -right-2 grid min-w-3.5 place-items-center rounded-full bg-fg px-1 text-[9px] font-medium leading-4 tabular-nums text-accent-fg">
                      {counts.openJobs > 9 ? "9+" : counts.openJobs}
                    </span>
                  ) : null}
                  {payments && counts.pendingPayments > 0 ? (
                    <span className="absolute -top-1 -right-2 grid min-w-3.5 place-items-center rounded-full bg-fg px-1 text-[9px] font-medium leading-4 tabular-nums text-accent-fg">
                      {counts.pendingPayments > 9 ? "9+" : counts.pendingPayments}
                    </span>
                  ) : null}
                </span>
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
