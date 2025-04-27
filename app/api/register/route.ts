import { NextResponse } from 'next/server';
import { z } from 'zod';

import postgres from 'postgres';
import bcrypt from 'bcryptjs';

const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' });
// 用户数据验证模式
const userSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(3),
  age: z.number().min(18).optional()
});

// 获取所有用户
export async function GET() {
  try {
    const users = await sql`SELECT id, name, email FROM users`;
    return NextResponse.json(users, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: '获取用户失败' }, { status: 500 });
  }
}

// 创建新用户
export async function POST(request: Request) {
  try {
    const body = await request.json();

    // 验证请求数据
    const validatedData = userSchema.parse(body);

    // 检查邮箱是否已存在
    const existingUser = await sql`SELECT * FROM users WHERE email = ${validatedData.email}`;
    if (existingUser.length > 0) {
      return NextResponse.json({ error: '邮箱已被注册' }, { status: 400 });
    }


    const hashedPassword = await bcrypt.hash(validatedData.password, 10);


    // 创建新用户
    const newUser = await sql`
      INSERT INTO users (name, email, password)
      VALUES (${validatedData.name}, ${validatedData.email}, ${hashedPassword})
      RETURNING id, name, email
    `;

    return NextResponse.json(newUser[0], { status: 201 });
  } catch (error) {
    console.error('创建用户失败', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: '创建用户失败' }, { status: 500 });
  }
}