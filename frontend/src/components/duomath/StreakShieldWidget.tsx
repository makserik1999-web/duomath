import { Shield, AlertTriangle } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

export function StreakShieldWidget() {
  const { t } = useLanguage();

  return (
    <div className="glass-panel p-4 border-streak/30 flex items-center gap-3 motion-safe:animate-fade-in">
      <div className="p-2 rounded-lg bg-streak/15">
        <AlertTriangle className="w-5 h-5 text-streak" />
      </div>
      <p className="text-xs text-muted-foreground flex-1">{t("widgets.streakShield")}</p>
      <Shield className="w-5 h-5 text-streak shrink-0" />
    </div>
  );
}
