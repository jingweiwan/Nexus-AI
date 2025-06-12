import type { NextConfig } from 'next';
import createNextPwa from 'next-pwa'; // 导入 next-pwa

// 使用导入的 createNextPwa 函数并传入 PWA 配置
const withPWA = createNextPwa({
  dest: 'public',
  register: true,
  skipWaiting: true,
  // disable: process.env.NODE_ENV === 'development', // 在开发环境中禁用 PWA (可选)
});

/** @type {import('next').NextConfig} */
const nextConfig: NextConfig = {
  // 你可以在这里添加其他 Next.js 配置
  // 例如:
  // reactStrictMode: true,
  // images: {
  //   domains: ['example.com'],
  // },
};

// 使用 export default 导出由 withPWA 包装后的配置
export default withPWA(nextConfig);