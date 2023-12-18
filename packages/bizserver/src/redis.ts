import * as redis from "redis";
import env from "src/envs"

const redis_client: redis.RedisClientType = redis.createClient({
  url: env.REDIS_URL
});

export {redis_client}
