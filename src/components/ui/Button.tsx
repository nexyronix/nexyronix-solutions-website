import { cn } from "@/lib/cn";
import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost";
type Size = "md" | "sm";

const base =
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-pill font-body font-medium " +
  "transition-all duration-300 ease-signature focus-visible:outline-2 focus-visible:outline-accent-cyan " +
  "disabled:pointer-events-none disabled:opacity-40";

const variants: Record<Variant, string> = {
  primary:
    "bg-accent-primary text-white shadow-glow-primary hover:brightness-110 hover:shadow-[0_0_0_1px_rgba(46,124,246,0.4),0_0_44px_rgba(46,124,246,0.32)] active:brightness-95",
  secondary:
    "bg-surface text-text border border-border-strong hover:border-accent-primary/60 hover:bg-surface-hover",
  ghost: "text-text-muted hover:text-text",
};

const sizes: Record<Size, string> = {
  md: "h-11 px-6 text-sm",
  sm: "h-9 px-4 text-xs",
};

interface ButtonOwnProps {
  variant?: Variant;
  size?: Size;
  icon?: ReactNode;
  href?: string;
  children?: ReactNode;
  className?: string;
}

type ButtonProps = ButtonOwnProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, keyof ButtonOwnProps> &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, keyof ButtonOwnProps>;

/** Primary interactive control for the whole site. Renders a <button>, or an <a> when `href` is passed. */
export function Button({
  variant = "primary",
  size = "md",
  icon,
  href,
  className,
  children,
  ...rest
}: ButtonProps) {
  const classes = cn(base, variants[variant], sizes[size], className);

  if (href) {
    return (
      <a href={href} className={classes} {...(rest as AnchorHTMLAttributes<HTMLAnchorElement>)}>
        {children}
        {icon}
      </a>
    );
  }

  return (
    <button className={classes} {...(rest as ButtonHTMLAttributes<HTMLButtonElement>)}>
      {children}
      {icon}
    </button>
  );
}
