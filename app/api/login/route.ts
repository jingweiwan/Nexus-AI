import { NextResponse } from 'next/server';
import { z } from 'zod';
import postgres from 'postgres';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import { generateToken } from '@/app/lib/auth';

const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' });

// 登录数据验证模式
const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(3)
});

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // 验证请求数据
    const validatedData = loginSchema.parse(body);

    // 查询用户
    const users = await sql`SELECT * FROM users WHERE email = ${validatedData.email}`;

    // 检查用户是否存在
    if (users.length === 0) {
      return NextResponse.json({ error: '邮箱或密码不正确' }, { status: 401 });
    }

    const user = users[0];

    // 验证密码
    const passwordMatch = await bcrypt.compare(validatedData.password, user.password);

    if (!passwordMatch) {
      return NextResponse.json({ error: '邮箱或密码不正确' }, { status: 401 });
    }
    // 登录成功，生成JWT
    const { password, ...userWithoutPassword } = user;
    // 确保传递给 generateToken 的对象符合 UserJwtPayload 类型
    const token = await generateToken({
      id: user.id,
      email: user.email,
      name: user.name
    });

    // 设置Cookie
    const cookieStore = await cookies();
    cookieStore.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7, // 7天
      path: '/',
      sameSite: 'strict'
    });

    return NextResponse.json(userWithoutPassword, { status: 200 });
  } catch (error) {
    console.error('登录失败', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: '登录失败' }, { status: 500 });
  }
}