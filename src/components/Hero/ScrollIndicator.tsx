interface ScrollIndicatorProps {
  targetId: string;
}

export function ScrollIndicator({ targetId }: ScrollIndicatorProps) {
  return (
    <a
      href={`#${targetId}`}
      className="group absolute inset-x-0 bottom-8 z-20 mx-auto flex w-fit flex-col items-center gap-3 font-mono text-[10px] uppercase tracking-[0.18em] text-text-faint transition-colors duration-300 hover:text-text-muted"
    >
      <span>Scroll to Explore</span>
      <span className="relative h-10 w-px overflow-hidden bg-border">
        <span className="absolute inset-x-0 top-0 h-3 w-px animate-scroll-cue bg-accent-cyan" />
      </span>
    </a>
  );
}
