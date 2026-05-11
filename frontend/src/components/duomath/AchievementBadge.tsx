import { LucideIcon } from "lucide-react";

interface AchievementBadgeProps {
  icon: LucideIcon;
  title: string;
  description: string;
  unlocked: boolean;
  rarity?: "common" | "rare" | "epic";
}

const rarityColors = {
  common: "border-muted-foreground/30",
  rare: "border-primary/50 glow-primary",
  epic: "border-accent/50 glow-accent",
};

export function AchievementBadge({ icon: Icon, title, description, unlocked, rarity = "common" }: AchievementBadgeProps) {
  return (
    <div className={`glass-panel p-4 flex items-center gap-3 motion-safe:transition-all motion-safe:duration-300 card-hover-lift ${
      unlocked ? rarityColors[rarity] : "opacity-40 grayscale"
    }`}>
      <div className={`p-2.5 rounded-xl ${
        unlocked ? "bg-gradient-to-br from-primary/20 to-accent/20" : "bg-secondary"
      }`}>
        <Icon className={`w-5 h-5 ${unlocked ? "text-accent" : "text-muted-foreground"}`} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold truncate">{title}</p>
        <p className="text-xs text-muted-foreground truncate">{description}</p>
      </div>
      {unlocked && (
        <div className="w-2 h-2 rounded-full bg-success animate-pulse-glow" />
      )}
    </div>
  );
}
