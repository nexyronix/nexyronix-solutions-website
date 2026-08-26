import { useState } from "react";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { IndustrySelector } from "./IndustrySelector";
import { IndustryPanel } from "./IndustryPanel";
import { IndustryVisual } from "./IndustryVisual";
import { INDUSTRIES } from "./industriesData";
import { useInViewOnce } from "@/hooks/useInView";
import { cn } from "@/lib/cn";
import { ArrowIcon } from "@/components/ui/ArrowIcon";

const REVEAL = "transition-all duration-700 ease-signature";


export function Industries() {
  const { ref, inView } = useInViewOnce<HTMLElement>();
  const revealed = inView ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0";

  const [selectedId, setSelectedId] = useState(INDUSTRIES[0].id);
  const selected = INDUSTRIES.find((ind) => ind.id === selectedId) ?? INDUSTRIES[0];

  return (
    <section id="industries" ref={ref} className="scroll-mt-20 relative border-t border-border bg-bg py-section-y">
      <Container size="page">
        <div className="max-w-2xl">
          <p className={cn("label-eyebrow", REVEAL, revealed)}>Possibilities</p>
          <h2
            className={cn("mt-4 font-display text-display-md font-semibold uppercase text-text", REVEAL, revealed)}
            style={{ transitionDelay: "80ms" }}
          >
            Built for the Real World.
          </h2>
          <p
            className={cn("mt-5 text-base text-text-muted sm:text-lg", REVEAL, revealed)}
            style={{ transitionDelay: "160ms" }}
          >
            Different industries have different challenges. We build digital solutions that can
            adapt to the way organizations work.
          </p>
        </div>

        {/* Desktop — list left, matrix + panel right */}
        <div
          className={cn("mt-14 hidden gap-10 lg:grid lg:grid-cols-12", REVEAL, revealed)}
          style={{ transitionDelay: "240ms" }}
        >
          <div className="lg:col-span-4">
            <IndustrySelector
              industries={INDUSTRIES}
              selectedId={selectedId}
              onSelect={setSelectedId}
              orientation="vertical"
            />
          </div>

          <div className="lg:col-span-8">
            <div className="grid grid-cols-12 gap-8 rounded-2xl border border-border bg-surface/30 p-8 backdrop-blur-sm">
              <div className="col-span-6 flex items-center justify-center">
                <IndustryVisual industries={INDUSTRIES} selectedId={selectedId} onSelect={setSelectedId} />
              </div>
              <div className="col-span-6 flex items-center">
                <IndustryPanel industry={selected} />
              </div>
            </div>
          </div>
        </div>

        {/* Mobile/tablet — horizontal chip selector, one industry at a time */}
        <div className="mt-12 lg:hidden">
          <IndustrySelector
            industries={INDUSTRIES}
            selectedId={selectedId}
            onSelect={setSelectedId}
            orientation="horizontal"
          />

          <div className="mt-4 rounded-2xl border border-border bg-surface/30 p-6 backdrop-blur-sm">
            <div className="mb-6 flex items-center justify-center">
              <div className="h-48 w-48">
                <IndustryVisual industries={INDUSTRIES} selectedId={selectedId} onSelect={setSelectedId} />
              </div>
            </div>
            <IndustryPanel industry={selected} />
          </div>
        </div>

        {/* Section statement */}
        <div className={cn("mt-20 text-center", REVEAL, revealed)} style={{ transitionDelay: "320ms" }}>
          <h3 className="font-display text-display-sm font-semibold uppercase leading-tight text-text sm:text-display-md">
            One Technology Foundation.
            <br />
            Many Possibilities.
          </h3>
          <p className="mx-auto mt-4 max-w-lg text-base text-text-muted">
            The right digital solution starts with understanding the environment in which it will
            be used.
          </p>
        </div>

        {/* CTA */}
        <div
          className={cn("mx-auto mt-14 flex max-w-md flex-col items-center gap-4 text-center", REVEAL, revealed)}
          style={{ transitionDelay: "380ms" }}
        >
          <p className="font-display text-sm font-semibold uppercase tracking-[0.08em] text-text">
            Have a Different Industry in Mind?
          </p>
          <p className="text-sm text-text-muted">Tell us what you are trying to solve.</p>
          <Button href="#contact" size="md" className="group/btn mt-1 uppercase tracking-wide" icon={<ArrowIcon />}>
            Talk to Nexyronix
          </Button>
        </div>
      </Container>
    </section>
  );
}
