import {drizzle} from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema/schema';
import dotenv from 'dotenv';

dotenv.config();

const postgresUrl = process.env.POSTGRES_URL;

// Allow landing-page deployments without database env vars.
// DB-backed routes will fail only when actually invoked.
export const client = postgresUrl ? postgres(postgresUrl) : null;
export const db = postgresUrl ? drizzle(client, {schema}) : null;

