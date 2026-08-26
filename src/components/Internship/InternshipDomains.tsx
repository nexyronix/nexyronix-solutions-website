import { useState } from "react";
import { Container } from "@/components/ui/Container";
import { DomainCard } from "./DomainCard";
import { DomainDetails } from "./DomainDetails";
import { INTERNSHIP_DOMAINS, DOMAIN_GROUPS, type DomainGroup } from "@/data/internshipDomains";
import { useInViewOnce } from "@/hooks/useInView";
import { cn } from "@/lib/cn";

const REVEAL = "transition-all duration-700 ease-signature";

export function InternshipDomains() {
  const { ref, inView } = useInViewOnce<HTMLDivElement>();
  const revealed = inView ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0";

  const [group, setGroup] = useState<DomainGroup>("technology");
  const [openId, setOpenId] = useState<string | null>(null);

  const domains = INTERNSHIP_DOMAINS.filter((d) => d.group === group);
  const openDomain = domains.find((d) => d.id === openId) ?? null;

  function handleToggle(id: string) {
    setOpenId((current) => (current === id ? null : id));
  }

  function handleGroupChange(next: DomainGroup) {
    setGroup(next);
    setOpenId(null); // avoid leaving a detail panel open for a now-hidden card
  }

  return (
    <div ref={ref} id="internship-domains" className="mt-section-y scroll-mt-24">
      <Container size="page">
        <div className="max-w-2xl">
          <p className={cn("label-eyebrow", REVEAL, revealed)}>Domains</p>
          <h3
            className={cn("mt-4 font-display text-display-sm font-semibold uppercase text-text", REVEAL, revealed)}
            style={{ transitionDelay: "80ms" }}
          >
            Explore Internship Domains
          </h3>
        </div>

        {/* Group switch */}
        <div
          className={cn("mt-8 flex flex-wrap gap-2", REVEAL, revealed)}
          style={{ transitionDelay: "160ms" }}
          role="tablist"
          aria-label="Domain groups"
        >
          {DOMAIN_GROUPS.map((g) => {
            const isActive = g.id === group;
            return (
              <button
                key={g.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => handleGroupChange(g.id)}
                className={cn(
                  "rounded-pill border px-4 py-2 font-mono text-[11px] uppercase tracking-[0.12em] transition-colors duration-200",
                  isActive
                    ? "border-accent-cyan/60 bg-surface text-text"
                    : "border-border text-text-muted hover:border-border-strong hover:text-text"
                )}
              >
                {g.label}
              </button>
            );
          })}
        </div>

        {/* Cards */}
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {domains.map((domain, i) => (
            <DomainCard
              key={domain.id}
              domain={domain}
              isOpen={openId === domain.id}
              onToggle={handleToggle}
              revealed={inView}
              delayMs={200 + i * 40}
            />
          ))}
        </div>

        {/* Detail — rendered once, below the grid, so it never reflows the card layout */}
        {openDomain && (
          <div className="mt-4 animate-fade-up">
            <DomainDetails domain={openDomain} />
          </div>
        )}
      </Container>
    </div>
  );
}
