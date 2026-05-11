import { createApp } from "./app.js";
import { config } from "./config.js";
import { ensureConnection } from "./db.js";

async function bootstrap(): Promise<void> {
  await ensureConnection();
  const app = createApp();
  app.listen(config.port, () => {
    console.log(`API started on port ${config.port}`);
  });
}

bootstrap().catch((error) => {
  console.error("Failed to start API", error);
  process.exit(1);
});
