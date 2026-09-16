import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { expireUnpaidJobs } from "@/lib/ops-data";
import { operatorMiddleware } from "@/lib/operator-data";

const CLOSED = new Set(["settled", "cancelled", "failed", "refunded"]);
const PAID_JOB = `(
  'paid','assigned','picked_up','in_transit','delivery_confirmation_pending',
  'delivered','settlement_pending','settled'
)`;

export type DeskRecentJob = {
  id: string;
  publicId: string;
  status: string;
  pickup: string;
  dropoff: string;
  sender: string;
  createdAt: string;
};

export type DeskPayment = {
  id: string;
  jobId: string;
  publicId: string;
  senderName: string;
  senderPhone: string;
  fleetName: string | null;
  amountNgn: number;
  deliFeeNgn: number;
  fleetPayoutNgn: number;
  status: string;
  jobStatus: string;
  provider: string;
  providerRef: string | null;
  paidAt: string | null;
  createdAt: string;
};

export type DeskSenderRow = {
  userId: string;
  name: string;
  phone: string;
  email: string | null;
  logo: string;
  jobs: number;
  paidJobs: number;
  spentNgn: number;
  createdAt: string;
};

export type DeskSenderJob = {
  id: string;
  publicId: string;
  status: string;
  pickup: string;
  dropoff: string;
  paidNgn: number | null;
  createdAt: string;
};

export type DeskOverview = {
  source: "neon" | "pglite";
  fleets: number;
  liveFleets: number;
  pausedFleets: number;
  jobs: number;
  openJobs: number;
  quotePending: number;
  inTransit: number;
  delivered: number;
  settled: number;
  senders: number;
  operators: number;
  paidJobs: number;
  paidPayments: number;
  pendingPayments: number;
  collectedNgn: number;
  pendingNgn: number;
  takeNgn: number;
  fleetDueNgn: number;
  recent: DeskRecentJob[];
  recentPayments: DeskPayment[];
  recentSenders: DeskSenderRow[];
};

export type DeskNavCounts = {
  openJobs: number;
  quotePending: number;
  pendingPayments: number;
};

export type DeskSender = {
  userId: string;
  name: string;
  phone: string;
  createdAt: string;
};

export type DeskOperator = {
  userId: string;
  createdAt: string;
};

export type DeskRecordTables = {
  source: "neon" | "pglite";
  tables: Array<{ name: string; rows: number }>;
  senders: DeskSender[];
  operators: DeskOperator[];
};

function n(value: unknown) {
  return Number(value ?? 0);
}

function iso(value: unknown) {
  if (!value) return null;
  return new Date(String(value)).toISOString();
}

function mapPayment(row: Record<string, unknown>): DeskPayment {
  return {
    id: String(row.id),
    jobId: String(row.job_id),
    publicId: String(row.public_id ?? ""),
    senderName: String(row.sender_name ?? ""),
    senderPhone: String(row.sender_phone ?? ""),
    fleetName: row.fleet_name ? String(row.fleet_name) : null,
    amountNgn: n(row.amount_ngn),
    deliFeeNgn: n(row.deli_fee_ngn),
    fleetPayoutNgn: n(row.fleet_payout_ngn),
    status: String(row.status ?? ""),
    jobStatus: String(row.job_status ?? ""),
    provider: String(row.provider ?? ""),
    providerRef: row.provider_ref ? String(row.provider_ref) : null,
    paidAt: iso(row.paid_at),
    createdAt: iso(row.created_at) ?? new Date().toISOString(),
  };
}

function mapSender(row: Record<string, unknown>): DeskSenderRow {
  return {
    userId: String(row.user_id),
    name: String(row.name ?? ""),
    phone: String(row.phone ?? ""),
    email: row.email ? String(row.email) : null,
    logo: String(row.logo ?? ""),
    jobs: n(row.jobs),
    paidJobs: n(row.paid_jobs),
    spentNgn: n(row.spent_ngn),
    createdAt: iso(row.created_at) ?? new Date().toISOString(),
  };
}

const PAYMENT_SELECT = `
  select p.id, p.job_id, p.quote_id, p.amount_ngn, p.currency, p.provider, p.provider_ref,
         p.status, p.paid_at, p.created_at,
         j.public_id, j.sender_name, j.sender_phone, j.status as job_status,
         coalesce(q.deli_fee_ngn, 0) as deli_fee_ngn,
         coalesce(q.fleet_payout_ngn, 0) as fleet_payout_ngn,
         f.name as fleet_name
  from payments p
  join jobs j on j.id = p.job_id
  left join quotes q on q.id = p.quote_id
  left join fleets f on f.id = j.selected_fleet_id
`;

const SENDER_SELECT = `
  select
    s.user_id, s.name, s.phone, s.logo, s.created_at, u.email,
    coalesce(j.jobs, 0)::int as jobs,
    coalesce(j.paid_jobs, 0)::int as paid_jobs,
    coalesce(p.spent_ngn, 0)::int as spent_ngn
  from senders s
  left join "user" u on u.id = s.user_id
  left join (
    select sender_user_id,
      count(*)::int as jobs,
      count(*) filter (where status in ${PAID_JOB})::int as paid_jobs
    from jobs
    where sender_user_id is not null
    group by sender_user_id
  ) j on j.sender_user_id = s.user_id
  left join (
    select jobs.sender_user_id, coalesce(sum(payments.amount_ngn), 0)::int as spent_ngn
    from payments
    join jobs on jobs.id = payments.job_id
    where payments.status = 'paid'
    group by jobs.sender_user_id
  ) p on p.sender_user_id = s.user_id
`;

export const getDeskOverview = createServerFn({ method: "GET" })
  .middleware([operatorMiddleware])
  .handler(async (): Promise<DeskOverview> => {
    const { getSql, dbSource } = await import("@/lib/db");
    const sql = await getSql();
    await expireUnpaidJobs(sql);
    const counts = await sql.query<{ status: string; n: number }>(
      `select status, count(*)::int as n from jobs group by status`,
    );
    const byStatus = Object.fromEntries(counts.map((row) => [row.status, n(row.n)]));
    const jobs = counts.reduce((sum, row) => sum + n(row.n), 0);
    const openJobs = counts.reduce((sum, row) => sum + (CLOSED.has(row.status) ? 0 : n(row.n)), 0);
    const fleets = await sql.query<{ n: number; live: number }>(
      `select count(*)::int as n, count(*) filter (where status = 'active')::int as live from fleets`,
    );
    const senders = await sql.query<{ n: number }>(`select count(*)::int as n from senders`);
    const operators = await sql.query<{ n: number }>(`select count(*)::int as n from operators`);
    const paidJobs = await sql.query<{ n: number }>(
      `select count(*)::int as n from jobs where status in ${PAID_JOB}`,
    );
    const money = await sql.query<{
      paid_count: number;
      pending_count: number;
      collected_ngn: number;
      pending_ngn: number;
    }>(
      `select
         count(*) filter (where status = 'paid')::int as paid_count,
         count(*) filter (where status = 'pending')::int as pending_count,
         coalesce(sum(amount_ngn) filter (where status = 'paid'), 0)::int as collected_ngn,
         coalesce(sum(amount_ngn) filter (where status = 'pending'), 0)::int as pending_ngn
       from payments`,
    );
    const take = await sql.query<{ take_ngn: number; fleet_due_ngn: number }>(
      `select
         coalesce(sum(q.deli_fee_ngn), 0)::int as take_ngn,
         coalesce(sum(q.fleet_payout_ngn), 0)::int as fleet_due_ngn
       from payments p
       join quotes q on q.id = p.quote_id
       where p.status = 'paid'`,
    );
    const recent = await sql.query<{
      id: string;
      public_id: string;
      status: string;
      pickup_landmark: string;
      dropoff_landmark: string;
      sender_name: string;
      created_at: string;
    }>(
      `select id, public_id, status, pickup_landmark, dropoff_landmark, sender_name, created_at
       from jobs
       where status not in ('cancelled','failed','refunded')
       order by created_at desc limit 8`,
    );
    const recentPayments = await sql.query<Record<string, unknown>>(
      `${PAYMENT_SELECT} order by coalesce(p.paid_at, p.created_at) desc limit 8`,
    );
    const recentSenders = await sql.query<Record<string, unknown>>(
      `${SENDER_SELECT} order by coalesce(p.spent_ngn, 0) desc, s.created_at desc limit 8`,
    );
    const fleetRow = fleets[0];
    const moneyRow = money[0];
    const takeRow = take[0];
    return {
      source: dbSource,
      fleets: n(fleetRow?.n),
      liveFleets: n(fleetRow?.live),
      pausedFleets: n(fleetRow?.n) - n(fleetRow?.live),
      jobs,
      openJobs,
      quotePending: n(byStatus.quote_pending) + n(byStatus.requested),
      inTransit: n(byStatus.in_transit) + n(byStatus.picked_up),
      delivered: n(byStatus.delivered) + n(byStatus.settlement_pending),
      settled: n(byStatus.settled),
      senders: n(senders[0]?.n),
      operators: n(operators[0]?.n),
      paidJobs: n(paidJobs[0]?.n),
      paidPayments: n(moneyRow?.paid_count),
      pendingPayments: n(moneyRow?.pending_count),
      collectedNgn: n(moneyRow?.collected_ngn),
      pendingNgn: n(moneyRow?.pending_ngn),
      takeNgn: n(takeRow?.take_ngn),
      fleetDueNgn: n(takeRow?.fleet_due_ngn),
      recent: recent.map((row) => ({
        id: String(row.id),
        publicId: String(row.public_id),
        status: String(row.status),
        pickup: String(row.pickup_landmark ?? ""),
        dropoff: String(row.dropoff_landmark ?? ""),
        sender: String(row.sender_name ?? ""),
        createdAt: new Date(String(row.created_at)).toISOString(),
      })),
      recentPayments: recentPayments.map(mapPayment),
      recentSenders: recentSenders.map(mapSender),
    };
  });

export const getDeskNavCounts = createServerFn({ method: "GET" })
  .middleware([operatorMiddleware])
  .handler(async (): Promise<DeskNavCounts> => {
    const { getSql } = await import("@/lib/db");
    const sql = await getSql();
    await expireUnpaidJobs(sql);
    const counts = await sql.query<{ status: string; n: number }>(
      `select status, count(*)::int as n from jobs group by status`,
    );
    const byStatus = Object.fromEntries(counts.map((row) => [row.status, n(row.n)]));
    const openJobs = counts.reduce((sum, row) => sum + (CLOSED.has(row.status) ? 0 : n(row.n)), 0);
    const pending = await sql.query<{ n: number }>(
      `select count(*)::int as n from payments where status = 'pending'`,
    );
    return {
      openJobs,
      quotePending: n(byStatus.quote_pending) + n(byStatus.requested),
      pendingPayments: n(pending[0]?.n),
    };
  });

export const getDeskPayments = createServerFn({ method: "GET" })
  .middleware([operatorMiddleware])
  .handler(async () => {
    const { getSql } = await import("@/lib/db");
    const sql = await getSql();
    const rows = await sql.query<Record<string, unknown>>(
      `${PAYMENT_SELECT} order by coalesce(p.paid_at, p.created_at) desc`,
    );
    return rows.map(mapPayment);
  });

export const getDeskSenders = createServerFn({ method: "GET" })
  .middleware([operatorMiddleware])
  .handler(async () => {
    const { getSql } = await import("@/lib/db");
    const sql = await getSql();
    const rows = await sql.query<Record<string, unknown>>(
      `${SENDER_SELECT} order by coalesce(p.spent_ngn, 0) desc, s.created_at desc`,
    );
    return rows.map(mapSender);
  });

export const getDeskSenderJobs = createServerFn({ method: "GET" })
  .middleware([operatorMiddleware])
  .validator(z.object({ userId: z.string().min(1) }))
  .handler(async ({ data }): Promise<DeskSenderJob[]> => {
    const { getSql } = await import("@/lib/db");
    const sql = await getSql();
    const rows = await sql.query<Record<string, unknown>>(
      `select j.id, j.public_id, j.status, j.pickup_landmark, j.dropoff_landmark, j.created_at,
              (
                select p.amount_ngn from payments p
                where p.job_id = j.id and p.status = 'paid'
                order by p.paid_at desc nulls last
                limit 1
              ) as paid_ngn
       from jobs j
       where j.sender_user_id = $1
       order by j.created_at desc`,
      [data.userId],
    );
    return rows.map((row) => ({
      id: String(row.id),
      publicId: String(row.public_id ?? ""),
      status: String(row.status ?? ""),
      pickup: String(row.pickup_landmark ?? ""),
      dropoff: String(row.dropoff_landmark ?? ""),
      paidNgn: row.paid_ngn != null ? n(row.paid_ngn) : null,
      createdAt: iso(row.created_at) ?? new Date().toISOString(),
    }));
  });

export const getDeskRecords = createServerFn({ method: "GET" })
  .middleware([operatorMiddleware])
  .handler(async (): Promise<DeskRecordTables> => {
    const { getSql, dbSource } = await import("@/lib/db");
    const sql = await getSql();
    const exact = await sql.query<{ table: string; n: number }>(
      `select 'fleets' as table, count(*)::int as n from fleets
       union all select 'jobs', count(*)::int from jobs
       union all select 'quotes', count(*)::int from quotes
       union all select 'senders', count(*)::int from senders
       union all select 'operators', count(*)::int from operators
       union all select 'job_events', count(*)::int from job_events
       union all select 'payments', count(*)::int from payments
       union all select 'payouts', count(*)::int from payouts
       union all select 'user', count(*)::int from "user"
       union all select 'session', count(*)::int from session`,
    );
    const senders = await sql.query<{ user_id: string; name: string; phone: string; created_at: string }>(
      `select user_id, name, phone, created_at from senders order by created_at desc`,
    );
    const operators = await sql.query<{ user_id: string; created_at: string }>(
      `select user_id, created_at from operators order by created_at asc`,
    );
    return {
      source: dbSource,
      tables: exact.map((row) => ({
        name: String(row.table),
        rows: n(row.n),
      })),
      senders: senders.map((row) => ({
        userId: String(row.user_id),
        name: String(row.name ?? ""),
        phone: String(row.phone ?? ""),
        createdAt: new Date(String(row.created_at)).toISOString(),
      })),
      operators: operators.map((row) => ({
        userId: String(row.user_id),
        createdAt: new Date(String(row.created_at)).toISOString(),
      })),
    };
  });
