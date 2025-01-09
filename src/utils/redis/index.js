const { createClient } = require("redis");

const ENV = process.env.NODE_ENV;

const createRedisClient = () => {
  const client = createClient({
    username: process.env.REDIS_USERNAME,
    password: process.env.REDIS_PASSWORD,
    socket: {
      host: process.env.REDIS_HOST,
      port: process.env.REDIS_PORT,
    },
  });

  client.on("connect", () => {
    console.log("Connected to Redis");
  });

  client.on("error", (err) => {
    console.error("Redis client error:", err.message);
  });

  const connect = async () => {
    try {
      await client.connect();
    } catch (err) {
      console.error("Failed to connect to Redis:", err.message);
    }
  };

  const isAlive = () => client.isOpen;

  const get = async (key) => {
    try {
      return await client.get(key);
    } catch (err) {
      console.error("Error getting value:", err.message);
      return null;
    }
  };

  const set = async (key, value, ttl) => {
    try {
      await client.set(key, value, { EX: ttl });
    } catch (err) {
      console.error("Error setting value:", err.message);
    }
  };

  const del = async (key) => {
    try {
      await client.del(key);
    } catch (err) {
      console.error("Error deleting value:", err.message);
    }
  };

  const deleteAllKeys = async () => {
    try {
      await client.flushDb();
    } catch (err) {
      console.error("Error deleting keys:", err.message);
    }
  };

  return {
    connect,
    isAlive,
    get,
    set,
    del,
    deleteAllKeys,
  };
};

const redisClient = createRedisClient();

(async () => {
  if (ENV === "prod") {
    await redisClient.connect();
  }
})();

module.exports = redisClient;
