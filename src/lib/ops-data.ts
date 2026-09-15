import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { operatorMiddleware } from "@/lib/operator-data";
import type { Partner, PartnerStatus, Vehicle } from "@/lib/types";

export const JOB_STATUSES = [
  "requested",
  "quote_pending",
  "quoted",
  "accepted",
  "payment_pending",
  "paid",
  "assigned",
  "picked_up",
  "in_transit",
  "delivery_confirmation_pending",
  "delivered",
  "settlement_pending",
  "settled",
  "cancelled",
  "failed",
  "disputed",
  "refund_pending",
  "refunded",
] as const;

export type JobStatus = (typeof JOB_STATUSES)[number];

export type JobRow = {
  id: string;
  publicId: string;
  status: JobStatus;
  pickupLat: number;
  pickupLng: number;
  pickupLandmark: string;
  dropoffLat: number;
  dropoffLng: number;
  dropoffLandmark: string;
  distanceKm: number;
  goods: string;
  constraints: string;
  windowKind: "now" | "scheduled";
  windowAt: string | null;
  senderName: string;
  senderPhone: string;
  selectedQuoteId: string | null;
  selectedFleetId: string | null;
  deliveryCode: string | null;
  payoutNote: string | null;
  createdAt: string;
};

export type QuoteRow = {
  id: string;
  jobId: string;
  fleetId: string;
  fleetName: string;
  totalNgn: number;
  fleetPayoutNgn: number;
  deliFeeNgn: number;
  paymentFeePayer: string;
  etaMinutes: number;
  expiresAt: string;
  terms: string;
  status: "offered" | "accepted" | "expired" | "withdrawn";
  createdAt: string;
};

export type JobEventRow = {
  id: string;
  kind: string;
  fromStatus: string | null;
  toStatus: string | null;
  payload: Record<string, string>;
  actor: string;
  at: string;
};

type FleetJoin = {
  id: string;
  name: string;
  notes: string;
  address: string;
  lat: number;
  lng: number;
  radius_km: number;
  max_job_km: number;
  vehicles: string[] | string;
  status: PartnerStatus;
  image: string;
  zone: string;
  created_at: string;
  updated_at: string;
  phone: string | null;
};

function asVehicles(value: string[] | string | null | undefined): Vehicle[] {
  const list = Array.isArray(value)
    ? value
    : typeof value === "string"
      ? value.replace(/[{}]/g, "").split(",").map((item) => item.trim()).filter(Boolean)
      : [];
  return list.filter((item): item is Vehicle => item === "bike" || item === "car" || item === "van");
}

function fleetToPartner(row: FleetJoin): Partner {
  return {
    id: row.id,
    name: row.name,
    phone: row.phone ?? "",
    notes: row.notes,
    address: row.address,
    lat: Number(row.lat),
    lng: Number(row.lng),
    radiusKm: Number(row.radius_km),
    vehicles: asVehicles(row.vehicles),
    status: row.status,
    image: row.image,
    createdAt: new Date(row.created_at).toISOString(),
    updatedAt: new Date(row.updated_at).toISOString(),
  };
}

const FLEET_SELECT = `
  select f.id, f.name, f.notes, f.address, f.lat, f.lng, f.radius_km, f.max_job_km,
         f.vehicles, f.status, f.image, f.zone, f.created_at, f.updated_at,
         c.phone
  from fleets f
  left join fleet_contacts c on c.fleet_id = f.id and c.is_primary = true
`;

export const listFleets = createServerFn({ method: "GET" }).middleware([operatorMiddleware]).handler(async () => {
  const { getSql } = await import("@/lib/db");
  const sql = await getSql();
  const rows = await sql.query<FleetJoin>(`${FLEET_SELECT} order by f.status asc, f.name asc`);
  return rows.map(fleetToPartner);
});

const partnerInput = z.object({
  id: z.string().min(1).optional(),
  name: z.string().min(2),
  phone: z.string().min(7),
  notes: z.string(),
  address: z.string(),
  lat: z.number(),
  lng: z.number(),
  radiusKm: z.number(),
  vehicles: z.array(z.enum(["bike", "car", "van"])).min(1),
  status: z.enum(["active", "paused"]),
  image: z.string(),
});


async function pushFleetsToCarto() {
  try {
    const { getSql } = await import("@/lib/db");
    const { publishFleetsToCarto } = await import("@/lib/carto.server");
    const sql = await getSql();
    const rows = await sql.query<FleetJoin>(`${FLEET_SELECT} order by f.name asc`);
    await publishFleetsToCarto(rows.map(fleetToPartner));
  } catch (error) {
    console.error("CARTO source publish failed", error);
  }
}

export const upsertFleet = createServerFn({ method: "POST" })
  .middleware([operatorMiddleware]).validator(partnerInput)
  .handler(async ({ data }) => {
    const { getSql } = await import("@/lib/db");
    const sql = await getSql();
    const id = data.id ?? crypto.randomUUID();
    const now = new Date().toISOString();
    await sql.query(
      `insert into fleets (id, name, notes, address, lat, lng, radius_km, max_job_km, vehicles, status, image, zone, created_at, updated_at, actor)
       values ($1,$2,$3,$4,$5,$6,$7,$7,$8::text[],$9,$10,'kano-core',$11,$11,'ops')
       on conflict (id) do update set
         name = excluded.name,
         notes = excluded.notes,
         address = excluded.address,
         lat = excluded.lat,
         lng = excluded.lng,
         radius_km = excluded.radius_km,
         max_job_km = excluded.max_job_km,
         vehicles = excluded.vehicles,
         status = excluded.status,
         image = excluded.image,
         updated_at = excluded.updated_at,
         actor = 'ops'`,
      [
        id,
        data.name.trim(),
        data.notes.trim(),
        data.address.trim(),
        data.lat,
        data.lng,
        data.radiusKm,
        `{${data.vehicles.join(",")}}`,
        data.status,
        data.image,
        now,
      ],
    );
    const contactId = `c-${id}`;
    await sql.query(
      `insert into fleet_contacts (id, fleet_id, name, phone, channel, is_primary)
       values ($1,$2,'Dispatch',$3,'whatsapp', true)
       on conflict (id) do update set phone = excluded.phone`,
      [contactId, id, data.phone.trim()],
    );
    const rows = await sql.query<FleetJoin>(`${FLEET_SELECT} where f.id = $1`, [id]);
    const partner = rows[0] ? fleetToPartner(rows[0]) : null;
    if (!partner) throw new Error("Fleet was not saved");
    void pushFleetsToCarto();
    return partner;
  });

export const setFleetStatus = createServerFn({ method: "POST" })
  .middleware([operatorMiddleware]).validator(z.object({ id: z.string(), status: z.enum(["active", "paused"]) }))
  .handler(async ({ data }) => {
    const { getSql } = await import("@/lib/db");
    const sql = await getSql();
    await sql.query(`update fleets set status = $2, updated_at = now(), actor = 'ops' where id = $1`, [
      data.id,
      data.status,
    ]);
    void pushFleetsToCarto();
    return { ok: true as const };
  });

export const removeFleet = createServerFn({ method: "POST" })
  .middleware([operatorMiddleware]).validator(z.object({ id: z.string() }))
  .handler(async ({ data }) => {
    const { getSql } = await import("@/lib/db");
    const sql = await getSql();
    await sql.query(`delete from fleets where id = $1`, [data.id]);
    void pushFleetsToCarto();
    return { ok: true as const };
  });

function stringifyPayload(value: unknown): Record<string, string> {
  const raw =
    typeof value === "string"
      ? (JSON.parse(value) as Record<string, unknown>)
      : value && typeof value === "object"
        ? (value as Record<string, unknown>)
        : {};
  const out: Record<string, string> = {};
  for (const [key, item] of Object.entries(raw)) {
    if (item == null) continue;
    out[key] = String(item);
  }
  return out;
}

export function mapJob(row: Record<string, unknown>): JobRow {
  return {
    id: String(row.id),
    publicId: String(row.public_id),
    status: row.status as JobStatus,
    pickupLat: Number(row.pickup_lat),
    pickupLng: Number(row.pickup_lng),
    pickupLandmark: String(row.pickup_landmark ?? ""),
    dropoffLat: Number(row.dropoff_lat),
    dropoffLng: Number(row.dropoff_lng),
    dropoffLandmark: String(row.dropoff_landmark ?? ""),
    distanceKm: Number(row.distance_km),
    goods: String(row.goods ?? ""),
    constraints: String(row.constraints ?? ""),
    windowKind: row.window_kind === "scheduled" ? "scheduled" : "now",
    windowAt: row.window_at ? new Date(String(row.window_at)).toISOString() : null,
    senderName: String(row.sender_name ?? ""),
    senderPhone: String(row.sender_phone ?? ""),
    selectedQuoteId: row.selected_quote_id ? String(row.selected_quote_id) : null,
    selectedFleetId: row.selected_fleet_id ? String(row.selected_fleet_id) : null,
    deliveryCode: row.delivery_code ? String(row.delivery_code) : null,
    payoutNote: row.payout_note ? String(row.payout_note) : null,
    createdAt: new Date(String(row.created_at)).toISOString(),
  };
}

export const listJobs = createServerFn({ method: "GET" }).middleware([operatorMiddleware]).handler(async () => {
  const { getSql } = await import("@/lib/db");
  const sql = await getSql();
  const rows = await sql.query(`select * from jobs order by created_at desc`);
  return rows.map(mapJob);
});

const jobInput = z.object({
  pickupLat: z.number(),
  pickupLng: z.number(),
  pickupLandmark: z.string().min(2),
  dropoffLat: z.number(),
  dropoffLng: z.number(),
  dropoffLandmark: z.string().min(2),
  distanceKm: z.number().positive(),
  goods: z.string().min(2),
  constraints: z.string(),
  windowKind: z.enum(["now", "scheduled"]),
  senderName: z.string().min(2),
  senderPhone: z.string().min(7),
});

export const createJob = createServerFn({ method: "POST" })
  .middleware([operatorMiddleware]).validator(jobInput)
  .handler(async ({ data }) => {
    const { getSql } = await import("@/lib/db");
    const sql = await getSql();
    const id = crypto.randomUUID();
    const seq = await sql.query<{ n: number }>(`select nextval('job_public_seq') as n`);
    const publicId = `DL-${seq[0]?.n ?? 1042}`;
    await sql.query(
      `insert into jobs (
         id, public_id, status,
         pickup_lat, pickup_lng, pickup_landmark,
         dropoff_lat, dropoff_lng, dropoff_landmark,
         distance_km, goods, constraints, window_kind,
         sender_name, sender_phone, actor
       ) values ($1,$2,'quote_pending',$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,'ops')`,
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
        data.windowKind,
        data.senderName.trim(),
        data.senderPhone.trim(),
      ],
    );
    await sql.query(
      `insert into job_events (id, job_id, kind, from_status, to_status, payload, actor)
       values ($1,$2,'status',null,'quote_pending','{"source":"desk"}','ops')`,
      [crypto.randomUUID(), id],
    );
    const rows = await sql.query(`select * from jobs where id = $1`, [id]);
    return mapJob(rows[0]!);
  });

export const listQuotes = createServerFn({ method: "GET" })
  .middleware([operatorMiddleware]).validator(z.object({ jobId: z.string() }))
  .handler(async ({ data }) => {
    const { getSql } = await import("@/lib/db");
    const sql = await getSql();
    const rows = await sql.query<{
      id: string;
      job_id: string;
      fleet_id: string;
      fleet_name: string;
      total_ngn: number;
      fleet_payout_ngn: number;
      deli_fee_ngn: number;
      payment_fee_payer: string;
      eta_minutes: number;
      expires_at: string;
      terms: string;
      status: QuoteRow["status"];
      created_at: string;
    }>(
      `select q.*, f.name as fleet_name
       from quotes q join fleets f on f.id = q.fleet_id
       where q.job_id = $1
       order by q.created_at desc`,
      [data.jobId],
    );
    return rows.map((row) => ({
      id: row.id,
      jobId: row.job_id,
      fleetId: row.fleet_id,
      fleetName: row.fleet_name,
      totalNgn: Number(row.total_ngn),
      fleetPayoutNgn: Number(row.fleet_payout_ngn),
      deliFeeNgn: Number(row.deli_fee_ngn),
      paymentFeePayer: row.payment_fee_payer,
      etaMinutes: Number(row.eta_minutes),
      expiresAt: new Date(row.expires_at).toISOString(),
      terms: row.terms,
      status: row.status,
      createdAt: new Date(row.created_at).toISOString(),
    }));
  });

const quoteInput = z.object({
  jobId: z.string(),
  fleetId: z.string(),
  totalNgn: z.number().int().positive(),
  deliFeeNgn: z.number().int().nonnegative(),
  etaMinutes: z.number().int().positive(),
  terms: z.string(),
  hoursValid: z.number().int().positive().default(6),
});

export const addQuote = createServerFn({ method: "POST" })
  .middleware([operatorMiddleware]).validator(quoteInput)
  .handler(async ({ data }) => {
    const { getSql } = await import("@/lib/db");
    const sql = await getSql();
    const fleetPayout = data.totalNgn - data.deliFeeNgn;
    if (fleetPayout < 0) throw new Error("Fee cannot exceed total");
    const expires = new Date(Date.now() + data.hoursValid * 3600_000).toISOString();
    const id = crypto.randomUUID();
    await sql.query(
      `insert into quotes (id, job_id, fleet_id, total_ngn, fleet_payout_ngn, deli_fee_ngn, payment_fee_payer, eta_minutes, expires_at, terms, status, actor)
       values ($1,$2,$3,$4,$5,$6,'sender',$7,$8,$9,'offered','ops')`,
      [id, data.jobId, data.fleetId, data.totalNgn, fleetPayout, data.deliFeeNgn, data.etaMinutes, expires, data.terms.trim()],
    );
    await sql.query(`update jobs set status = 'quoted', updated_at = now() where id = $1 and status in ('requested','quote_pending','quoted')`, [
      data.jobId,
    ]);
    await sql.query(
      `insert into job_events (id, job_id, kind, from_status, to_status, payload, actor)
       values ($1,$2,'quote',null,'quoted',$3::jsonb,'ops')`,
      [crypto.randomUUID(), data.jobId, JSON.stringify({ quoteId: id, fleetId: data.fleetId, totalNgn: data.totalNgn })],
    );
    return { ok: true as const, id };
  });

export const listJobEvents = createServerFn({ method: "GET" })
  .middleware([operatorMiddleware]).validator(z.object({ jobId: z.string() }))
  .handler(async ({ data }) => {
    const { getSql } = await import("@/lib/db");
    const sql = await getSql();
    const rows = await sql.query<{
      id: string;
      kind: string;
      from_status: string | null;
      to_status: string | null;
      payload: Record<string, unknown> | string | null;
      actor: string;
      at: string;
    }>(`select id, kind, from_status, to_status, payload, actor, at from job_events where job_id = $1 order by at desc`, [
      data.jobId,
    ]);
    return rows.map((row) => ({
      id: row.id,
      kind: row.kind,
      fromStatus: row.from_status,
      toStatus: row.to_status,
      payload: stringifyPayload(row.payload),
      actor: row.actor,
      at: new Date(row.at).toISOString(),
    })) satisfies JobEventRow[];
  });


const OPEN_STATUSES: JobStatus[] = [
  "requested",
  "quote_pending",
  "quoted",
  "accepted",
  "payment_pending",
  "paid",
  "assigned",
  "picked_up",
  "in_transit",
  "delivery_confirmation_pending",
];

const ADVANCE: Partial<Record<JobStatus, JobStatus>> = {
  paid: "assigned",
  assigned: "picked_up",
  picked_up: "in_transit",
  in_transit: "delivery_confirmation_pending",
  delivered: "settlement_pending",
};

export function fourDigit() {
  return String(1000 + Math.floor(Math.random() * 9000));
}

async function loadJob(id: string) {
  const { getSql } = await import("@/lib/db");
  const sql = await getSql();
  const rows = await sql.query(`select * from jobs where id = $1`, [id]);
  if (!rows[0]) throw new Error("Job not found");
  return { sql, job: mapJob(rows[0] as Record<string, unknown>), raw: rows[0] as Record<string, unknown> };
}

async function writeStatus(
  sql: Awaited<ReturnType<(typeof import("@/lib/db"))["getSql"]>>,
  job: JobRow,
  to: JobStatus,
  kind: string,
  payload: Record<string, unknown> = {},
) {
  await sql.query(`update jobs set status = $2, updated_at = now(), actor = 'ops' where id = $1`, [job.id, to]);
  await sql.query(
    `insert into job_events (id, job_id, kind, from_status, to_status, payload, actor)
     values ($1,$2,$3,$4,$5,$6::jsonb,'ops')`,
    [crypto.randomUUID(), job.id, kind, job.status, to, JSON.stringify(payload)],
  );
}

export const acceptQuote = createServerFn({ method: "POST" })
  .middleware([operatorMiddleware]).validator(z.object({ jobId: z.string(), quoteId: z.string() }))
  .handler(async ({ data }) => {
    const { sql, job } = await loadJob(data.jobId);
    if (job.status !== "quoted" && job.status !== "quote_pending") {
      throw new Error("Quotes can only be accepted while the job is still being quoted.");
    }
    const quotes = await sql.query<{ id: string; status: string }>(
      `select id, status from quotes where job_id = $1`,
      [data.jobId],
    );
    const chosen = quotes.find((q) => q.id === data.quoteId);
    if (!chosen) throw new Error("Quote not found");
    if (chosen.status !== "offered") throw new Error("That quote is no longer offered.");
    const fleet = await sql.query<{ fleet_id: string }>(`select fleet_id from quotes where id = $1`, [data.quoteId]);
    const fleetId = fleet[0]?.fleet_id;
    if (!fleetId) throw new Error("Quote has no fleet");
    await sql.query(`update quotes set status = 'accepted' where id = $1`, [data.quoteId]);
    await sql.query(`update quotes set status = 'withdrawn' where job_id = $1 and id <> $2 and status = 'offered'`, [
      data.jobId,
      data.quoteId,
    ]);
    await sql.query(
      `update jobs set selected_quote_id = $2, selected_fleet_id = $3, status = 'accepted', updated_at = now() where id = $1`,
      [data.jobId, data.quoteId, fleetId],
    );
    await sql.query(
      `insert into job_events (id, job_id, kind, from_status, to_status, payload, actor)
       values ($1,$2,'quote_accepted',$3,'accepted',$4::jsonb,'ops')`,
      [crypto.randomUUID(), data.jobId, job.status, JSON.stringify({ quoteId: data.quoteId, fleetId })],
    );
    return { ok: true as const };
  });

export const markPaid = createServerFn({ method: "POST" })
  .middleware([operatorMiddleware]).validator(z.object({ jobId: z.string(), reference: z.string().min(2) }))
  .handler(async ({ data }) => {
    const { sql, job } = await loadJob(data.jobId);
    if (job.status !== "accepted" && job.status !== "payment_pending") {
      throw new Error("Mark paid only after a quote is accepted.");
    }
    if (!job.selectedQuoteId || !job.selectedFleetId) throw new Error("Accept a quote first.");
    const quote = await sql.query<{ total_ngn: number }>(`select total_ngn from quotes where id = $1`, [
      job.selectedQuoteId,
    ]);
    const amount = Number(quote[0]?.total_ngn ?? 0);
    const code = job.deliveryCode ?? fourDigit();
    await sql.query(
      `insert into payments (id, job_id, quote_id, amount_ngn, currency, provider, provider_ref, status, paid_at)
       values ($1,$2,$3,$4,'NGN','desk_transfer',$5,'paid', now())`,
      [crypto.randomUUID(), job.id, job.selectedQuoteId, amount, data.reference.trim()],
    );
    await sql.query(`update jobs set delivery_code = $2, status = 'paid', updated_at = now(), actor = 'ops' where id = $1`, [
      job.id,
      code,
    ]);
    await sql.query(
      `insert into job_events (id, job_id, kind, from_status, to_status, payload, actor)
       values ($1,$2,'paid',$3,'paid',$4::jsonb,'ops')`,
      [crypto.randomUUID(), job.id, job.status, JSON.stringify({ reference: data.reference.trim(), amountNgn: amount })],
    );
    return { ok: true as const };
  });

export const advanceJob = createServerFn({ method: "POST" })
  .middleware([operatorMiddleware]).validator(z.object({ jobId: z.string() }))
  .handler(async ({ data }) => {
    const { sql, job } = await loadJob(data.jobId);
    const to = ADVANCE[job.status];
    if (!to) throw new Error("No next step from this status.");
    if (to === "delivery_confirmation_pending" && !job.deliveryCode) {
      await sql.query(`update jobs set delivery_code = $2 where id = $1`, [job.id, fourDigit()]);
    }
    await writeStatus(sql, job, to, "status");
    return { ok: true as const };
  });

export const confirmDelivery = createServerFn({ method: "POST" })
  .middleware([operatorMiddleware]).validator(z.object({ jobId: z.string(), code: z.string().min(4).max(4) }))
  .handler(async ({ data }) => {
    const { sql, job } = await loadJob(data.jobId);
    if (job.status !== "delivery_confirmation_pending" && job.status !== "in_transit") {
      throw new Error("Confirm delivery only when the rider is at dropoff.");
    }
    if (!job.deliveryCode || job.deliveryCode !== data.code.trim()) {
      throw new Error("Code does not match.");
    }
    await writeStatus(sql, job, "delivered", "delivered", { code: data.code.trim() });
    return { ok: true as const };
  });

export const recordPayout = createServerFn({ method: "POST" })
  .middleware([operatorMiddleware]).validator(z.object({ jobId: z.string(), note: z.string().min(2), amountNgn: z.number().int().positive() }))
  .handler(async ({ data }) => {
    const { sql, job } = await loadJob(data.jobId);
    if (job.status !== "delivered" && job.status !== "settlement_pending") {
      throw new Error("Record payout after delivery.");
    }
    if (!job.selectedFleetId) throw new Error("No fleet on this job.");
    await sql.query(
      `insert into payouts (id, job_id, fleet_id, amount_ngn, provider, provider_ref, status, approved_by, released_at)
       values ($1,$2,$3,$4,'desk_transfer',$5,'sent','ops', now())`,
      [crypto.randomUUID(), job.id, job.selectedFleetId, data.amountNgn, data.note.trim()],
    );
    await sql.query(`update jobs set payout_note = $2, status = 'settled', updated_at = now(), actor = 'ops' where id = $1`, [
      job.id,
      data.note.trim(),
    ]);
    await sql.query(
      `insert into job_events (id, job_id, kind, from_status, to_status, payload, actor)
       values ($1,$2,'payout',$3,'settled',$4::jsonb,'ops')`,
      [
        crypto.randomUUID(),
        job.id,
        job.status,
        JSON.stringify({ note: data.note.trim(), amountNgn: data.amountNgn }),
      ],
    );
    return { ok: true as const };
  });

export const abortJob = createServerFn({ method: "POST" })
  .middleware([operatorMiddleware]).validator(
    z.object({
      jobId: z.string(),
      status: z.enum(["cancelled", "failed"]),
      reason: z.string().min(2),
    }),
  )
  .handler(async ({ data }) => {
    const { sql, job } = await loadJob(data.jobId);
    if (!OPEN_STATUSES.includes(job.status) && job.status !== "delivery_confirmation_pending") {
      throw new Error("This job is already closed.");
    }
    await writeStatus(sql, job, data.status, data.status, { reason: data.reason.trim() });
    return { ok: true as const };
  });
