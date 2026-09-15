import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { authMiddleware } from "@/lib/auth/middleware";

function payRef(publicId: string) {
  const stamp = Date.now().toString(36);
  const rand = crypto.randomUUID().replaceAll("-", "").slice(0, 8);
  return `deli${publicId.replaceAll("-", "")}${stamp}${rand}`.slice(0, 100);
}

export const startPaystackCheckout = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(z.object({ jobId: z.string(), origin: z.string().min(8) }))
  .handler(async ({ context, data }) => {
    const { getSql } = await import("@/lib/db");
    const { initializePaystack, paystackConfigured } = await import("@/lib/paystack.server");
    if (!paystackConfigured()) {
      throw new Error("Paystack is not connected. Add PAYSTACK_SECRET_KEY on the host.");
    }
    const sql = await getSql();
    const jobs = await sql.query<{
      id: string;
      public_id: string;
      status: string;
      selected_quote_id: string | null;
    }>(`select id, public_id, status, selected_quote_id from jobs where id = $1 and sender_user_id = $2`, [
      data.jobId,
      context.userId,
    ]);
    const job = jobs[0];
    if (!job) throw new Error("Job not found");
    if (job.status !== "accepted" && job.status !== "payment_pending") {
      throw new Error("Accept the price first, then pay.");
    }
    if (!job.selected_quote_id) throw new Error("No price on this job.");
    const quotes = await sql.query<{ total_ngn: number }>(`select total_ngn from quotes where id = $1`, [
      job.selected_quote_id,
    ]);
    const amountNgn = Number(quotes[0]?.total_ngn ?? 0);
    if (amountNgn < 1) throw new Error("Price is missing.");
    const users = await sql.query<{ email: string }>(`select email from "user" where id = $1`, [context.userId]);
    const email = users[0]?.email?.trim();
    if (!email) throw new Error("Your account needs an email to pay.");
    const { getRequest } = await import("@tanstack/react-start/server");
    const requestUrl = getRequest()?.url;
    const origin = requestUrl ? new URL(requestUrl).origin : callbackOrigin(data.origin);
    const reference = payRef(String(job.public_id));
    const started = await initializePaystack({
      email,
      amountNgn,
      reference,
      callbackUrl: `${origin}/pay?reference=${encodeURIComponent(reference)}`,
      jobId: job.id,
      publicId: String(job.public_id),
    });
    await sql.query(
      `insert into payments (id, job_id, quote_id, amount_ngn, currency, provider, provider_ref, status)
       values ($1,$2,$3,$4,'NGN','paystack',$5,'pending')`,
      [crypto.randomUUID(), job.id, job.selected_quote_id, amountNgn, started.reference],
    );
    if (job.status !== "payment_pending") {
      await sql.query(
        `update jobs set status = 'payment_pending', updated_at = now(), actor = 'sender' where id = $1`,
        [job.id],
      );
      await sql.query(
        `insert into job_events (id, job_id, kind, from_status, to_status, payload, actor)
         values ($1,$2,'status',$3,'payment_pending',$4::jsonb,'sender')`,
        [crypto.randomUUID(), job.id, job.status, JSON.stringify({ reference: started.reference })],
      );
    }
    return { authorizationUrl: started.authorizationUrl, accessCode: started.accessCode, reference: started.reference };
  });

export const confirmPaystackPayment = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(z.object({ reference: z.string().min(4) }))
  .handler(async ({ context, data }) => {
    const { getSql } = await import("@/lib/db");
    const { applyPaidJob, verifyPaystackReference } = await import("@/lib/paystack.server");
    const verified = await verifyPaystackReference(data.reference);
    if (verified.status !== "success") {
      throw new Error("Payment is not complete yet.");
    }
    const sql = await getSql();
    const rows = await sql.query<{ job_id: string }>(`select job_id from payments where provider_ref = $1`, [
      verified.reference,
    ]);
    const jobId = verified.jobId ?? rows[0]?.job_id;
    if (!jobId) throw new Error("That payment is not on a Deli job.");
    const owned = await sql.query<{ id: string }>(`select id from jobs where id = $1 and sender_user_id = $2`, [
      jobId,
      context.userId,
    ]);
    if (!owned[0]) throw new Error("Job not found");
    return applyPaidJob({
      jobId,
      reference: verified.reference,
      amountNgn: Math.round(verified.amountKobo / 100),
      actor: "paystack",
      channel: verified.channel,
    });
  });

function callbackOrigin(origin: string, requestUrl?: string) {
  try {
    const client = new URL(origin);
    if (requestUrl && new URL(requestUrl).host === client.host) return client.origin;
  } catch {
    /* fall through */
  }
  return safeOrigin(origin);
}

function safeOrigin(origin: string) {
  let url: URL;
  try {
    url = new URL(origin);
  } catch {
    throw new Error("Bad return address.");
  }
  const host = url.hostname;
  const ok =
    host === "localhost" ||
    host === "127.0.0.1" ||
    host.endsWith(".vercel.app") ||
    host.endsWith(".grok-sandbox.com") ||
    host.endsWith(".grok.fun") ||
    host.endsWith(".ngrok-free.app");
  if (!ok || (url.protocol !== "https:" && host !== "localhost" && host !== "127.0.0.1")) {
    throw new Error("Bad return address.");
  }
  return url.origin;
}
