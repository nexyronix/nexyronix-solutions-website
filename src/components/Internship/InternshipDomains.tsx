import { useState } from "react";
import { Container } from "@/components/ui/Container";
import { DomainCard } from "./DomainCard";
import { DomainDetails } from "./DomainDetails";
import { INTERNSHIP_DOMAINS, DOMAIN_GROUPS, type DomainGroup } from "@/data/internshipDomains";
import { useInViewOnce } from "@/hooks/useInView";
import { cn } from "@/lib/cn";

const REVEAL = "transition-all duration-700 ease-signature";

// Progressive disclosure rather than dumping every domain in one grid — the
// technology group alone runs to 14 cards, which is a lot to scroll past
// before reaching the rest of the page. Same cards, same grid, just fewer
// shown until asked for.
const INITIAL_VISIBLE = 8;

export function InternshipDomains() {
  const { ref, inView } = useInViewOnce<HTMLDivElement>();
  const revealed = inView ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0";

  const [group, setGroup] = useState<DomainGroup>("technology");
  const [openId, setOpenId] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);

  const allDomains = INTERNSHIP_DOMAINS.filter((d) => d.group === group);
  const domains = showAll ? allDomains : allDomains.slice(0, INITIAL_VISIBLE);
  const hiddenCount = allDomains.length - domains.length;
  const openDomain = allDomains.find((d) => d.id === openId) ?? null;

  function handleToggle(id: string) {
    setOpenId((current) => (current === id ? null : id));
  }

  function handleGroupChange(next: DomainGroup) {
    setGroup(next);
    setOpenId(null); // avoid leaving a detail panel open for a now-hidden card
    setShowAll(false);
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

        {hiddenCount > 0 && (
          <div className="mt-6 flex justify-center">
            <button
              type="button"
              onClick={() => setShowAll(true)}
              className="rounded-pill border border-border px-5 py-2.5 font-mono text-xs uppercase tracking-[0.12em] text-text-muted transition-colors duration-200 hover:border-border-strong hover:text-text"
            >
              Show all {allDomains.length} domains
            </button>
          </div>
        )}

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
