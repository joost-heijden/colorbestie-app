import { prisma } from "@/lib/prisma";

let ensured = false;

async function ensureSchema() {
  if (ensured) return;
  await prisma.$executeRawUnsafe(`
    ALTER TABLE users
    ADD COLUMN IF NOT EXISTS credit_balance INTEGER NOT NULL DEFAULT 0;
  `);

  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS credit_grants (
      session_id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      credits INTEGER NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  ensured = true;
}

export async function getCreditBalance(userId: string) {
  await ensureSchema();
  const rows = await prisma.$queryRawUnsafe<Array<{ credit_balance: number }>>(
    `SELECT credit_balance FROM users WHERE id = $1::uuid LIMIT 1`,
    userId
  );
  return rows[0]?.credit_balance ?? 0;
}

export async function addCredits(userId: string, credits: number) {
  await ensureSchema();
  if (credits <= 0) return getCreditBalance(userId);
  const rows = await prisma.$queryRawUnsafe<Array<{ credit_balance: number }>>(
    `UPDATE users SET credit_balance = credit_balance + $2 WHERE id = $1::uuid RETURNING credit_balance`,
    userId,
    credits
  );
  return rows[0]?.credit_balance ?? 0;
}

export async function consumeOneCredit(userId: string) {
  await ensureSchema();
  const rows = await prisma.$queryRawUnsafe<Array<{ credit_balance: number }>>(
    `UPDATE users SET credit_balance = credit_balance - 1 WHERE id = $1::uuid AND credit_balance > 0 RETURNING credit_balance`,
    userId
  );
  if (!rows.length) return { ok: false as const, balance: 0 };
  return { ok: true as const, balance: rows[0].credit_balance };
}

export async function claimCreditGrant(params: { grantId: string; userId: string; credits: number }) {
  await ensureSchema();

  const inserted = await prisma.$queryRawUnsafe<Array<{ session_id: string }>>(
    `INSERT INTO credit_grants (session_id, user_id, credits)
     VALUES ($1, $2, $3)
     ON CONFLICT (session_id) DO NOTHING
     RETURNING session_id`,
    params.grantId,
    params.userId,
    params.credits
  );

  if (!inserted.length) {
    return { applied: false as const, balance: await getCreditBalance(params.userId) };
  }

  const balance = await addCredits(params.userId, params.credits);
  return { applied: true as const, balance };
}

export async function claimCreditGrantForSession(params: { sessionId: string; userId: string; credits: number }) {
  return claimCreditGrant({ grantId: params.sessionId, userId: params.userId, credits: params.credits });
}
