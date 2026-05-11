import { useLanguage } from "@/contexts/LanguageContext";

interface DailyGoalWidgetProps {
  current: number;
  goal: number;
}

export function DailyGoalWidget({ current, goal }: DailyGoalWidgetProps) {
  const { t } = useLanguage();
  const pct = Math.min((current / goal) * 100, 100);
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (pct / 100) * circumference;
  const isComplete = current >= goal;

  return (
    <div className="glass-panel p-4 flex items-center gap-4">
      <div className="relative w-20 h-20 shrink-0">
        <svg className="w-20 h-20 -rotate-90" viewBox="0 0 80 80">
          <circle cx="40" cy="40" r={radius} fill="none" stroke="hsl(var(--secondary))" strokeWidth="6" />
          <circle
            cx="40" cy="40" r={radius} fill="none"
            stroke={isComplete ? "hsl(var(--success))" : "hsl(var(--primary))"}
            strokeWidth="6" strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className="motion-safe:transition-all motion-safe:duration-700"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-sm font-bold font-display">{Math.round(pct)}%</span>
        </div>
      </div>
      <div>
        <p className="font-display font-semibold text-sm">{t("widgets.dailyGoal")}</p>
        <p className="text-xs text-muted-foreground">{t("widgets.xpToday", { n: current, goal })}</p>
        {isComplete && <p className="text-xs text-success font-medium mt-1">✅ {t("widgets.goalComplete")}</p>}
      </div>
    </div>
  );
}
