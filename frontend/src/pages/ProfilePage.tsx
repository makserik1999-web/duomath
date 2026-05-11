import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AppHeader } from "@/components/duomath/AppHeader";
import { AchievementBadge } from "@/components/duomath/AchievementBadge";
import { StatCard } from "@/components/duomath/StatCard";
import { Zap, Flame, BookOpen, Trophy, Target, ArrowLeft } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { learningApi, type UserStats, type UserAchievement, type UserProgress } from "@/lib/api";

const topicColors: Record<string, string> = {
  algebra: "bg-primary",
  geometry: "bg-accent",
  "number-theory": "bg-success",
  calculus: "bg-warning",
  statistics: "bg-destructive",
};

export default function ProfilePage() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { accessToken, user, logout } = useAuth();
  const [stats, setStats] = useState<UserStats | null>(null);
  const [achievements, setAchievements] = useState<UserAchievement[]>([]);
  const [progress, setProgress] = useState<UserProgress[]>([]);

  useEffect(() => {
    if (!accessToken) return;
    Promise.all([
      learningApi.stats(accessToken),
      learningApi.achievements(accessToken),
      learningApi.progress(accessToken),
    ]).then(([s, a, p]) => {
      setStats(s);
      setAchievements(a);
      setProgress(p);
    }).catch(() => {});
  }, [accessToken]);

  const handleLogout = async () => {
    await logout();
    navigate("/auth");
  };

  const completedLessons = progress.filter(p => p.completedAt !== null).length;
  const topicMap = new Map<string, { total: number; completed: number }>();
  for (const p of progress) {
    const cur = topicMap.get(p.topicName) ?? { total: 0, completed: 0 };
    cur.total++;
    if (p.completedAt) cur.completed++;
    topicMap.set(p.topicName, cur);
  }

  return (
    <div className="min-h-screen bg-background">
      <AppHeader onLogout={handleLogout} streak={stats?.streakDays ?? 0} />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-6 motion-safe:animate-page-enter">
        <button onClick={() => navigate("/dashboard")} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground motion-safe:transition-colors mb-6 btn-press">
          <ArrowLeft className="w-4 h-4" /> {t("profile.backToDashboard")}
        </button>

        <div className="glass-panel p-6 mb-6 flex flex-col sm:flex-row items-center gap-5">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-2xl font-bold font-display text-background">
            {(user?.name?.[0] ?? user?.email?.[0] ?? "M").toUpperCase()}
          </div>
          <div className="text-center sm:text-left flex-1">
            <h1 className="font-display text-xl font-bold">{user?.name ?? t("profile.defaultName")}</h1>
            <p className="text-sm text-muted-foreground">{user?.email ?? ""}</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-center px-4">
              <p className="font-display text-2xl font-bold text-xp">{stats?.xp ?? 0}</p>
              <p className="text-xs text-muted-foreground">{t("profile.totalXp")}</p>
            </div>
            <div className="w-px h-10 bg-border" />
            <div className="text-center px-4">
              <p className="font-display text-2xl font-bold text-streak">{stats?.streakDays ?? 0}</p>
              <p className="text-xs text-muted-foreground">{t("profile.dayStreak")}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard icon={BookOpen} label={t("dashboard.lessonsDone")} value={completedLessons} color="primary" />
          <StatCard icon={Trophy} label={t("dashboard.achievements")} value={`${achievements.length}`} color="accent" />
          <StatCard icon={Target} label={t("profile.accuracy")} value={`${stats?.xp ?? 0 > 0 ? Math.round((completedLessons / Math.max(progress.length, 1)) * 100) : 0}%`} color="xp" />
          <StatCard icon={Flame} label={t("profile.bestStreak")} value={t("profile.daysValue", { n: stats?.streakDays ?? 0 })} color="streak" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="glass-panel p-5">
            <h2 className="font-display font-semibold mb-4">{t("profile.progressByTopic")}</h2>
            <div className="space-y-4">
              {Array.from(topicMap.entries()).map(([topicName, data]) => (
                <div key={topicName}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm font-medium">{topicName}</span>
                    <span className="text-xs text-muted-foreground">{data.completed}/{data.total}</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-secondary overflow-hidden">
                    <div
                      className={`h-full rounded-full ${topicColors[topicName.toLowerCase()] ?? "bg-primary"} motion-safe:transition-all motion-safe:duration-700`}
                      style={{ width: `${(data.completed / data.total) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-panel p-5">
            <h2 className="font-display font-semibold mb-4">{t("profile.allAchievements")}</h2>
            <div className="space-y-2 max-h-[400px] overflow-y-auto scrollbar-thin pr-1">
              {achievements.length === 0 ? (
                <p className="text-xs text-muted-foreground">0 {t("dashboard.achievements")}</p>
              ) : (
                achievements.map(a => (
                  <AchievementBadge key={a.id} icon={Target} title={a.name} description={a.description} unlocked={true} rarity="rare" />
                ))
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
