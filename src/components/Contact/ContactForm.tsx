import { useRef, useState, type FormEvent } from "react";
import { FormField } from "./FormField";
import { ResumeUploadField } from "./ResumeUploadField";
import { FormSuccess, FormError } from "./FormStatus";
import { Button } from "@/components/ui/Button";
import { ArrowIcon } from "@/components/ui/ArrowIcon";
import {
  validateEnquiry,
  hasErrors,
  ENQUIRY_TYPES,
  BUDGET_OPTIONS,
  SOURCE_OPTIONS,
  RESUME_ENQUIRY_TYPES,
  type EnquiryPayload,
  type FieldErrors,
} from "@/shared/enquiry";

type Status = "idle" | "submitting" | "success" | "error";

const EMPTY: EnquiryPayload = {
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

interface ContactFormProps {
  /** Preselects the enquiry type when arriving from one of the three option cards. */
  presetType?: string;
}

export function ContactForm({ presetType }: ContactFormProps) {
  const [values, setValues] = useState<EnquiryPayload>(() =>
    presetType ? { ...EMPTY, enquiryType: presetType } : EMPTY
  );
  const [errors, setErrors] = useState<FieldErrors>({});
  const [status, setStatus] = useState<Status>("idle");
  const [errorMessage, setErrorMessage] = useState("");

  // Guards against double submission even if the button state is bypassed
  const inFlight = useRef(false);

  function setField<K extends keyof EnquiryPayload>(key: K, value: EnquiryPayload[K]) {
    setValues((current) => {
      const next = { ...current, [key]: value };
      // Resume only makes sense for Internship / Career — drop it (and its
      // error) if the enquiry type changes to something it isn't offered
      // for, so a stale attachment can't silently ride along on submit.
      if (key === "enquiryType" && !RESUME_ENQUIRY_TYPES.includes(value as (typeof RESUME_ENQUIRY_TYPES)[number])) {
        next.resume = undefined;
      }
      return next;
    });
    // Clear a field's error as soon as the user starts correcting it
    setErrors((current) => {
      if (!current[key]) return current;
      const next = { ...current };
      delete next[key];
      if (key === "enquiryType") delete next.resume;
      return next;
    });
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (inFlight.current) return;

    const found = validateEnquiry(values);
    if (hasErrors(found)) {
      setErrors(found);
      setStatus("error");
      setErrorMessage("Please check the highlighted fields and try again.");
      return;
    }

    inFlight.current = true;
    setStatus("submitting");
    setErrors({});
    setErrorMessage("");

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        // The server re-validates; surface its field errors if it sent any
        if (data?.errors) setErrors(data.errors as FieldErrors);
        setStatus("error");
        setErrorMessage(
          typeof data?.message === "string"
            ? data.message
            : "We couldn't submit your request right now. Please try again."
        );
        return;
      }

      setStatus("success");
      setValues(EMPTY);
    } catch {
      setStatus("error");
      setErrorMessage(
        "We couldn't reach the server. Please check your connection and try again."
      );
    } finally {
      inFlight.current = false;
    }
  }

  function handleReset() {
    setValues(EMPTY);
    setErrors({});
    setStatus("idle");
    setErrorMessage("");
  }

  if (status === "success") {
    return <FormSuccess onReset={handleReset} />;
  }

  const isSubmitting = status === "submitting";

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="rounded-2xl border border-border bg-surface/50 p-6 backdrop-blur-sm sm:p-8"
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <FormField
          label="Full Name"
          required
          value={values.name}
          error={errors.name}
          autoComplete="name"
          onChange={(v) => setField("name", v)}
        />
        <FormField
          label="Email Address"
          type="email"
          required
          value={values.email}
          error={errors.email}
          autoComplete="email"
          onChange={(v) => setField("email", v)}
        />
        <FormField
          label="Phone Number"
          type="tel"
          value={values.phone ?? ""}
          error={errors.phone}
          autoComplete="tel"
          onChange={(v) => setField("phone", v)}
        />
        <FormField
          label="Organization / Company"
          value={values.organization ?? ""}
          error={errors.organization}
          autoComplete="organization"
          onChange={(v) => setField("organization", v)}
        />

        <FormField
          as="select"
          label="Enquiry Type"
          required
          className="sm:col-span-2"
          value={values.enquiryType}
          error={errors.enquiryType}
          options={ENQUIRY_TYPES}
          placeholderOption="Select an enquiry type"
          onChange={(v) => setField("enquiryType", v)}
        />

        {RESUME_ENQUIRY_TYPES.includes(values.enquiryType as (typeof RESUME_ENQUIRY_TYPES)[number]) && (
          <ResumeUploadField
            value={values.resume ?? null}
            error={errors.resume}
            onChange={(resume) => setField("resume", resume ?? undefined)}
          />
        )}

        <FormField
          as="textarea"
          label="Project / Enquiry Details"
          required
          className="sm:col-span-2"
          value={values.message}
          error={errors.message}
          rows={6}
          placeholder="Tell us about your idea, requirement or question..."
          onChange={(v) => setField("message", v)}
        />

        <FormField
          as="select"
          label="Budget"
          value={values.budget ?? ""}
          error={errors.budget}
          options={BUDGET_OPTIONS}
          placeholderOption="Select a range"
          hint="Only if you'd like to share it."
          onChange={(v) => setField("budget", v)}
        />
        <FormField
          as="select"
          label="How did you hear about us?"
          value={values.source ?? ""}
          error={errors.source}
          options={SOURCE_OPTIONS}
          placeholderOption="Select an option"
          onChange={(v) => setField("source", v)}
        />
      </div>

      {/* Honeypot — hidden from people, tempting to bots. Never rendered visibly. */}
      <div aria-hidden="true" className="absolute h-0 w-0 overflow-hidden opacity-0">
        <label htmlFor="website-field">Website</label>
        <input
          id="website-field"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={values.website ?? ""}
          onChange={(e) => setField("website", e.target.value)}
        />
      </div>

      {status === "error" && errorMessage && (
        <div className="mt-6">
          <FormError message={errorMessage} />
        </div>
      )}

      <div className="mt-7 flex flex-wrap items-center gap-4">
        <Button
          type="submit"
          size="md"
          disabled={isSubmitting}
          className="group/btn uppercase tracking-wide"
          icon={isSubmitting ? <Spinner /> : <ArrowIcon />}
        >
          {isSubmitting ? "Sending" : "Submit Enquiry"}
        </Button>
        <p className="text-xs text-text-faint">Fields marked * are required.</p>
      </div>
    </form>
  );
}

function Spinner() {
  return (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="none" className="animate-spin" aria-hidden="true">
      <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeOpacity="0.25" strokeWidth="2" />
      <path d="M14.5 8A6.5 6.5 0 008 1.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
