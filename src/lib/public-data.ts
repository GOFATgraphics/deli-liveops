import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

export type PublicTrack = {
  publicId: string;
  status: string;
  pickup: string;
  dropoff: string;
};

export const lookupTrack = createServerFn({ method: "GET" })
  .validator(z.object({ q: z.string().min(2).max(40) }))
  .handler(async ({ data }) => {
    const { getSql } = await import("@/lib/db");
    const sql = await getSql();
    const q = data.q.trim();
    const rows = await sql.query<{
      public_id: string;
      status: string;
      pickup_landmark: string;
      dropoff_landmark: string;
    }>(
      `select public_id, status, pickup_landmark, dropoff_landmark
       from jobs
       where public_id ilike $1
          or delivery_code = $2
       order by created_at desc
       limit 5`,
      [q.includes("-") ? q : `%${q}%`, q],
    );
    return rows.map(
      (row): PublicTrack => ({
        publicId: String(row.public_id),
        status: String(row.status).replaceAll("_", " "),
        pickup: String(row.pickup_landmark ?? ""),
        dropoff: String(row.dropoff_landmark ?? ""),
      }),
    );
  });

export const sendContact = createServerFn({ method: "POST" })
  .validator(
    z.object({
      name: z.string().min(2).max(80),
      email: z.string().email().max(120),
      phone: z.string().max(24).optional(),
      message: z.string().min(8).max(2000),
    }),
  )
  .handler(async ({ data }) => {
    const { getSql } = await import("@/lib/db");
    const sql = await getSql();
    const id = crypto.randomUUID();
    await sql.query(
      `insert into contact_messages (id, name, email, phone, message)
       values ($1, $2, $3, $4, $5)`,
      [id, data.name.trim(), data.email.trim(), (data.phone ?? "").trim(), data.message.trim()],
    );
    return { ok: true as const };
  });
