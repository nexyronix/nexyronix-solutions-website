import { Container } from "@/components/ui/Container";
import { Logo } from "@/components/ui/Logo";
import { SOCIAL_LINKS } from "@/data/site";

const LINK_GROUPS: { title: string; links: { label: string; href: string }[] }[] = [
  {
    title: "Company",
    links: [
      { label: "Solutions", href: "#solutions" },
      { label: "Industries", href: "#industries" },
      { label: "Careers", href: "#careers" },
      { label: "About", href: "#about" },
      { label: "Contact", href: "#contact" },
    ],
  },
  {
    title: "Internships",
    links: [
      { label: "Internship Opportunities", href: "#internships" },
      { label: "Domains", href: "#internship-domains" },
      { label: "Apply", href: "#internship-apply" },
    ],
  },
  {
    // Plain static pages (public/privacy-policy.html, public/terms-of-use.html),
    // served at clean URLs by server/index.ts — not part of the SPA/router.
    title: "Legal",
    links: [
      { label: "Privacy Policy", href: "/privacy-policy" },
      { label: "Terms of Use", href: "/terms-of-use" },
    ],
  },
];

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-bg-secondary">
      <Container size="page" className="py-16">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-8">
          {/* Brand */}
          <div className="lg:col-span-4">
            <Logo context="footer" />
            <p className="mt-6 font-display text-sm font-medium uppercase tracking-[0.14em] text-accent-cyan">
              Building the digital future.
            </p>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-text-muted">
              Software, web, mobile and AI-driven products engineered for organizations that build
              for the long term.
            </p>

            {/* Rendered only when official accounts are configured — see src/data/site.ts */}
            {SOCIAL_LINKS.length > 0 && (
              <ul className="mt-6 flex gap-3">
                {SOCIAL_LINKS.map((social) => (
                  <li key={social.label}>
                    <a
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={social.label}
                      className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-text-muted transition-colors duration-200 hover:border-accent-primary/60 hover:text-accent-cyan"
                    >
                      <span className="font-mono text-[10px] uppercase">{social.short}</span>
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Link columns */}
          <nav className="grid grid-cols-2 gap-8 lg:col-span-8" aria-label="Footer">
            {LINK_GROUPS.map((group) => (
              <div key={group.title}>
                <h3 className="label-eyebrow">{group.title}</h3>
                <ul className="mt-4 space-y-2.5">
                  {group.links.map((link) => (
                    <li key={link.label}>
                      <a
                        href={link.href}
                        className="text-sm text-text-muted transition-colors duration-200 hover:text-text"
                      >
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </div>

        <div className="divider-signature my-10" />

        <div className="flex flex-col-reverse items-start justify-between gap-4 sm:flex-row sm:items-center">
          <p className="font-mono text-xs text-text-faint">
            © {year} Nexyronix Solutions Private Limited. All Rights Reserved.
          </p>
          <p className="font-mono text-xs uppercase tracking-[0.14em] text-text-faint">
            Software &amp; Digital Solutions
          </p>
        </div>
      </Container>
    </footer>
  );
}
