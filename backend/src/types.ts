export type User = {
  id: string;
  email: string;
  name?: string;
  passwordHash: string;
  createdAt: string;
};

export type Topic = {
  id: string;
  name: string;
  gradeLabel: string;
  sortOrder: number;
};

export type Lesson = {
  id: string;
  topicId: string;
  title: string;
  level: string;
  sortOrder: number;
};

export type Question = {
  id: string;
  lessonId: string;
  prompt: string;
  choices: string[];
  correctAnswer: string;
  sortOrder: number;
};

export type UserStats = {
  userId: string;
  xp: number;
  streakDays: number;
  lastActivityAt: string | null;
};

export type UserAchievement = {
  id: string;
  name: string;
  description: string;
  unlockedAt: string;
};

export type LessonResult = {
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  xpGained: number;
  streakDays: number;
  unlockedAchievements: UserAchievement[];
};
