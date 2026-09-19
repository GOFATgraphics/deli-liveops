import { Link, useNavigate } from "@tanstack/react-router";
import { Search as SearchIcon } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { lookupTrack, type PublicTrack } from "@/lib/public-data";
import { cn } from "@/lib/utils";

const PAGES = [
  { label: "Request a pickup", hint: "File a job", to: "/request" as const, search: undefined },
  { label: "My jobs", hint: "Sender desk", to: "/jobs" as const, search: undefined },
  { label: "Contact", hint: "Talk to Deli", to: "/contact" as const, search: undefined },
  { label: "Sign in", hint: "Account", to: "/login" as const, search: { next: "/jobs" as const } },
  { label: "LiveOps", hint: "Staff desk", to: "/ops" as const, search: undefined },
];

type Hit =
  | { kind: "track"; id: string; track: PublicTrack }
  | { kind: "page"; id: string; page: (typeof PAGES)[number] };

export function SearchButton({ onOpen }: { onOpen: () => void }) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className="grid size-11 place-items-center rounded-md text-fg transition-colors hover:bg-fg/5 focus-visible:ring-2 focus-visible:ring-ring/40"
      aria-label="Search"
      aria-keyshortcuts="Meta+K"
    >
      <SearchIcon className="size-5" />
    </button>
  );
}

export function SearchDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const reduce = useReducedMotion();
  const navigate = useNavigate();
  const panelRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [tracks, setTracks] = useState<PublicTrack[]>([]);
  const [busy, setBusy] = useState(false);
  const [active, setActive] = useState(0);

  const pages = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return PAGES;
    return PAGES.filter((page) => `${page.label} ${page.hint}`.toLowerCase().includes(q));
  }, [query]);

  const hits: Hit[] = useMemo(
    () => [
      ...tracks.map((track) => ({ kind: "track" as const, id: `t-${track.publicId}`, track })),
      ...pages.map((page) => ({ kind: "page" as const, id: `p-${page.to}`, page })),
    ],
    [tracks, pages],
  );

  useEffect(() => {
    if (!open) return;
    setQuery("");
    setTracks([]);
    setActive(0);
    const id = window.setTimeout(() => inputRef.current?.focus(), 20);
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.clearTimeout(id);
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  useEffect(() => {
    const q = query.trim();
    if (q.length < 2) {
      setTracks([]);
      setBusy(false);
      return;
    }
    let alive = true;
    setBusy(true);
    const id = window.setTimeout(() => {
      void lookupTrack({ data: { q } })
        .then((rows) => {
          if (alive) setTracks(rows);
        })
        .catch(() => {
          if (alive) setTracks([]);
        })
        .finally(() => {
          if (alive) setBusy(false);
        });
    }, 180);
    return () => {
      alive = false;
      window.clearTimeout(id);
    };
  }, [query]);

  useEffect(() => {
    setActive(0);
  }, [hits.length, query]);

  function go(hit: Hit | undefined) {
    if (!hit) return;
    onClose();
    if (hit.kind === "track") {
      void navigate({ to: "/login", search: { next: "/jobs" } });
      return;
    }
    void navigate({ to: hit.page.to, search: hit.page.search });
  }

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-50 grid place-items-start bg-fg/40 px-4 pt-[12vh] backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-label="Search Deli"
          initial={reduce ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.15 } }}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) onClose();
          }}
        >
          <motion.div
            ref={panelRef}
            className="w-full max-w-lg overflow-hidden rounded-xl bg-raised shadow-[var(--shadow-card)]"
            initial={reduce ? false : { opacity: 0, y: 12, filter: "blur(4px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -8, filter: "blur(4px)", transition: { duration: 0.15 } }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="flex items-center gap-2 border-b border-border px-3">
              <SearchIcon className="size-4 text-muted" aria-hidden />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search pages or a job id (DL-1042)"
                className="h-12 w-full bg-transparent text-sm outline-none placeholder:text-subtle"
                aria-label="Search"
                aria-autocomplete="list"
                aria-controls="deli-search-list"
                aria-activedescendant={hits[active]?.id}
                onKeyDown={(event) => {
                  if (event.key === "ArrowDown") {
                    event.preventDefault();
                    setActive((i) => Math.min(hits.length - 1, i + 1));
                  } else if (event.key === "ArrowUp") {
                    event.preventDefault();
                    setActive((i) => Math.max(0, i - 1));
                  } else if (event.key === "Enter") {
                    event.preventDefault();
                    go(hits[active]);
                  } else if (event.key === "Tab") {
                    const root = panelRef.current;
                    if (!root) return;
                    const nodes = [...root.querySelectorAll<HTMLElement>("input, button, a")].filter(
                      (el) => !el.hasAttribute("disabled"),
                    );
                    if (nodes.length === 0) return;
                    const first = nodes[0];
                    const last = nodes[nodes.length - 1];
                    if (event.shiftKey && document.activeElement === first) {
                      event.preventDefault();
                      last.focus();
                    } else if (!event.shiftKey && document.activeElement === last) {
                      event.preventDefault();
                      first.focus();
                    }
                  }
                }}
              />
            </div>
            <ul id="deli-search-list" role="listbox" className="max-h-80 overflow-y-auto p-2">
              {busy ? (
                <li className="px-3 py-2 text-sm text-muted" aria-live="polite">
                  Looking up jobs…
                </li>
              ) : null}
              {hits.map((hit, index) =>
                hit.kind === "track" ? (
                  <li key={hit.id} role="option" aria-selected={index === active} id={hit.id}>
                    <button
                      type="button"
                      className={cn(
                        "flex w-full flex-col rounded-md px-3 py-2 text-left",
                        "hover:bg-fg/5 focus-visible:bg-fg/5 focus-visible:outline-none",
                        index === active && "bg-fg/5",
                      )}
                      onClick={() => go(hit)}
                      onMouseEnter={() => setActive(index)}
                    >
                      <span className="font-mono text-sm">{hit.track.publicId}</span>
                      <span className="mt-0.5 block text-sm text-muted">
                        {hit.track.pickup} → {hit.track.dropoff} · {hit.track.status}
                      </span>
                    </button>
                  </li>
                ) : (
                  <li key={hit.id} role="option" aria-selected={index === active} id={hit.id}>
                    <Link
                      to={hit.page.to}
                      search={hit.page.search}
                      className={cn(
                        "flex flex-col rounded-md px-3 py-2 text-left",
                        "hover:bg-fg/5 focus-visible:bg-fg/5 focus-visible:outline-none",
                        index === active && "bg-fg/5",
                      )}
                      onClick={onClose}
                      onMouseEnter={() => setActive(index)}
                    >
                      <span className="text-sm font-medium">{hit.page.label}</span>
                      <span className="text-xs text-muted">{hit.page.hint}</span>
                    </Link>
                  </li>
                ),
              )}
              {hits.length === 0 && !busy ? (
                <li className="px-3 py-6 text-center text-sm text-muted">Nothing matches.</li>
              ) : null}
            </ul>
            <div className="border-t border-border px-3 py-2 text-xs text-subtle">
              ↑↓ to move · Enter · Esc
              <button
                type="button"
                className="ml-3 underline-offset-2 hover:underline focus-visible:ring-2 focus-visible:ring-ring/40"
                onClick={() => {
                  onClose();
                  void navigate({ to: "/contact" });
                }}
              >
                Contact
              </button>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
