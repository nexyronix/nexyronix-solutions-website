/**
 * SHARED between the browser and the server.
 *
 * The server re-runs every check in here on submission. Client-side validation
 * exists only to give fast feedback — it is never trusted. Keeping the rules in
 * one module means the two sides cannot silently drift apart.
 */

export const ENQUIRY_TYPES = [
  "Software Development",
  "Website",
  "Web Application",
  "Mobile Application",
  "AI Solution",
  "SaaS",
  "Automation",
  "E-Commerce",
  "Internship",
  "General Enquiry",
  "Other",
] as const;

export const BUDGET_OPTIONS = [
  "Not decided",
  "Under ₹50,000",
  "₹50,000 – ₹2,00,000",
  "₹2,00,000 – ₹5,00,000",
  "₹5,00,000+",
  "Prefer to discuss",
] as const;

export const SOURCE_OPTIONS = [
  "Google",
  "Social Media",
  "Referral",
  "University / College",
  "Search",
  "Other",
] as const;

export type EnquiryType = (typeof ENQUIRY_TYPES)[number];
export type BudgetOption = (typeof BUDGET_OPTIONS)[number];
export type SourceOption = (typeof SOURCE_OPTIONS)[number];

export interface EnquiryPayload {
  name: string;
  email: string;
  phone?: string;
  organization?: string;
  enquiryType: string;
  budget?: string;
  source?: string;
  message: string;
  /** Honeypot — must stay empty. Real users never see this field. */
  website?: string;
}

export type FieldErrors = Partial<Record<keyof EnquiryPayload, string>>;

/** Field length caps, enforced on both sides. Also bounds the request body size. */
export const LIMITS = {
  name: 100,
  email: 254,
  phone: 32,
  organization: 120,
  message: 5000,
} as const;

/**
 * Deliberately pragmatic rather than RFC-exhaustive: one @, something either
 * side, a dot in the domain, no whitespace. Over-strict email regexes reject
 * real addresses, which costs more than the occasional bad one getting through
 * (the address gets verified by actually emailing it anyway).
 */
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateEnquiry(input: Partial<EnquiryPayload>): FieldErrors {
  const errors: FieldErrors = {};

  const name = (input.name ?? "").trim();
  if (!name) {
    errors.name = "Please enter your name.";
  } else if (name.length > LIMITS.name) {
    errors.name = `Please keep this under ${LIMITS.name} characters.`;
  }

  const email = (input.email ?? "").trim();
  if (!email) {
    errors.email = "Please enter your email address.";
  } else if (email.length > LIMITS.email || !EMAIL_PATTERN.test(email)) {
    errors.email = "Please enter a valid email address.";
  }

  const phone = (input.phone ?? "").trim();
  if (phone && phone.length > LIMITS.phone) {
    errors.phone = `Please keep this under ${LIMITS.phone} characters.`;
  }

  const organization = (input.organization ?? "").trim();
  if (organization && organization.length > LIMITS.organization) {
    errors.organization = `Please keep this under ${LIMITS.organization} characters.`;
  }

  const enquiryType = (input.enquiryType ?? "").trim();
  if (!enquiryType) {
    errors.enquiryType = "Please choose an enquiry type.";
  } else if (!ENQUIRY_TYPES.includes(enquiryType as EnquiryType)) {
    errors.enquiryType = "Please choose an enquiry type from the list.";
  }

  const budget = (input.budget ?? "").trim();
  if (budget && !BUDGET_OPTIONS.includes(budget as BudgetOption)) {
    errors.budget = "Please choose an option from the list.";
  }

  const source = (input.source ?? "").trim();
  if (source && !SOURCE_OPTIONS.includes(source as SourceOption)) {
    errors.source = "Please choose an option from the list.";
  }

  const message = (input.message ?? "").trim();
  if (!message) {
    errors.message = "Please tell us a little about your enquiry.";
  } else if (message.length < 10) {
    errors.message = "Please add a little more detail.";
  } else if (message.length > LIMITS.message) {
    errors.message = `Please keep this under ${LIMITS.message} characters.`;
  }

  return errors;
}

export function hasErrors(errors: FieldErrors): boolean {
  return Object.keys(errors).length > 0;
}
