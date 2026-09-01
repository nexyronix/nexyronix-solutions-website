import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ArrowIcon } from "@/components/ui/ArrowIcon";

const TECH_TAGS = ["SOFTWARE", "AI", "CLOUD", "DIGITAL SOLUTIONS"];


export function HeroContent() {
  return (
    <div className="max-w-3xl">
      <div className="animate-fade-up opacity-0" style={{ animationDelay: "0ms" }}>
        <Badge dot>Nexyronix Solutions Private Limited</Badge>
      </div>

      <h1
        className="mt-6 animate-fade-up font-display text-display-xl font-semibold uppercase tracking-tight leading-[1.02] text-text opacity-0"
        style={{ animationDelay: "90ms" }}
      >
        Building the digital <span className="text-accent-primary">future.</span>
      </h1>

      <p
        className="mt-6 max-w-xl animate-fade-up font-body text-base text-text-muted opacity-0 sm:text-lg"
        style={{ animationDelay: "180ms" }}
      >
        We build software, applications and intelligent digital solutions that turn ideas into
        technology.
      </p>

      <div
        className="mt-9 flex animate-fade-up flex-wrap items-center gap-4 opacity-0"
        style={{ animationDelay: "270ms" }}
      >
        <Button href="#contact" size="md" className="group/btn uppercase tracking-wide" icon={<ArrowIcon />}>
          Start a Project
        </Button>
        <Button href="#solutions" variant="secondary" size="md" className="uppercase tracking-wide">
          Explore Solutions
        </Button>
      </div>

      <p
        className="mt-10 animate-fade-up font-mono text-xs uppercase tracking-[0.2em] text-text-faint opacity-0"
        style={{ animationDelay: "360ms" }}
      >
        {TECH_TAGS.join(" • ")}
      </p>
    </div>
  );
}
