import * as redis from "redis";
import env from "src/envs"

const redisClient: redis.RedisClientType = redis.createClient({
  url: env.REDIS_URL
});

redisClient.on('error', err => console.log('Redis Client Error', err));

export { redisClient }
