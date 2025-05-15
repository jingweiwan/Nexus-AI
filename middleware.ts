import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from '@/app/lib/auth';
import { extendTokenExpiry } from '@/app/lib/redis';

// 不需要登录就可以访问的路径
const publicPaths = ['/login', '/register', '/', '/api/login', '/api/register'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 检查是否为公开路径
  const isPublicPath = publicPaths.some(path =>
    path === pathname || pathname.startsWith('/api/') && !pathname.startsWith('/api/me')
  );

  // 获取 auth-token cookie
  const authCookie = request.cookies.get('auth-token');

  // 如果是公开路径，直接放行
  if (isPublicPath) {
    return NextResponse.next();
  }

  // 如果不是公开路径且没有 auth-token，重定向到登录页
  if (!authCookie) {
    const url = new URL('/login', request.url);
    return NextResponse.redirect(url);
  }

  const response = NextResponse.next();

  if (authCookie) {
    try {
      // 解析 JWT 获取用户信息
      const payload = await verifyToken(authCookie.value);
      if (!payload) {
        return NextResponse.redirect(new URL('/login', request.url));
      }
      const userId = payload.id;

      // 设置新的过期时间（例如7天）
      const expiryInSeconds = 7 * 24 * 60 * 60;
      const newExpiry = new Date();
      newExpiry.setSeconds(newExpiry.getSeconds() + expiryInSeconds);

      // 更新 Redis 中 token 的过期时间
      const tokenExtended = await extendTokenExpiry(userId, expiryInSeconds);

      // 如果 Redis 中的 token 成功更新，则更新 Cookie
      if (tokenExtended) {
        response.cookies.set({
          name: 'auth-token',
          value: authCookie.value,
          expires: newExpiry,
          path: '/',
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict'
        });
      }
    } catch (error) {
      console.error('Token 验证失败:', error);
      // 清除无效的 Cookie
      response.cookies.delete('auth-token');
      // 重定向到登录页
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  // 有 auth-token，放行
  return response;
}

// 配置中间件应用的路径
export const config = {
  matcher: [
    /*
     * 匹配所有路径，除了:
     * - api 路由 (除了 /api/me)
     * - 静态文件 (_next/static, favicon.ico 等)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};