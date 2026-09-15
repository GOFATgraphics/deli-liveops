import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { authMiddleware } from "@/lib/auth/middleware";
import { mapJob, type JobRow } from "@/lib/ops-data";

export type SenderProfile = {
  userId: string;
  name: string;
  phone: string;
};

export type SenderJob = JobRow & {
  fleetName: string | null;
  quoteId: string | null;
  quoteTotalNgn: number | null;
  quoteEtaMinutes: number | null;
};

export const getMySender = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const { getSql } = await import("@/lib/db");
    const sql = await getSql();
    const rows = await sql.query<{ user_id: string; name: string; phone: string }>(
      `select user_id, name, phone from senders where user_id = $1`,
      [context.userId],
    );
    const row = rows[0];
    if (!row) return null;
    return { userId: String(row.user_id), name: String(row.name ?? ""), phone: String(row.phone ?? "") };
  });

export const saveMySender = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(z.object({ name: z.string().min(2), phone: z.string().min(7) }))
  .handler(async ({ context, data }) => {
    const { getSql } = await import("@/lib/db");
    const sql = await getSql();
    await sql.query(
      `insert into senders (user_id, name, phone, updated_at)
       values ($1, $2, $3, now())
       on conflict (user_id) do update set name = excluded.name, phone = excluded.phone, updated_at = now()`,
      [context.userId, data.name.trim(), data.phone.trim()],
    );
    return { ok: true as const };
  });

export const listMyJobs = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const { getSql } = await import("@/lib/db");
    const sql = await getSql();
    const rows = await sql.query<Record<string, unknown>>(
      `select j.*, f.name as fleet_name,
              q.id as quote_id, q.total_ngn as quote_total_ngn, q.eta_minutes as quote_eta_minutes
       from jobs j
       left join lateral (
         select id, fleet_id, total_ngn, eta_minutes
         from quotes
         where job_id = j.id and status in ('offered','accepted')
         order by created_at desc
         limit 1
       ) q on true
       left join fleets f on f.id = coalesce(j.selected_fleet_id, q.fleet_id)
       where j.sender_user_id = $1
       order by j.created_at desc`,
      [context.userId],
    );
    return rows.map((row) => {
      const job = mapJob(row);
      const paid = [
        "paid",
        "assigned",
        "picked_up",
        "in_transit",
        "delivery_confirmation_pending",
        "delivered",
        "settled",
      ].includes(job.status);
      return {
        ...job,
        deliveryCode: paid ? job.deliveryCode : null,
        fleetName: row.fleet_name ? String(row.fleet_name) : null,
        quoteId: row.quote_id ? String(row.quote_id) : null,
        quoteTotalNgn: row.quote_total_ngn != null ? Number(row.quote_total_ngn) : null,
        quoteEtaMinutes: row.quote_eta_minutes != null ? Number(row.quote_eta_minutes) : null,
      };
    }) satisfies SenderJob[];
  });

const senderJobInput = z.object({
  pickupLat: z.number(),
  pickupLng: z.number(),
  pickupLandmark: z.string().min(2),
  dropoffLat: z.number(),
  dropoffLng: z.number(),
  dropoffLandmark: z.string().min(2),
  distanceKm: z.number().positive(),
  goods: z.string().min(2),
  constraints: z.string(),
});

export const createSenderJob = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(senderJobInput)
  .handler(async ({ context, data }) => {
    const { getSql } = await import("@/lib/db");
    const sql = await getSql();
    const profile = await sql.query<{ name: string; phone: string }>(
      `select name, phone from senders where user_id = $1`,
      [context.userId],
    );
    const name = profile[0]?.name?.trim() ?? "";
    const phone = profile[0]?.phone?.trim() ?? "";
    if (name.length < 2 || phone.length < 7) {
      throw new Error("Add your name and business phone first.");
    }
    const id = crypto.randomUUID();
    const seq = await sql.query<{ n: number }>(`select nextval('job_public_seq') as n`);
    const publicId = `DL-${seq[0]?.n ?? 1042}`;
    await sql.query(
      `insert into jobs (
         id, public_id, status,
         pickup_lat, pickup_lng, pickup_landmark,
         dropoff_lat, dropoff_lng, dropoff_landmark,
         distance_km, goods, constraints, window_kind,
         sender_name, sender_phone, sender_user_id, actor
       ) values ($1,$2,'requested',$3,$4,$5,$6,$7,$8,$9,$10,$11,'now',$12,$13,$14,'sender')`,
      [
        id,
        publicId,
        data.pickupLat,
        data.pickupLng,
        data.pickupLandmark.trim(),
        data.dropoffLat,
        data.dropoffLng,
        data.dropoffLandmark.trim(),
        data.distanceKm,
        data.goods.trim(),
        data.constraints.trim(),
        name,
        phone,
        context.userId,
      ],
    );
    await sql.query(
      `insert into job_events (id, job_id, kind, from_status, to_status, payload, actor)
       values ($1,$2,'status',null,'requested',$3::jsonb,'sender')`,
      [crypto.randomUUID(), id, JSON.stringify({ source: "sender" })],
    );
    await sql.query(`update jobs set status = 'quote_pending', updated_at = now(), actor = 'sender' where id = $1`, [
      id,
    ]);
    await sql.query(
      `insert into job_events (id, job_id, kind, from_status, to_status, payload, actor)
       values ($1,$2,'status','requested','quote_pending','{"source":"sender"}','sender')`,
      [crypto.randomUUID(), id],
    );
    const rows = await sql.query(`select * from jobs where id = $1 and sender_user_id = $2`, [id, context.userId]);
    return mapJob(rows[0]!);
  });

export const acceptMyQuote = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(z.object({ jobId: z.string(), quoteId: z.string() }))
  .handler(async ({ context, data }) => {
    const { getSql } = await import("@/lib/db");
    const sql = await getSql();
    const jobs = await sql.query<{ id: string; status: string }>(
      `select id, status from jobs where id = $1 and sender_user_id = $2`,
      [data.jobId, context.userId],
    );
    const job = jobs[0];
    if (!job) throw new Error("Job not found");
    if (job.status !== "quoted") throw new Error("No price to accept on this job.");
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
    return { ok: true as const };
  });

export const rejectMyQuote = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(z.object({ jobId: z.string(), quoteId: z.string() }))
  .handler(async ({ context, data }) => {
    const { getSql } = await import("@/lib/db");
    const sql = await getSql();
    const jobs = await sql.query<{ id: string; status: string }>(
      `select id, status from jobs where id = $1 and sender_user_id = $2`,
      [data.jobId, context.userId],
    );
    const job = jobs[0];
    if (!job) throw new Error("Job not found");
    if (job.status !== "quoted") throw new Error("No price to reject on this job.");
    const quotes = await sql.query<{ id: string; status: string }>(
      `select id, status from quotes where id = $1 and job_id = $2`,
      [data.quoteId, data.jobId],
    );
    const quote = quotes[0];
    if (!quote || quote.status !== "offered") throw new Error("That price is no longer offered.");
    await sql.query(`update quotes set status = 'withdrawn' where id = $1`, [quote.id]);
    await sql.query(
      `update jobs set status = 'quote_pending', updated_at = now(), actor = 'sender' where id = $1`,
      [data.jobId],
    );
    await sql.query(
      `insert into job_events (id, job_id, kind, from_status, to_status, payload, actor)
       values ($1,$2,'quote_rejected','quoted','quote_pending',$3::jsonb,'sender')`,
      [crypto.randomUUID(), data.jobId, JSON.stringify({ quoteId: quote.id })],
    );
    return { ok: true as const };
  });
