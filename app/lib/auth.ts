import { SignJWT, jwtVerify } from 'jose';
import { storeToken, validateToken, extendTokenExpiry, removeToken } from '@/app/lib/redis';

// 确保设置了环境变量
const JWT_SECRET = process.env.JWT_SECRET || '';
// 用户类型定义
export type UserJwtPayload = {
  id: string;
  email: string;
  name: string;
  exp?: number; // exp是可选的，因为在生成token时不需要手动提供
};

// 生成JWT
export async function generateToken(user: Omit<UserJwtPayload, 'exp'>): Promise<string> {
  // 创建一个新的 SignJWT 实例
  const secretKey = new TextEncoder().encode(JWT_SECRET);
  const expiryInSeconds = 7 * 24 * 60 * 60; // 7天的秒数

  const token = await new SignJWT({
    id: user.id,
    email: user.email,
    name: user.name
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(secretKey);

  // 存储token到Redis
  await storeToken(user.id, token, expiryInSeconds);

  return token;
}

// 验证JWT
export async function verifyToken(token: string) {
  try {
    const secretKey = new TextEncoder().encode(JWT_SECRET);
    // 验证token
    const { payload } = await jwtVerify(token, secretKey);
    const userPayload = payload as UserJwtPayload;

    // 验证Redis中是否存在该token
    if (userPayload.id) {
      const isValid = await validateToken(userPayload.id, token);
      if (!isValid) {
        return null;
      }
    }

    return userPayload;
  } catch (error) {
    console.error('Token验证失败:', error);
    return null;
  }
}