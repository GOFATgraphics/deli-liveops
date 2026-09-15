import { createServerFn } from "@tanstack/react-start";
import { operatorMiddleware } from "@/lib/operator-data";

const CLOSED = new Set(["settled", "cancelled", "failed", "refunded"]);

export type DeskRecentJob = {
  id: string;
  publicId: string;
  status: string;
  pickup: string;
  dropoff: string;
  sender: string;
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
  recent: DeskRecentJob[];
};

export type DeskNavCounts = {
  openJobs: number;
  quotePending: number;
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

export const getDeskOverview = createServerFn({ method: "GET" })
  .middleware([operatorMiddleware])
  .handler(async (): Promise<DeskOverview> => {
    const { getSql, dbSource } = await import("@/lib/db");
    const sql = await getSql();
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
       from jobs order by created_at desc limit 8`,
    );
    const fleetRow = fleets[0];
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
      recent: recent.map((row) => ({
        id: String(row.id),
        publicId: String(row.public_id),
        status: String(row.status),
        pickup: String(row.pickup_landmark ?? ""),
        dropoff: String(row.dropoff_landmark ?? ""),
        sender: String(row.sender_name ?? ""),
        createdAt: new Date(String(row.created_at)).toISOString(),
      })),
    };
  });

export const getDeskNavCounts = createServerFn({ method: "GET" })
  .middleware([operatorMiddleware])
  .handler(async (): Promise<DeskNavCounts> => {
    const { getSql } = await import("@/lib/db");
    const sql = await getSql();
    const counts = await sql.query<{ status: string; n: number }>(
      `select status, count(*)::int as n from jobs group by status`,
    );
    const byStatus = Object.fromEntries(counts.map((row) => [row.status, n(row.n)]));
    const openJobs = counts.reduce((sum, row) => sum + (CLOSED.has(row.status) ? 0 : n(row.n)), 0);
    return {
      openJobs,
      quotePending: n(byStatus.quote_pending) + n(byStatus.requested),
    };
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
