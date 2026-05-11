import Database from "better-sqlite3";
import { randomUUID } from "node:crypto";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type {
  Lesson,
  LessonResult,
  Question,
  Topic,
  User,
  UserAchievement,
  UserStats,
} from "./types.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.resolve(__dirname, "../../database.sqlite");

const db = new Database(dbPath);

export async function ensureConnection(): Promise<void> {
  // better-sqlite3 is synchronous, just execute a simple query
  db.prepare("SELECT 1").get();
}

export async function createUser(user: User): Promise<void> {
  db.prepare(
    "INSERT INTO users (id, email, name, password_hash, created_at) VALUES (?, ?, ?, ?, ?)"
  ).run(user.id, user.email, user.name ?? null, user.passwordHash, user.createdAt);
}

export async function findUserByEmail(email: string): Promise<User | null> {
  const row = db.prepare(
    "SELECT id, email, name, password_hash, created_at FROM users WHERE email=?"
  ).get(email) as any;
  if (!row) return null;
  return {
    id: row.id,
    email: row.email,
    name: row.name ?? undefined,
    passwordHash: row.password_hash,
    createdAt: row.created_at,
  };
}

export async function findUserById(id: string): Promise<User | null> {
  const row = db.prepare(
    "SELECT id, email, name, password_hash, created_at FROM users WHERE id=?"
  ).get(id) as any;
  if (!row) return null;
  return {
    id: row.id,
    email: row.email,
    name: row.name ?? undefined,
    passwordHash: row.password_hash,
    createdAt: row.created_at,
  };
}

export async function saveRefreshToken(
  token: string,
  userId: string,
  expiresAt: string
): Promise<void> {
  db.prepare(
    "INSERT INTO refresh_tokens (token, user_id, expires_at) VALUES (?, ?, ?)"
  ).run(token, userId, expiresAt);
}

export async function hasRefreshToken(token: string): Promise<boolean> {
  const row = db.prepare(
    "SELECT token FROM refresh_tokens WHERE token=? AND expires_at > CURRENT_TIMESTAMP"
  ).get(token) as any;
  return Boolean(row);
}

export async function revokeRefreshToken(token: string): Promise<void> {
  db.prepare("DELETE FROM refresh_tokens WHERE token=?").run(token);
}

export async function listTopics(): Promise<Topic[]> {
  const rows = db.prepare(
    "SELECT id, name, grade_label, sort_order FROM math_topics ORDER BY sort_order ASC"
  ).all() as any[];
  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    gradeLabel: row.grade_label,
    sortOrder: row.sort_order,
  }));
}

export async function listLessonsByTopic(topicId: string): Promise<Lesson[]> {
  const rows = db.prepare(
    "SELECT id, topic_id, title, level, sort_order FROM lessons WHERE topic_id=? ORDER BY sort_order ASC"
  ).all(topicId) as any[];
  return rows.map((row) => ({
    id: row.id,
    topicId: row.topic_id,
    title: row.title,
    level: row.level,
    sortOrder: row.sort_order,
  }));
}

export async function findLessonById(lessonId: string): Promise<Lesson | null> {
  const row = db.prepare(
    "SELECT id, topic_id, title, level, sort_order FROM lessons WHERE id=?"
  ).get(lessonId) as any;
  if (!row) return null;
  return {
    id: row.id,
    topicId: row.topic_id,
    title: row.title,
    level: row.level,
    sortOrder: row.sort_order,
  };
}

export async function listQuestionsByLesson(lessonId: string): Promise<Question[]> {
  const rows = db.prepare(
    "SELECT id, lesson_id, prompt, choices, correct_answer, sort_order FROM questions WHERE lesson_id=? ORDER BY sort_order ASC"
  ).all(lessonId) as any[];
  return rows.map((row) => ({
    id: row.id,
    lessonId: row.lesson_id,
    prompt: row.prompt,
    choices: JSON.parse(row.choices),
    correctAnswer: row.correct_answer,
    sortOrder: row.sort_order,
  }));
}

export async function ensureUserStats(userId: string): Promise<void> {
  const row = db.prepare("SELECT user_id FROM user_stats WHERE user_id=?").get(userId) as any;
  if (!row) {
    db.prepare(
      "INSERT INTO user_stats (user_id, xp, streak_days, last_activity_at) VALUES (?, 0, 0, NULL)"
    ).run(userId);
  }
}

export async function getUserStats(userId: string): Promise<UserStats> {
  await ensureUserStats(userId);
  const row = db.prepare(
    "SELECT user_id, xp, streak_days, last_activity_at FROM user_stats WHERE user_id=?"
  ).get(userId) as any;
  return {
    userId: row.user_id,
    xp: row.xp,
    streakDays: row.streak_days,
    lastActivityAt: row.last_activity_at,
  };
}

export async function getUserProgress(userId: string): Promise<
  Array<{
    lessonId: string;
    bestScore: number;
    completedAt: string | null;
    topicName: string;
    lessonTitle: string;
  }>
> {
  const rows = db.prepare(
    `SELECT up.lesson_id, up.best_score, up.completed_at, mt.name AS topic_name, l.title AS lesson_title
     FROM user_progress up
     JOIN lessons l ON l.id = up.lesson_id
     JOIN math_topics mt ON mt.id = l.topic_id
     WHERE up.user_id=?
     ORDER BY up.updated_at DESC`
  ).all(userId) as any[];
  return rows.map((row) => ({
    lessonId: row.lesson_id,
    bestScore: row.best_score,
    completedAt: row.completed_at,
    topicName: row.topic_name,
    lessonTitle: row.lesson_title,
  }));
}

export async function getUserAchievements(userId: string): Promise<UserAchievement[]> {
  const rows = db.prepare(
    `SELECT a.id, a.name, a.description, ua.unlocked_at
     FROM user_achievements ua
     JOIN achievements a ON a.id = ua.achievement_id
     WHERE ua.user_id=?
     ORDER BY ua.unlocked_at DESC`
  ).all(userId) as any[];
  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    description: row.description,
    unlockedAt: row.unlocked_at,
  }));
}

function calculateStreak(previousDate: string | null): number {
  const today = new Date();
  const currentDay = new Date(
    Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate())
  );
  if (!previousDate) return 1;
  const prev = new Date(previousDate);
  const prevDay = new Date(
    Date.UTC(prev.getUTCFullYear(), prev.getUTCMonth(), prev.getUTCDate())
  );
  const diffDays = Math.floor(
    (currentDay.getTime() - prevDay.getTime()) / (24 * 60 * 60 * 1000)
  );
  if (diffDays <= 0) return -1;
  if (diffDays === 1) return -2;
  return 1;
}

export async function submitLesson(
  userId: string,
  lessonId: string,
  answers: Array<{ questionId: string; answer: string }>
): Promise<LessonResult> {
  const transaction = db.transaction(() => {
    ensureUserStats(userId);

    const qRows = db.prepare(
      "SELECT id, correct_answer FROM questions WHERE lesson_id=?"
    ).all(lessonId) as any[];
    const correctById = new Map<string, string>();
    qRows.forEach((row) => correctById.set(row.id, row.correct_answer));
    const totalQuestions = qRows.length;

    let correctAnswers = 0;
    for (const entry of answers) {
      const correct = correctById.get(entry.questionId);
      if (!correct) continue;
      const isCorrect = entry.answer === correct;
      if (isCorrect) correctAnswers += 1;
      db.prepare(
        `INSERT INTO attempts (id, user_id, lesson_id, question_id, submitted_answer, is_correct)
         VALUES (?, ?, ?, ?, ?, ?)`
      ).run(randomUUID(), userId, lessonId, entry.questionId, entry.answer, isCorrect ? 1 : 0);
    }

    const score = totalQuestions ? Math.round((correctAnswers / totalQuestions) * 100) : 0;
    const xpGained = correctAnswers * 10 + (correctAnswers === totalQuestions ? 20 : 0);
    const completedAt = correctAnswers > 0 ? new Date().toISOString() : null;

    db.prepare(
      `INSERT INTO user_progress (user_id, lesson_id, best_score, completed_at, updated_at)
       VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
       ON CONFLICT (user_id, lesson_id) DO UPDATE
       SET best_score = MAX(user_progress.best_score, excluded.best_score),
           completed_at = COALESCE(user_progress.completed_at, excluded.completed_at),
           updated_at = CURRENT_TIMESTAMP`
    ).run(userId, lessonId, score, completedAt);

    const stats = db.prepare(
      "SELECT xp, streak_days, last_activity_at FROM user_stats WHERE user_id=?"
    ).get(userId) as any;
    
    const streakCalc = calculateStreak(stats.last_activity_at);
    let streakDays = stats.streak_days as number;
    if (streakCalc === 1) streakDays = 1;
    else if (streakCalc === -2) streakDays += 1;

    const newXp = (stats.xp as number) + xpGained;
    db.prepare(
      "UPDATE user_stats SET xp=?, streak_days=?, last_activity_at=CURRENT_TIMESTAMP WHERE user_id=?"
    ).run(newXp, streakDays, userId);

    const unlockedIds: string[] = [];
    if (completedAt) unlockedIds.push("first_lesson");
    if (streakDays >= 3) unlockedIds.push("streak_3_days");
    if (newXp >= 100) unlockedIds.push("xp_100");

    for (const achievementId of unlockedIds) {
      db.prepare(
        `INSERT INTO user_achievements (user_id, achievement_id)
         VALUES (?, ?)
         ON CONFLICT (user_id, achievement_id) DO NOTHING`
      ).run(userId, achievementId);
    }

    if (unlockedIds.length === 0) return { score, totalQuestions, correctAnswers, xpGained, streakDays, unlockedAchievements: [] };

    const placeholders = unlockedIds.map(() => '?').join(',');
    const unlockedResult = db.prepare(
      `SELECT a.id, a.name, a.description, ua.unlocked_at
       FROM user_achievements ua
       JOIN achievements a ON a.id = ua.achievement_id
       WHERE ua.user_id=? AND ua.achievement_id IN (${placeholders})`
    ).all(userId, ...unlockedIds) as any[];

    return {
      score,
      totalQuestions,
      correctAnswers,
      xpGained,
      streakDays,
      unlockedAchievements: unlockedResult.map((row) => ({
        id: row.id,
        name: row.name,
        description: row.description,
        unlockedAt: row.unlocked_at,
      })),
    };
  });

  return transaction();
}
