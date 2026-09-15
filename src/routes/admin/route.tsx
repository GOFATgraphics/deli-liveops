import { createFileRoute, Link, Navigate } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import { DeskShell } from "@/components/ops/desk-shell";
import { SignInGate } from "@/lib/auth/gates";
import { ensureOperator } from "@/lib/operator-data";

export const Route = createFileRoute("/admin")({
  component: AdminLayout,
  head: () => ({
    meta: [
      { title: "Deli Admin" },
      { name: "description", content: "Staff dashboard — overview, jobs, fleets, map, records." },
    ],
  }),
});

function AdminLayout() {
  return (
    <SignInGate fallback={<Navigate to="/login" search={{ next: "/admin" }} />}>
      <AdminGate>
        <DeskShell />
      </AdminGate>
    </SignInGate>
  );
}

function AdminGate({ children }: { children: ReactNode }) {
  const [state, setState] = useState<"load" | "ok" | "no">("load");

  useEffect(() => {
    void ensureOperator()
      .then(() => setState("ok"))
      .catch(() => setState("no"));
  }, []);

  if (state === "load") {
    return (
      <main className="grid min-h-dvh place-items-center bg-bg p-6">
        <div className="h-40 w-full max-w-sm animate-pulse rounded-xl bg-raised" />
      </main>
    );
  }

  if (state === "no") {
    return (
      <main className="grid min-h-dvh place-items-center bg-bg px-4">
        <div className="max-w-sm text-center">
          <p className="font-display text-3xl tracking-tight">Deli</p>
          <p className="mt-1 text-xs font-medium tracking-[0.18em] text-subtle uppercase">Admin</p>
          <p className="mt-6 text-sm text-muted">This desk is for Deli staff only.</p>
          <p className="mt-6">
            <Link to="/" className="text-sm underline-offset-4 hover:underline">
              Back to your jobs
            </Link>
          </p>
        </div>
      </main>
    );
  }

  return <>{children}</>;
}
