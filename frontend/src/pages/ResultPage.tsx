import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Trophy, Flame, Zap, Star, ArrowRight, RotateCcw } from "lucide-react";
import { Confetti } from "@/components/duomath/Confetti";
import { useLanguage } from "@/contexts/LanguageContext";

export default function ResultPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useLanguage();
  const state = (location.state as { correct?: number; total?: number; xpGained?: number; streakDays?: number; achievements?: Array<{ id: string; name: string; description: string }> }) || {};
  const correct = state.correct ?? 0;
  const total = state.total ?? 1;
  const xpEarned = state.xpGained ?? correct * 16;
  const streakDays = state.streakDays ?? 0;
  const unlockedAchievements = state.achievements ?? [];
  const pct = Math.round((correct / total) * 100);
  const isPerfect = pct === 100;
  const isPass = pct >= 60;
  const [showConfetti] = useState(isPerfect);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Confetti active={showConfetti} />
      <div className="w-full max-w-md motion-safe:animate-slide-up">
        {/* Score circle */}
        <div className="text-center mb-8">
          <div className={`inline-flex items-center justify-center w-32 h-32 rounded-full border-4 mb-4 motion-safe:animate-scale-in ${
            isPerfect ? "border-accent glow-accent" : isPass ? "border-success glow-success" : "border-destructive"
          }`}>
            <div>
              <p className={`font-display text-4xl font-bold ${
                isPerfect ? "text-accent" : isPass ? "text-success" : "text-destructive"
              }`}>{pct}%</p>
              <p className="text-xs text-muted-foreground">{correct}/{total}</p>
            </div>
          </div>
          <h1 className="font-display text-2xl font-bold mb-1">
            {isPerfect ? t("result.perfectTitle") : isPass ? t("result.greatTitle") : t("result.keepTitle")}
          </h1>
          <p className="text-sm text-muted-foreground">
            {isPerfect ? t("result.perfectSub") : isPass ? t("result.greatSub") : t("result.keepSub")}
          </p>
        </div>

        {/* Rewards */}
        <div className="space-y-3 mb-8">
          <div className="glass-panel p-4 flex items-center gap-3 card-hover-lift">
            <div className="p-2 rounded-lg bg-xp/10">
              <Zap className="w-5 h-5 text-xp" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium">{t("result.xpEarned")}</p>
              <p className="text-xs text-muted-foreground">{t("result.addedToTotal")}</p>
            </div>
            <span className="font-display font-bold text-lg text-xp">+{xpEarned}</span>
          </div>

          <div className="glass-panel p-4 flex items-center gap-3 card-hover-lift">
            <div className="p-2 rounded-lg bg-streak/10">
              <Flame className="w-5 h-5 text-streak" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium">{t("result.streakMaintained")}</p>
              <p className="text-xs text-muted-foreground">{t("result.daysAndCounting", { n: 8 })}</p>
            </div>
            <span className="font-display font-bold text-lg text-streak">🔥 8</span>
          </div>

          {isPerfect && (
            <div className="glass-panel p-4 flex items-center gap-3 border-accent/30 motion-safe:animate-scale-in card-hover-lift">
              <div className="p-2 rounded-lg bg-accent/10">
                <Star className="w-5 h-5 text-accent" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">{t("result.achievementUnlocked")}</p>
                <p className="text-xs text-muted-foreground">{t("result.perfectScoreMaster")}</p>
              </div>
              <Trophy className="w-5 h-5 text-accent" />
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <button
            onClick={() => navigate("/dashboard")}
            className="w-full h-12 rounded-xl bg-gradient-to-r from-primary to-primary/80 text-primary-foreground font-semibold text-sm flex items-center justify-center gap-2 hover:opacity-90 motion-safe:transition-opacity glow-primary btn-press"
          >
            {t("result.continueLearning")} <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => navigate("/lesson")}
            className="w-full h-12 rounded-xl bg-secondary text-secondary-foreground font-semibold text-sm flex items-center justify-center gap-2 hover:bg-secondary/80 motion-safe:transition-colors btn-press"
          >
            <RotateCcw className="w-4 h-4" /> {t("result.retryLesson")}
          </button>
        </div>
      </div>
    </div>
  );
}
