import { Container } from "@/components/ui/Container";
import { MISSION, VISION } from "@/data/company";
import { useInViewOnce } from "@/hooks/useInView";
import { cn } from "@/lib/cn";

const REVEAL = "transition-all duration-700 ease-signature";

interface StatementProps {
  label: string;
  heading: string;
  body: string;
  accent: "cyan" | "primary";
  revealed: boolean;
  delayMs: number;
}

function Statement({ label, heading, body, accent, revealed, delayMs }: StatementProps) {
  return (
    <div
      className={cn(
        "relative rounded-2xl border border-border bg-surface/30 p-8 backdrop-blur-sm sm:p-10",
        REVEAL,
        revealed ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"
      )}
      style={{ transitionDelay: `${delayMs}ms` }}
    >
      {/* Accent rule */}
      <span
        className={cn(
          "absolute left-8 top-0 h-px w-16 sm:left-10",
          accent === "cyan" ? "bg-accent-cyan" : "bg-accent-primary"
        )}
        aria-hidden="true"
      />

      <p className="label-eyebrow">{label}</p>
      <h3 className="mt-5 font-display text-display-sm font-semibold uppercase leading-tight text-text">
        {heading}
      </h3>
      <p className="mt-4 text-base leading-relaxed text-text-muted">{body}</p>
    </div>
  );
}

export function MissionVision() {
  const { ref, inView } = useInViewOnce<HTMLDivElement>();

  return (
    <div ref={ref} className="mt-section-y">
      <Container size="page">
        <div className="grid gap-5 lg:grid-cols-2">
          <Statement {...MISSION} accent="cyan" revealed={inView} delayMs={0} />
          <Statement {...VISION} accent="primary" revealed={inView} delayMs={120} />
        </div>
      </Container>
    </div>
  );
}
