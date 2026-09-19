import { PublicShell } from "@/components/public/public-shell";
import { Skeleton } from "@/components/ui/skeleton";

export function PublicPending() {
  return (
    <PublicShell>
      <div className="mx-auto max-w-5xl px-4 py-16" aria-busy="true" aria-label="Loading">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="mt-4 h-12 w-3/4 max-w-md" />
        <Skeleton className="mt-4 h-20 w-full max-w-xl" />
        <div className="mt-10 grid gap-4 md:grid-cols-4">
          <Skeleton className="h-36" />
          <Skeleton className="h-36" />
          <Skeleton className="h-36" />
          <Skeleton className="h-36" />
        </div>
      </div>
    </PublicShell>
  );
}
