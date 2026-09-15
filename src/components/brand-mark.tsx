import { cn } from "@/lib/utils";

export function BrandMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      className={cn("size-8 shrink-0", className)}
      aria-hidden
    >
      <rect width="32" height="32" rx="7" fill="var(--color-fg)" />
      <rect x="7" y="8" width="18" height="16" rx="2" fill="var(--color-raised)" />
      <rect x="14.5" y="8" width="3" height="16" fill="var(--color-muted)" />
      <rect x="7" y="14.5" width="18" height="3" fill="var(--color-muted)" />
    </svg>
  );
}
