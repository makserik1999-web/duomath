import { LucideIcon, ChevronRight } from "lucide-react";

interface TopicItemProps {
  icon: LucideIcon;
  title: string;
  lessonsCount: number;
  completedCount: number;
  active?: boolean;
  onClick?: () => void;
}

export function TopicItem({ icon: Icon, title, lessonsCount, completedCount, active, onClick }: TopicItemProps) {
  const pct = lessonsCount > 0 ? (completedCount / lessonsCount) * 100 : 0;

  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-200 text-left group ${
        active
          ? "bg-primary/10 border border-primary/30"
          : "hover:bg-secondary/50 border border-transparent"
      }`}
    >
      <div className={`p-2 rounded-lg ${active ? "bg-primary/20 text-primary" : "bg-secondary text-muted-foreground group-hover:text-foreground"}`}>
        <Icon className="w-4 h-4" />
      </div>
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium truncate ${active ? "text-foreground" : "text-secondary-foreground"}`}>{title}</p>
        <div className="flex items-center gap-2 mt-1">
          <div className="flex-1 h-1 bg-secondary rounded-full overflow-hidden">
            <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${pct}%` }} />
          </div>
          <span className="text-[10px] text-muted-foreground">{completedCount}/{lessonsCount}</span>
        </div>
      </div>
      <ChevronRight className={`w-4 h-4 text-muted-foreground transition-transform ${active ? "text-primary" : ""} group-hover:translate-x-0.5`} />
    </button>
  );
}
