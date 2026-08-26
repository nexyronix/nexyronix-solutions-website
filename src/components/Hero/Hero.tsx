import { Suspense, lazy, useState } from "react";
import { Container } from "@/components/ui/Container";
import { HeroContent } from "./HeroContent";
import { HeroFallback } from "./HeroFallback";
import { ScrollIndicator } from "./ScrollIndicator";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { useWebGLSupport } from "@/hooks/useWebGLSupport";
import { useDeviceTier } from "@/hooks/useDeviceTier";
import { cn } from "@/lib/cn";

// three.js / R3F / drei are a heavy chunk — only fetched when the hero
// actually needs to render 3D, and never touched by the reduced-motion
// or no-WebGL paths at all.
const HeroScene = lazy(() => import("./HeroScene").then((m) => ({ default: m.HeroScene })));

export function Hero() {
  const reducedMotion = usePrefersReducedMotion();
  const webglSupported = useWebGLSupport();
  const tier = useDeviceTier();
  const [sceneReady, setSceneReady] = useState(false);

  const canRender3D = webglSupported && !reducedMotion;

  return (
    <section id="home" className="relative min-h-[100svh] overflow-hidden pt-18">
      {/* Layer 0 — 3D scene (or its static, motion-free substitute). Shifted right on
          larger screens so the sphere and its orbit nodes clear the hero copy instead
          of sitting behind it. */}
      <div className="absolute inset-0 xl:translate-x-[170px] 2xl:translate-x-[260px]">
        {canRender3D ? (
          <>
            <HeroFallback />
            <Suspense fallback={null}>
              <div
                className={cn(
                  "absolute inset-0 transition-opacity duration-700 ease-signature",
                  sceneReady ? "opacity-100" : "opacity-0"
                )}
              >
                <HeroScene tier={tier} onReady={() => setSceneReady(true)} />
              </div>
            </Suspense>
          </>
        ) : (
          <HeroFallback />
        )}
      </div>

      {/* Layer 1 — quiet grid + atmospheric fade, purely decorative, cheap CSS */}
      <div className="pointer-events-none absolute inset-0 bg-grid-overlay bg-grid opacity-[0.04]" />
      <div className="pointer-events-none absolute inset-0 bg-radial-fade" />

      {/* Layer 2 — content, always interactive regardless of what layer 0 rendered */}
      <Container size="page" className="relative flex min-h-[100svh] flex-col justify-center py-24">
        <HeroContent />
      </Container>

      <ScrollIndicator targetId="solutions" />
    </section>
  );
}
