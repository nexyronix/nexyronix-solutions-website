import { useId } from "react";
import { cn } from "@/lib/cn";

type BaseProps = {
  label: string;
  error?: string;
  required?: boolean;
  hint?: string;
  className?: string;
};

type InputProps = BaseProps & {
  as?: "input";
  type?: string;
  value: string;
  placeholder?: string;
  autoComplete?: string;
  onChange: (value: string) => void;
};

type TextareaProps = BaseProps & {
  as: "textarea";
  value: string;
  placeholder?: string;
  rows?: number;
  onChange: (value: string) => void;
};

type SelectProps = BaseProps & {
  as: "select";
  value: string;
  options: readonly string[];
  placeholderOption: string;
  onChange: (value: string) => void;
};

type FormFieldProps = InputProps | TextareaProps | SelectProps;

const controlBase =
  "w-full rounded-lg border bg-bg/60 px-4 text-text placeholder:text-text-faint " +
  "transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-accent-cyan/40";

/**
 * Every field gets a real <label> tied to the control by id. Placeholders are
 * supplementary only — never the sole label, which would disappear the moment
 * a user starts typing and leaves screen-reader users with nothing.
 */
export function FormField(props: FormFieldProps) {
  const id = useId();
  const errorId = `${id}-error`;
  const hintId = `${id}-hint`;
  const { label, error, required, hint, className } = props;

  const describedBy = [error ? errorId : null, hint ? hintId : null].filter(Boolean).join(" ");

  const controlClasses = cn(
    controlBase,
    error ? "border-red-400/60 focus:ring-red-400/30" : "border-border focus:border-accent-cyan/50"
  );

  return (
    <div className={className}>
      <label htmlFor={id} className="mb-2 block font-mono text-[11px] uppercase tracking-[0.12em] text-text-muted">
        {label}
        {required ? (
          <span className="ml-1 text-accent-cyan" aria-hidden="true">
            *
          </span>
        ) : (
          <span className="ml-2 normal-case tracking-normal text-text-faint">(optional)</span>
        )}
      </label>

      {props.as === "textarea" ? (
        <textarea
          id={id}
          value={props.value}
          rows={props.rows ?? 5}
          placeholder={props.placeholder}
          required={required}
          aria-invalid={Boolean(error)}
          aria-describedby={describedBy || undefined}
          onChange={(e) => props.onChange(e.target.value)}
          className={cn(controlClasses, "resize-y py-3 leading-relaxed")}
        />
      ) : props.as === "select" ? (
        <select
          id={id}
          value={props.value}
          required={required}
          aria-invalid={Boolean(error)}
          aria-describedby={describedBy || undefined}
          onChange={(e) => props.onChange(e.target.value)}
          className={cn(controlClasses, "h-12 appearance-none pr-10", !props.value && "text-text-faint")}
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' fill='none'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%23576076' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E\")",
            backgroundRepeat: "no-repeat",
            backgroundPosition: "right 1rem center",
          }}
        >
          <option value="">{props.placeholderOption}</option>
          {props.options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      ) : (
        <input
          id={id}
          type={props.type ?? "text"}
          value={props.value}
          placeholder={props.placeholder}
          autoComplete={props.autoComplete}
          required={required}
          aria-invalid={Boolean(error)}
          aria-describedby={describedBy || undefined}
          onChange={(e) => props.onChange(e.target.value)}
          className={cn(controlClasses, "h-12")}
        />
      )}

      {hint && !error && (
        <p id={hintId} className="mt-1.5 text-xs text-text-faint">
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} className="mt-1.5 text-xs text-red-400">
          {error}
        </p>
      )}
    </div>
  );
}
