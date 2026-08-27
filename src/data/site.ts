/**
 * Site-level configuration.
 *
 * SOCIAL_LINKS is intentionally EMPTY. No official Nexyronix social accounts
 * have been provided, and inventing profile URLs would send visitors to pages
 * that either don't exist or belong to someone else. The footer renders no
 * social row at all while this array is empty — add entries only for accounts
 * that genuinely exist.
 *
 * Example once real accounts exist:
 *   { label: "LinkedIn", short: "in", href: "https://www.linkedin.com/company/..." }
 */
export interface SocialLink {
  label: string;
  /** 2-3 character mark shown in the footer button. */
  short: string;
  href: string;
}

export const SOCIAL_LINKS: SocialLink[] = [];

/**
 * Canonical origin, used for canonical tags, Open Graph URLs and the sitemap.
 * Override per-environment with VITE_SITE_URL. The default is the intended
 * production domain; nothing here assumes DNS is live yet.
 */
export const SITE_URL = (import.meta.env.VITE_SITE_URL || "https://nexyronix.com").replace(
  /\/$/,
  ""
);

export const SITE_NAME = "Nexyronix Solutions Private Limited";

export const SITE_DESCRIPTION =
  "Nexyronix Solutions Private Limited builds websites, applications, custom software, AI solutions and digital products while providing internship opportunities across multiple domains.";

/**
 * Contact details. These are Nexyronix's real, provided details, so — unlike
 * SOCIAL_LINKS above — they ship with real defaults rather than sitting
 * blank until configured. Still overridable per-environment via
 * VITE_CONTACT_EMAIL / VITE_CONTACT_PHONE / VITE_CONTACT_LOCATION if ever
 * needed (e.g. a regional number for a future office).
 */
export const CONTACT_EMAIL = import.meta.env.VITE_CONTACT_EMAIL || "info@nexyronix.com";

export const CONTACT_PHONE_DISPLAY = import.meta.env.VITE_CONTACT_PHONE || "+91 94820 81830";

export const CONTACT_LOCATION =
  import.meta.env.VITE_CONTACT_LOCATION ||
  "80, 4th Floor, Mango Meadows Layout, North Main Gate, Bidarahalli, Bengaluru 560049";

/**
 * Digits-only, E.164-style number (no "+", no spaces) — the format tel: and
 * wa.me links require. Kept separate from CONTACT_PHONE_DISPLAY because that
 * one is free-text (env-overridable) and can't safely be parsed into this
 * shape; this is the one number these links are guaranteed to work with.
 */
const WHATSAPP_NUMBER = "919482081830";

export const CONTACT_PHONE_TEL = `+${WHATSAPP_NUMBER}`;

/** wa.me deep link, prefilled with a short, neutral opener. */
export const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
  "Hi Nexyronix, I'd like to know more about your services."
)}`;
