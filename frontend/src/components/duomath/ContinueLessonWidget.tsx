import { Play } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";

interface ContinueLessonWidgetProps {
  lessonTitle: string;
  topicTitle: string;
  progress: number; // 0-100
  onClick?: () => void;
}

export function ContinueLessonWidget({ lessonTitle, topicTitle, progress, onClick }: ContinueLessonWidgetProps) {
  const navigate = useNavigate();
  const { t } = useLanguage();

  return (
    <button
      onClick={onClick || (() => navigate("/lesson"))}
      className="w-full glass-panel-hover p-4 flex items-center gap-4 group"
    >
      <div className="p-2.5 rounded-xl bg-primary/20 text-primary group-hover:bg-primary group-hover:text-primary-foreground motion-safe:transition-colors motion-safe:duration-200">
        <Play className="w-5 h-5" />
      </div>
      <div className="flex-1 text-left min-w-0">
        <p className="text-sm font-semibold truncate">{lessonTitle}</p>
        <p className="text-xs text-muted-foreground">{topicTitle} · {progress}%</p>
      </div>
      <span className="text-xs font-medium text-primary shrink-0">{t("widgets.continueBtn")} →</span>
    </button>
  );
}
