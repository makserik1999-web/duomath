const apiUrl = import.meta.env.VITE_API_URL ?? "http://localhost:4000/api";

export type AuthTokens = { accessToken: string; refreshToken: string };
export type Topic = { id: string; name: string; gradeLabel: string; sortOrder: number };
export type Lesson = {
  id: string;
  topicId: string;
  title: string;
  level: string;
  sortOrder: number;
};
export type LessonQuestion = {
  id: string;
  lessonId: string;
  prompt: string;
  choices: string[];
  correctAnswer: string;
  sortOrder: number;
};
export type LessonDetails = {
  lesson: Lesson;
  questions: LessonQuestion[];
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
export type UserProgress = {
  lessonId: string;
  bestScore: number;
  completedAt: string | null;
  topicName: string;
  lessonTitle: string;
};
export type UserInfo = {
  id: string;
  email: string;
  name?: string;
};

export async function apiRequest<T>(
  path: string,
  options: RequestInit = {},
  accessToken?: string
): Promise<T> {
  const headers = new Headers(options.headers ?? {});
  headers.set("Content-Type", "application/json");
  if (accessToken) headers.set("Authorization", `Bearer ${accessToken}`);

  const response = await fetch(`${apiUrl}${path}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || "Request failed");
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const body = (await response.json()) as { data: T };
  return body.data;
}

export const authApi = {
  register: (email: string, password: string, name?: string) =>
    apiRequest<AuthTokens>("/auth/register", {
      method: "POST",
      body: JSON.stringify({ email, password, name }),
    }),
  login: (email: string, password: string) =>
    apiRequest<AuthTokens>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),
  loginGuest: () =>
    apiRequest<AuthTokens>("/auth/guest", {
      method: "POST",
    }),
  refresh: (refreshToken: string) =>
    apiRequest<AuthTokens>("/auth/refresh", {
      method: "POST",
      body: JSON.stringify({ refreshToken }),
    }),
  logout: (refreshToken: string) =>
    apiRequest<void>("/auth/logout", {
      method: "POST",
      body: JSON.stringify({ refreshToken }),
    }),
  me: (accessToken: string) =>
    apiRequest<UserInfo>("/auth/me", {}, accessToken),
};

export const learningApi = {
  topics: (accessToken: string) => apiRequest<Topic[]>("/topics", {}, accessToken),
  lessonsByTopic: (accessToken: string, topicId: string) =>
    apiRequest<Lesson[]>(`/topics/${topicId}/lessons`, {}, accessToken),
  lessonDetails: (accessToken: string, lessonId: string) =>
    apiRequest<LessonDetails>(`/lessons/${lessonId}`, {}, accessToken),
  submitLesson: (
    accessToken: string,
    lessonId: string,
    answers: Array<{ questionId: string; answer: string }>
  ) =>
    apiRequest<LessonResult>(
      `/lessons/${lessonId}/submit`,
      {
        method: "POST",
        body: JSON.stringify({ answers }),
      },
      accessToken
    ),
  stats: (accessToken: string) => apiRequest<UserStats>("/stats/me", {}, accessToken),
  progress: (accessToken: string) =>
    apiRequest<UserProgress[]>("/progress/me", {}, accessToken),
  achievements: (accessToken: string) =>
    apiRequest<UserAchievement[]>("/achievements/me", {}, accessToken),
};
