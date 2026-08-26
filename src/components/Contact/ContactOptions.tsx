import { ArrowIcon } from "@/components/ui/ArrowIcon";
import { cn } from "@/lib/cn";

export interface ContactOption {
  id: string;
  title: string;
  description: string;
  cta: string;
  /** Enquiry type preselected in the form when this path is chosen. */
  enquiryType: string;
  accent: "cyan" | "primary" | "violet";
}

export const CONTACT_OPTIONS: ContactOption[] = [
  {
    id: "project",
    title: "Start a Project",
    description:
      "For businesses, organizations and individuals looking for software or digital solutions.",
    cta: "Start a Project",
    enquiryType: "Software Development",
    accent: "cyan",
  },
  {
    id: "internship",
    title: "Internship",
    description: "For students interested in internship opportunities.",
    cta: "Internship Enquiry",
    enquiryType: "Internship",
    accent: "primary",
  },
  {
    id: "general",
    title: "General Enquiry",
    description: "For other questions or collaboration opportunities.",
    cta: "Send an Enquiry",
    enquiryType: "General Enquiry",
    accent: "violet",
  },
];

interface ContactOptionsProps {
  activeId: string;
  onSelect: (option: ContactOption) => void;
  revealed: boolean;
}

const ACCENT_RULE: Record<ContactOption["accent"], string> = {
  cyan: "bg-accent-cyan",
  primary: "bg-accent-primary",
  violet: "bg-accent-violet",
};

export function ContactOptions({ activeId, onSelect, revealed }: ContactOptionsProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {CONTACT_OPTIONS.map((option, i) => {
        const isActive = option.id === activeId;
        return (
          <button
            key={option.id}
            type="button"
            onClick={() => onSelect(option)}
            aria-pressed={isActive}
            style={{ transitionDelay: `${i * 80}ms` }}
            className={cn(
              "group relative flex flex-col overflow-hidden rounded-xl border p-6 text-left backdrop-blur-sm",
              "transition-all duration-500 ease-signature hover:-translate-y-1 hover:bg-surface",
              isActive
                ? "border-accent-cyan/50 bg-surface"
                : "border-border bg-surface/40 hover:border-accent-primary/50",
              revealed ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
            )}
          >
            <span
              className={cn("absolute left-6 top-0 h-px w-12", ACCENT_RULE[option.accent])}
              aria-hidden="true"
            />

            <h4 className="font-display text-base font-semibold uppercase text-text">
              {option.title}
            </h4>
            <p className="mt-2.5 flex-1 text-sm leading-relaxed text-text-muted">
              {option.description}
            </p>

            <span className="group/btn mt-5 inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.14em] text-accent-cyan">
              {option.cta}
              <ArrowIcon />
            </span>
          </button>
        );
      })}
    </div>
  );
}
