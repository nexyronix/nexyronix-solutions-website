import { useState } from "react";
import { Container } from "@/components/ui/Container";
import { COMPANY_PILLARS } from "@/data/company";
import { useInViewOnce } from "@/hooks/useInView";
import { cn } from "@/lib/cn";

const CYAN = "#45e0e8";
const PRIMARY = "#2e7cf6";
const BORDER = "#232c3b";

const REVEAL = "transition-all duration-700 ease-signature";

const CENTER = 160;
const RADIUS = 105;

export function CompanyPillars() {
  const { ref, inView } = useInViewOnce<HTMLDivElement>();
  const revealed = inView ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0";

  const [activeId, setActiveId] = useState<string | null>(null);

  return (
    <div ref={ref} className="mt-section-y">
      <Container size="page">
        <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-14">
          {/* Visual */}
          <div className={cn("lg:col-span-6", REVEAL, revealed)}>
            <div className="relative mx-auto max-w-[420px]">
              <svg viewBox="0 0 320 320" width="100%" height="100%" fill="none" role="presentation">
                {COMPANY_PILLARS.map((pillar, i) => {
                  const angle = (i / COMPANY_PILLARS.length) * Math.PI * 2 - Math.PI / 2;
                  const x = CENTER + Math.cos(angle) * RADIUS;
                  const y = CENTER + Math.sin(angle) * RADIUS;
                  const isActive = pillar.id === activeId;

                  return (
                    <g
                      key={pillar.id}
                      onMouseEnter={() => setActiveId(pillar.id)}
                      onMouseLeave={() => setActiveId(null)}
                      className="cursor-pointer"
                    >
                      <line
                        x1={CENTER}
                        y1={CENTER}
                        x2={x}
                        y2={y}
                        stroke={isActive ? CYAN : BORDER}
                        strokeWidth="1"
                        strokeOpacity={isActive ? 0.8 : 0.6}
                        className="transition-all duration-300"
                      />
                      <circle cx={x} cy={y} r="26" fill="transparent" />
                      {isActive && (
                        <circle
                          cx={x}
                          cy={y}
                          r="22"
                          fill="none"
                          stroke={CYAN}
                          strokeOpacity="0.35"
                          className="animate-pulse-slow"
                        />
                      )}
                      <circle
                        cx={x}
                        cy={y}
                        r={isActive ? 17 : 15}
                        fill="#0d1119"
                        stroke={isActive ? CYAN : PRIMARY}
                        strokeOpacity={isActive ? 0.9 : 0.5}
                        className="transition-all duration-300"
                      />
                      <text
                        x={x}
                        y={y + 3}
                        textAnchor="middle"
                        fontFamily="'JetBrains Mono', monospace"
                        fontSize="8"
                        letterSpacing="0.12em"
                        fill={isActive ? "#edf1f6" : "#93a0b4"}
                        className="pointer-events-none uppercase"
                      >
                        {pillar.name}
                      </text>
                    </g>
                  );
                })}

                {/* Core */}
                <circle cx={CENTER} cy={CENTER} r="34" fill="#0d1119" stroke={PRIMARY} strokeOpacity="0.5" />
                <circle cx={CENTER} cy={CENTER} r="20" fill={CYAN} fillOpacity="0.08" />
                <text
                  x={CENTER}
                  y={CENTER + 4}
                  textAnchor="middle"
                  fontFamily="'Space Grotesk', sans-serif"
                  fontSize="11"
                  fontWeight="600"
                  fill="#edf1f6"
                  className="pointer-events-none"
                >
                  NEXYRONIX
                </text>
              </svg>
            </div>
          </div>

          {/* Text list — always fully readable, independent of the visual */}
          <div className="lg:col-span-6">
            <ul className="space-y-3">
              {COMPANY_PILLARS.map((pillar, i) => {
                const isActive = pillar.id === activeId;
                return (
                  <li key={pillar.id}>
                    <button
                      type="button"
                      onMouseEnter={() => setActiveId(pillar.id)}
                      onMouseLeave={() => setActiveId(null)}
                      onFocus={() => setActiveId(pillar.id)}
                      onBlur={() => setActiveId(null)}
                      className={cn(
                        "w-full rounded-xl border p-5 text-left transition-all duration-300",
                        isActive
                          ? "border-accent-cyan/50 bg-surface"
                          : "border-border bg-surface/30 hover:border-border-strong",
                        REVEAL,
                        revealed
                      )}
                      style={{ transitionDelay: `${120 + i * 80}ms` }}
                    >
                      <span className="flex items-baseline gap-3">
                        <span className="font-mono text-[11px] text-text-faint">
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        <span className="font-display text-lg font-semibold text-text">{pillar.name}</span>
                      </span>
                      <span className="mt-1.5 block pl-8 text-sm text-text-muted">
                        {pillar.description}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </Container>
    </div>
  );
}
