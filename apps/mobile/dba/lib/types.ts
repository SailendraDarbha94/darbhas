/**
 * Minimal domain types matching the darbha.info NestJS API responses.
 * Kept local because this app is intentionally standalone (not a pnpm
 * workspace member), so it can't import @darbha/types.
 */

export type WorkType = 'poem' | 'play' | 'talk' | 'travel' | 'essay' | 'other';

export interface WorkMedia {
  images?: string[];
  audio?: string[];
  video?: string[];
}

export interface Work {
  id: string;
  tenantId: string;
  type: WorkType;
  title: string;
  /** Markdown body. */
  body: string;
  /** Language of the work ("en", "te", ...). */
  lang: string;
  excerpt: string | null;
  coverUrl: string | null;
  media: WorkMedia;
  tags: string[];
  published: boolean;
  publishedAt: string | null;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface TenantWithWorks {
  id: string;
  slug: string;
  displayName: string;
  tagline: string | null;
  genre: WorkType;
  bio: string | null;
  avatarUrl: string | null;
  works: Work[];
}
