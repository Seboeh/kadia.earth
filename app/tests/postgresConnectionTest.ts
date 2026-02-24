// @ts-nocheck
import { Client } from "pg";

async function testDb() {
    const connectionString = process.env.POSTGRES_URL;
    const client = new Client({ connectionString });

    try {
        console.log("🔌 Connecting to Postgres...");
        await client.connect();
        console.log("✅ Connected!");
        const res = await client.query("SELECT NOW()");
        console.log("🕓 Server time:", res.rows[0].now);
    } catch (err) {
        console.error("❌ Connection failed:", err);
    } finally {
        await client.end();
    }
}

testDb();
