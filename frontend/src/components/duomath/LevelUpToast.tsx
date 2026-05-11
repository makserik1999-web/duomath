import { useEffect, useState } from "react";
import { Star } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface LevelUpToastProps {
  level: number;
  show: boolean;
  onDone?: () => void;
}

export function LevelUpToast({ level, show, onDone }: LevelUpToastProps) {
  const { t } = useLanguage();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!show) return;
    setVisible(true);
    const timer = setTimeout(() => {
      setVisible(false);
      onDone?.();
    }, 3000);
    return () => clearTimeout(timer);
  }, [show, onDone]);

  if (!visible) return null;

  return (
    <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[150] motion-safe:animate-fade-in">
      <div className="glass-panel px-6 py-4 flex items-center gap-3 border-primary/40 glow-primary shadow-2xl">
        <div className="p-2 rounded-full bg-primary/20">
          <Star className="w-6 h-6 text-primary motion-safe:animate-[spin_2s_ease-in-out]" />
        </div>
        <p className="font-display font-bold text-sm">{t("widgets.levelUp", { n: level })}</p>
      </div>
    </div>
  );
}
