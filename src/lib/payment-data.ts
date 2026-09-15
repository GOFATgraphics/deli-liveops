import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { authMiddleware } from "@/lib/auth/middleware";

function payRef(publicId: string) {
  const stamp = Date.now().toString(36);
  const rand = crypto.randomUUID().replaceAll("-", "").slice(0, 8);
  return `deli${publicId.replaceAll("-", "")}${stamp}${rand}`.slice(0, 100);
}

type Sql = Awaited<ReturnType<(typeof import("@/lib/db"))["getSql"]>>;

async function beginCheckout(sql: Sql, input: { userId: string; jobId: string; origin: string }) {
  const { initializePaystack, paystackConfigured } = await import("@/lib/paystack.server");
  if (!paystackConfigured()) {
    throw new Error("Paystack is not connected. Add PAYSTACK_SECRET_KEY on the host.");
  }
  const jobs = await sql.query<{
    id: string;
    public_id: string;
    status: string;
    selected_quote_id: string | null;
  }>(`select id, public_id, status, selected_quote_id from jobs where id = $1 and sender_user_id = $2`, [
    input.jobId,
    input.userId,
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
  const users = await sql.query<{ email: string }>(`select email from "user" where id = $1`, [input.userId]);
  const email = users[0]?.email?.trim();
  if (!email) throw new Error("Your account needs an email to pay.");
  const origin = await checkoutOrigin(input.origin);
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
  return { authorizationUrl: started.authorizationUrl, reference: started.reference };
}

export const acceptAndPay = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(z.object({ jobId: z.string(), quoteId: z.string(), origin: z.string().min(8) }))
  .handler(async ({ context, data }) => {
    const { getSql } = await import("@/lib/db");
    const { paystackConfigured } = await import("@/lib/paystack.server");
    if (!paystackConfigured()) {
      throw new Error("Paystack is not connected. Add PAYSTACK_SECRET_KEY on the host.");
    }
    const sql = await getSql();
    const jobs = await sql.query<{ id: string; status: string }>(
      `select id, status from jobs where id = $1 and sender_user_id = $2`,
      [data.jobId, context.userId],
    );
    const job = jobs[0];
    if (!job) throw new Error("Job not found");
    if (job.status !== "quoted" && job.status !== "accepted" && job.status !== "payment_pending") {
      throw new Error("This job is not waiting for payment.");
    }
    if (job.status === "quoted") {
      const quotes = await sql.query<{ id: string; status: string; fleet_id: string }>(
        `select id, status, fleet_id from quotes where id = $1 and job_id = $2`,
        [data.quoteId, data.jobId],
      );
      const quote = quotes[0];
      if (!quote || quote.status !== "offered") throw new Error("That price is no longer offered.");
      await sql.query(`update quotes set status = 'accepted' where id = $1`, [quote.id]);
      await sql.query(`update quotes set status = 'withdrawn' where job_id = $1 and id <> $2 and status = 'offered'`, [
        data.jobId,
        quote.id,
      ]);
      await sql.query(
        `update jobs set selected_quote_id = $2, selected_fleet_id = $3, delivery_code = null, status = 'payment_pending', updated_at = now(), actor = 'sender'
         where id = $1`,
        [data.jobId, quote.id, quote.fleet_id],
      );
      await sql.query(
        `insert into job_events (id, job_id, kind, from_status, to_status, payload, actor)
         values ($1,$2,'quote_accepted',$3,'payment_pending',$4::jsonb,'sender')`,
        [crypto.randomUUID(), data.jobId, job.status, JSON.stringify({ quoteId: quote.id, fleetId: quote.fleet_id })],
      );
    }
    return beginCheckout(sql, { userId: context.userId, jobId: data.jobId, origin: data.origin });
  });

export const startPaystackCheckout = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(z.object({ jobId: z.string(), origin: z.string().min(8) }))
  .handler(async ({ context, data }) => {
    const { getSql } = await import("@/lib/db");
    const sql = await getSql();
    return beginCheckout(sql, { userId: context.userId, jobId: data.jobId, origin: data.origin });
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

async function checkoutOrigin(clientOrigin: string) {
  const { env } = await import("@/lib/env.server");
  try {
    const client = new URL(clientOrigin);
    if (client.hostname.endsWith(".vercel.app")) return client.origin;
  } catch {
    /* fall through */
  }
  const vercel = env("VERCEL_PROJECT_PRODUCTION_URL") || env("VERCEL_URL");
  if (vercel) return `https://${vercel.replace(/^https?:\/\//, "")}`;
  const { getRequest } = await import("@tanstack/react-start/server");
  const req = getRequest();
  if (req) return new URL(req.url).origin;
  return safeOrigin(clientOrigin);
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
