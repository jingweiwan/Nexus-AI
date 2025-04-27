import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// 不需要登录就可以访问的路径
const publicPaths = ['/login', '/register', '/', '/api/login', '/api/register'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 检查是否为公开路径
  const isPublicPath = publicPaths.some(path =>
    path === pathname || pathname.startsWith('/api/') && !pathname.startsWith('/api/me')
  );

  // 获取 auth-token cookie
  const authToken = request.cookies.get('auth-token');

  // 如果是公开路径，直接放行
  if (isPublicPath) {
    return NextResponse.next();
  }

  // 如果不是公开路径且没有 auth-token，重定向到登录页
  if (!authToken) {
    const url = new URL('/login', request.url);
    return NextResponse.redirect(url);
  }

  // 有 auth-token，放行
  return NextResponse.next();
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