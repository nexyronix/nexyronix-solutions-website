import { useState } from "react";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { ArrowIcon } from "@/components/ui/ArrowIcon";
import { FeaturedProject } from "./FeaturedProject";
import { ProjectFilters } from "./ProjectFilters";
import { ProjectGrid } from "./ProjectGrid";
import { CaseStudyPreview } from "./CaseStudyPreview";
import { FEATURED_PROJECT, type ProjectCategory } from "@/data/projects";
import { useInViewOnce } from "@/hooks/useInView";
import { cn } from "@/lib/cn";

const REVEAL = "transition-all duration-700 ease-signature";

export function Projects() {
  const { ref, inView } = useInViewOnce<HTMLElement>();
  const revealed = inView ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0";

  const [activeCategory, setActiveCategory] = useState<ProjectCategory | "all">("all");

  return (
    <section id="projects" ref={ref} className="scroll-mt-20 relative border-t border-border bg-bg py-section-y">
      {/* Continuity seam from the Technology Stack above — technology becomes product */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-bg-secondary/50 to-transparent"
        aria-hidden="true"
      />

      <Container size="page" className="relative">
        <div className="max-w-2xl">
          <p className={cn("label-eyebrow", REVEAL, revealed)}>Selected Work</p>
          <h2
            className={cn("mt-4 font-display text-display-md font-semibold uppercase text-text", REVEAL, revealed)}
            style={{ transitionDelay: "80ms" }}
          >
            From ideas to products.
          </h2>
          <p
            className={cn("mt-5 text-base text-text-muted sm:text-lg", REVEAL, revealed)}
            style={{ transitionDelay: "160ms" }}
          >
            Explore the types of digital experiences, applications and software platforms we can
            create.
          </p>
        </div>

        {/* Honest, up-front disclosure — stated once, plainly, before any project is shown */}
        <div
          className={cn(
            "mt-8 max-w-2xl rounded-xl border border-accent-violet/25 bg-accent-violet/5 p-4",
            REVEAL,
            revealed
          )}
          style={{ transitionDelay: "200ms" }}
        >
          <p className="text-sm leading-relaxed text-text-muted">
            <span className="font-medium text-text">These are concept pieces, not client work.</span>{" "}
            Each one illustrates the kind of product Nexyronix can build. They will be replaced with
            real projects and documented case studies as that work is completed.
          </p>
        </div>

        {/* Featured */}
        <div className="mt-12">
          <FeaturedProject project={FEATURED_PROJECT} revealed={inView} />
        </div>

        {/* Filters */}
        <div className={cn("mt-12", REVEAL, revealed)} style={{ transitionDelay: "260ms" }}>
          <ProjectFilters active={activeCategory} onChange={setActiveCategory} />
        </div>

        {/* Editorial grid */}
        <div className="mt-6">
          <ProjectGrid activeCategory={activeCategory} revealed={inView} />
        </div>

        {/* Case study architecture */}
        <div className="mt-16">
          <CaseStudyPreview revealed={inView} />
        </div>

        {/* Section statement */}
        <div className={cn("mt-20 text-center", REVEAL, revealed)} style={{ transitionDelay: "320ms" }}>
          <h3 className="mx-auto max-w-4xl font-display text-display-sm font-semibold uppercase leading-tight text-text sm:text-display-md">
            Technology becomes valuable when it solves something.
          </h3>
          <p className="mx-auto mt-4 max-w-md text-base text-text-muted">
            Every product starts with a problem worth solving.
          </p>
        </div>

        {/* CTA */}
        <div
          className={cn("mx-auto mt-14 flex max-w-md flex-col items-center gap-4 text-center", REVEAL, revealed)}
          style={{ transitionDelay: "380ms" }}
        >
          <p className="font-display text-sm font-semibold uppercase tracking-[0.08em] text-text">
            Have an idea?
          </p>
          <p className="text-sm text-text-muted">Let's explore what we can build together.</p>
          <Button href="#contact" size="md" className="group/btn mt-1 uppercase tracking-wide" icon={<ArrowIcon />}>
            Start a Project
          </Button>
        </div>
      </Container>
    </section>
  );
}
