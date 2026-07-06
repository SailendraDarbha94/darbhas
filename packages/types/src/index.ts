export type WorkType = "poem" | "play" | "travel" | "essay" | "other";

export type TenantStatus = "active" | "hidden";

export type ApplicationStatus = "pending" | "approved" | "rejected";

export type ProfileRole = "admin" | "writer";

/** Per-tenant visual theme stored as JSON on the tenant row. */
export interface TenantTheme {
  /** Named preset applied by the subdomain template. */
  preset: "ivory" | "ink" | "sage" | "sand" | "plum";
  /** Optional accent color override, hex. */
  accent?: string;
  /** Serif for poetry/plays, sans for travel logs, etc. */
  fontStyle?: "serif" | "sans";
}

export interface Tenant {
  id: string;
  slug: string;
  displayName: string;
  tagline: string | null;
  genre: WorkType;
  bio: string | null;
  theme: TenantTheme;
  avatarUrl: string | null;
  status: TenantStatus;
  ownerUserId: string | null;
  createdAt: string;
  updatedAt: string;
}

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

export interface Application {
  id: string;
  firstName: string;
  lastName: string;
  requestedSlug: string;
  email: string;
  message: string | null;
  genre: WorkType;
  status: ApplicationStatus;
  createdAt: string;
}

export interface Profile {
  id: string;
  role: ProfileRole;
  tenantId: string | null;
  createdAt: string;
}

/** Tenant plus its published works, as served to subdomain pages and the mobile app. */
export interface TenantWithWorks extends Tenant {
  works: Work[];
}

export interface CreateApplicationInput {
  firstName: string;
  lastName: string;
  requestedSlug: string;
  email: string;
  message?: string;
  genre: WorkType;
}

export const WORK_TYPES: WorkType[] = ["poem", "play", "travel", "essay", "other"];

export const THEME_PRESETS: TenantTheme["preset"][] = ["ivory", "ink", "sage", "sand", "plum"];

export const RESERVED_SLUGS = [
  "www",
  "admin",
  "api",
  "app",
  "mail",
  "blog",
  "dev",
  "staging",
  "vercel",
  "supabase",
];

export const SLUG_REGEX = /^[a-z][a-z0-9-]{1,30}$/;
