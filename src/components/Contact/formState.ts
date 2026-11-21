/**
 * Pure state helpers for ContactForm — kept free of React and the DOM so the
 * rules are unit-tested directly (test/form-state.test.ts).
 *
 * Relative import on purpose: this module is also loaded by the Node test
 * runner, which doesn't know the "@/" alias.
 */
import { RESUME_ENQUIRY_TYPES, type EnquiryPayload } from "../../shared/enquiry";

export const EMPTY_ENQUIRY: EnquiryPayload = {
  name: "",
  email: "",
  phone: "",
  organization: "",
  enquiryType: "",
  budget: "",
  source: "",
  message: "",
  website: "",
};

/** Whether the resume field is offered for this enquiry type. */
export function acceptsResume(enquiryType: string): boolean {
  return RESUME_ENQUIRY_TYPES.includes(enquiryType as (typeof RESUME_ENQUIRY_TYPES)[number]);
}

/** A blank form, optionally with an enquiry type preselected. */
export function initialEnquiry(presetType?: string): EnquiryPayload {
  return presetType ? { ...EMPTY_ENQUIRY, enquiryType: presetType } : { ...EMPTY_ENQUIRY };
}

/**
 * Returns the form values with one field changed, leaving every other field
 * exactly as the visitor typed it. Changing the enquiry type to one that
 * doesn't offer a resume also drops any attached resume, so a stale file
 * can't silently ride along on submit. Returns the same object when nothing
 * changes, so React can skip the re-render.
 */
export function withField<K extends keyof EnquiryPayload>(
  values: EnquiryPayload,
  key: K,
  value: EnquiryPayload[K]
): EnquiryPayload {
  if (values[key] === value) return values;
  const next: EnquiryPayload = { ...values, [key]: value };
  if (key === "enquiryType" && !acceptsResume(String(value ?? ""))) next.resume = undefined;
  return next;
}
