import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';
import {
  clearSessionCookie,
  createSession,
  csrfCookie,
  getAuthConfig,
  getCookie,
  hashIp,
  isAuthenticated,
  newCsrfToken,
  sessionCookie,
  verifyCsrf,
  verifyPassword,
} from '../../../lib/auth';
import {
  apiError,
  getClientIp,
  isSameOrigin,
  isSecureRequest,
  json,
  readJson,
} from '../../../lib/http';
import {
  MAX_ATTEMPTS,
  clearFailures,
  getLockState,
  recordFailure,
} from '../../../lib/rate-limit';

export const prerender = false;

interface LoginBody {
  password?: unknown;
}

export const GET: APIRoute = async ({ request }) => {
  const secure = isSecureRequest(request);
  const csrfToken = getCookie(request, 'csrf_token') || newCsrfToken();
  const config = getAuthConfig(env);

  return json(
    {
      authenticated: config
        ? await isAuthenticated(request, config.sessionSecret)
        : false,
      csrfToken,
    },
    { headers: { 'set-cookie': csrfCookie(csrfToken, secure) } }
  );
};

export const POST: APIRoute = async ({ request }) => {
  const config = getAuthConfig(env);
  if (!config) {
    return apiError(500, 'Server belum dikonfigurasi. Hubungi administrator.');
  }

  if (!isSameOrigin(request)) {
    return apiError(403, 'Origin tidak diizinkan.');
  }
  if (!verifyCsrf(request)) {
    return apiError(403, 'CSRF token tidak valid. Muat ulang halaman.');
  }

  const body = await readJson<LoginBody>(request);
  const password = typeof body?.password === 'string' ? body.password : '';
  if (!password || password.length > 200) {
    return apiError(400, 'Password wajib diisi.');
  }

  const now = Date.now();
  const ipHash = await hashIp(getClientIp(request), config.ipSecret);

  const lock = await getLockState(env.DB, ipHash, now);
  if (lock.lockedUntil) {
    const retryAfter = Math.max(1, Math.ceil((lock.lockedUntil - now) / 1000));
    return json(
      { error: 'Terlalu banyak percobaan. Coba lagi nanti.', lockedUntil: lock.lockedUntil },
      { status: 429, headers: { 'retry-after': String(retryAfter) } }
    );
  }

  const valid = await verifyPassword(password, config.passwordHash);
  if (!valid) {
    const failure = await recordFailure(env.DB, ipHash, now);
    if (failure.lockedUntil) {
      const retryAfter = Math.max(1, Math.ceil((failure.lockedUntil - now) / 1000));
      return json(
        { error: 'Terlalu banyak percobaan. Akun dikunci sementara.', lockedUntil: failure.lockedUntil },
        { status: 429, headers: { 'retry-after': String(retryAfter) } }
      );
    }
    return json(
      { error: 'Password salah.', remaining: Math.max(0, MAX_ATTEMPTS - failure.attempts) },
      { status: 401 }
    );
  }

  await clearFailures(env.DB, ipHash);
  const token = await createSession(config.sessionSecret);
  const secure = isSecureRequest(request);

  return json({ ok: true }, { headers: { 'set-cookie': sessionCookie(token, secure) } });
};

export const DELETE: APIRoute = async ({ request }) => {
  const config = getAuthConfig(env);
  if (!config) {
    return apiError(500, 'Server belum dikonfigurasi. Hubungi administrator.');
  }

  if (!isSameOrigin(request)) {
    return apiError(403, 'Origin tidak diizinkan.');
  }
  if (!verifyCsrf(request)) {
    return apiError(403, 'CSRF token tidak valid.');
  }

  const secure = isSecureRequest(request);
  void config;

  return json({ ok: true }, { headers: { 'set-cookie': clearSessionCookie(secure) } });
};
