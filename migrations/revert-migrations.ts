import { Kysely, PostgresDialect } from "kysely";
import { Pool } from "pg";
import { down } from "./001_create_event_table";

const db = new Kysely<any>({
  dialect: new PostgresDialect({
    pool: new Pool({
      connectionString: process.env.DATABASE_URL,
    }),
  }),
});

async function revertMigrations() {
  await down(db);
  console.log("Миграции успешно откачены");
  await db.destroy();
}

revertMigrations().catch((err) => {
  console.error("Ошибка при откате миграций:", err);
  process.exit(1);
});
