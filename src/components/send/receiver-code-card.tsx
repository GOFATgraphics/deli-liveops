import { useState } from "react";
import { Check, Copy, Share2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type ReceiverCodeCardProps = {
  code: string;
  publicId: string;
  pickupLandmark: string;
  dropoffLandmark: string;
  amountNgn?: number | null;
  variant?: "success" | "code";
  statusLabel?: string;
  className?: string;
};

function money(n: number) {
  return `₦${n.toLocaleString("en-NG")}`;
}

function shareMessage(props: ReceiverCodeCardProps) {
  return [
    `Deli receiver code: ${props.code}`,
    "",
    "Show this to the rider at dropoff.",
    `${props.publicId} · ${props.pickupLandmark} → ${props.dropoffLandmark}`,
  ].join("\n");
}

export function ReceiverCodeCard({
  code,
  publicId,
  pickupLandmark,
  dropoffLandmark,
  amountNgn,
  variant = "code",
  statusLabel,
  className,
}: ReceiverCodeCardProps) {
  const [copied, setCopied] = useState(false);
  const digits = code.replace(/\D/g, "").slice(0, 4).padEnd(4, "·").split("");

  async function copyCode() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      toast.success("Code copied");
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      toast.error("Could not copy");
    }
  }

  async function shareWithReceiver() {
    const text = shareMessage({ code, publicId, pickupLandmark, dropoffLandmark, amountNgn });
    if (typeof navigator.share === "function") {
      try {
        await navigator.share({ title: "Deli receiver code", text });
        return;
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") return;
      }
    }
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank", "noopener,noreferrer");
  }

  return (
    <div className={cn("rounded-xl bg-raised p-5 shadow-[var(--shadow-card)]", className)}>
      {variant === "success" ? (
        <div className="flex items-start gap-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-full bg-fg text-accent-fg">
            <Check className="size-5" strokeWidth={2.25} />
          </span>
          <div className="min-w-0">
            <p className="text-xs font-medium tracking-[0.16em] text-subtle uppercase">Paid</p>
            <h2 className="font-display mt-0.5 text-2xl tracking-tight">Payment successful</h2>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-between gap-2">
          <p className="text-xs font-medium tracking-[0.16em] text-subtle uppercase">Receiver code</p>
          {statusLabel ? <p className="text-xs tracking-wide text-subtle uppercase">{statusLabel}</p> : null}
        </div>
      )}

      <p className="mt-3 text-sm text-muted">
        {publicId}
        {amountNgn != null ? ` · ${money(amountNgn)} held until delivery` : ""}
      </p>
      <p className="mt-1 text-sm font-medium">
        {pickupLandmark} → {dropoffLandmark}
      </p>

      <div className="mt-5 rounded-lg bg-fg px-4 py-5 text-accent-fg">
        <p className="text-center text-xs font-medium tracking-[0.2em] text-accent-fg/60 uppercase">
          Share with the receiver
        </p>
        <p className="font-display mt-3 flex select-all justify-center gap-3 text-5xl leading-none tracking-[0.12em] tabular-nums">
          {digits.map((d, i) => (
            <span key={`${d}-${i}`} className="inline-block w-10 text-center">
              {d}
            </span>
          ))}
        </p>
        <p className="mt-3 text-center text-sm text-accent-fg/70">
          They show this to the rider. We match it before the fleet is paid.
        </p>
      </div>

      <div className="mt-4 flex gap-2">
        <Button type="button" variant="secondary" className="flex-1" onClick={() => void copyCode()}>
          {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
          {copied ? "Copied" : "Copy code"}
        </Button>
        <Button type="button" className="flex-1" onClick={() => void shareWithReceiver()}>
          <Share2 className="size-4" />
          Share
        </Button>
      </div>
    </div>
  );
}
