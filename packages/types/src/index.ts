export type WorkType = "poem" | "play" | "talk" | "travel" | "essay" | "other";

/** BCP-47 language tags the platform styles for. */
export type WorkLang = "en" | "te";

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
  /**
   * Optional Google font family for the site's Latin text. Only families in
   * the curated SITE_FONTS whitelist (packages/ui) ever take effect — unknown
   * values are ignored at render time. Telugu always uses Noto Serif Telugu.
   */
  font?: string;
}

/** A dated (or period) entry in a life timeline: education, career, etc. */
export interface TimelineEntry {
  period: string;
  title: string;
  detail?: string;
}

/** Optional structured biography rendered as a "Life" section on the subdomain. */
export interface TenantProfile {
  /** e.g. ["Educator", "Scholar", "Poet", "Playwright"] */
  roles?: string[];
  born?: { date?: string; place?: string };
  parents?: { father?: string; mother?: string };
  education?: TimelineEntry[];
  career?: TimelineEntry[];
}

export interface Tenant {
  id: string;
  slug: string;
  displayName: string;
  tagline: string | null;
  genre: WorkType;
  bio: string | null;
  theme: TenantTheme;
  profile: TenantProfile | null;
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

export interface Application {
  id: string;
  firstName: string;
  lastName: string;
  requestedSlug: string;
  email: string;
  /** Contact number for the community outreach call; "" on older applications. */
  phone: string;
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

/** Tenant plus its published works, as served to subdomain pages. */
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

export const WORK_TYPES: WorkType[] = ["poem", "play", "talk", "travel", "essay", "other"];

export const WORK_LANGS: WorkLang[] = ["en", "te"];

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
  // Would shadow the GET /tenants/me endpoint.
  "me",
];

export const SLUG_REGEX = /^[a-z][a-z0-9-]{1,30}$/;

/** Medium-style per-reader cap on claps for one work. */
export const MAX_CLAPS_PER_READER = 50;

/** GET/POST /works/:id/claps — a work's applause, and this reader's share. */
export interface ClapState {
  total: number;
  mine: number;
  max: number;
  /**
   * True when this reader's network has no room left on this work (the per-IP
   * backstop), so further claps would be dropped — the UI says so instead of
   * letting taps silently vanish.
   */
  limited: boolean;
}

/** Outcome of sending a writer their login invite (approval or the Sites page). */
export interface InviteResult {
  /** True when Supabase accepted the invite email. */
  sent: boolean;
  /** True when the email already had a login. */
  alreadyRegistered?: boolean;
  /**
   * Present whenever anything needs the admin's attention — an unsent invite,
   * or a sent invite / existing account whose profile could not be linked.
   */
  reason?: string;
}
