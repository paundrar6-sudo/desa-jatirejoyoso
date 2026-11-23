import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';
import { requireAdmin } from '../../../lib/admin-guard';
import { apiError, json, readJson } from '../../../lib/http';
import {
  createContent,
  deleteContent,
  getContentById,
  listContent,
  updateContent,
} from '../../../lib/repositories/content';
import { parseContentType, parseId, validateContentInput } from '../../../lib/validation';

export const prerender = false;

const jsonBody = (data: unknown, status = 200) => json(data, { status });

export const GET: APIRoute = async ({ request }) => {
  const guard = await requireAdmin(request, env);
  if ('error' in guard) return guard.error;

  const url = new URL(request.url);
  const type = parseContentType(url.searchParams.get('type'));
  if (!type) return apiError(400, 'Parameter type tidak valid.');

  try {
    return jsonBody(await listContent(env.DB, type));
  } catch (error) {
    console.error('GET /api/admin/content failed', error);
    return apiError(500, 'Gagal memuat data.');
  }
};

export const POST: APIRoute = async ({ request }) => {
  const guard = await requireAdmin(request, env);
  if ('error' in guard) return guard.error;

  const url = new URL(request.url);
  const type = parseContentType(url.searchParams.get('type'));
  if (!type) return apiError(400, 'Parameter type tidak valid.');

  const body = await readJson<unknown>(request);
  if (body === null) return apiError(400, 'Body permintaan harus JSON.');

  try {
    const fields = validateContentInput(type, body, false);
    const row = await createContent(env.DB, type, fields);
    return jsonBody(row, 201);
  } catch (error) {
    if (error instanceof Error && error.name === 'ValidationError') {
      return apiError(400, error.message);
    }
    console.error('POST /api/admin/content failed', error);
    return apiError(500, 'Gagal menyimpan data.');
  }
};

export const PUT: APIRoute = async ({ request }) => {
  const guard = await requireAdmin(request, env);
  if ('error' in guard) return guard.error;

  const url = new URL(request.url);
  const type = parseContentType(url.searchParams.get('type'));
  const id = parseId(url.searchParams.get('id'));
  if (!type || !id) return apiError(400, 'Parameter type/id tidak valid.');

  const body = await readJson<unknown>(request);
  if (body === null) return apiError(400, 'Body permintaan harus JSON.');

  try {
    const fields = validateContentInput(type, body, true);
    const existing = await getContentById(env.DB, type, id);
    if (!existing) return apiError(404, 'Data tidak ditemukan.');
    const row = await updateContent(env.DB, type, id, fields);
    return jsonBody(row);
  } catch (error) {
    if (error instanceof Error && error.name === 'ValidationError') {
      return apiError(400, error.message);
    }
    console.error('PUT /api/admin/content failed', error);
    return apiError(500, 'Gagal memperbarui data.');
  }
};

export const DELETE: APIRoute = async ({ request }) => {
  const guard = await requireAdmin(request, env);
  if ('error' in guard) return guard.error;

  const url = new URL(request.url);
  const type = parseContentType(url.searchParams.get('type'));
  const id = parseId(url.searchParams.get('id'));
  if (!type || !id) return apiError(400, 'Parameter type/id tidak valid.');

  try {
    const existing = await getContentById(env.DB, type, id);
    if (!existing) return apiError(404, 'Data tidak ditemukan.');
    await deleteContent(env.DB, type, id);
    return jsonBody({ ok: true });
  } catch (error) {
    console.error('DELETE /api/admin/content failed', error);
    return apiError(500, 'Gagal menghapus data.');
  }
};
