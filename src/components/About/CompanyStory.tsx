import { Container } from "@/components/ui/Container";
import { CompanyVisual } from "./CompanyVisual";
import { COMPANY_STORY, COMPANY_FACTS } from "@/data/company";
import { useInViewOnce } from "@/hooks/useInView";
import { cn } from "@/lib/cn";

const REVEAL = "transition-all duration-700 ease-signature";

export function CompanyStory() {
  const { ref, inView } = useInViewOnce<HTMLDivElement>();
  const revealed = inView ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0";

  return (
    <div ref={ref} className="mt-section-y">
      <Container size="page">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-14">
          <div className="lg:col-span-6">
            <h3
              className={cn(
                "font-display text-display-sm font-semibold uppercase leading-tight text-text sm:text-display-md",
                REVEAL,
                revealed
              )}
            >
              {COMPANY_STORY.headline}
            </h3>
          </div>

          <div className="lg:col-span-6">
            {COMPANY_STORY.paragraphs.map((paragraph, i) => (
              <p
                key={i}
                className={cn(
                  "text-base leading-relaxed text-text-muted",
                  i > 0 && "mt-5",
                  REVEAL,
                  revealed
                )}
                style={{ transitionDelay: `${100 + i * 90}ms` }}
              >
                {paragraph}
              </p>
            ))}
          </div>
        </div>

        {/* Evolution visual */}
        <div
          className={cn(
            "mt-14 overflow-x-auto rounded-2xl border border-border bg-surface/25 px-4 py-8 backdrop-blur-sm sm:px-8",
            REVEAL,
            revealed
          )}
          style={{ transitionDelay: "320ms" }}
        >
          <div className="min-w-[520px] sm:min-w-0">
            <CompanyVisual />
          </div>
        </div>

        {/* Factual company information — only what has actually been provided */}
        <dl
          className={cn("mt-10 grid gap-4 sm:grid-cols-3", REVEAL, revealed)}
          style={{ transitionDelay: "380ms" }}
        >
          {COMPANY_FACTS.map((fact) => (
            <div key={fact.label} className="rounded-xl border border-border bg-surface/40 p-5 backdrop-blur-sm">
              <dt className="label-eyebrow">{fact.label}</dt>
              <dd className="mt-2 font-display text-sm font-medium text-text">{fact.value}</dd>
            </div>
          ))}
        </dl>
      </Container>
    </div>
  );
}
