import type { Generated, ColumnType } from "kysely";

export interface DB {
  users: {
    id: Generated<number>;
    tg_id: number;
    tg_username: string;
    first_name: string;
    last_name: string | null;
    created_at: ColumnType<Date, string | undefined, never>;
  };
  event: {
    id: Generated<number>;
    name: string;
    date: ColumnType<Date, string | undefined, never>;
    description: string;
  };
  feedback: {
    id: Generated<number>;
    message: string;
    userId: string;
    username: string | null;
    createdAt: ColumnType<Date, string | undefined, never>;
  };
}
