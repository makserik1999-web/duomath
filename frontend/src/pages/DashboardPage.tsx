import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Zap, Flame, BookOpen, Trophy, Calculator, Shapes, BarChart3, Binary, Sigma, Target } from "lucide-react";
import { AppHeader } from "@/components/duomath/AppHeader";
import { StatCard } from "@/components/duomath/StatCard";
import { TopicItem } from "@/components/duomath/TopicItem";
import { LessonCard } from "@/components/duomath/LessonCard";
import { AchievementBadge } from "@/components/duomath/AchievementBadge";
import { DailyGoalWidget } from "@/components/duomath/DailyGoalWidget";
import { ContinueLessonWidget } from "@/components/duomath/ContinueLessonWidget";
import { StreakShieldWidget } from "@/components/duomath/StreakShieldWidget";
import { SkeletonStatCard, SkeletonLessonCard, SkeletonTopicItem } from "@/components/duomath/SkeletonCard";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { learningApi, type Topic, type Lesson, type UserStats, type UserAchievement, type UserProgress } from "@/lib/api";

const topicIcons: Record<string, typeof Calculator> = {
  algebra: Calculator,
  geometry: Shapes,
  statistics: BarChart3,
  "number-theory": Binary,
  calculus: Sigma,
};

const achievementIcons: Record<string, typeof Flame> = {
  weekWarrior: Flame,
  speedSolver: Zap,
  topicMaster: Trophy,
  perfectTen: Target,
  mathRoyalty: Target,
  consistentLearner: Target,
  firstSteps: Target,
  explorer: Target,
  algebraPro: Target,
};

export default function DashboardPage() {
  const [selectedTopic, setSelectedTopic] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [achievements, setAchievements] = useState<UserAchievement[]>([]);
  const [progress, setProgress] = useState<UserProgress[]>([]);
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { accessToken, logout } = useAuth();

  useEffect(() => {
    if (!accessToken) return;
    async function load() {
      setLoading(true);
      try {
        const [topicData, statsData, progressData, achievementsData] = await Promise.all([
          learningApi.topics(accessToken),
          learningApi.stats(accessToken),
          learningApi.progress(accessToken),
          learningApi.achievements(accessToken),
        ]);
        setTopics(topicData);
        setStats(statsData);
        setProgress(progressData);
        setAchievements(achievementsData);
        if (topicData.length > 0) {
          setSelectedTopic(topicData[0].id);
          const lessonData = await learningApi.lessonsByTopic(accessToken, topicData[0].id);
          setLessons(lessonData);
        }
      } catch {
        // handle error silently
      } finally {
        setLoading(false);
      }
    }
    void load();
  }, [accessToken]);

  async function selectTopic(topicId: string) {
    if (!accessToken) return;
    setSelectedTopic(topicId);
    try {
      const data = await learningApi.lessonsByTopic(accessToken, topicId);
      setLessons(data);
    } catch {
      // handle error silently
    }
  }

  const completedLessons = useMemo(
    () => progress.filter(p => p.completedAt !== null).length,
    [progress]
  );

  const handleLogout = async () => {
    await logout();
    navigate("/auth");
  };

  return (
    <div className="min-h-screen bg-background">
      <AppHeader onLogout={handleLogout} streak={stats?.streakDays ?? 0} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 motion-safe:animate-page-enter">
        {/* Engagement widgets */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          <DailyGoalWidget current={stats?.xp ?? 0} goal={200} />
          <ContinueLessonWidget
            lessonTitle={progress.length > 0 ? (t("lessonTitles." + progress[0].lessonId) || progress[0].lessonTitle) : (lessons[0] ? (t("lessonTitles." + lessons[0].id) || lessons[0].title) : "")}
            topicTitle={progress.length > 0 ? (t("topics." + topics.find(t => t.name === progress[0].topicName)?.id) || progress[0].topicName) : (topics[0] ? (t("topics." + topics[0].id) || topics[0].name) : "")}
            progress={progress.length > 0 ? 50 : 0}
            onClick={() => {
              if (progress.length > 0) navigate(`/lesson?id=${progress[0].lessonId}`);
              else if (lessons[0]) navigate(`/lesson?id=${lessons[0].id}`);
            }}
          />
          <StreakShieldWidget />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {loading ? (
            <>
              <SkeletonStatCard /><SkeletonStatCard /><SkeletonStatCard /><SkeletonStatCard />
            </>
          ) : (
            <>
              <StatCard icon={Zap} label={t("dashboard.totalXp")} value={stats?.xp ?? 0} color="xp" subtitle={t("dashboard.level", { n: Math.floor((stats?.xp ?? 0) / 500) + 1 })} />
              <StatCard icon={Flame} label={t("dashboard.currentStreak")} value={`${stats?.streakDays ?? 0} ${t("dashboard.days")}`} color="streak" subtitle={t("dashboard.personalBest", { n: stats?.streakDays ?? 0 })} />
              <StatCard icon={BookOpen} label={t("dashboard.lessonsDone")} value={completedLessons} color="primary" subtitle={t("dashboard.thisWeek", { n: completedLessons })} />
              <StatCard icon={Trophy} label={t("dashboard.achievements")} value={`${achievements.length}`} color="accent" subtitle={t("dashboard.awayFromNext", { n: 1 })} />
            </>
          )}
        </div>

        {/* Main grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Topics sidebar */}
          <div className="lg:col-span-3">
            <div className="glass-panel p-4">
              <h2 className="font-display font-semibold text-sm text-muted-foreground mb-3 px-1">{t("dashboard.topics")}</h2>
              <div className="space-y-1">
                {loading ? (
                  <>{Array.from({ length: 5 }).map((_, i) => <SkeletonTopicItem key={i} />)}</>
                ) : (
                  topics.map(tp => {
                    const Icon = topicIcons[tp.id] ?? Calculator;
                    const topicProgress = progress.filter(p => p.topicName === tp.name);
                    const completed = topicProgress.filter(p => p.completedAt !== null).length;
                    return (
                      <TopicItem
                        key={tp.id}
                        icon={Icon}
                        title={t("topics." + tp.id) || tp.name}
                        lessonsCount={lessons.length}
                        completedCount={completed}
                        active={selectedTopic === tp.id}
                        onClick={() => selectTopic(tp.id)}
                      />
                    );
                  })
                )}
              </div>
            </div>
          </div>

          {/* Lessons */}
          <div className="lg:col-span-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display font-bold text-lg">
                {selectedTopic ? t("topics." + selectedTopic) : ""} {t("dashboard.lessons")}
              </h2>
              <span className="text-xs text-muted-foreground">
                {lessons.filter(l => progress.some(p => p.lessonId === l.id && p.completedAt !== null)).length}/{lessons.length} {t("dashboard.complete")}
              </span>
            </div>
            <div className="space-y-3">
              {loading ? (
                <>{Array.from({ length: 3 }).map((_, i) => <SkeletonLessonCard key={i} />)}</>
              ) : (
                lessons.map(l => {
                  const lessonProgress = progress.find(p => p.lessonId === l.id);
                  const status: "locked" | "available" | "completed" = lessonProgress?.completedAt ? "completed" : "available";
                  const diff = (l.level?.toLowerCase() ?? "easy") as "easy" | "medium" | "hard";
                  return (
                    <LessonCard
                      key={l.id}
                      title={t("lessonTitles." + l.id) || l.title}
                      description={t("lessonDescs." + l.id) || l.level}
                      difficulty={diff}
                      status={status}
                      xpReward={50}
                      questionsCount={5}
                      onClick={() => navigate(`/lesson?id=${l.id}`)}
                    />
                  );
                })
              )}
            </div>
          </div>

          {/* Right panel */}
          <div className="lg:col-span-4 space-y-6">
            <div className="glass-panel p-4">
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-display font-semibold text-sm text-muted-foreground">{t("dashboard.achievements")}</h2>
                <button onClick={() => navigate("/profile")} className="text-xs text-primary hover:underline">{t("dashboard.viewAll")}</button>
              </div>
              <div className="space-y-2">
                {achievements.length === 0 ? (
                  <p className="text-xs text-muted-foreground">{t("dashboard.achievements")}: 0</p>
                ) : (
                  achievements.slice(0, 3).map(a => (
                    <AchievementBadge key={a.id} icon={achievementIcons[a.name] ?? Target} title={a.name} description={a.description} unlocked={true} rarity="rare" />
                  ))
                )}
              </div>
            </div>

            <div className="glass-panel p-4">
              <h2 className="font-display font-semibold text-sm text-muted-foreground mb-3">{t("dashboard.recentActivity")}</h2>
              <div className="space-y-3">
                {progress.length === 0 ? (
                  <p className="text-xs text-muted-foreground">{t("dashboard.recentActivity")}</p>
                ) : (
                  progress.slice(0, 5).map(p => (
                    <div key={p.lessonId} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                      <div>
                        <p className="text-sm font-medium">{t("lessonTitles." + p.lessonId) || p.lessonTitle}</p>
                        <p className="text-xs text-muted-foreground">{t("topics." + topics.find(t => t.name === p.topicName)?.id) || p.topicName}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">{p.bestScore}%</p>
                        <p className="text-xs text-xp">+XP</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
