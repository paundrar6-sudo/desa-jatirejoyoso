import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';
import { apiError, json } from '../../lib/http';
import { getPublicContent } from '../../lib/repositories/content';

export const prerender = false;

export const GET: APIRoute = async () => {
  try {
    const content = await getPublicContent(env.DB);
    return json(content);
  } catch (error) {
    console.error('GET /api/content failed', error);
    return apiError(500, 'Gagal memuat konten desa.');
  }
};
