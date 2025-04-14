import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/app/lib/auth';
import postgres from 'postgres';

const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' });

export async function GET() {
  try {
    // 获取 cookie 中的 auth-token
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token');

    // 如果没有令牌，返回未授权
    if (!token) {
      return NextResponse.json({ error: '未授权' }, { status: 401 });
    }

    // 验证令牌
    const payload = verifyToken(token.value);

    // 如果令牌无效，返回未授权
    if (!payload) {
      return NextResponse.json({ error: '无效的令牌' }, { status: 401 });
    }

    // 从数据库获取用户信息
    const users = await sql`
      SELECT id, name, email
      FROM users
      WHERE id = ${payload.id}
    `;

    // 如果用户不存在，返回未授权
    if (users.length === 0) {
      return NextResponse.json({ error: '用户不存在' }, { status: 401 });
    }

    // 返回用户信息（不包含密码）
    return NextResponse.json(users[0], { status: 200 });
  } catch (error) {
    console.error('获取用户信息失败', error);
    return NextResponse.json({ error: '服务器错误' }, { status: 500 });
  }
}