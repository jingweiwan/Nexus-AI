'use client';

import NexusLogo from '@/components/ui/nexusLogo';
import { ArrowRightIcon } from '@heroicons/react/24/outline';
import { ChartBarIcon, ShieldCheckIcon, CurrencyDollarIcon, UserGroupIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import styles from './ui/home.module.css';
import { lusitana } from './ui/fonts';
import Image from 'next/image';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useAuth } from '@/app/contexts/AuthContext';

export default function Page() {
  const { user, loading } = useAuth();
  const isLoggedIn = !!user;

  return (
    <main className="flex min-h-screen flex-col p-6">
      <div className="flex h-20 shrink-0 items-end rounded-lg bg-primary p-4 md:h-52 relative">
        <NexusLogo />

        <div className="absolute top-4 right-4 hidden md:flex space-x-4">
          <div className="bg-white/10 backdrop-blur-md rounded-lg p-3 flex items-center">
            <div className="text-center">
              <div className="text-xs text-gray-300">BTC</div>
              <div className="text-sm font-bold text-white">$36,789</div>
              <div className="text-xs text-red-400">-2.4%</div>
            </div>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-lg p-3 flex items-center">
            <div className="text-center">
              <div className="text-xs text-gray-300">ETH</div>
              <div className="text-sm font-bold text-white">$2,456</div>
              <div className="text-xs text-green-400">+1.2%</div>
            </div>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-lg p-3 flex items-center">
            <div className="text-center">
              <div className="text-xs text-gray-300">市场情绪</div>
              <div className="text-sm font-bold text-white">中性</div>
            </div>
          </div>
        </div>
      </div>
      <div className="mt-4 flex grow flex-col gap-4 md:flex-row">
        <div className="flex flex-col  gap-6 rounded-lg bg-card px-6 py-10 md:w-2/5 md:px-20">
          {/* <div className={styles.shape}></div> */}
          <p className={`${lusitana.className} text-xl text-card-foreground md:text-3xl md:leading-normal `}>
            <strong>欢迎来到 Nexus.</strong>
            <br />
            <strong>你的专属期权交易追踪助手</strong>
          </p>
          <p className="text-muted-foreground mb-4">
            专业的期权交易分析工具，帮助您实时追踪市场动态，优化交易策略，降低风险，提高收益。
          </p>
          {loading ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : isLoggedIn ? (
            <div className="flex flex-col space-y-4 md:flex-row md:space-x-4 md:space-y-0">
              <Link
                href="/dashboard"
                className={cn(
                  buttonVariants({ variant: "default", size: "lg" }),
                  "self-start"
                )}
              >
                <span>进入仪表盘</span> <ArrowRightIcon className="w-5 md:w-6" />
              </Link>
            </div>
          ) : (
            <div className="flex flex-col space-y-4 md:flex-row md:space-x-4 md:space-y-0">
              <Link
                href="/login"
                className={cn(
                  buttonVariants({ variant: "default", size: "lg" }),
                  "self-start"
                )}
              >
                <span>登录</span> <ArrowRightIcon className="w-5 md:w-6" />
              </Link>
              <Link
                href="/register"
                className={cn(
                  buttonVariants({ variant: "secondary", size: "lg" }),
                  "self-start"
                )}
              >
                <span>注册</span> <ArrowRightIcon className="w-5 md:w-6" />
              </Link>
            </div>
          )}
          <div className="mt-8 grid grid-cols-2 gap-4 text-center">
            <div className="rounded-lg bg-muted p-4">
              <p className="text-2xl font-bold">10,000+</p>
              <p className="text-sm text-muted-foreground">活跃用户</p>
            </div>
            <div className="rounded-lg bg-muted p-4">
              <p className="text-2xl font-bold">¥1.2亿</p>
              <p className="text-sm text-muted-foreground">交易额</p>
            </div>
          </div>
        </div>
        <div className="flex flex-col items-center justify-center p-6 md:w-3/5 md:px-28 md:py-12">
          <div className="relative mb-8 transition-all duration-300 hover:scale-105 shadow-lg rounded-xl overflow-hidden">
            <Image
              src="/nexus-dashboard.jpeg"
              width={1000}
              height={760}
              className="hidden md:block"
              alt="Nexus仪表盘界面截图"
            />
            <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
          </div>
          <div className="relative transition-all duration-300 hover:scale-105 shadow-lg rounded-xl overflow-hidden">
            <Image
              src="/demo.png"
              width={1000}
              height={760}
              className="hidden md:block"
              alt="Nexus演示界面截图"
            />
            <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
          </div>
          <Image
            src="/hero-mobile.png"
            width={560}
            height={620}
            className="block md:hidden rounded-lg shadow-md"
            alt="Nexus移动端界面截图"
          />
          <div className="grid grid-cols-2 gap-4 mt-8 w-full">
            <div className="bg-card p-4 rounded-lg flex flex-col items-center text-center">
              <ChartBarIcon className="h-8 w-8 text-primary mb-2" />
              <h3 className="font-medium">实时市场分析</h3>
              <p className="text-sm text-muted-foreground">全面的市场数据和图表分析</p>
            </div>
            <div className="bg-card p-4 rounded-lg flex flex-col items-center text-center">
              <ShieldCheckIcon className="h-8 w-8 text-primary mb-2" />
              <h3 className="font-medium">风险管理</h3>
              <p className="text-sm text-muted-foreground">智能风险评估和预警系统</p>
            </div>
            <div className="bg-card p-4 rounded-lg flex flex-col items-center text-center">
              <CurrencyDollarIcon className="h-8 w-8 text-primary mb-2" />
              <h3 className="font-medium">策略优化</h3>
              <p className="text-sm text-muted-foreground">AI辅助交易策略推荐</p>
            </div>
            <div className="bg-card p-4 rounded-lg flex flex-col items-center text-center">
              <UserGroupIcon className="h-8 w-8 text-primary mb-2" />
              <h3 className="font-medium">专家社区</h3>
              <p className="text-sm text-muted-foreground">与交易专家交流学习</p>
            </div>
          </div>
        </div>
      </div>
      <div className="mt-12 bg-card rounded-lg p-6">
        <h2 className={`${lusitana.className} text-2xl font-bold text-center mb-8`}>用户评价</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-muted p-4 rounded-lg">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-bold mr-3">L</div>
              <div>
                <p className="font-medium">李先生</p>
                <p className="text-sm text-muted-foreground">期权交易员</p>
              </div>
            </div>
            <p className="text-muted-foreground">"Nexus的风险管理功能帮我避免了很多潜在亏损，非常实用的平台。"</p>
          </div>
          <div className="bg-muted p-4 rounded-lg">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-bold mr-3">W</div>
              <div>
                <p className="font-medium">王女士</p>
                <p className="text-sm text-muted-foreground">投资顾问</p>
              </div>
            </div>
            <p className="text-muted-foreground">"界面直观，数据全面，是我向客户推荐期权投资策略的得力助手。"</p>
          </div>
          <div className="bg-muted p-4 rounded-lg">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-bold mr-3">Z</div>
              <div>
                <p className="font-medium">张先生</p>
                <p className="text-sm text-muted-foreground">个人投资者</p>
              </div>
            </div>
            <p className="text-muted-foreground">"作为期权新手，Nexus的教育资源和分析工具让我快速上手并获得了不错的收益。"</p>
          </div>
        </div>
      </div>
    </main>
  );
}