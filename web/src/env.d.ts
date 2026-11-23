/// <reference types="@cloudflare/workers-types" />
/// <reference types="astro/client" />

declare namespace Cloudflare {
  interface Env {
    DB: D1Database;
    ASSETS: Fetcher;
    ADMIN_PASSWORD_HASH?: string;
    SESSION_SECRET?: string;
    IP_HASH_SECRET?: string;
  }
}
