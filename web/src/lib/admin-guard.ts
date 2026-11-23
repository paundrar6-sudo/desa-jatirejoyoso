import type { AuthConfig } from './types';
import { apiError, isSameOrigin } from './http';
import { getAuthConfig, isAuthenticated, verifyCsrf } from './auth';

export async function requireAdmin(
  request: Request,
  env: Cloudflare.Env
): Promise<{ config: AuthConfig } | { error: Response }> {
  const config = getAuthConfig(env);
  if (!config) {
    return {
      error: apiError(500, 'Server belum dikonfigurasi. Hubungi administrator.'),
      };
  }
  if (!(await isAuthenticated(request, config.sessionSecret))) {
    return { error: apiError(401, 'Sesi tidak valid. Silakan login kembali.') };
  }
  if (request.method !== 'GET') {
    if (!isSameOrigin(request)) {
      return { error: apiError(403, 'Origin tidak diizinkan.') };
    }
    if (!verifyCsrf(request)) {
      return { error: apiError(403, 'CSRF token tidak valid.') };
    }
  }
  return { config };
}
