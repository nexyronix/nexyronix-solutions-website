import { TechnologyCard } from "./TechnologyCard";
import { TECHNOLOGIES, type TechCategoryId } from "@/data/technologies";

interface TechnologyGridProps {
  activeCategory: TechCategoryId | "all";
  selectedId: string | null;
  onSelect: (id: string) => void;
  revealed: boolean;
}

/**
 * All technologies stay mounted; the filter dims non-matching cards rather
 * than unmounting them. That keeps the grid from reflowing on every filter
 * change and matches the brief's "others fade slightly" behaviour.
 */
export function TechnologyGrid({ activeCategory, selectedId, onSelect, revealed }: TechnologyGridProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {TECHNOLOGIES.map((tech, i) => (
        <TechnologyCard
          key={tech.id}
          technology={tech}
          isSelected={selectedId === tech.id}
          isDimmed={activeCategory !== "all" && tech.category !== activeCategory}
          onSelect={onSelect}
          revealed={revealed}
          delayMs={Math.min(i * 30, 400)}
        />
      ))}
    </div>
  );
}
