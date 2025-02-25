import { Kysely, sql } from "kysely";

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable("users")
    .addColumn("id", "serial", (col) => col.primaryKey())
    .addColumn("tg_id", "integer", (col) => col.notNull())
    .addColumn("tg_username", "varchar", (col) => col.notNull())
    .addColumn("first_name", "varchar", (col) => col.notNull())
    .addColumn("last_name", "varchar")
    .addColumn("created_at", "timestamp", (col) =>
      col.defaultTo(sql`now()`).notNull()
    )
    .execute();

  await db.schema
    .createTable("event")
    .addColumn("id", "serial", (col) => col.primaryKey())
    .addColumn("name", "varchar", (col) => col.notNull())
    .addColumn("date", "timestamp", (col) => col.notNull())
    .addColumn("description", "text", (col) => col.notNull())
    .execute();

  await db.schema
    .createTable("feedback")
    .addColumn("id", "serial", (col) => col.primaryKey())
    .addColumn("message", "text", (col) => col.notNull())
    .addColumn("user_id", "varchar", (col) => col.notNull())
    .addColumn("username", "varchar")
    .addColumn("created_at", "timestamp", (col) =>
      col.defaultTo(sql`now()`).notNull()
    )
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable("feedback").execute();
  await db.schema.dropTable("event").execute();
  await db.schema.dropTable("users").execute();
}
