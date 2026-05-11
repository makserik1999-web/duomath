import dotenv from "dotenv";

dotenv.config();

export const config = {
  port: Number(process.env.PORT ?? 4000),
  databaseUrl:
    process.env.DATABASE_URL ??
    "postgres://mvp_user:mvp_password@localhost:5432/mvp_db",
  accessSecret: process.env.JWT_ACCESS_SECRET ?? "dev_access_secret_change_me",
  refreshSecret:
    process.env.JWT_REFRESH_SECRET ?? "dev_refresh_secret_change_me",
  accessTtl: process.env.ACCESS_TOKEN_TTL ?? "15m",
  refreshTtlDays: Number(process.env.REFRESH_TOKEN_TTL_DAYS ?? 7),
};
