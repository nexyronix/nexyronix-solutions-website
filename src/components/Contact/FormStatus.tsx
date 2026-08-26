import { Button } from "@/components/ui/Button";

interface FormSuccessProps {
  onReset: () => void;
}

export function FormSuccess({ onReset }: FormSuccessProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="flex flex-col items-center rounded-2xl border border-accent-cyan/40 bg-surface/60 p-10 text-center backdrop-blur-sm"
    >
      <span className="flex h-14 w-14 items-center justify-center rounded-full border border-accent-cyan/50 bg-accent-cyan/10">
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M5 12.5l4.5 4.5L19 7.5"
            stroke="#45e0e8"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>

      <h4 className="mt-6 font-display text-display-sm font-semibold uppercase text-text">
        Thank you.
      </h4>
      <p className="mt-3 max-w-sm text-sm leading-relaxed text-text-muted">
        Your enquiry has been received successfully. Our team will review your message and get
        back to you.
      </p>

      <Button variant="secondary" size="md" className="mt-7 uppercase tracking-wide" onClick={onReset}>
        Send Another Enquiry
      </Button>
    </div>
  );
}

interface FormErrorProps {
  message: string;
}

/** Submission-level error. Field-level errors render inline on the fields themselves. */
export function FormError({ message }: FormErrorProps) {
  return (
    <div
      role="alert"
      className="rounded-lg border border-red-400/40 bg-red-400/5 px-4 py-3 text-sm text-red-300"
    >
      {message}
    </div>
  );
}
