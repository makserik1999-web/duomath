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

const SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  password_hash TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS refresh_tokens (
  token TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires_at TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS math_topics (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  grade_label TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0
);
CREATE TABLE IF NOT EXISTS lessons (
  id TEXT PRIMARY KEY,
  topic_id TEXT NOT NULL REFERENCES math_topics(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  level TEXT NOT NULL DEFAULT 'easy',
  sort_order INTEGER NOT NULL DEFAULT 0
);
CREATE TABLE IF NOT EXISTS questions (
  id TEXT PRIMARY KEY,
  lesson_id TEXT NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  prompt TEXT NOT NULL,
  choices TEXT NOT NULL,
  correct_answer TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0
);
CREATE TABLE IF NOT EXISTS attempts (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  lesson_id TEXT NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  question_id TEXT NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  submitted_answer TEXT NOT NULL,
  is_correct INTEGER NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS user_progress (
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  lesson_id TEXT NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  best_score INTEGER NOT NULL DEFAULT 0,
  completed_at TEXT,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, lesson_id)
);
CREATE TABLE IF NOT EXISTS user_stats (
  user_id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  xp INTEGER NOT NULL DEFAULT 0,
  streak_days INTEGER NOT NULL DEFAULT 0,
  last_activity_at TEXT
);
CREATE TABLE IF NOT EXISTS achievements (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS user_achievements (
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  achievement_id TEXT NOT NULL REFERENCES achievements(id) ON DELETE CASCADE,
  unlocked_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, achievement_id)
);
CREATE INDEX IF NOT EXISTS idx_lessons_topic_id ON lessons(topic_id);
CREATE INDEX IF NOT EXISTS idx_questions_lesson_id ON questions(lesson_id);
CREATE INDEX IF NOT EXISTS idx_attempts_user_lesson ON attempts(user_id, lesson_id);
`;

const SEED_SQL = `
INSERT INTO math_topics (id, name, grade_label, sort_order) VALUES
  ('algebra', 'Algebra', '8+', 1),
  ('geometry', 'Geometry', '8+', 2),
  ('statistics', 'Statistics', '8+', 3),
  ('number-theory', 'Number Theory', '8+', 4),
  ('calculus', 'Calculus', '10+', 5)
ON CONFLICT (id) DO NOTHING;

INSERT INTO lessons (id, topic_id, title, level, sort_order) VALUES
  ('linearEquations', 'algebra', 'Linear Equations', 'easy', 1),
  ('quadraticEquations', 'algebra', 'Quadratic Equations', 'medium', 2),
  ('anglesLines', 'geometry', 'Angles & Lines', 'easy', 1),
  ('triangles', 'geometry', 'Triangles', 'medium', 2),
  ('meanMedian', 'statistics', 'Mean & Median', 'easy', 1),
  ('primesFactors', 'number-theory', 'Primes & Factors', 'easy', 1),
  ('limitsIntro', 'calculus', 'Intro to Limits', 'hard', 1)
ON CONFLICT (id) DO NOTHING;

INSERT INTO questions (id, lesson_id, prompt, choices, correct_answer, sort_order) VALUES
  ('q_alg_lin_1', 'linearEquations', 'Solve: x + 5 = 9', '["2","3","4","5"]', '4', 1),
  ('q_alg_lin_2', 'linearEquations', 'Solve: 2x = 10', '["4","5","6","10"]', '5', 2),
  ('q_alg_lin_3', 'linearEquations', 'Solve: x - 3 = 7', '["4","7","10","11"]', '10', 3),
  ('q_alg_quad_1', 'quadraticEquations', 'Solve for positive x: x^2 = 16', '["2","4","8","16"]', '4', 1),
  ('q_alg_quad_2', 'quadraticEquations', 'What is the y-intercept of y = x^2 + 3?', '["0","1","3","4"]', '3', 2),
  ('q_geo_ang_1', 'anglesLines', 'Adjacent angles on a straight line sum to:', '["90","120","180","360"]', '180', 1),
  ('q_geo_ang_2', 'anglesLines', 'A right angle measures:', '["45","60","90","120"]', '90', 2),
  ('q_geo_tri_1', 'triangles', 'Sum of interior angles of a triangle:', '["90","180","270","360"]', '180', 1),
  ('q_geo_tri_2', 'triangles', 'Hypotenuse of right triangle with legs 3 and 4:', '["5","6","7","25"]', '5', 2),
  ('q_stat_mm_1', 'meanMedian', 'Mean of 2, 4, 6 is:', '["3","4","5","6"]', '4', 1),
  ('q_stat_mm_2', 'meanMedian', 'Median of 1, 5, 9 is:', '["1","4","5","9"]', '5', 2),
  ('q_nt_pf_1', 'primesFactors', 'Which of these is a prime number?', '["4","6","9","11"]', '11', 1),
  ('q_nt_pf_2', 'primesFactors', 'Prime factorization of 12 is:', '["2x6","3x4","2x2x3","12x1"]', '2x2x3', 2),
  ('q_calc_lim_1', 'limitsIntro', 'Limit of x as x approaches 5:', '["0","1","5","infinity"]', '5', 1),
  ('q_calc_lim_2', 'limitsIntro', 'Limit of 1/x as x approaches infinity:', '["0","1","infinity","-1"]', '0', 2)
ON CONFLICT (id) DO NOTHING;

INSERT INTO achievements (id, name, description) VALUES
  ('first_lesson', 'firstSteps', 'Complete your first lesson'),
  ('streak_3_days', 'consistentLearner', 'Learn for 3 days in a row'),
  ('xp_100', 'firstSteps', 'Reach 100 total XP')
ON CONFLICT (id) DO NOTHING;
`;

export function initializeDatabase(): void {
  console.log(`Initializing database at: ${dbPath}`);
  db.exec(SCHEMA_SQL);
  db.exec(SEED_SQL);
  console.log("Database ready.");
}

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
