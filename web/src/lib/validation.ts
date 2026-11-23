import type { ContentType } from './types';

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

const ALLOWED_FILTER_GROUPS = ['Pengumuman', 'Kegiatan Warga', 'Pembangunan'] as const;
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function requireRecord(value: unknown): Record<string, unknown> {
  if (!isRecord(value)) throw new ValidationError('Body permintaan harus berupa objek JSON.');
  return value;
}

function readString(
  value: unknown,
  field: string,
  options: { required?: boolean; max: number }
): string | null {
  if (value === undefined || value === null || value === '') {
    if (options.required) throw new ValidationError(`${field} wajib diisi.`);
    return null;
  }
  if (typeof value !== 'string') throw new ValidationError(`${field} harus berupa teks.`);
  const trimmed = value.trim();
  if (options.required && !trimmed) throw new ValidationError(`${field} wajib diisi.`);
  if (trimmed.length > options.max) {
    throw new ValidationError(`${field} maksimal ${options.max} karakter.`);
  }
  return trimmed || null;
}

function readDate(value: unknown, field: string): string {
  const result = readString(value, field, { required: true, max: 10 });
  if (!result || !DATE_PATTERN.test(result)) {
    throw new ValidationError(`${field} harus berformat YYYY-MM-DD.`);
  }
  return result;
}

function readInteger(
  value: unknown,
  field: string,
  options: { min: number; max: number; required?: boolean }
): number | null {
  if (value === undefined || value === null || value === '') {
    if (options.required) throw new ValidationError(`${field} wajib diisi.`);
    return null;
  }
  const number = typeof value === 'number' ? value : Number(value);
  if (!Number.isInteger(number) || number < options.min || number > options.max) {
    throw new ValidationError(`${field} harus bilangan bulat ${options.min}-${options.max}.`);
  }
  return number;
}

function readBoolean(value: unknown, field: string): number {
  if (typeof value === 'boolean') return value ? 1 : 0;
  if (value === 0 || value === 1) return value;
  if (value === '0' || value === '1') return Number(value);
  throw new ValidationError(`${field} harus bernilai benar/salah.`);
}

function readFilterGroups(value: unknown): string[] {
  if (value === undefined || value === null) return [];
  if (!Array.isArray(value)) throw new ValidationError('filter_groups harus berupa array.');
  const groups: string[] = [];
  for (const item of value) {
    if (typeof item !== 'string') throw new ValidationError('filter_groups harus berisi teks.');
    if (!ALLOWED_FILTER_GROUPS.includes(item as (typeof ALLOWED_FILTER_GROUPS)[number])) {
      throw new ValidationError(`Filter grup tidak dikenal: ${item}.`);
    }
    if (!groups.includes(item)) groups.push(item);
  }
  return groups;
}

export function validateArticleInput(
  body: unknown,
  partial: boolean
): Record<string, unknown> {
  const input = requireRecord(body);
  const result: Record<string, unknown> = {};
  const has = (key: string) => Object.prototype.hasOwnProperty.call(input, key);

  if (!partial || has('title')) {
    result.title = readString(input.title, 'Judul', { required: true, max: 200 });
  }
  if (!partial || has('excerpt')) {
    result.excerpt = readString(input.excerpt, 'Ringkasan', { required: true, max: 2000 });
  }
  if (!partial || has('published_at')) {
    result.published_at = readDate(input.published_at, 'Tanggal terbit');
  }
  if (!partial || has('placement')) {
    const placement = readString(input.placement, 'Penempatan', { required: true, max: 10 });
    if (placement !== 'home' && placement !== 'info') {
      throw new ValidationError('Penempatan harus home atau info.');
    }
    result.placement = placement;
  }
  if (!partial || has('category')) {
    result.category = readString(input.category, 'Kategori', { max: 100 });
  }
  if (!partial || has('badge')) {
    result.badge = readString(input.badge, 'Label', { max: 50 });
  }
  if (!partial || has('author')) {
    result.author = readString(input.author, 'Penulis', { max: 100 });
  }
  if (!partial || has('is_published')) {
    result.is_published = readBoolean(input.is_published ?? true, 'Status terbit');
  }
  if (!partial || has('filter_groups')) {
    result.filter_groups = JSON.stringify(readFilterGroups(input.filter_groups));
  }

  if (result.placement === 'home') {
    result.filter_groups = '[]';
  }

  return result;
}

export function validateOfficialInput(
  body: unknown,
  partial: boolean
): Record<string, unknown> {
  const input = requireRecord(body);
  const result: Record<string, unknown> = {};
  const has = (key: string) => Object.prototype.hasOwnProperty.call(input, key);

  if (!partial || has('name')) {
    result.name = readString(input.name, 'Nama', { required: true, max: 150 });
  }
  if (!partial || has('role')) {
    result.role = readString(input.role, 'Jabatan', { required: true, max: 100 });
  }
  if (!partial || has('tier')) {
    result.tier = readInteger(input.tier, 'Tier', { min: 1, max: 6, required: true });
  }
  if (!partial || has('unit')) {
    result.unit = readString(input.unit, 'Unit/Dusun', { max: 100 });
  }
  if (!partial || has('photo')) {
    result.photo = readString(input.photo, 'Foto', { required: true, max: 300 });
  }
  if (!partial || has('sort_order')) {
    result.sort_order = readInteger(input.sort_order, 'Urutan', {
      min: 0,
      max: 9999,
      required: true,
    });
  }

  return result;
}

export function validateEventInput(
  body: unknown,
  partial: boolean
): Record<string, unknown> {
  const input = requireRecord(body);
  const result: Record<string, unknown> = {};
  const has = (key: string) => Object.prototype.hasOwnProperty.call(input, key);

  if (!partial || has('event_date')) {
    result.event_date = readDate(input.event_date, 'Tanggal acara');
  }
  if (!partial || has('title')) {
    result.title = readString(input.title, 'Judul acara', { required: true, max: 200 });
  }
  if (!partial || has('category')) {
    result.category = readString(input.category, 'Kategori acara', { required: true, max: 100 });
  }
  if (!partial || has('location')) {
    result.location = readString(input.location, 'Lokasi', { max: 200 });
  }
  if (!partial || has('event_time')) {
    result.event_time = readString(input.event_time, 'Waktu', { max: 100 });
  }
  if (!partial || has('description')) {
    result.description = readString(input.description, 'Deskripsi', { required: true, max: 4000 });
  }

  return result;
}

export function validateContentInput(
  type: ContentType,
  body: unknown,
  partial: boolean
): Record<string, unknown> {
  if (type === 'articles') return validateArticleInput(body, partial);
  if (type === 'officials') return validateOfficialInput(body, partial);
  return validateEventInput(body, partial);
}

export function parseContentType(value: string | null): ContentType | null {
  if (value === 'articles' || value === 'officials' || value === 'events') return value;
  return null;
}

export function parseId(value: string | null): number | null {
  if (!value) return null;
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
}
