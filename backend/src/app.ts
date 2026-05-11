import bcrypt from "bcryptjs";
import cors from "cors";
import express, { type NextFunction, type Request, type Response } from "express";
import jwt from "jsonwebtoken";
import { randomUUID } from "node:crypto";
import { z } from "zod";
import { config } from "./config.js";
import * as db from "./db.js";

type AuthRequest = Request & { userId?: string };

const authSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(1).max(100).optional(),
});

const submitSchema = z.object({
  answers: z.array(
    z.object({
      questionId: z.string(),
      answer: z.string(),
    })
  ),
});

function signAccessToken(userId: string): string {
  return jwt.sign({ sub: userId }, config.accessSecret, {
    expiresIn: config.accessTtl as jwt.SignOptions["expiresIn"],
  });
}

function signRefreshToken(userId: string): string {
  const expiresInSeconds = config.refreshTtlDays * 24 * 60 * 60;
  return jwt.sign({ sub: userId }, config.refreshSecret, {
    expiresIn: expiresInSeconds,
  });
}

function authMiddleware(req: AuthRequest, res: Response, next: NextFunction): void {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const token = header.substring("Bearer ".length);
  try {
    const payload = jwt.verify(token, config.accessSecret) as { sub: string };
    req.userId = payload.sub;
    next();
  } catch {
    res.status(401).json({ error: "Unauthorized" });
  }
}

export function createApp(): express.Express {
  const app = express();
  const frontendUrl = process.env.FRONTEND_URL;
  app.use(cors(frontendUrl ? { origin: frontendUrl } : {}));
  app.use(express.json());

  app.get("/health", (_req, res) => {
    res.json({ data: { status: "ok" }, error: null });
  });

  app.post("/api/auth/register", async (req, res) => {
    const parsed = authSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid payload" });
      return;
    }

    const existing = await db.findUserByEmail(parsed.data.email);
    if (existing) {
      res.status(409).json({ error: "Email already in use" });
      return;
    }

    const userId = randomUUID();
    const now = new Date().toISOString();
    const passwordHash = await bcrypt.hash(parsed.data.password, 10);
    await db.createUser({
      id: userId,
      email: parsed.data.email,
      name: parsed.data.name,
      passwordHash,
      createdAt: now,
    });

    const accessToken = signAccessToken(userId);
    const refreshToken = signRefreshToken(userId);
    const refreshExpiresAt = new Date(
      Date.now() + config.refreshTtlDays * 24 * 60 * 60 * 1000
    ).toISOString();
    await db.saveRefreshToken(refreshToken, userId, refreshExpiresAt);

    res.status(201).json({ data: { accessToken, refreshToken }, error: null });
  });

  app.post("/api/auth/guest", async (_req, res) => {
    const userId = randomUUID();
    const now = new Date().toISOString();
    const guestEmail = `guest_${userId.split("-")[0]}@duomath.local`;
    const passwordHash = await bcrypt.hash(randomUUID(), 10);

    await db.createUser({
      id: userId,
      email: guestEmail,
      name: "Guest",
      passwordHash,
      createdAt: now,
    });

    const accessToken = signAccessToken(userId);
    const refreshToken = signRefreshToken(userId);
    const refreshExpiresAt = new Date(
      Date.now() + config.refreshTtlDays * 24 * 60 * 60 * 1000
    ).toISOString();
    await db.saveRefreshToken(refreshToken, userId, refreshExpiresAt);

    res.status(201).json({ data: { accessToken, refreshToken }, error: null });
  });

  app.post("/api/auth/login", async (req, res) => {
    const parsed = authSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid payload" });
      return;
    }

    const user = await db.findUserByEmail(parsed.data.email);
    if (!user) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }

    const valid = await bcrypt.compare(parsed.data.password, user.passwordHash);
    if (!valid) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }

    const accessToken = signAccessToken(user.id);
    const refreshToken = signRefreshToken(user.id);
    const refreshExpiresAt = new Date(
      Date.now() + config.refreshTtlDays * 24 * 60 * 60 * 1000
    ).toISOString();
    await db.saveRefreshToken(refreshToken, user.id, refreshExpiresAt);

    res.json({ data: { accessToken, refreshToken }, error: null });
  });

  app.post("/api/auth/refresh", async (req, res) => {
    const token = req.body?.refreshToken;
    if (typeof token !== "string") {
      res.status(400).json({ error: "Missing refresh token" });
      return;
    }

    const exists = await db.hasRefreshToken(token);
    if (!exists) {
      res.status(401).json({ error: "Invalid refresh token" });
      return;
    }

    try {
      const payload = jwt.verify(token, config.refreshSecret) as { sub: string };
      await db.revokeRefreshToken(token);
      const accessToken = signAccessToken(payload.sub);
      const refreshToken = signRefreshToken(payload.sub);
      const refreshExpiresAt = new Date(
        Date.now() + config.refreshTtlDays * 24 * 60 * 60 * 1000
      ).toISOString();
      await db.saveRefreshToken(refreshToken, payload.sub, refreshExpiresAt);
      res.json({ data: { accessToken, refreshToken }, error: null });
    } catch {
      res.status(401).json({ error: "Invalid refresh token" });
    }
  });

  app.post("/api/auth/logout", async (req, res) => {
    const token = req.body?.refreshToken;
    if (typeof token === "string") {
      await db.revokeRefreshToken(token);
    }
    res.status(204).send();
  });

  app.get("/api/auth/me", authMiddleware, async (req: AuthRequest, res) => {
    const user = await db.findUserById(req.userId!);
    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }
    res.json({ data: { id: user.id, email: user.email, name: user.name }, error: null });
  });

  app.get("/api/topics", authMiddleware, async (_req, res) => {
    const topics = await db.listTopics();
    res.json({ data: topics, error: null });
  });

  app.get("/api/topics/:topicId/lessons", authMiddleware, async (req, res) => {
    const lessons = await db.listLessonsByTopic(req.params.topicId);
    res.json({ data: lessons, error: null });
  });

  app.get("/api/lessons/:lessonId", authMiddleware, async (req, res) => {
    const lesson = await db.findLessonById(req.params.lessonId);
    if (!lesson) {
      res.status(404).json({ error: "Lesson not found" });
      return;
    }
    const questions = await db.listQuestionsByLesson(lesson.id);
    const sanitizedQuestions = questions.map((q) => ({
      id: q.id,
      lessonId: q.lessonId,
      prompt: q.prompt,
      choices: q.choices,
      correctAnswer: q.correctAnswer,
      sortOrder: q.sortOrder,
    }));
    res.json({ data: { lesson, questions: sanitizedQuestions }, error: null });
  });

  app.post(
    "/api/lessons/:lessonId/submit",
    authMiddleware,
    async (req: AuthRequest, res) => {
      const lesson = await db.findLessonById(req.params.lessonId);
      if (!lesson) {
        res.status(404).json({ error: "Lesson not found" });
        return;
      }
      const parsed = submitSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({ error: "Invalid payload" });
        return;
      }
      const result = await db.submitLesson(req.userId!, lesson.id, parsed.data.answers);
      res.json({ data: result, error: null });
    }
  );

  app.get("/api/progress/me", authMiddleware, async (req: AuthRequest, res) => {
    const progress = await db.getUserProgress(req.userId!);
    res.json({ data: progress, error: null });
  });

  app.get("/api/stats/me", authMiddleware, async (req: AuthRequest, res) => {
    const stats = await db.getUserStats(req.userId!);
    res.json({ data: stats, error: null });
  });

  app.get("/api/achievements/me", authMiddleware, async (req: AuthRequest, res) => {
    const achievements = await db.getUserAchievements(req.userId!);
    res.json({ data: achievements, error: null });
  });

  app.post("/api/debug/bootstrap-user-stats", async (req, res) => {
    const parsed = z.object({ userId: z.string().uuid() }).safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid payload" });
      return;
    }
    await db.ensureUserStats(parsed.data.userId);
    res.status(204).send();
  });

  app.use((error: unknown, _req: Request, res: Response, _next: NextFunction) => {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  });

  return app;
}
