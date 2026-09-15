import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { BrandMark } from "@/components/brand-mark";
import { ReceiverCodeCard } from "@/components/send/receiver-code-card";
import { Button } from "@/components/ui/button";
import { RedirectToSignIn, SignInGate } from "@/lib/auth/gates";
import { confirmPaystackPayment } from "@/lib/payment-data";

export const Route = createFileRoute("/pay")({
  validateSearch: (search: Record<string, unknown>) => ({
    reference: typeof search.reference === "string" ? search.reference : typeof search.trxref === "string" ? search.trxref : "",
  }),
  component: PayPage,
  head: () => ({
    meta: [{ title: "Deli — Payment successful" }],
  }),
});

function PayPage() {
  return (
    <SignInGate fallback={<RedirectToSignIn />}>
      <PayReturn />
    </SignInGate>
  );
}

type Receipt = {
  deliveryCode: string;
  publicId: string;
  pickupLandmark: string;
  dropoffLandmark: string;
  amountNgn: number;
};

function PayReturn() {
  const { reference } = Route.useSearch();
  const [state, setState] = useState<"load" | "ok" | "no">("load");
  const [receipt, setReceipt] = useState<Receipt | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!reference) {
      setState("no");
      setError("No payment reference.");
      return;
    }
    void confirmPaystackPayment({ data: { reference } })
      .then((result) => {
        if (!result.deliveryCode) {
          setError("Payment landed, but the receiver code is not ready yet. Open your jobs.");
          setState("no");
          return;
        }
        setReceipt({
          deliveryCode: result.deliveryCode,
          publicId: result.publicId,
          pickupLandmark: result.pickupLandmark,
          dropoffLandmark: result.dropoffLandmark,
          amountNgn: result.amountNgn,
        });
        setState("ok");
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : "Payment could not be confirmed.");
        setState("no");
      });
  }, [reference]);

  return (
    <div className="flex min-h-dvh flex-col bg-bg">
      <header className="sticky top-0 z-20 flex items-center justify-between gap-3 border-b border-border bg-raised/90 px-4 py-3 backdrop-blur-md md:px-5">
        <div className="flex min-w-0 items-center gap-2.5">
          <BrandMark className="size-8" />
          <div className="min-w-0">
            <div className="flex items-baseline gap-2">
              <span className="font-display text-xl leading-none tracking-tight">Deli</span>
              <span className="text-xs font-medium tracking-[0.16em] text-subtle uppercase">Send</span>
            </div>
            <p className="mt-0.5 truncate text-xs text-muted">Payment</p>
          </div>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-xl flex-1 flex-col justify-center gap-5 p-4 md:p-6">
        {state === "load" ? (
          <div className="rounded-xl bg-raised p-5 shadow-[var(--shadow-card)]">
            <div className="h-6 w-40 animate-pulse rounded bg-surface" />
            <p className="mt-4 text-sm text-muted">Confirming payment…</p>
            <div className="mt-5 h-36 animate-pulse rounded-lg bg-fg/90" />
          </div>
        ) : null}

        {state === "ok" && receipt ? (
          <ReceiverCodeCard
            variant="success"
            code={receipt.deliveryCode}
            publicId={receipt.publicId}
            pickupLandmark={receipt.pickupLandmark}
            dropoffLandmark={receipt.dropoffLandmark}
            amountNgn={receipt.amountNgn}
          />
        ) : null}

        {state === "no" ? (
          <div className="rounded-xl bg-raised p-5 shadow-[var(--shadow-card)]">
            <p className="text-xs font-medium tracking-[0.16em] text-subtle uppercase">Payment</p>
            <h2 className="font-display mt-1 text-2xl tracking-tight">Could not confirm</h2>
            <p className="mt-3 text-sm text-muted">{error}</p>
          </div>
        ) : null}

        <Button asChild variant="secondary" className="w-full">
          <Link to="/">Back to your jobs</Link>
        </Button>
      </main>
    </div>
  );
}
