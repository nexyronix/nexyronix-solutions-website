/// <reference types="vite/client" />

/**
 * Declaring this interface replaces Vite's default index signature on
 * import.meta.env, so EVERY VITE_ variable the app reads must be listed here
 * or it becomes a TS2339 build error.
 */
interface ImportMetaEnv {
  /** Canonical origin for canonical tags, OG URLs and the sitemap. */
  readonly VITE_SITE_URL?: string;

  /** Public contact details. Blank/undefined values fall back to the real defaults in src/data/site.ts. */
  readonly VITE_CONTACT_EMAIL?: string;
  readonly VITE_CONTACT_PHONE?: string;
  readonly VITE_CONTACT_LOCATION?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
