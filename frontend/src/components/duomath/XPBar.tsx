interface XPBarProps {
  current: number;
  max: number;
  level: number;
}

export function XPBar({ current, max, level }: XPBarProps) {
  const pct = Math.min((current / max) * 100, 100);

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/20 border border-primary/30 text-primary text-xs font-bold font-display">
        {level}
      </div>
      <div className="flex-1 h-2.5 bg-secondary rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-primary to-accent rounded-full animate-progress-fill transition-all duration-700"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-xs text-muted-foreground font-medium min-w-[4rem] text-right">
        {current}/{max} XP
      </span>
    </div>
  );
}
