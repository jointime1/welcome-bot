import { Kysely, PostgresDialect } from "kysely";
import { Pool } from "pg";
import { up } from "./001_create_event_table";

const db = new Kysely<any>({
  dialect: new PostgresDialect({
    pool: new Pool({
      connectionString: process.env.DATABASE_URL,
    }),
  }),
});

async function applyMigrations() {
  await up(db);
  console.log("Миграции успешно применены");
  await db.destroy();
}

applyMigrations().catch((err) => {
  console.error("Ошибка при применении миграций:", err);
  process.exit(1);
});
