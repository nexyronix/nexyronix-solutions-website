import { useEffect, useState } from "react";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { cn } from "@/lib/cn";

/**
 * Pre-hydration shell, rendered by React itself. Unmounts on the first
 * effect flush after mount, so it only shows for as long as React takes
 * to commit the real app — no artificial delay.
 */
export function BootScreen() {
  const [visible, setVisible] = useState(true);
  const reducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    setVisible(false);
  }, []);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-bg">
      <div className="text-center">
        <div className="font-display text-lg font-semibold tracking-tight text-text">NEXYRONIX</div>
        <div className="mx-auto mt-4 h-px w-[110px] overflow-hidden bg-border">
          <div className={cn("h-px w-2/5 bg-accent-cyan", !reducedMotion && "animate-boot")} />
        </div>
      </div>
    </div>
  );
}
