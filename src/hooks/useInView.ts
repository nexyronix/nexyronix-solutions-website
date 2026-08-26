import { useEffect, useRef, useState } from "react";

/**
 * Fires once when the observed element first enters the viewport, then
 * disconnects. Used to gate scroll-reveal animations without re-triggering
 * them every time the user scrolls back up and down past a section.
 */
export function useInViewOnce<T extends HTMLElement>(threshold = 0.15) {
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || inView) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [inView, threshold]);

  return { ref, inView };
}
