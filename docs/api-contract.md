# API Contract v1

Base URL: `/api`

## Auth
- `POST /auth/register` -> creates user and returns token pair
- `POST /auth/login` -> returns token pair
- `POST /auth/refresh` -> rotates refresh token and returns new token pair
- `POST /auth/logout` -> revokes refresh token
- `GET /auth/me` -> current user profile

## Learning content
- `GET /topics` -> list available math topics
- `GET /topics/:topicId/lessons` -> list lessons in topic
- `GET /lessons/:lessonId` -> lesson details and questions (without correct answers)
- `POST /lessons/:lessonId/submit` -> evaluate answers and return score + rewards

### Submit request body
```json
{
  "answers": [
    { "questionId": "uuid", "answer": "4" }
  ]
}
```

### Submit response
```json
{
  "data": {
    "score": 100,
    "totalQuestions": 3,
    "correctAnswers": 3,
    "xpGained": 50,
    "streakDays": 2,
    "unlockedAchievements": []
  },
  "error": null
}
```

## Student dashboard
- `GET /progress/me` -> completed lessons and best scores
- `GET /stats/me` -> xp, streak, last activity
- `GET /achievements/me` -> unlocked achievements

## Response envelope
```json
{
  "data": {},
  "error": null
}
```

## Auth headers
`Authorization: Bearer <accessToken>`
