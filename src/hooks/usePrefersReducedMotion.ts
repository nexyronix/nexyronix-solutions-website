import { useEffect, useState } from "react";

const QUERY = "(prefers-reduced-motion: reduce)";

/**
 * Tracks the user's reduced-motion preference, including live changes.
 *
 * Read synchronously on the first render (this is a client-only app — there
 * is no server render to mismatch). Starting from `false` and correcting it
 * in an effect meant the first render briefly took the motion path, which
 * was enough to start downloading the three.js chunk for visitors who had
 * asked for reduced motion.
 */
export function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(() => typeof window !== "undefined" && window.matchMedia(QUERY).matches);

  useEffect(() => {
    const mql = window.matchMedia(QUERY);
    setReduced(mql.matches);
    const onChange = (e: MediaQueryListEvent) => setReduced(e.matches);
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, []);

  return reduced;
}
