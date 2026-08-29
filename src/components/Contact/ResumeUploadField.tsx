import { useId, useRef, useState } from "react";
import {
  RESUME_ALLOWED_EXTENSIONS,
  RESUME_MAX_BYTES,
  type ResumeAttachment,
} from "@/shared/enquiry";
import { cn } from "@/lib/cn";

interface ResumeUploadFieldProps {
  value: ResumeAttachment | null;
  /** Server-side error, surfaced after submission. Client-side selection errors are handled locally. */
  error?: string;
  onChange: (file: ResumeAttachment | null) => void;
}

const ACCEPT = RESUME_ALLOWED_EXTENSIONS.map((ext) => `.${ext}`).join(",");
const MAX_MB = RESUME_MAX_BYTES / (1024 * 1024);

function formatSize(bytes: number): string {
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function readAsBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      // reader.result is "data:<mime>;base64,<data>" — only the data is sent.
      const result = reader.result as string;
      const commaIndex = result.indexOf(",");
      resolve(commaIndex >= 0 ? result.slice(commaIndex + 1) : result);
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

/**
 * Client-side checks are a fast UX courtesy only — the server re-validates
 * extension, declared MIME type, actual file signature and size before
 * this ever reaches an email (see api/contact.ts). A user can trivially
 * bypass anything checked only here.
 */
function describeSelectionError(file: File): string | null {
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
  if (!RESUME_ALLOWED_EXTENSIONS.includes(ext as (typeof RESUME_ALLOWED_EXTENSIONS)[number])) {
    return "Please upload a PDF, DOC or DOCX file.";
  }
  if (file.size > RESUME_MAX_BYTES) {
    return `Please keep your resume under ${MAX_MB} MB.`;
  }
  return null;
}

export function ResumeUploadField({ value, error, onChange }: ResumeUploadFieldProps) {
  const id = useId();
  const errorId = `${id}-error`;
  const inputRef = useRef<HTMLInputElement>(null);
  const [localError, setLocalError] = useState<string | null>(null);
  const [selectedName, setSelectedName] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<number | null>(null);

  const shownError = localError ?? error;

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const issue = describeSelectionError(file);
    if (issue) {
      setLocalError(issue);
      setSelectedName(null);
      setSelectedSize(null);
      onChange(null);
      e.target.value = "";
      return;
    }

    setLocalError(null);
    setSelectedName(file.name);
    setSelectedSize(file.size);

    try {
      const base64 = await readAsBase64(file);
      onChange({ filename: file.name, mimeType: file.type, base64 });
    } catch {
      setLocalError("We couldn't read that file. Please try again.");
      setSelectedName(null);
      setSelectedSize(null);
      onChange(null);
      e.target.value = "";
    }
  }

  function handleRemove() {
    setSelectedName(null);
    setSelectedSize(null);
    setLocalError(null);
    onChange(null);
    if (inputRef.current) inputRef.current.value = "";
  }

  return (
    <div className="sm:col-span-2">
      <label htmlFor={id} className="mb-2 block font-mono text-[11px] uppercase tracking-[0.12em] text-text-muted">
        Resume
        <span className="ml-2 normal-case tracking-normal text-text-faint">(optional)</span>
      </label>

      {value && selectedName ? (
        <div
          className={cn(
            "flex items-center justify-between gap-3 rounded-lg border bg-bg/60 px-4 py-3",
            shownError ? "border-red-400/60" : "border-border"
          )}
        >
          <div className="flex min-w-0 items-center gap-2.5">
            <FileIcon />
            <div className="min-w-0">
              <p className="truncate text-sm text-text">{selectedName}</p>
              {selectedSize !== null && (
                <p className="text-xs text-text-faint">{formatSize(selectedSize)}</p>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={handleRemove}
            className="shrink-0 text-xs text-text-faint transition-colors duration-200 hover:text-text"
          >
            Remove
          </button>
        </div>
      ) : (
        <label
          htmlFor={id}
          className={cn(
            "flex h-12 cursor-pointer items-center justify-between rounded-lg border bg-bg/60 px-4 text-sm transition-all duration-200",
            "text-text-faint hover:border-border-strong",
            shownError ? "border-red-400/60" : "border-border"
          )}
        >
          <span>Choose a file — PDF, DOC or DOCX, up to {MAX_MB} MB</span>
          <span className="shrink-0 font-mono text-[10px] uppercase tracking-[0.14em] text-accent-cyan">
            Browse
          </span>
        </label>
      )}

      <input
        ref={inputRef}
        id={id}
        type="file"
        accept={ACCEPT}
        aria-invalid={Boolean(shownError)}
        aria-describedby={shownError ? errorId : undefined}
        onChange={handleFileChange}
        className="sr-only"
      />

      {shownError && (
        <p id={errorId} className="mt-1.5 text-xs text-red-400">
          {shownError}
        </p>
      )}
    </div>
  );
}

function FileIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" className="shrink-0 text-accent-cyan" aria-hidden="true">
      <path
        d="M10.5 1.5H4.5a1 1 0 00-1 1v13a1 1 0 001 1h9a1 1 0 001-1V6l-4-4.5z"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M10.5 1.5V6h4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
