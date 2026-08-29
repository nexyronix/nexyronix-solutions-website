import { CareersHero } from "./CareersHero";
import { CareersCTA } from "./CareersCTA";

export function Careers() {
  return (
    <section id="careers" className="scroll-mt-20 relative border-t border-border bg-bg-secondary py-section-y">
      <CareersHero />
      <CareersCTA />
    </section>
  );
}
