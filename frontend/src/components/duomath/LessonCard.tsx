import { CheckCircle2, Lock, Play } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface LessonCardProps {
  title: string;
  description: string;
  difficulty: "easy" | "medium" | "hard";
  status: "locked" | "available" | "completed";
  xpReward: number;
  questionsCount: number;
  onClick?: () => void;
}

const difficultyConfig = {
  easy: { key: "difficulty.easy", cls: "bg-success/15 text-success border-success/20" },
  medium: { key: "difficulty.medium", cls: "bg-warning/15 text-warning border-[hsl(var(--warning)/0.2)]" },
  hard: { key: "difficulty.hard", cls: "bg-destructive/15 text-destructive border-destructive/20" },
};

export function LessonCard({ title, description, difficulty, status, xpReward, questionsCount, onClick }: LessonCardProps) {
  const { t } = useLanguage();
  const diff = difficultyConfig[difficulty];

  return (
    <button
      onClick={status !== "locked" ? onClick : undefined}
      disabled={status === "locked"}
      className={`w-full text-left glass-panel-hover p-5 group card-hover-lift btn-press ${
        status === "locked" ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
      } ${status === "completed" ? "border-success/20" : ""}`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-display font-semibold text-base truncate">{title}</h3>
          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{description}</p>
        </div>
        <div className="ml-3">
          {status === "completed" && <CheckCircle2 className="w-5 h-5 text-success" />}
          {status === "locked" && <Lock className="w-5 h-5 text-muted-foreground" />}
          {status === "available" && (
            <div className="p-1.5 rounded-lg bg-primary/20 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
              <Play className="w-4 h-4" />
            </div>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${diff.cls}`}>
          {t(diff.key)}
        </span>
        <span className="text-[10px] text-muted-foreground">{t("lesson.questions", { n: questionsCount })}</span>
        <span className="text-[10px] text-xp font-medium ml-auto">+{xpReward} XP</span>
      </div>
    </button>
  );
}
