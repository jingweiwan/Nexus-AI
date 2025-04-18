import jwt from 'jsonwebtoken';
import { Redis } from '@upstash/redis'

// 确保设置了环境变量
const JWT_SECRET = process.env.JWT_SECRET;
// 用户类型定义
export type UserJwtPayload = {
  id: string;
  email: string;
  name: string;
  exp?: number; // exp是可选的，因为在生成token时不需要手动提供
};

const redisClient = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN
});


// 生成JWT
export function generateToken(user: Omit<UserJwtPayload, 'exp'>): string {
  // jwt.sign会自动添加exp字段，所以不需要在user对象中提供
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      name: user.name
    },
    JWT_SECRET || '',
    { expiresIn: '7d' } // 令牌7天后过期
  );
}

// 验证JWT
export async function verifyToken(token: string) {
  try {
    // 先从Redis查询
    const cachedPayload = await redisClient.get(`token:${token}`) as UserJwtPayload;
    if (cachedPayload) {
      return cachedPayload;
    }
    // 验证token
    const payload = await jwt.verify(token, JWT_SECRET || '') as UserJwtPayload;
    console.log('payload', payload);
    // 存入Redis，设置过期时间
    if (payload.exp) {
      const ttl = payload.exp - Math.floor(Date.now() / 1000);
      if (ttl > 0) {
        await redisClient.set(`token:${token}`, JSON.stringify(payload), { ex: ttl });
      }
    }

    return payload;
  } catch (error) {
    console.error('Token验证失败:', error);
    return null;
  }
}