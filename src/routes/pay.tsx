import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { RedirectToSignIn, SignInGate } from "@/lib/auth/gates";
import { confirmPaystackPayment } from "@/lib/payment-data";

export const Route = createFileRoute("/pay")({
  validateSearch: (search: Record<string, unknown>) => ({
    reference: typeof search.reference === "string" ? search.reference : typeof search.trxref === "string" ? search.trxref : "",
  }),
  component: PayPage,
  head: () => ({
    meta: [{ title: "Deli — Payment" }],
  }),
});

function PayPage() {
  return (
    <SignInGate fallback={<RedirectToSignIn />}>
      <PayReturn />
    </SignInGate>
  );
}

function PayReturn() {
  const { reference } = Route.useSearch();
  const [state, setState] = useState<"load" | "ok" | "no">("load");
  const [code, setCode] = useState<string | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!reference) {
      setState("no");
      setError("No payment reference.");
      return;
    }
    void confirmPaystackPayment({ data: { reference } })
      .then((result) => {
        setCode(result.deliveryCode);
        setState("ok");
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : "Payment could not be confirmed.");
        setState("no");
      });
  }, [reference]);

  return (
    <main className="grid min-h-dvh place-items-center bg-bg px-4">
      <div className="w-full max-w-sm text-center">
        <p className="font-display text-3xl tracking-tight">Deli</p>
        {state === "load" ? <p className="mt-6 text-sm text-muted">Confirming payment…</p> : null}
        {state === "ok" ? (
          <>
            <p className="mt-6 text-sm text-muted">Payment received. We hold it until delivery.</p>
            {code ? (
              <>
                <p className="mt-6 text-xs font-medium tracking-[0.16em] text-subtle uppercase">Receiver code</p>
                <p className="font-display mt-2 text-4xl tracking-[0.28em] tabular-nums">{code}</p>
                <p className="mt-3 text-sm text-muted">Send this to the person receiving.</p>
              </>
            ) : null}
          </>
        ) : null}
        {state === "no" ? <p className="mt-6 text-sm text-muted">{error}</p> : null}
        <p className="mt-8">
          <Link to="/jobs" className="text-sm underline-offset-4 hover:underline">
            Back to your jobs
          </Link>
        </p>
      </div>
    </main>
  );
}
