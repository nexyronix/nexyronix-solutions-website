import { InternshipHero } from "./InternshipHero";
import { StudentJourney } from "./StudentJourney";
import { InternshipDomains } from "./InternshipDomains";
import { InternshipBenefits } from "./InternshipBenefits";
import { InternshipCTA } from "./InternshipCTA";

export function Internship() {
  return (
    <section id="internships" className="scroll-mt-20 relative border-t border-border bg-bg py-section-y">
      <InternshipHero />
      <StudentJourney />
      <InternshipDomains />
      <InternshipBenefits />
      <InternshipCTA />
    </section>
  );
}
