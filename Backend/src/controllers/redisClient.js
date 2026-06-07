import { createClient } from "redis";

const redisClient = createClient({
  url: "redis://127.0.0.1:6379",
});
redisClient.on("error", (err) => {
  console.log("Redis Error:", err);
});
await redisClient.connect();
console.log("redis connected");
export default redisClient;
