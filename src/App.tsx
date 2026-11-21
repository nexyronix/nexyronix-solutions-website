import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { WhatsAppButton } from "@/components/ui/WhatsAppButton";
import { Hero } from "@/components/Hero/Hero";
import { Solutions } from "@/components/Solutions/Solutions";
import { TechnologyUniverse } from "@/components/TechnologyUniverse/TechnologyUniverse";
import { Process } from "@/components/Process/Process";
import { Industries } from "@/components/Industries/Industries";
import { Internship } from "@/components/Internship/Internship";
import { Careers } from "@/components/Careers/Careers";
import { Technology } from "@/components/Technology/Technology";
import { Projects } from "@/components/Projects/Projects";
import { About } from "@/components/About/About";
import { Contact } from "@/components/Contact/Contact";

export default function App() {
  return (
    <div className="flex min-h-screen flex-col bg-bg text-text">
      {/* First focusable element on the page: lets keyboard users jump past
          the navigation. Invisible until it receives keyboard focus. */}
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-md focus:border focus:border-border-strong focus:bg-bg-elevated focus:px-4 focus:py-2.5 focus:font-body focus:text-sm focus:text-text focus:shadow-raised"
      >
        Skip to main content
      </a>
      <Navbar />
      {/* tabIndex -1 lets the skip link move focus here; the ring is
          suppressed because the whole page would otherwise be outlined. */}
      <main id="main" tabIndex={-1} className="flex-1 focus-visible:outline-none">
        <Hero />
        <Solutions />
        <TechnologyUniverse />
        <Process />
        <Industries />
        <Internship />
        <Careers />
        <Technology />
        <Projects />
        <About />
        <Contact />
      </main>
      <Footer />
      <WhatsAppButton />
    </div>
  );
}
