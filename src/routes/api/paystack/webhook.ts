import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/paystack/webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const raw = await request.text();
        const { applyPaidJob, verifyPaystackSignature } = await import("@/lib/paystack.server");
        const { getSql } = await import("@/lib/db");
        const signature = request.headers.get("x-paystack-signature");
        if (!verifyPaystackSignature(raw, signature)) {
          return new Response("invalid signature", { status: 401 });
        }
        let event: {
          event?: string;
          data?: {
            reference?: string;
            amount?: number;
            channel?: string;
            metadata?: { jobId?: string };
          };
        };
        try {
          event = JSON.parse(raw) as typeof event;
        } catch {
          return new Response("bad json", { status: 400 });
        }
        if (event.event !== "charge.success" || !event.data?.reference) {
          return new Response("ok");
        }
        let jobId = event.data.metadata?.jobId;
        if (!jobId) {
          const sql = await getSql();
          const rows = await sql.query<{ job_id: string }>(`select job_id from payments where provider_ref = $1`, [
            event.data.reference,
          ]);
          jobId = rows[0]?.job_id;
        }
        if (!jobId) return new Response("ok");
        try {
          await applyPaidJob({
            jobId,
            reference: event.data.reference,
            amountNgn: Math.round(Number(event.data.amount ?? 0) / 100),
            actor: "paystack",
            channel: event.data.channel,
          });
        } catch (error) {
          console.error("[paystack] webhook apply failed", error);
          return new Response("retry", { status: 500 });
        }
        return new Response("ok");
      },
    },
  },
});
