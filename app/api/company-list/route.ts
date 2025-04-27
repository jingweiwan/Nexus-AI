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

    // 从数据库获取公司列表信息
    const companys = await sql`
      SELECT id, company_name, company_code
      FROM company
    `;

    // 返回公司列表信息
    return NextResponse.json(companys, { status: 200 });
  } catch (error) {
    console.error('获取公司列表信息失败', error);
    return NextResponse.json({ error: '服务器错误' }, { status: 500 });
  }
}