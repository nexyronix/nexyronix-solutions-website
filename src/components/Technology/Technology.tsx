import { useState } from "react";
import { Container } from "@/components/ui/Container";
import { FilterPill } from "@/components/ui/FilterPill";
import { TechnologyConstellation } from "./TechnologyConstellation";
import { TechnologyCategoryFilter } from "./TechnologyCategoryFilter";
import { TechnologyGrid } from "./TechnologyGrid";
import { TechnologyDetails } from "./TechnologyDetails";
import { TechIconGlyph } from "./TechIconGlyph";
import { FEATURED_TECHNOLOGIES, TECHNOLOGIES, type TechCategoryId } from "@/data/technologies";
import { useInViewOnce } from "@/hooks/useInView";
import { cn } from "@/lib/cn";

const REVEAL = "transition-all duration-700 ease-signature";

export function Technology() {
  const { ref, inView } = useInViewOnce<HTMLElement>();
  const revealed = inView ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0";

  const [activeCategory, setActiveCategory] = useState<TechCategoryId | "all">("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const selected = TECHNOLOGIES.find((t) => t.id === selectedId) ?? null;

  function handleSelect(id: string) {
    setSelectedId((current) => (current === id ? null : id));
  }

  function handleCategoryChange(category: TechCategoryId | "all") {
    setActiveCategory(category);
    // Drop a selection that's no longer visible under the new filter
    setSelectedId((current) => {
      if (!current || category === "all") return current;
      const tech = TECHNOLOGIES.find((t) => t.id === current);
      return tech && tech.category === category ? current : null;
    });
  }

  return (
    <section id="technology" ref={ref} className="scroll-mt-20 relative border-t border-border bg-bg-secondary py-section-y">
      <Container size="page">
        <div className="max-w-2xl">
          <p className={cn("label-eyebrow", REVEAL, revealed)}>The Technology Behind the Vision</p>
          <h2
            className={cn("mt-4 font-display text-display-md font-semibold uppercase text-text", REVEAL, revealed)}
            style={{ transitionDelay: "80ms" }}
          >
            Built with modern technology.
          </h2>
          <p
            className={cn("mt-5 text-base text-text-muted sm:text-lg", REVEAL, revealed)}
            style={{ transitionDelay: "160ms" }}
          >
            We work with modern development technologies and platforms to create scalable digital
            products and solutions.
          </p>
        </div>

        {/* Selected technologies */}
        <div className={cn("mt-10", REVEAL, revealed)} style={{ transitionDelay: "220ms" }}>
          <p className="label-eyebrow mb-3">Selected Technologies</p>
          <div className="flex flex-wrap gap-2">
            {FEATURED_TECHNOLOGIES.map((tech) => (
              <FilterPill
                key={tech.id}
                variant="chip"
                active={selectedId === tech.id}
                onClick={() => handleSelect(tech.id)}
              >
                <TechIconGlyph icon={tech.icon} size={14} />
                {tech.name}
              </FilterPill>
            ))}
          </div>
        </div>

        {/* Constellation + detail */}
        <div
          className={cn("mt-14 grid gap-8 lg:grid-cols-12", REVEAL, revealed)}
          style={{ transitionDelay: "280ms" }}
        >
          <div className="lg:col-span-7">
            <div className="relative overflow-hidden rounded-2xl border border-border bg-surface/25 p-4 backdrop-blur-sm">
              <div className="pointer-events-none absolute inset-0 bg-grid-overlay bg-grid opacity-[0.04]" />
              <div className="relative mx-auto aspect-square w-full max-w-[460px]">
                <TechnologyConstellation
                  activeCategory={activeCategory}
                  selected={selected}
                  onSelectCategory={handleCategoryChange}
                />
              </div>
            </div>
          </div>

          <div className="flex items-center lg:col-span-5">
            {selected ? (
              <div className="w-full animate-fade-up">
                <TechnologyDetails technology={selected} />
              </div>
            ) : (
              <div className="w-full rounded-xl border border-dashed border-border p-6">
                <p className="text-sm text-text-faint">
                  Select a technology below — or a cluster in the constellation — to see how it fits
                  into the wider system.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Filter + grid */}
        <div className={cn("mt-14", REVEAL, revealed)} style={{ transitionDelay: "340ms" }}>
          <TechnologyCategoryFilter active={activeCategory} onChange={handleCategoryChange} />
        </div>

        <div className="mt-6">
          <TechnologyGrid
            activeCategory={activeCategory}
            selectedId={selectedId}
            onSelect={handleSelect}
            revealed={inView}
          />
        </div>
      </Container>
    </section>
  );
}
