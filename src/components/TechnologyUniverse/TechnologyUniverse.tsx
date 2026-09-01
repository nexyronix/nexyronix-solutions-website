import { Suspense, lazy, useState } from "react";
import { Container } from "@/components/ui/Container";
import { FilterPill } from "@/components/ui/FilterPill";
import { UniverseFallback } from "./UniverseFallback";
import { getTechNodes } from "./technologyNodesData";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { useWebGLSupport } from "@/hooks/useWebGLSupport";
import { useDeviceTier } from "@/hooks/useDeviceTier";
import { useInViewOnce } from "@/hooks/useInView";
import { cn } from "@/lib/cn";

// three.js / R3F / drei — only fetched when the scene will actually render.
const UniverseScene = lazy(() => import("./UniverseScene").then((m) => ({ default: m.UniverseScene })));

const REVEAL = "transition-all duration-700 ease-signature";
const ALL_NODES = getTechNodes(10);

export function TechnologyUniverse() {
  const { ref, inView } = useInViewOnce<HTMLElement>();
  const reducedMotion = usePrefersReducedMotion();
  const webglSupported = useWebGLSupport();
  const tier = useDeviceTier();

  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [sceneReady, setSceneReady] = useState(false);

  const canRender3D = webglSupported && !reducedMotion;
  const displayId = selectedId ?? hoveredId;
  const activeNode = ALL_NODES.find((n) => n.id === displayId) ?? null;

  const revealed = inView ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0";

  function toggleSelected(id: string) {
    setSelectedId((current) => (current === id ? null : id));
  }

  return (
    <section id="ecosystem" ref={ref} className="relative overflow-hidden border-t border-border bg-bg py-section-y">
      {/* Quiet continuity seam from the Solutions section above — a soft fade rather than a hard edge */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-bg-secondary/50 to-transparent" />

      <Container size="page" className="relative">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-10">
          {/* LEFT — intro + accessible node list (the authoritative info source, independent of 3D) */}
          <div className="lg:col-span-5">
            <p className={cn("label-eyebrow", REVEAL, revealed)}>The Nexyronix Ecosystem</p>
            <h2
              className={cn(
                "mt-4 font-display text-display-md font-semibold uppercase tracking-tight text-text",
                REVEAL,
                revealed
              )}
              style={{ transitionDelay: "80ms" }}
            >
              Everything connects.
            </h2>
            <p
              className={cn("mt-5 text-base text-text-muted sm:text-lg", REVEAL, revealed)}
              style={{ transitionDelay: "160ms" }}
            >
              Software, AI, cloud, data and digital experiences are not isolated technologies.
              They work together to create complete solutions.
            </p>

            <div className={cn("mt-10", REVEAL, revealed)} style={{ transitionDelay: "240ms" }}>
              <p className="label-eyebrow mb-3">Explore the Ecosystem</p>
              <div className="flex flex-wrap gap-2" role="group" aria-label="Technology nodes">
                {ALL_NODES.map((node) => (
                  <FilterPill
                    key={node.id}
                    active={displayId === node.id}
                    onMouseEnter={() => setHoveredId(node.id)}
                    onMouseLeave={() => setHoveredId(null)}
                    onFocus={() => setHoveredId(node.id)}
                    onBlur={() => setHoveredId(null)}
                    onClick={() => toggleSelected(node.id)}
                  >
                    {node.label}
                  </FilterPill>
                ))}
              </div>

              <div aria-live="polite" className="mt-4 min-h-[4.5rem] rounded-lg border border-border bg-surface/50 p-4">
                {activeNode ? (
                  <>
                    <p className="font-display text-sm font-semibold text-text">{activeNode.label}</p>
                    <p className="mt-1 text-sm text-text-muted">{activeNode.description}</p>
                  </>
                ) : (
                  <p className="text-sm text-text-faint">Hover, focus, or tap a node to learn more.</p>
                )}
              </div>
            </div>
          </div>

          {/* RIGHT — the 3D universe (or its static substitute) */}
          <div className="lg:col-span-7">
            <div className="relative h-[420px] overflow-hidden rounded-2xl border border-border sm:h-[520px] lg:h-[620px]">
              {canRender3D ? (
                <>
                  <div className="absolute inset-0">
                    <UniverseFallback />
                  </div>
                  <Suspense fallback={null}>
                    <div
                      className={cn(
                        "absolute inset-0 transition-opacity duration-700 ease-signature",
                        sceneReady ? "opacity-100" : "opacity-0"
                      )}
                    >
                      <UniverseScene
                        tier={tier}
                        activeId={displayId}
                        onHover={setHoveredId}
                        onSelect={toggleSelected}
                        onReady={() => setSceneReady(true)}
                      />
                    </div>
                  </Suspense>
                </>
              ) : (
                <UniverseFallback />
              )}
              <div className="pointer-events-none absolute inset-0 bg-radial-fade" />
            </div>
          </div>
        </div>

        {/* Section end */}
        <div
          className={cn("mt-16 flex flex-col items-center gap-3 text-center", REVEAL, revealed)}
          style={{ transitionDelay: "400ms" }}
        >
          <p className="max-w-2xl font-display text-base font-semibold uppercase tracking-[0.02em] text-text sm:text-lg">
            Technology is only powerful when it connects.
          </p>
          <p className="max-w-md text-sm text-text-muted">
            Nexyronix brings technologies together to create complete digital solutions.
          </p>
          <span className="relative mt-4 h-10 w-px overflow-hidden bg-border" aria-hidden="true">
            <span className="absolute inset-x-0 top-0 h-3 w-px animate-scroll-cue bg-accent-cyan" />
          </span>
        </div>
      </Container>
    </section>
  );
}
