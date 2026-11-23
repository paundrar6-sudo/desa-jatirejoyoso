export type ContentType = 'articles' | 'officials' | 'events';

export interface Article {
  id: number;
  title: string;
  category: string | null;
  badge: string | null;
  excerpt: string;
  author: string | null;
  published_at: string;
  placement: 'home' | 'info';
  filter_groups: string[];
  is_published: number;
  created_at?: string;
  updated_at?: string;
}

export interface Official {
  id: number;
  name: string;
  role: string;
  tier: number;
  unit: string | null;
  photo: string;
  sort_order: number;
  created_at?: string;
  updated_at?: string;
}

export interface VillageEvent {
  id: number;
  event_date: string;
  title: string;
  category: string;
  location: string | null;
  event_time: string | null;
  description: string;
  created_at?: string;
  updated_at?: string;
}

export interface PublicContent {
  articles: Article[];
  officials: Official[];
  events: VillageEvent[];
}

export interface AuthConfig {
  passwordHash: string;
  sessionSecret: string;
  ipSecret: string;
}

export type ContentRecord = Article | Official | VillageEvent;
