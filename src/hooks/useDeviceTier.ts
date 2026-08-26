import { useEffect, useState } from "react";

export type DeviceTier = "high" | "medium" | "low";

function computeTier(): DeviceTier {
  if (typeof window === "undefined") return "medium";

  const width = window.innerWidth;
  const cores = navigator.hardwareConcurrency ?? 4;
  const coarsePointer = window.matchMedia("(pointer: coarse)").matches;

  if (width < 640 || (coarsePointer && cores <= 4)) return "low";
  if (width < 1024 || cores <= 4) return "medium";
  return "high";
}

/**
 * Coarse device-capability signal (screen width + core count + pointer type)
 * used to scale particle counts, node counts, and geometry detail in the
 * hero scene. Re-evaluated on resize (covers orientation changes / devtools
 * responsive mode) but intentionally not on every pixel of resize churn.
 */
export function useDeviceTier(): DeviceTier {
  const [tier, setTier] = useState<DeviceTier>(computeTier);

  useEffect(() => {
    let frame: number;
    const onResize = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => setTier(computeTier()));
    };
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
      cancelAnimationFrame(frame);
    };
  }, []);

  return tier;
}
