import type { Article, ContentType, Official, PublicContent, VillageEvent } from '../types';

type Row = Record<string, unknown>;

const COLUMNS: Record<ContentType, string[]> = {
  articles: [
    'title',
    'category',
    'badge',
    'excerpt',
    'author',
    'published_at',
    'placement',
    'filter_groups',
    'is_published',
  ],
  officials: ['name', 'role', 'tier', 'unit', 'photo', 'sort_order'],
  events: ['event_date', 'title', 'category', 'location', 'event_time', 'description'],
};

function asString(value: unknown): string | null {
  return typeof value === 'string' ? value : null;
}

function asNumber(value: unknown, fallback: number): number {
  return typeof value === 'number' ? value : fallback;
}

function parseFilterGroups(value: unknown): string[] {
  if (typeof value !== 'string') return [];
  try {
    const parsed = JSON.parse(value);
    if (Array.isArray(parsed)) {
      return parsed.filter((item): item is string => typeof item === 'string');
    }
  } catch {
    // ignore malformed JSON
  }
  return [];
}

function mapArticle(row: Row): Article {
  return {
    id: asNumber(row.id, 0),
    title: asString(row.title) ?? '',
    category: asString(row.category),
    badge: asString(row.badge),
    excerpt: asString(row.excerpt) ?? '',
    author: asString(row.author),
    published_at: asString(row.published_at) ?? '',
    placement: row.placement === 'home' ? 'home' : 'info',
    filter_groups: parseFilterGroups(row.filter_groups),
    is_published: asNumber(row.is_published, 0),
    created_at: asString(row.created_at) ?? undefined,
    updated_at: asString(row.updated_at) ?? undefined,
  };
}

function mapOfficial(row: Row): Official {
  return {
    id: asNumber(row.id, 0),
    name: asString(row.name) ?? '',
    role: asString(row.role) ?? '',
    tier: asNumber(row.tier, 0),
    unit: asString(row.unit),
    photo: asString(row.photo) ?? '',
    sort_order: asNumber(row.sort_order, 0),
    created_at: asString(row.created_at) ?? undefined,
    updated_at: asString(row.updated_at) ?? undefined,
  };
}

function mapEvent(row: Row): VillageEvent {
  return {
    id: asNumber(row.id, 0),
    event_date: asString(row.event_date) ?? '',
    title: asString(row.title) ?? '',
    category: asString(row.category) ?? '',
    location: asString(row.location),
    event_time: asString(row.event_time),
    description: asString(row.description) ?? '',
    created_at: asString(row.created_at) ?? undefined,
    updated_at: asString(row.updated_at) ?? undefined,
  };
}

export async function getPublicContent(db: D1Database): Promise<PublicContent> {
  const [articleResult, officialResult, eventResult] = await db.batch<Row>([
    db.prepare(
      `SELECT id, title, category, badge, excerpt, author, published_at, placement,
              filter_groups, is_published
       FROM articles
       WHERE is_published = 1
       ORDER BY published_at DESC, id DESC`
    ),
    db.prepare(
      `SELECT id, name, role, tier, unit, photo, sort_order
       FROM officials
       ORDER BY tier ASC, sort_order ASC, id ASC`
    ),
    db.prepare(
      `SELECT id, event_date, title, category, location, event_time, description
       FROM events
       ORDER BY event_date ASC, id ASC`
    ),
  ]);

  return {
    articles: articleResult.results.map(mapArticle),
    officials: officialResult.results.map(mapOfficial),
    events: eventResult.results.map(mapEvent),
  };
}

export async function listContent(
  db: D1Database,
  type: ContentType
): Promise<Record<string, unknown>[]> {
  const table = type;
  const { results } = await db.prepare(`SELECT * FROM ${table} ORDER BY id ASC`).all<Row>();
  return results;
}

export async function getContentById(
  db: D1Database,
  type: ContentType,
  id: number
): Promise<Row | null> {
  return db
    .prepare(`SELECT * FROM ${type} WHERE id = ?`)
    .bind(id)
    .first<Row>();
}

function assertColumns(type: ContentType, fields: Record<string, unknown>): string[] {
  const allowed = COLUMNS[type];
  const keys = Object.keys(fields).filter((key) => allowed.includes(key));
  if (keys.length === 0) throw new Error('Tidak ada kolom valid untuk disimpan.');
  return keys;
}

export async function createContent(
  db: D1Database,
  type: ContentType,
  fields: Record<string, unknown>
): Promise<Row | null> {
  const keys = assertColumns(type, fields);
  const placeholders = keys.map(() => '?').join(', ');
  const values = keys.map((key) => fields[key]);
  return db
    .prepare(
      `INSERT INTO ${type} (${keys.join(', ')}) VALUES (${placeholders}) RETURNING *`
    )
    .bind(...values)
    .first<Row>();
}

export async function updateContent(
  db: D1Database,
  type: ContentType,
  id: number,
  fields: Record<string, unknown>
): Promise<Row | null> {
  const keys = assertColumns(type, fields);
  const assignments = keys.map((key) => `${key} = ?`).join(', ');
  const values = keys.map((key) => fields[key]);
  return db
    .prepare(
      `UPDATE ${type} SET ${assignments}, updated_at = datetime('now') WHERE id = ? RETURNING *`
    )
    .bind(...values, id)
    .first<Row>();
}

export async function deleteContent(
  db: D1Database,
  type: ContentType,
  id: number
): Promise<boolean> {
  const result = await db
    .prepare(`DELETE FROM ${type} WHERE id = ?`)
    .bind(id)
    .run();
  return (result.meta?.changes ?? 0) > 0;
}
