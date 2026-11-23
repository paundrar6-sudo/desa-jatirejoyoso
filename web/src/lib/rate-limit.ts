const WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 5;

export interface LockState {
  lockedUntil: number | null;
}

export async function getLockState(
  db: D1Database,
  ipHash: string,
  now: number
): Promise<LockState> {
  const row = await db
    .prepare('SELECT locked_until FROM login_attempts WHERE ip_hash = ?')
    .bind(ipHash)
    .first<{ locked_until: number | null }>();

  if (row?.locked_until && row.locked_until > now) {
    return { lockedUntil: row.locked_until };
  }
  return { lockedUntil: null };
}

export async function recordFailure(
  db: D1Database,
  ipHash: string,
  now: number
): Promise<{ attempts: number; lockedUntil: number | null }> {
  const lockUntil = now + WINDOW_MS;
  const row = await db
    .prepare(
      `INSERT INTO login_attempts (ip_hash, attempts, window_start, locked_until, updated_at)
       VALUES (?1, 1, ?2, NULL, ?2)
       ON CONFLICT(ip_hash) DO UPDATE SET
         attempts = CASE
           WHEN login_attempts.window_start IS NULL OR ?2 - login_attempts.window_start >= 900000 THEN 1
           ELSE login_attempts.attempts + 1
         END,
         window_start = CASE
           WHEN login_attempts.window_start IS NULL OR ?2 - login_attempts.window_start >= 900000 THEN ?2
           ELSE login_attempts.window_start
         END,
         locked_until = CASE
           WHEN (CASE
             WHEN login_attempts.window_start IS NULL OR ?2 - login_attempts.window_start >= 900000 THEN 1
             ELSE login_attempts.attempts + 1
           END) >= 5 THEN ?3
           ELSE NULL
         END,
         updated_at = ?2
       RETURNING attempts, locked_until`
    )
    .bind(ipHash, now, lockUntil)
    .first<{ attempts: number; locked_until: number | null }>();

  return {
    attempts: row?.attempts ?? 1,
    lockedUntil: row?.locked_until ?? null,
  };
}

export async function clearFailures(db: D1Database, ipHash: string): Promise<void> {
  await db.prepare('DELETE FROM login_attempts WHERE ip_hash = ?').bind(ipHash).run();
}

export { MAX_ATTEMPTS, WINDOW_MS };
