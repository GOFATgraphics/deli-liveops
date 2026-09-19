import { Link, useRouterState } from "@tanstack/react-router";
import { ClipboardList, MapPinned, Plus, User } from "lucide-react";
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { toast } from "sonner";
import { BrandMark } from "@/components/brand-mark";
import { PageTransition } from "@/components/fm";
import { PhoneGate } from "@/components/send/phone-gate";
import { ThemeToggle } from "@/components/theme-toggle";
import { RedirectToSignIn, SignInGate, UserButton } from "@/lib/auth/gates";
import { useCurrentUser } from "@/lib/auth/use-current-user";
import { getMySender, listMyJobs, type SenderJob, type SenderProfile } from "@/lib/sender-data";
import { needsSenderAction } from "@/lib/sender-status";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/jobs", label: "Jobs", icon: ClipboardList, exact: true },
  { to: "/request", label: "Request", icon: Plus, exact: false },
  { to: "/track", label: "Track", icon: MapPinned, exact: false },
  { to: "/account", label: "Account", icon: User, exact: false },
] as const;

function navActive(pathname: string, to: string, exact: boolean) {
  if (exact) return pathname === "/jobs" || pathname.startsWith("/job/");
  return pathname === to || pathname.startsWith(`${to}/`);
}

function pageTitle(pathname: string) {
  if (pathname.startsWith("/job/")) return "Job";
  const hit = [...NAV].reverse().find((item) => navActive(pathname, item.to, item.exact));
  return hit?.label ?? "Jobs";
}

type SenderSession = {
  profile: SenderProfile | null | undefined;
  jobs: SenderJob[];
  refresh: () => Promise<void>;
};

const SenderCtx = createContext<SenderSession | null>(null);

export function useSenderSession() {
  const value = useContext(SenderCtx);
  if (!value) throw new Error("Sender session missing");
  return value;
}

export function SenderLayout({ children }: { children: ReactNode }) {
  return (
    <SignInGate fallback={<RedirectToSignIn />}>
      <SenderSession>
        <SenderChrome>{children}</SenderChrome>
      </SenderSession>
    </SignInGate>
  );
}

function SenderSession({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<SenderProfile | null | undefined>(undefined);
  const [jobs, setJobs] = useState<SenderJob[]>([]);

  async function refresh() {
    const [nextProfile, nextJobs] = await Promise.all([getMySender(), listMyJobs()]);
    setProfile(nextProfile);
    setJobs(nextJobs);
  }

  useEffect(() => {
    void refresh().catch((error) => {
      const message = error instanceof Error ? error.message : "Could not load";
      if (message === "Unauthorized") return;
      toast.error(message);
    });
    const id = window.setInterval(() => {
      void refresh().catch(() => undefined);
    }, 20000);
    return () => window.clearInterval(id);
  }, []);

  return <SenderCtx.Provider value={{ profile, jobs, refresh }}>{children}</SenderCtx.Provider>;
}

function JobsBadge({ count }: { count: number }) {
  if (count <= 0) return null;
  return (
    <span className="ml-auto grid min-w-5 place-items-center rounded-full bg-fg px-1.5 py-px text-[10px] font-medium tabular-nums text-accent-fg">
      {count > 99 ? "99+" : count}
    </span>
  );
}

function SenderChrome({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const user = useCurrentUser();
  const { profile, jobs, refresh } = useSenderSession();
  const title = pageTitle(pathname);
  const actionCount = jobs.filter((job) => needsSenderAction(job.status)).length;
  const needsPhone = profile !== undefined && (!profile || profile.phone.length < 7);

  return (
    <div className="flex h-dvh max-w-[100vw] flex-col overflow-x-hidden bg-bg md:flex-row">
      <aside className="hidden w-60 shrink-0 flex-col border-r border-border bg-raised md:flex">
        <div className="flex items-center gap-3 border-b border-border px-4 py-4">
          <BrandMark className="size-9" />
          <div className="min-w-0">
            <p className="font-display text-xl leading-none tracking-tight">Deli</p>
            <p className="mt-1 text-[11px] font-medium tracking-[0.16em] text-subtle uppercase">Send</p>
          </div>
        </div>

        <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto px-2 py-4" aria-label="Sender">
          {NAV.map((item) => {
            const active = navActive(pathname, item.to, item.exact);
            const jobsItem = item.to === "/jobs";
            return (
              <Link
                key={item.to}
                to={item.to}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "relative flex h-10 items-center gap-2.5 rounded-md px-3 text-sm font-medium",
                  "before:absolute before:inset-y-1.5 before:left-0 before:w-0.5 before:origin-center before:rounded-full before:bg-fg",
                  "before:transition-transform before:duration-200 before:ease-[cubic-bezier(0.22,1,0.36,1)]",
                  "transition-[background-color,color] duration-150 ease-[cubic-bezier(0.22,1,0.36,1)]",
                  active
                    ? "bg-fg/[0.06] text-fg before:scale-y-100"
                    : "text-muted before:scale-y-0 hover:bg-fg/[0.04] hover:text-fg",
                )}
              >
                <item.icon className="size-4 shrink-0" />
                {item.label}
                {jobsItem ? <JobsBadge count={actionCount} /> : null}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto border-t border-border px-3 py-3">
          {profile?.logo ? (
            <div className="mb-3 flex items-center gap-2 px-1">
              <img src={profile.logo} alt="" className="size-8 rounded-md object-cover" />
              <p className="truncate text-xs text-muted">{profile.name}</p>
            </div>
          ) : (
            <p className="mb-3 px-1 text-xs text-muted">
              Kano pickup
              {actionCount > 0 ? <span className="text-subtle"> · {actionCount} waiting</span> : null}
            </p>
          )}
          <div className="flex items-center gap-1">
            <ThemeToggle />
            <div className="min-w-0 flex-1">
              <UserButton />
            </div>
          </div>
        </div>
      </aside>

      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between gap-3 border-b border-border bg-raised/90 px-4 py-2.5 pt-[max(0.625rem,env(safe-area-inset-top))] backdrop-blur-md md:hidden">
          <div className="flex min-w-0 items-center gap-2.5">
            {profile?.logo ? (
              <img src={profile.logo} alt="" className="size-8 rounded-md object-cover" />
            ) : (
              <BrandMark className="size-8" />
            )}
            <div className="min-w-0">
              <p className="font-display text-lg leading-none tracking-tight">Deli</p>
              <p className="mt-0.5 text-[11px] font-medium tracking-[0.16em] text-subtle uppercase">{title}</p>
            </div>
          </div>
          <div className="flex shrink-0 items-center">
            <ThemeToggle />
            <UserButton compact />
          </div>
        </header>
        <PageTransition
          id={pathname}
          className="min-h-0 flex-1 overflow-hidden pb-[calc(3.75rem+env(safe-area-inset-bottom))] md:pb-0"
        >
          {profile === undefined ? (
            <div className="grid h-full gap-3 p-4 md:grid-cols-[minmax(260px,340px)_minmax(0,1fr)]">
              <div className="h-40 animate-pulse rounded-xl bg-raised" />
              <div className="hidden h-40 animate-pulse rounded-xl bg-raised md:block" />
            </div>
          ) : needsPhone ? (
            <div className="h-full overflow-y-auto">
              <div className="mx-auto w-full max-w-xl p-4 md:p-6">
                <PhoneGate
                  initialName={profile?.name || user?.displayName || ""}
                  initialPhone={profile?.phone ?? ""}
                  onSaved={() => void refresh()}
                />
              </div>
            </div>
          ) : (
            children
          )}
        </PageTransition>
      </div>

      <nav
        className="fixed inset-x-0 bottom-0 z-20 border-t border-border bg-raised/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md md:hidden"
        aria-label="Sender"
      >
        <div className="flex">
          {NAV.map((item) => {
            const active = navActive(pathname, item.to, item.exact);
            const jobsItem = item.to === "/jobs";
            return (
              <Link
                key={item.to}
                to={item.to}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "relative flex h-14 min-w-0 flex-1 flex-col items-center justify-center gap-0.5 text-[10px] font-medium",
                  "transition-colors duration-150 ease-[cubic-bezier(0.22,1,0.36,1)]",
                  active ? "text-fg" : "text-subtle",
                )}
              >
                <span
                  className={cn(
                    "absolute inset-x-8 top-0 h-0.5 origin-center rounded-full bg-fg",
                    "transition-transform duration-200 ease-[cubic-bezier(0.22,1,0.36,1)]",
                    active ? "scale-x-100" : "scale-x-0",
                  )}
                  aria-hidden
                />
                <span className="relative">
                  <item.icon className="size-[18px]" />
                  {jobsItem && actionCount > 0 ? (
                    <span className="absolute -top-1 -right-2 grid min-w-3.5 place-items-center rounded-full bg-fg px-1 text-[9px] font-medium leading-4 tabular-nums text-accent-fg">
                      {actionCount > 9 ? "9+" : actionCount}
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
