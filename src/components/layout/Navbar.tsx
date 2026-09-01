import { useEffect, useState } from "react";
import { Container } from "@/components/ui/Container";
import { Logo } from "@/components/ui/Logo";
import { Button } from "@/components/ui/Button";
import { ArrowIcon } from "@/components/ui/ArrowIcon";
import { cn } from "@/lib/cn";

const NAV_LINKS = [
  { label: "Home", href: "#home" },
  { label: "Solutions", href: "#solutions" },
  { label: "Industries", href: "#industries" },
  { label: "Internships", href: "#internships" },
  { label: "Careers", href: "#careers" },
  { label: "About", href: "#about" },
  { label: "Contact", href: "#contact" },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Lock body scroll while the mobile menu is open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-300 ease-signature",
        scrolled
          ? "bg-bg-elevated/85 backdrop-blur-md border-b border-border"
          : "bg-transparent border-b border-transparent"
      )}
    >
      <Container size="page">
        <nav className="flex h-18 items-center justify-between">
          <a href="#home" className="shrink-0" aria-label="Nexyronix Solutions — home">
            <Logo context="nav" />
          </a>

          {/* Desktop links */}
          <ul className="hidden items-center gap-9 lg:flex">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  className="font-body text-sm text-text-muted transition-colors duration-200 hover:text-text"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>

          <div className="hidden lg:block">
            <Button href="#contact" size="md" icon={<ArrowIcon />}>
              Start a Project
            </Button>
          </div>

          {/* Mobile menu toggle */}
          <button
            type="button"
            className="flex h-10 w-10 items-center justify-center rounded-md border border-border text-text lg:hidden"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((v) => !v)}
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
              {menuOpen ? (
                <path
                  d="M1 1L17 17M17 1L1 17"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              ) : (
                <>
                  <path d="M1 3.5H17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  <path d="M1 9H17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  <path d="M1 14.5H17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </>
              )}
            </svg>
          </button>
        </nav>
      </Container>

      {/* Mobile menu panel */}
      <div
        className={cn(
          "grid overflow-hidden bg-bg-elevated/98 backdrop-blur-md transition-[grid-template-rows] duration-300 ease-signature lg:hidden",
          menuOpen ? "grid-rows-[1fr] border-b border-border" : "grid-rows-[0fr]"
        )}
      >
        <div className="overflow-hidden">
          <Container size="page" className="flex flex-col gap-1 py-4">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="rounded-md px-3 py-3 font-body text-base text-text-muted transition-colors hover:bg-surface hover:text-text"
              >
                {link.label}
              </a>
            ))}
            <Button
              href="#contact"
              size="md"
              className="mt-3 w-full"
              icon={<ArrowIcon />}
              onClick={() => setMenuOpen(false)}
            >
              Start a Project
            </Button>
          </Container>
        </div>
      </div>
    </header>
  );
}
