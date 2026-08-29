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
      <Navbar />
      <main className="flex-1">
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
