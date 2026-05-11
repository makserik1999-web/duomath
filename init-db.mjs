import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';
import url from 'url';

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));

const dbPath = path.join(__dirname, 'database.sqlite');

function initDb() {
  console.log(`Connecting to database: ${dbPath}`);
  const db = new Database(dbPath);

  try {
    const schemaSql = fs.readFileSync(path.join(__dirname, 'infra', 'schema.sql'), 'utf8');
    const seedSql = fs.readFileSync(path.join(__dirname, 'infra', 'seed_math.sql'), 'utf8');

    console.log('Running schema.sql...');
    db.exec(schemaSql);

    console.log('Running seed_math.sql...');
    db.exec(seedSql);

    console.log('Database initialized successfully!');
  } catch (error) {
    console.error('Error initializing database:', error);
    process.exit(1);
  } finally {
    db.close();
  }
}

initDb();
