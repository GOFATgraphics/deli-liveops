import { createHmac, timingSafeEqual } from "node:crypto";
import { env } from "@/lib/env.server";
import { fourDigit } from "@/lib/ops-data";

export function paystackSecret() {
  return env("PAYSTACK_SECRET_KEY");
}

export function paystackConfigured() {
  return Boolean(paystackSecret());
}

function secretOrThrow() {
  const key = paystackSecret();
  if (!key) throw new Error("Paystack is not connected. Add PAYSTACK_SECRET_KEY on the host.");
  return key;
}

export function verifyPaystackSignature(rawBody: string, signature: string | null) {
  const key = paystackSecret();
  if (!key || !signature) return false;
  const hash = createHmac("sha512", key).update(rawBody).digest("hex");
  const a = Buffer.from(hash);
  const b = Buffer.from(signature);
  return a.length === b.length && timingSafeEqual(a, b);
}

type InitializeResult = { authorizationUrl: string; reference: string; accessCode: string };

export async function initializePaystack(input: {
  email: string;
  amountNgn: number;
  reference: string;
  callbackUrl: string;
  jobId: string;
  publicId: string;
}): Promise<InitializeResult> {
  const res = await fetch("https://api.paystack.co/transaction/initialize", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${secretOrThrow()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: input.email,
      amount: input.amountNgn * 100,
      currency: "NGN",
      reference: input.reference,
      callback_url: input.callbackUrl,
      channels: ["card", "bank", "ussd", "bank_transfer"],
      metadata: {
        jobId: input.jobId,
        publicId: input.publicId,
        custom_fields: [
          { display_name: "Job", variable_name: "job", value: input.publicId },
        ],
      },
    }),
  });
  const body = (await res.json()) as {
    status: boolean;
    message?: string;
    data?: { authorization_url: string; reference: string; access_code: string };
  };
  if (!res.ok || !body.status || !body.data?.authorization_url) {
    throw new Error(body.message || "Paystack could not start this payment.");
  }
  return {
    authorizationUrl: body.data.authorization_url,
    reference: body.data.reference,
    accessCode: body.data.access_code,
  };
}

export type PaystackVerify = {
  status: string;
  amountKobo: number;
  reference: string;
  channel: string | null;
  jobId: string | null;
};

export async function verifyPaystackReference(reference: string): Promise<PaystackVerify> {
  const res = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`, {
    headers: { Authorization: `Bearer ${secretOrThrow()}` },
  });
  const body = (await res.json()) as {
    status: boolean;
    message?: string;
    data?: {
      status: string;
      amount: number;
      reference: string;
      channel?: string;
      metadata?: { jobId?: string };
    };
  };
  if (!res.ok || !body.status || !body.data) {
    throw new Error(body.message || "Paystack could not confirm this payment.");
  }
  return {
    status: body.data.status,
    amountKobo: Number(body.data.amount),
    reference: body.data.reference,
    channel: body.data.channel ?? null,
    jobId: body.data.metadata?.jobId ?? null,
  };
}

export async function applyPaidJob(opts: {
  jobId: string;
  reference: string;
  amountNgn: number;
  actor: string;
  channel?: string | null;
}) {
  const { getSql } = await import("@/lib/db");
  const sql = await getSql();
  const jobs = await sql.query<Record<string, unknown>>(`select * from jobs where id = $1`, [opts.jobId]);
  const job = jobs[0];
  if (!job) throw new Error("Job not found");
  const status = String(job.status);
  if (["paid", "assigned", "picked_up", "in_transit", "delivery_confirmation_pending", "delivered", "settlement_pending", "settled"].includes(status)) {
    return paidResult({
      already: true,
      deliveryCode: job.delivery_code ? String(job.delivery_code) : null,
      job,
      amountNgn: opts.amountNgn,
    });
  }
  if (!["accepted", "payment_pending"].includes(status)) {
    throw new Error("This job is not waiting for payment.");
  }
  const quoteId = job.selected_quote_id ? String(job.selected_quote_id) : null;
  if (!quoteId) throw new Error("Accept a price first.");
  const quotes = await sql.query<{ total_ngn: number }>(`select total_ngn from quotes where id = $1`, [quoteId]);
  const expected = Number(quotes[0]?.total_ngn ?? 0);
  if (expected > 0 && opts.amountNgn < expected) {
    throw new Error("Paid amount does not match the price.");
  }
  const existing = await sql.query<{ id: string; status: string }>(
    `select id, status from payments where provider_ref = $1`,
    [opts.reference],
  );
  if (!existing[0]) {
    await sql.query(
      `insert into payments (id, job_id, quote_id, amount_ngn, currency, provider, provider_ref, status, paid_at)
       values ($1,$2,$3,$4,'NGN','paystack',$5,'paid', now())`,
      [crypto.randomUUID(), opts.jobId, quoteId, opts.amountNgn, opts.reference],
    );
  } else if (existing[0].status !== "paid") {
    await sql.query(`update payments set status = 'paid', paid_at = now() where id = $1`, [existing[0].id]);
  }
  const code = job.delivery_code ? String(job.delivery_code) : fourDigit();
  await sql.query(
    `update jobs set delivery_code = $2, status = 'paid', updated_at = now(), actor = $3 where id = $1`,
    [opts.jobId, code, opts.actor],
  );
  await sql.query(
    `insert into job_events (id, job_id, kind, from_status, to_status, payload, actor)
     values ($1,$2,'paid',$3,'paid',$4::jsonb,$5)`,
    [
      crypto.randomUUID(),
      opts.jobId,
      status,
      JSON.stringify({ reference: opts.reference, amountNgn: opts.amountNgn, channel: opts.channel ?? null }),
      opts.actor,
    ],
  );
  return paidResult({ already: false, deliveryCode: code, job, amountNgn: opts.amountNgn });
}

function paidResult(input: {
  already: boolean;
  deliveryCode: string | null;
  job: Record<string, unknown>;
  amountNgn: number;
}) {
  return {
    ok: true as const,
    already: input.already,
    deliveryCode: input.deliveryCode,
    jobId: String(input.job.id),
    publicId: String(input.job.public_id ?? ""),
    pickupLandmark: String(input.job.pickup_landmark ?? ""),
    dropoffLandmark: String(input.job.dropoff_landmark ?? ""),
    amountNgn: input.amountNgn,
  };
}
