import request from "supertest";
import { describe, expect, it, vi } from "vitest";
import jwt from "jsonwebtoken";
import { createApp } from "../src/app.js";
import * as db from "../src/db.js";
import { config } from "../src/config.js";

describe("app", () => {
  it("returns healthy status", async () => {
    const app = createApp();
    const response = await request(app).get("/health");
    expect(response.status).toBe(200);
    expect(response.body.data.status).toBe("ok");
  });

  it("rejects invalid auth payload", async () => {
    const app = createApp();
    const response = await request(app).post("/api/auth/login").send({
      email: "bad",
      password: "123",
    });
    expect(response.status).toBe(400);
  });

  it("protects topics endpoint with auth", async () => {
    const app = createApp();
    const response = await request(app).get("/api/topics");
    expect(response.status).toBe(401);
  });

  it("returns lesson submit result shape", async () => {
    const app = createApp();
    vi.spyOn(db, "findLessonById").mockResolvedValueOnce({
      id: "aaaaaaa1-aaaa-aaaa-aaaa-aaaaaaaaaaa1",
      topicId: "11111111-1111-1111-1111-111111111111",
      title: "One-step equations",
      level: "easy",
      sortOrder: 1,
    });
    vi.spyOn(db, "submitLesson").mockResolvedValueOnce({
      score: 100,
      totalQuestions: 2,
      correctAnswers: 2,
      xpGained: 40,
      streakDays: 2,
      unlockedAchievements: [],
    });
    const token = jwt.sign(
      { sub: "9f2c2fe0-117f-41ba-b7d7-f1174e744fb2" },
      config.accessSecret
    );

    const response = await request(app)
      .post("/api/lessons/aaaaaaa1-aaaa-aaaa-aaaa-aaaaaaaaaaa1/submit")
      .set("Authorization", `Bearer ${token}`)
      .send({
        answers: [
          {
            questionId: "11111111-1111-1111-1111-111111111111",
            answer: "4",
          },
        ],
      });

    expect(response.status).toBe(200);
    expect(response.body.data.xpGained).toBe(40);
    expect(response.body.data.streakDays).toBe(2);
  });
});
