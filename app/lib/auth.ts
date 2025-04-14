import jwt from 'jsonwebtoken';

// 确保设置了环境变量
const JWT_SECRET = process.env.JWT_SECRET || '9a410db607fc864540c4d6ca51005e48e3fcc04878c2ede9bb678b5e9985b5545abae1a98ed7a03616f99e257d5e7e9b2d4b8a6922e3f73810a6bc095f32ce91';

// 用户类型定义
export type UserJwtPayload = {
  id: string;
  email: string;
  name: string;
};

// 生成JWT
export function generateToken(user: UserJwtPayload): string {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      name: user.name
    },
    JWT_SECRET,
    { expiresIn: '7d' } // 令牌7天后过期
  );
}

// 验证JWT
export function verifyToken(token: string): UserJwtPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as UserJwtPayload;
  } catch (error) {
    return null;
  }
}