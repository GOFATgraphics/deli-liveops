import { createMiddleware, createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "@/lib/auth/middleware";

export class ForbiddenError extends Error {
  readonly status = 403;
  constructor() {
    super("Forbidden");
    this.name = "ForbiddenError";
  }
}

/** Desk calls only — signed in AND in `operators`. */
export const operatorMiddleware = createMiddleware({ type: "function" })
  .client(async ({ next }) => {
    const { getBearerToken } = await import("@/lib/auth/client");
    return next({ sendContext: { bearerToken: getBearerToken() ?? undefined } });
  })
  .server(async ({ next, context }) => {
    const { assertSameSiteRequest } = await import("@/lib/auth/isolation.server");
    const { requireUserId } = await import("@/lib/auth/verify.server");
    assertSameSiteRequest();
    const userId = await requireUserId(context.bearerToken);
    const { getSql } = await import("@/lib/db");
    const sql = await getSql();
    const rows = await sql.query(`select user_id from operators where user_id = $1`, [userId]);
    if (!rows[0]) throw new ForbiddenError();
    return next({ context: { userId } });
  });

/** First signed-in visitor to /admin becomes the only operator. */
export const ensureOperator = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const { getSql } = await import("@/lib/db");
    const sql = await getSql();
    const mine = await sql.query(`select user_id from operators where user_id = $1`, [context.userId]);
    if (mine[0]) return { ok: true as const };
    const any = await sql.query(`select user_id from operators limit 1`);
    if (any[0]) throw new ForbiddenError();
    await sql.query(`insert into operators (user_id) values ($1)`, [context.userId]);
    return { ok: true as const };
  });
