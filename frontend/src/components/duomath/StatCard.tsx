import { LucideIcon } from "lucide-react";

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  color: "primary" | "accent" | "xp" | "streak";
  subtitle?: string;
}

const colorMap = {
  primary: "from-primary/20 to-primary/5 border-primary/20",
  accent: "from-accent/20 to-accent/5 border-accent/20",
  xp: "from-xp/20 to-xp/5 border-[hsl(var(--xp)/0.2)]",
  streak: "from-streak/20 to-streak/5 border-[hsl(var(--streak)/0.2)]",
};

const iconColorMap = {
  primary: "text-primary",
  accent: "text-accent",
  xp: "text-xp",
  streak: "text-streak",
};

export function StatCard({ icon: Icon, label, value, color, subtitle }: StatCardProps) {
  return (
    <div className={`glass-panel bg-gradient-to-br ${colorMap[color]} p-5 motion-safe:animate-scale-in card-hover-lift`}>
      <div className="flex items-center gap-3 mb-2">
        <div className={`p-2 rounded-lg bg-background/50 ${iconColorMap[color]}`}>
          <Icon className="w-5 h-5" />
        </div>
        <span className="text-sm font-medium text-muted-foreground">{label}</span>
      </div>
      <p className="text-3xl font-bold font-display">{value}</p>
      {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
    </div>
  );
}
