import { Link, useRouterState } from "@tanstack/react-router";
import { Menu, X, ArrowUp } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { BrandMark } from "@/components/brand-mark";
import { PageTransition } from "@/components/fm";
import { SearchButton, SearchDialog } from "@/components/public/search";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/contact" as const, label: "Contact" },
  { to: "/jobs" as const, label: "Jobs" },
];

export function PublicShell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const reduce = useReducedMotion();
  const [menu, setMenu] = useState(false);
  const [search, setSearch] = useState(false);
  const [progress, setProgress] = useState(0);
  const [top, setTop] = useState(false);

  useEffect(() => {
    setMenu(false);
  }, [pathname]);

  useEffect(() => {
    function onScroll() {
      const el = document.documentElement;
      const max = el.scrollHeight - el.clientHeight;
      setProgress(max <= 0 ? 0 : (el.scrollTop / max) * 100);
      setTop(el.scrollTop > 400);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setSearch(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (!menu && !search) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [menu, search]);

  return (
    <div className="min-h-dvh bg-bg">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-50 focus:rounded-md focus:bg-raised focus:px-3 focus:py-2 focus:text-fg focus:shadow-[var(--shadow-card)]"
      >
        Skip to content
      </a>
      <div
        className="pointer-events-none fixed inset-x-0 top-0 z-40 h-0.5 bg-border"
        role="progressbar"
        aria-label="Scroll progress"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(progress)}
      >
        <div className="h-full bg-fg transition-[width] duration-150 ease-out" style={{ width: `${progress}%` }} />
      </div>

      <header className="sticky top-0 z-30 border-b border-border bg-raised/90 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-5xl items-center gap-3 px-4">
          <Link to="/" className="flex min-w-0 items-center gap-2.5" aria-label="Deli home">
            <BrandMark className="size-8" />
            <span className="font-display text-lg leading-none tracking-tight">Deli</span>
          </Link>
          <nav className="ml-6 hidden items-center gap-1 md:flex" aria-label="Public">
            <a
              href="/#how"
              className="rounded-md px-3 py-2 text-sm text-muted transition-colors hover:text-fg focus-visible:ring-2 focus-visible:ring-ring/40"
            >
              How it works
            </a>
            {NAV.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                aria-current={pathname === item.to ? "page" : undefined}
                className={cn(
                  "rounded-md px-3 py-2 text-sm transition-colors focus-visible:ring-2 focus-visible:ring-ring/40",
                  pathname === item.to ? "text-fg" : "text-muted hover:text-fg",
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="ml-auto flex items-center gap-1">
            <SearchButton onOpen={() => setSearch(true)} />
            <ThemeToggle />
            <Button size="sm" className="hidden md:inline-flex" asChild>
              <Link to="/request">Request pickup</Link>
            </Button>
            <button
              type="button"
              className="grid size-11 place-items-center rounded-md md:hidden focus-visible:ring-2 focus-visible:ring-ring/40"
              aria-label={menu ? "Close menu" : "Open menu"}
              aria-expanded={menu}
              aria-controls="public-menu"
              onClick={() => setMenu((open) => !open)}
            >
              {menu ? <X className="size-5" /> : <Menu className="size-5" />}
            </button>
          </div>
        </div>
        <AnimatePresence>
          {menu ? (
            <motion.nav
              id="public-menu"
              className="overflow-hidden border-t border-border bg-raised md:hidden"
              aria-label="Mobile"
              initial={reduce ? false : { height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="flex flex-col gap-1 px-4 py-3 pb-4">
                <a
                  href="/#how"
                  className="rounded-md px-3 py-3 text-sm focus-visible:ring-2 focus-visible:ring-ring/40"
                  onClick={() => setMenu(false)}
                >
                  How it works
                </a>
                <Link
                  to="/contact"
                  className="rounded-md px-3 py-3 text-sm focus-visible:ring-2 focus-visible:ring-ring/40"
                  onClick={() => setMenu(false)}
                >
                  Contact
                </Link>
                <Link
                  to="/jobs"
                  className="rounded-md px-3 py-3 text-sm focus-visible:ring-2 focus-visible:ring-ring/40"
                  onClick={() => setMenu(false)}
                >
                  My jobs
                </Link>
                <Link
                  to="/request"
                  className="rounded-md px-3 py-3 text-sm font-medium focus-visible:ring-2 focus-visible:ring-ring/40"
                  onClick={() => setMenu(false)}
                >
                  Request pickup
                </Link>
              </div>
            </motion.nav>
          ) : null}
        </AnimatePresence>
      </header>

      <main id="main">
        <PageTransition id={pathname}>{children}</PageTransition>
      </main>

      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-5xl flex-col gap-3 px-4 py-8 text-sm text-muted md:flex-row md:items-center md:justify-between">
          <p>Deli · Kano last mile</p>
          <div className="flex flex-wrap gap-4">
            <Link to="/contact" className="hover:text-fg focus-visible:ring-2 focus-visible:ring-ring/40">
              Contact
            </Link>
            <Link
              to="/login"
              search={{ next: "/jobs" }}
              className="hover:text-fg focus-visible:ring-2 focus-visible:ring-ring/40"
            >
              Sign in
            </Link>
            <Link to="/ops" className="hover:text-fg focus-visible:ring-2 focus-visible:ring-ring/40">
              LiveOps
            </Link>
          </div>
        </div>
      </footer>

      <AnimatePresence>
        {top ? (
          <motion.button
            type="button"
            aria-label="Back to top"
            onClick={() => window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" })}
            className="fixed right-4 bottom-[max(1rem,env(safe-area-inset-bottom))] z-30 grid size-11 place-items-center rounded-full bg-fg text-accent-fg shadow-[var(--shadow-card)] focus-visible:ring-2 focus-visible:ring-ring/40"
            initial={reduce ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
          >
            <ArrowUp className="size-4" />
          </motion.button>
        ) : null}
      </AnimatePresence>

      <SearchDialog open={search} onClose={() => setSearch(false)} />
    </div>
  );
}
