import Redis from "ioredis";

const redisClient = new Redis(process.env.REDIS_URL);

redisClient.on("error", (err) => {
  console.log("Redis Error:", err);
});

redisClient.on("connect", () => {
  console.log("redis connected");
});

export default redisClient;
