import { useRef, useState } from "react";
import { Container } from "@/components/ui/Container";
import { ContactOptions, CONTACT_OPTIONS, type ContactOption } from "./ContactOptions";
import { ContactForm } from "./ContactForm";
import { ContactInfo } from "./ContactInfo";
import { ContactVisual } from "./ContactVisual";
import { useInViewOnce } from "@/hooks/useInView";
import { cn } from "@/lib/cn";

const REVEAL = "transition-all duration-700 ease-signature";

export function Contact() {
  const { ref, inView } = useInViewOnce<HTMLElement>();
  const revealed = inView ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0";

  const [selected, setSelected] = useState<ContactOption>(CONTACT_OPTIONS[0]);
  const formRef = useRef<HTMLDivElement>(null);

  function handleSelect(option: ContactOption) {
    setSelected(option);
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <section id="contact" ref={ref} className="scroll-mt-20 relative border-t border-border bg-bg py-section-y">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-bg-secondary/50 to-transparent"
        aria-hidden="true"
      />

      <Container size="page" className="relative">
        {/* Intro */}
        <div className="max-w-3xl">
          <p className={cn("label-eyebrow", REVEAL, revealed)}>Start a Conversation</p>
          <h2
            className={cn(
              "mt-4 font-display text-display-md font-semibold uppercase leading-[1.08] text-text",
              REVEAL,
              revealed
            )}
            style={{ transitionDelay: "80ms" }}
          >
            Have an idea?
            <br />
            <span className="text-accent-primary">Let's build it.</span>
          </h2>
          <p
            className={cn("mt-5 max-w-xl text-base text-text-muted sm:text-lg", REVEAL, revealed)}
            style={{ transitionDelay: "160ms" }}
          >
            Whether you have a complete requirement, a business problem or simply an idea, tell us
            what you're thinking.
          </p>
        </div>

        {/* Three paths */}
        <div className="mt-12">
          <ContactOptions activeId={selected.id} onSelect={handleSelect} revealed={inView} />
        </div>

        {/* Split layout — copy and context left, form right */}
        <div ref={formRef} className="mt-16 grid gap-10 scroll-mt-24 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-5">
            <h3
              className={cn(
                "font-display text-display-sm font-semibold uppercase leading-tight text-text",
                REVEAL,
                revealed
              )}
            >
              Let's turn an idea into something real.
            </h3>
            <p
              className={cn("mt-5 text-base leading-relaxed text-text-muted", REVEAL, revealed)}
              style={{ transitionDelay: "100ms" }}
            >
              Share as much or as little as you like. A short description of the problem is enough
              to start — we'll come back with questions.
            </p>

            <div
              className={cn(
                "mt-8 overflow-hidden rounded-xl border border-border bg-surface/25 px-4 py-6 backdrop-blur-sm",
                REVEAL,
                revealed
              )}
              style={{ transitionDelay: "160ms" }}
            >
              <ContactVisual />
            </div>

            <div className={cn("mt-4", REVEAL, revealed)} style={{ transitionDelay: "220ms" }}>
              <ContactInfo />
            </div>
          </div>

          <div className={cn("lg:col-span-7", REVEAL, revealed)} style={{ transitionDelay: "120ms" }}>
            {/* Remount on path change so the preselected enquiry type applies */}
            <ContactForm key={selected.id} presetType={selected.enquiryType} />
          </div>
        </div>

        {/* Closing statement */}
        <div className={cn("mt-20 text-center", REVEAL, revealed)} style={{ transitionDelay: "280ms" }}>
          <h3 className="mx-auto max-w-3xl font-display text-display-sm font-semibold uppercase leading-tight text-text sm:text-display-md">
            Your next project could start here.
          </h3>
          <p className="mx-auto mt-4 max-w-md text-base text-text-muted">
            Tell us what you're building.
          </p>
        </div>
      </Container>
    </section>
  );
}
