import type {Config} from 'drizzle-kit';

export default {
  schema: './lib/db/schema',
  out: './lib/db/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: "postgres://postgres:postgres@localhost:54322/postgres",
  },
} satisfies Config;
