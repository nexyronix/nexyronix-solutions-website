import { useState } from "react";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { ProcessTimeline } from "./ProcessTimeline";
import { ProcessStage } from "./ProcessStage";
import { ProcessVisual } from "./ProcessVisual";
import { PROCESS_STAGES, type ProcessStageData } from "./processData";
import { useInViewOnce } from "@/hooks/useInView";
import { cn } from "@/lib/cn";
import { ArrowIcon } from "@/components/ui/ArrowIcon";

const REVEAL = "transition-all duration-700 ease-signature";


export function Process() {
  const { ref, inView } = useInViewOnce<HTMLElement>();
  const revealed = inView ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0";

  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const activeIndex = hoverIndex ?? 0;
  const activeStage = PROCESS_STAGES[activeIndex];

  return (
    <section id="process" ref={ref} className="scroll-mt-20 relative border-t border-border bg-bg-secondary py-section-y">
      <Container size="page">
        <div className="max-w-2xl">
          <p className={cn("label-eyebrow", REVEAL, revealed)}>Our Process</p>
          <h2
            className={cn("mt-4 font-display text-display-md font-semibold uppercase text-text", REVEAL, revealed)}
            style={{ transitionDelay: "80ms" }}
          >
            From Idea to Impact.
          </h2>
          <p
            className={cn("mt-5 text-base text-text-muted sm:text-lg", REVEAL, revealed)}
            style={{ transitionDelay: "160ms" }}
          >
            Great software starts with understanding the problem. We turn requirements into
            thoughtful designs, reliable technology and continuously improving digital products.
          </p>
        </div>

        {/* Desktop — hover timeline drives a shared detail panel */}
        <div className={cn("mt-16 hidden lg:block", REVEAL, revealed)} style={{ transitionDelay: "240ms" }}>
          <ProcessTimeline stages={PROCESS_STAGES} activeIndex={activeIndex} onHover={setHoverIndex} />

          <div className="mt-12 grid grid-cols-12 items-center gap-10 rounded-2xl border border-border bg-surface/40 p-10 backdrop-blur-sm">
            <ProcessStage stage={activeStage} className="col-span-7" />
            <div className="col-span-5 flex items-center justify-center">
              <ProcessVisual stageIndex={activeIndex} size="lg" />
            </div>
          </div>
        </div>

        {/* Mobile/tablet — vertical journey, every stage fully readable without any interaction */}
        <div className="mt-14 space-y-8 lg:hidden">
          {PROCESS_STAGES.map((stage, i) => (
            <MobileStage key={stage.id} stage={stage} index={i} isLast={i === PROCESS_STAGES.length - 1} />
          ))}
        </div>

        {/* CTA */}
        <div
          className={cn("mt-20 flex flex-col items-center gap-5 text-center", REVEAL, revealed)}
          style={{ transitionDelay: "320ms" }}
        >
          <h3 className="font-display text-display-sm font-semibold uppercase text-text sm:text-display-md">
            Ready to Build Something?
          </h3>
          <p className="max-w-md text-base text-text-muted">
            Whether you have a complete requirement or just an idea, the journey can start with a
            conversation.
          </p>
          <Button href="#contact" size="md" className="group/btn mt-2 uppercase tracking-wide" icon={<ArrowIcon />}>
            Start a Project
          </Button>
        </div>
      </Container>
    </section>
  );
}

interface MobileStageProps {
  stage: ProcessStageData;
  index: number;
  isLast: boolean;
}

function MobileStage({ stage, index, isLast }: MobileStageProps) {
  const { ref, inView } = useInViewOnce<HTMLDivElement>(0.25);

  return (
    <div ref={ref} className="relative flex gap-5">
      <div className="flex flex-col items-center">
        <span
          className={cn(
            "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 font-mono text-[11px] transition-all duration-500",
            inView ? "border-accent-cyan bg-accent-cyan/10 text-text" : "border-border text-text-faint"
          )}
        >
          {stage.number}
        </span>
        {!isLast && <span className="mt-1 w-px flex-1 bg-border" aria-hidden="true" />}
      </div>

      <div
        className={cn(
          "flex-1 pb-2 transition-all duration-700 ease-signature",
          inView ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
        )}
      >
        <div className="mb-3">
          <ProcessVisual stageIndex={index} size="sm" />
        </div>
        <ProcessStage stage={stage} variant="compact" hideNumber />
      </div>
    </div>
  );
}
