import { createClient } from "redis";

const redisUrl = process.env.REDIS_URL || process.env.REDIS_HOST || "redis://localhost:6379";

const client = createClient({ url: redisUrl });

client.on("error", (err) => {
  console.error("Redis Client Error", err);
});

await client.connect();

function isObject(value) {
  return value !== null && (typeof value === "object" || Array.isArray(value));
}

export const cache = {
  async get(key) {
    const value = await client.get(key);
    if (value === null) return null;
    try {
      return JSON.parse(value);
    } catch {
      return value;
    }
  },
  async set(key, value, ttlSeconds = 300) {
    const serialized = isObject(value) ? JSON.stringify(value) : String(value);
    if (ttlSeconds && Number.isFinite(ttlSeconds)) {
      await client.set(key, serialized, { EX: ttlSeconds });
    } else {
      await client.set(key, serialized);
    }
    return true;
  },
  async has(key) {
    const exists = await client.exists(key);
    return exists === 1;
  },
  async del(key) {
    await client.del(key);
    return true;
  },
  /** expose raw client if needed */
  client,
};