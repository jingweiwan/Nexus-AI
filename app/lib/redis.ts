import { Redis } from '@upstash/redis'

// 创建 Redis 客户端
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN
});


// 存储 token 到 Redis
export const storeToken = async (userId: string, token: string, expiryInSeconds: number) => {
  const key = `user:token:${userId}`;
  await redis.set(key, token, { ex: expiryInSeconds });
};

// 验证 token 是否有效
export const validateToken = async (userId: string, token: string) => {
  const key = `user:token:${userId}`;
  const storedToken = await redis.get(key);
  return storedToken === token;
};

// 更新 token 的过期时间
export const extendTokenExpiry = async (userId: string, expiryInSeconds: number) => {
  const key = `user:token:${userId}`;
  const token = await redis.get(key);

  if (token) {
    await redis.expire(key, expiryInSeconds);
    return true;
  }

  return false;
};

// 删除 token（用于登出）
export const removeToken = async (userId: string) => {
  const key = `user:token:${userId}`;
  await redis.del(key);
};