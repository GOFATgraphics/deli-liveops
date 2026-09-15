import { Link, Outlet, useRouterState } from "@tanstack/react-router";
import { Bike, ClipboardList, Database, LayoutDashboard, Map } from "lucide-react";
import { useEffect } from "react";
import { UserButton } from "@/lib/auth/gates";
import { usePartners } from "@/lib/store";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/admin", label: "Overview", icon: LayoutDashboard, exact: true },
  { to: "/admin/jobs", label: "Jobs", icon: ClipboardList, exact: false },
  { to: "/admin/fleets", label: "Fleets", icon: Bike, exact: false },
  { to: "/admin/map", label: "Map", icon: Map, exact: false },
  { to: "/admin/records", label: "Records", icon: Database, exact: false },
] as const;

function navActive(pathname: string, to: string, exact: boolean) {
  if (exact) return pathname === "/admin" || pathname === "/admin/";
  return pathname === to || pathname.startsWith(`${to}/`);
}

export function DeskShell() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const hydrate = usePartners((s) => s.hydrate);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  return (
    <div className="flex h-dvh flex-col bg-bg md:flex-row">
      <aside className="hidden w-56 shrink-0 flex-col border-r border-border bg-raised md:flex">
        <div className="border-b border-border px-4 py-4">
          <p className="font-display text-2xl leading-none tracking-tight">Deli</p>
          <p className="mt-1 text-xs font-medium tracking-[0.18em] text-subtle uppercase">Admin</p>
        </div>
        <nav className="flex flex-1 flex-col gap-1 p-2">
          {NAV.map((item) => {
            const active = navActive(pathname, item.to, item.exact);
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "flex h-11 items-center gap-2.5 rounded-md px-3 text-sm font-medium",
                  active ? "bg-fg text-accent-fg" : "text-muted hover:bg-fg/5 hover:text-fg",
                )}
              >
                <item.icon className="size-4 shrink-0" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-border px-3 py-3">
          <UserButton />
        </div>
      </aside>

      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between gap-3 border-b border-border px-4 py-3 md:hidden">
          <div>
            <p className="font-display text-xl leading-none tracking-tight">Deli</p>
            <p className="mt-0.5 text-xs font-medium tracking-[0.18em] text-subtle uppercase">Admin</p>
          </div>
          <UserButton />
        </header>
        <div className="min-h-0 flex-1 overflow-hidden pb-16 md:pb-0">
          <Outlet />
        </div>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-20 flex border-t border-border bg-raised md:hidden">
        {NAV.map((item) => {
          const active = navActive(pathname, item.to, item.exact);
          return (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                "flex h-14 flex-1 flex-col items-center justify-center gap-0.5 text-xs font-medium tracking-wide uppercase",
                active ? "text-fg" : "text-subtle",
              )}
            >
              <item.icon className="size-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
