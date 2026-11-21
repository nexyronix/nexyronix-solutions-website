import { useEffect, useRef, useState, type RefObject } from "react";

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

/**
 * Live viewport tracking for an existing element ref, used to drive the 3D
 * scenes: `near` follows the element in and out of the viewport expanded by
 * `rootMargin` (so work can resume shortly BEFORE the element is visible),
 * and `seen` latches true the first time it is near. Without
 * IntersectionObserver support both are reported true, which keeps the
 * previous always-on behaviour.
 */
export function useViewportPresence<T extends Element>(
  ref: RefObject<T>,
  rootMargin = "0px",
  initiallyNear = false
) {
  const [state, setState] = useState({ near: initiallyNear, seen: initiallyNear });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      setState({ near: true, seen: true });
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) =>
        setState((current) =>
          entry.isIntersecting
            ? current.near && current.seen
              ? current
              : { near: true, seen: true }
            : current.near
              ? { near: false, seen: current.seen }
              : current
        ),
      { rootMargin }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [ref, rootMargin]);

  return state;
}
