import { type FastifyBaseLogger } from "fastify";
import {
  CamelCasePlugin,
  DeduplicateJoinsPlugin,
  Kysely,
  PostgresDialect,
} from "kysely";
import pg from "pg";

import { config } from "./config.ts";

import type { DB } from "./schema.ts";

export function createDataSource({ logger }: { logger: FastifyBaseLogger }) {
  const dialect = new PostgresDialect({
    pool: new pg.Pool({
      connectionString: config.DATABASE_URL,
      max: config.DATABASE_MAX_CONNECTIONS,
    }),
  });

  return new Kysely<DB>({
    dialect,
    plugins: [new DeduplicateJoinsPlugin(), new CamelCasePlugin()],
    log(event) {
      if (event.level === "error") {
        logger.error(
          {
            durationMs: event.queryDurationMillis,
            error: event.error,
            sql: event.query.sql,
            params: event.query.parameters,
          },
          "Query failed"
        );

        return;
      }

      // `'query'`
      logger.info(
        {
          durationMs: event.queryDurationMillis,
          sql: event.query.sql,
          params: event.query.parameters,
        },
        "Query executed"
      );
    },
  });
}

export function closeDatabaseConnection(dataSource: Kysely<DB>) {
  return () => dataSource.destroy();
}
