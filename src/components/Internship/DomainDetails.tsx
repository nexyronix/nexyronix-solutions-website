import { DomainIconGlyph } from "./DomainIconGlyph";
import type { InternshipDomain } from "@/data/internshipDomains";

interface DomainDetailsProps {
  domain: InternshipDomain;
}

export function DomainDetails({ domain }: DomainDetailsProps) {
  return (
    <div
      id={`domain-detail-${domain.id}`}
      className="rounded-xl border border-accent-cyan/30 bg-surface/70 p-6 backdrop-blur-sm"
    >
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-accent-cyan/50 bg-accent-cyan/5">
          <DomainIconGlyph icon={domain.icon} />
        </span>
        <h4 className="font-display text-lg font-semibold text-text">{domain.name}</h4>
      </div>

      <p className="mt-4 text-sm text-text-muted sm:text-base">{domain.description}</p>

      <div className="mt-5">
        <p className="label-eyebrow mb-2.5">Possible Learning Areas</p>
        <div className="flex flex-wrap gap-2">
          {domain.areas.map((area) => (
            <span
              key={area}
              className="rounded-pill border border-border bg-bg/50 px-2.5 py-1 text-xs text-text-muted"
            >
              {area}
            </span>
          ))}
        </div>
        <p className="mt-4 text-xs leading-relaxed text-text-faint">
          Areas vary by project, availability and individual progress. Not every area applies to
          every internship.
        </p>
      </div>
    </div>
  );
}
