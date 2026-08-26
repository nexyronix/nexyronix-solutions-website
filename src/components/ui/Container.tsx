import { cn } from "@/lib/cn";
import type { HTMLAttributes } from "react";

interface ContainerProps extends HTMLAttributes<HTMLDivElement> {
  /** Narrower measure for text-heavy sections. Defaults to the standard content width. */
  size?: "content" | "page";
}

/**
 * Global width + gutter primitive. Every section should nest its content
 * inside a Container instead of hardcoding max-width/padding, so page
 * width can be tuned once here for the whole site.
 */
export function Container({ size = "content", className, children, ...props }: ContainerProps) {
  return (
    <div
      className={cn(
        "mx-auto w-full px-5 sm:px-8 lg:px-12",
        size === "content" ? "max-w-content" : "max-w-page",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
