import { createClient } from "redis";

const ENV = "prod";

// Redis connection credentials
const REDIS_USERNAME = process.env.REDIS_USERNAME || "default";
const REDIS_PASSWORD =
  process.env.REDIS_PASSWORD || "gQ2qxhKoOk9dwnr70Xv1B1zGyykEW3SP";
const REDIS_HOST =
  process.env.REDIS_HOST ||
  "redis-15341.c15.us-east-1-4.ec2.redns.redis-cloud.com";
const REDIS_PORT = process.env.REDIS_PORT || 15341;

class RedisClient {
  constructor() {
    this.client = null;
    this.isConnected = false;

    if (ENV === "prod") {
      this.client = createClient({
        url: `redis://${REDIS_USERNAME}:${REDIS_PASSWORD}@${REDIS_HOST}:${REDIS_PORT}`,
      });

      this.client.on("connect", () => {
        console.log("Connected to Redis");
        this.isConnected = true;
      });

      this.client.on("error", (err) => {
        console.error("Redis client error:", err.message);
        this.isConnected = false;
      });

      this.client.on("end", () => {
        console.log("Redis client disconnected");
        this.isConnected = false;
      });
    } else {
      console.warn("Redis operations are only enabled in production.");
    }
  }

  async connect() {
    if (!this.client) {
      console.warn(
        "Redis is not initialized. This operation is only allowed in production."
      );
      return;
    }
    try {
      await this.client.connect();
    } catch (err) {
      console.error("Failed to connect to Redis:", err.message);
    }
  }

  isAlive() {
    return this.isConnected;
  }

  async get(key) {
    if (ENV !== "prod" || !this.client) {
      console.warn("Redis operations are only available in production.");
      return null;
    }
    try {
      return await this.client.get(key);
    } catch (err) {
      console.error("Error getting value:", err.message);
      return null;
    }
  }

  async set(key, value, ttl) {
    if (ENV !== "prod" || !this.client) {
      console.warn("Redis operations are only available in production.");
      return;
    }
    try {
      await this.client.set(key, value, { EX: ttl });
    } catch (err) {
      console.error("Error setting value:", err.message);
    }
  }

  async del(key) {
    if (ENV !== "prod" || !this.client) {
      console.warn("Redis operations are only available in production.");
      return;
    }
    try {
      await this.client.del(key);
    } catch (err) {
      console.error("Error deleting value:", err.message);
    }
  }

  async deleteAllKeys() {
    if (ENV !== "prod" || !this.client) {
      console.warn("Redis operations are only available in production.");
      return;
    }
    try {
      await this.client.flushDb();
    } catch (err) {
      console.error("Error deleting keys:", err.message);
    }
  }
}

const redisClient = new RedisClient();

if (ENV === "prod") {
  (async () => {
    await redisClient.connect();
  })();
}

export default redisClient;
