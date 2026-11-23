import type { AuthConfig } from './types';

const encoder = new TextEncoder();
const SESSION_TTL_SECONDS = 8 * 60 * 60;
const CSRF_TTL_SECONDS = 8 * 60 * 60;

interface SessionPayload {
  sub: 'admin';
  iat: number;
  exp: number;
}

function toBinary(bytes: Uint8Array): string {
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return binary;
}

export function base64UrlEncode(bytes: Uint8Array): string {
  return btoa(toBinary(bytes)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

export function base64UrlDecode(value: string): Uint8Array {
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/');
  const padded = normalized + '='.repeat((4 - (normalized.length % 4)) % 4);
  const binary = atob(padded);
  return Uint8Array.from(binary, (char) => char.charCodeAt(0));
}

function decodeBase64(value: string): Uint8Array {
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/');
  const padded = normalized + '='.repeat((4 - (normalized.length % 4)) % 4);
  const binary = atob(padded);
  return Uint8Array.from(binary, (char) => char.charCodeAt(0));
}

export function timingSafeEqual(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let index = 0; index < a.length; index += 1) {
    diff |= a[index] ^ b[index];
  }
  return diff === 0;
}

async function hmacSha256(secret: string, data: string): Promise<Uint8Array> {
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(data));
  return new Uint8Array(signature);
}

export async function hashIp(ip: string, secret: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', encoder.encode(`${ip}:${secret}`));
  return base64UrlEncode(new Uint8Array(digest));
}

export async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
  const parts = storedHash.split('$');
  if (parts.length !== 4 || parts[0] !== 'pbkdf2_sha256') return false;

  const iterations = Number(parts[1]);
  if (!Number.isInteger(iterations) || iterations < 100_000) return false;
  const salt = decodeBase64(parts[2]);
  const expected = decodeBase64(parts[3]);
  if (salt.length < 16 || expected.length < 16) return false;

  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    'PBKDF2',
    false,
    ['deriveBits']
  );
  const derived = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt: salt as BufferSource, iterations, hash: 'SHA-256' },
    key,
    expected.length * 8
  );
  return timingSafeEqual(new Uint8Array(derived), expected);
}

export async function createSession(secret: string): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const payload: SessionPayload = { sub: 'admin', iat: now, exp: now + SESSION_TTL_SECONDS };
  const encodedPayload = base64UrlEncode(encoder.encode(JSON.stringify(payload)));
  const signature = await hmacSha256(secret, encodedPayload);
  return `${encodedPayload}.${base64UrlEncode(signature)}`;
}

export async function verifySession(
  token: string | undefined,
  secret: string
): Promise<SessionPayload | null> {
  if (!token) return null;
  const [encodedPayload, encodedSignature] = token.split('.');
  if (!encodedPayload || !encodedSignature) return null;

  const expected = await hmacSha256(secret, encodedPayload);
  if (!timingSafeEqual(base64UrlDecode(encodedSignature), expected)) return null;

  try {
    const payload = JSON.parse(new TextDecoder().decode(base64UrlDecode(encodedPayload))) as SessionPayload;
    if (payload.sub !== 'admin') return null;
    if (!Number.isInteger(payload.exp) || payload.exp <= Math.floor(Date.now() / 1000)) return null;
    return payload;
  } catch {
    return null;
  }
}

export function getCookie(request: Request, name: string): string | undefined {
  const cookieHeader = request.headers.get('cookie');
  if (!cookieHeader) return undefined;
  for (const part of cookieHeader.split(';')) {
    const [key, ...rest] = part.trim().split('=');
    if (key === name) return rest.join('=');
  }
  return undefined;
}

export function sessionCookie(token: string, secure: boolean): string {
  const flags = [
    `admin_session=${token}`,
    'HttpOnly',
    'SameSite=Strict',
    'Path=/',
    `Max-Age=${SESSION_TTL_SECONDS}`,
  ];
  if (secure) flags.push('Secure');
  return flags.join('; ');
}

export function clearSessionCookie(secure: boolean): string {
  const flags = ['admin_session=', 'HttpOnly', 'SameSite=Strict', 'Path=/', 'Max-Age=0'];
  if (secure) flags.push('Secure');
  return flags.join('; ');
}

export function newCsrfToken(): string {
  return base64UrlEncode(crypto.getRandomValues(new Uint8Array(32)));
}

export function csrfCookie(token: string, secure: boolean): string {
  const flags = [
    `csrf_token=${token}`,
    'SameSite=Strict',
    'Path=/',
    `Max-Age=${CSRF_TTL_SECONDS}`,
  ];
  if (secure) flags.push('Secure');
  return flags.join('; ');
}

export function verifyCsrf(request: Request): boolean {
  const cookieToken = getCookie(request, 'csrf_token');
  const headerToken = request.headers.get('x-csrf-token');
  if (!cookieToken || !headerToken) return false;
  return cookieToken === headerToken;
}

export async function isAuthenticated(request: Request, secret: string): Promise<boolean> {
  return (await verifySession(getCookie(request, 'admin_session'), secret)) !== null;
}

export function getAuthConfig(env: Cloudflare.Env): AuthConfig | null {
  const passwordHash = env.ADMIN_PASSWORD_HASH?.trim();
  const sessionSecret = env.SESSION_SECRET?.trim();
  const ipSecret = env.IP_HASH_SECRET?.trim();
  if (!passwordHash || !sessionSecret || !ipSecret) return null;
  if (sessionSecret.length < 32 || ipSecret.length < 32) return null;
  return { passwordHash, sessionSecret, ipSecret };
}
