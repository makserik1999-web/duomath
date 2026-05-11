# Release Checklist

## Pre-release
- Ensure both env files are filled (`infra/.env.backend`, `infra/.env.frontend`).
- Run backend checks: `npm run lint && npm test && npm run build`.
- Run frontend checks: `npm run lint && npm test && npm run build`.
- Verify database schema is applied in staging.

## Smoke test
- Register new account.
- Login and open learning dashboard.
- Open topic and start lesson.
- Submit answers and verify score.
- Verify XP and streak changes on dashboard.
- Verify first achievement unlock after first lesson.
- Logout and login again.

## Release
- Merge to main.
- Confirm CI green.
- Deploy backend.
- Deploy frontend.
- Run staging and production health checks.
