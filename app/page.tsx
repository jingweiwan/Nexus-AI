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
import dashboardImage from '@/public/nexus-dashboard.jpeg';
import demoImage from '@/public/demo.png';
import heroMobileImage from '@/public/hero-mobile.png';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

export default function Page() {
  const { user, loading } = useAuth();
  const isLoggedIn = !!user;
  const [cryptoData, setCryptoData] = useState({
    btc: { price: 36789, change: -2.4 },
    eth: { price: 2456, change: 1.2 }
  });

  // 动画变体
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: 'spring', stiffness: 100 }
    }
  };

  const fadeInVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.6 } }
  };

  // 模拟加载实时数据
  useEffect(() => {
    const interval = setInterval(() => {
      setCryptoData({
        btc: {
          price: Math.floor(36000 + Math.random() * 2000),
          change: +(Math.random() * 6 - 3).toFixed(1)
        },
        eth: {
          price: Math.floor(2300 + Math.random() * 300),
          change: +(Math.random() * 4 - 2).toFixed(1)
        }
      });
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <main className="flex min-h-screen flex-col p-6">
      <motion.div
        className="flex h-20 shrink-0 items-end rounded-lg bg-primary p-4 md:h-52 relative"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <NexusLogo />
        </motion.div>

        <motion.div
          className="absolute top-4 right-4 hidden md:flex space-x-4"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <motion.div
            className="bg-white/10 backdrop-blur-md rounded-lg p-3 flex items-center"
            whileHover={{ scale: 1.05 }}
            transition={{ type: 'spring', stiffness: 400, damping: 10 }}
          >
            <div className="text-center">
              <div className="text-xs text-gray-300">BTC</div>
              <motion.div
                className="text-sm font-bold text-white"
                key={cryptoData.btc.price}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                ${cryptoData.btc.price}
              </motion.div>
              <motion.div
                className={`text-xs ${cryptoData.btc.change >= 0 ? 'text-green-400' : 'text-red-400'}`}
                key={cryptoData.btc.change}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                {cryptoData.btc.change >= 0 ? '+' : ''}{cryptoData.btc.change}%
              </motion.div>
            </div>
          </motion.div>
          <motion.div
            className="bg-white/10 backdrop-blur-md rounded-lg p-3 flex items-center"
            whileHover={{ scale: 1.05 }}
            transition={{ type: 'spring', stiffness: 400, damping: 10 }}
          >
            <div className="text-center">
              <div className="text-xs text-gray-300">ETH</div>
              <motion.div
                className="text-sm font-bold text-white"
                key={cryptoData.eth.price}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                ${cryptoData.eth.price}
              </motion.div>
              <motion.div
                className={`text-xs ${cryptoData.eth.change >= 0 ? 'text-green-400' : 'text-red-400'}`}
                key={cryptoData.eth.change}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                {cryptoData.eth.change >= 0 ? '+' : ''}{cryptoData.eth.change}%
              </motion.div>
            </div>
          </motion.div>
          <motion.div
            className="bg-white/10 backdrop-blur-md rounded-lg p-3 flex items-center"
            whileHover={{ scale: 1.05 }}
            transition={{ type: 'spring', stiffness: 400, damping: 10 }}
          >
            <div className="text-center">
              <div className="text-xs text-gray-300">市场情绪</div>
              <div className="text-sm font-bold text-white">中性</div>
            </div>
          </motion.div>
        </motion.div>
      </motion.div>
      <div className="mt-4 flex grow flex-col gap-4 md:flex-row">
        <motion.div
          className="flex flex-col gap-6 rounded-lg bg-card px-6 py-10 md:w-2/5 md:px-20"
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <motion.p
            className={`${lusitana.className} text-xl text-card-foreground md:text-3xl md:leading-normal`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.5 }}
          >
            <strong>欢迎来到 Nexus.</strong>
            <br />
            <strong>你的专属期权交易追踪助手</strong>
          </motion.p>
          <motion.p
            className="text-muted-foreground mb-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.7 }}
          >
            专业的期权交易分析工具，帮助您实时追踪市场动态，优化交易策略，降低风险，提高收益。
          </motion.p>
          {loading ? (
            <motion.div
              className="flex items-center justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </motion.div>
          ) : isLoggedIn ? (
            <motion.div
              className="flex flex-col space-y-4 md:flex-row md:space-x-4 md:space-y-0"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.8 }}
            >
              <Link
                href="/home"
                className={cn(
                  buttonVariants({ variant: "default", size: "lg" }),
                  "self-start"
                )}
              >
                <motion.span
                  whileHover={{ x: -3 }}
                  transition={{ type: 'spring', stiffness: 400 }}
                >
                  进入仪表盘
                </motion.span>
                <motion.span
                  whileHover={{ x: 3 }}
                  transition={{ type: 'spring', stiffness: 400 }}
                >
                  <ArrowRightIcon className="w-5 md:w-6" />
                </motion.span>
              </Link>
            </motion.div>
          ) : (
            <motion.div
              className="flex flex-col space-y-4 md:flex-row md:space-x-4 md:space-y-0"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.8 }}
            >
              <motion.div whileHover={{ scale: 1.05 }} transition={{ type: 'spring', stiffness: 400, damping: 10 }}>
                <Link
                  href="/login"
                  className={cn(
                    buttonVariants({ variant: "default", size: "lg" }),
                    "self-start"
                  )}
                >
                  <motion.span
                    whileHover={{ x: -3 }}
                    transition={{ type: 'spring', stiffness: 400 }}
                  >
                    登录
                  </motion.span>
                  <motion.span
                    whileHover={{ x: 3 }}
                    transition={{ type: 'spring', stiffness: 400 }}
                  >
                    <ArrowRightIcon className="w-5 md:w-6" />
                  </motion.span>
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} transition={{ type: 'spring', stiffness: 400, damping: 10 }}>
                <Link
                  href="/register"
                  className={cn(
                    buttonVariants({ variant: "secondary", size: "lg" }),
                    "self-start"
                  )}
                >
                  <motion.span
                    whileHover={{ x: -3 }}
                    transition={{ type: 'spring', stiffness: 400 }}
                  >
                    注册
                  </motion.span>
                  <motion.span
                    whileHover={{ x: 3 }}
                    transition={{ type: 'spring', stiffness: 400 }}
                  >
                    <ArrowRightIcon className="w-5 md:w-6" />
                  </motion.span>
                </Link>
              </motion.div>
            </motion.div>
          )}
          <motion.div
            className="mt-8 grid grid-cols-2 gap-4 text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 1 }}
          >
            <motion.div
              className="rounded-lg bg-muted p-4"
              whileHover={{ scale: 1.05, backgroundColor: 'rgba(var(--primary-rgb), 0.15)' }}
              transition={{ type: 'spring', stiffness: 300, damping: 10 }}
            >
              <motion.p
                className="text-2xl font-bold"
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 1.2 }}
              >
                10,000+
              </motion.p>
              <p className="text-sm text-muted-foreground">活跃用户</p>
            </motion.div>
            <motion.div
              className="rounded-lg bg-muted p-4"
              whileHover={{ scale: 1.05, backgroundColor: 'rgba(var(--primary-rgb), 0.15)' }}
              transition={{ type: 'spring', stiffness: 300, damping: 10 }}
            >
              <motion.p
                className="text-2xl font-bold"
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 1.4 }}
              >
                ¥1.2亿
              </motion.p>
              <p className="text-sm text-muted-foreground">交易额</p>
            </motion.div>
          </motion.div>
        </motion.div>
        <motion.div
          className="flex flex-col items-center justify-center p-6 md:w-3/5 md:px-28 md:py-12"
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <motion.div
            className="relative mb-8 shadow-lg rounded-xl overflow-hidden"
            whileHover={{ scale: 1.05 }}
            transition={{ type: 'spring', stiffness: 300, damping: 10 }}
          >
            <Image
              src={dashboardImage}
              width={1000}
              height={760}
              className="hidden md:block"
              alt="Nexus仪表盘界面截图"
            />
            <motion.div
              className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-transparent"
              initial={{ opacity: 0 }}
              whileHover={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            ></motion.div>
          </motion.div>
          <motion.div
            className="relative shadow-lg rounded-xl overflow-hidden"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.7 }}
            whileHover={{ scale: 1.05 }}
          >
            <Image
              src={demoImage}
              width={1000}
              height={760}
              className="hidden md:block"
              alt="Nexus演示界面截图"
            />
            <motion.div
              className="absolute inset-0 bg-gradient-to-tr from-primary/10 to-transparent"
              initial={{ opacity: 0 }}
              whileHover={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            ></motion.div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.8 }}
          >
            <Image
              src={heroMobileImage}
              width={560}
              height={620}
              className="block md:hidden rounded-lg shadow-md"
              alt="Nexus移动端界面截图"
            />
          </motion.div>
          <motion.div
            className="grid grid-cols-2 gap-4 mt-8 w-full"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.div
              className="bg-card p-4 rounded-lg flex flex-col items-center text-center"
              variants={itemVariants}
              whileHover={{ scale: 1.05, boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)' }}
            >
              <motion.div
                initial={{ rotateY: 0 }}
                animate={{ rotateY: 360 }}
                transition={{ duration: 1, delay: 1, repeat: Infinity, repeatDelay: 20 }}
              >
                <ChartBarIcon className="h-8 w-8 text-primary mb-2" />
              </motion.div>
              <h3 className="font-medium">实时市场分析</h3>
              <p className="text-sm text-muted-foreground">全面的市场数据和图表分析</p>
            </motion.div>
            <motion.div
              className="bg-card p-4 rounded-lg flex flex-col items-center text-center"
              variants={itemVariants}
              whileHover={{ scale: 1.05, boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)' }}
            >
              <motion.div
                animate={{
                  scale: [1, 1.2, 1],
                }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 5 }}
              >
                <ShieldCheckIcon className="h-8 w-8 text-primary mb-2" />
              </motion.div>
              <h3 className="font-medium">风险管理</h3>
              <p className="text-sm text-muted-foreground">智能风险评估和预警系统</p>
            </motion.div>
            <motion.div
              className="bg-card p-4 rounded-lg flex flex-col items-center text-center"
              variants={itemVariants}
              whileHover={{ scale: 1.05, boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)' }}
            >
              <motion.div
                animate={{
                  rotate: [0, 10, -10, 0],
                }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
              >
                <CurrencyDollarIcon className="h-8 w-8 text-primary mb-2" />
              </motion.div>
              <h3 className="font-medium">策略优化</h3>
              <p className="text-sm text-muted-foreground">AI辅助交易策略推荐</p>
            </motion.div>
            <motion.div
              className="bg-card p-4 rounded-lg flex flex-col items-center text-center"
              variants={itemVariants}
              whileHover={{ scale: 1.05, boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)' }}
            >
              <motion.div
                animate={{
                  y: [0, -5, 0],
                }}
                transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 4 }}
              >
                <UserGroupIcon className="h-8 w-8 text-primary mb-2" />
              </motion.div>
              <h3 className="font-medium">专家社区</h3>
              <p className="text-sm text-muted-foreground">与交易专家交流学习</p>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
      <motion.div
        className="mt-12 bg-card rounded-lg p-6"
        variants={fadeInVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.h2
          className={`${lusitana.className} text-2xl font-bold text-center mb-8`}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          用户评价
        </motion.h2>
        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div
            className="bg-muted p-4 rounded-lg"
            variants={itemVariants}
            whileHover={{ scale: 1.03, boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)' }}
          >
            <div className="flex items-center mb-4">
              <motion.div
                className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-bold mr-3"
                whileHover={{ scale: 1.1 }}
                transition={{ type: 'spring', stiffness: 400, damping: 10 }}
              >
                L
              </motion.div>
              <div>
                <p className="font-medium">李先生</p>
                <p className="text-sm text-muted-foreground">期权交易员</p>
              </div>
            </div>
            <p className="text-muted-foreground">"Nexus的风险管理功能帮我避免了很多潜在亏损，非常实用的平台。"</p>
          </motion.div>
          <motion.div
            className="bg-muted p-4 rounded-lg"
            variants={itemVariants}
            whileHover={{ scale: 1.03, boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)' }}
          >
            <div className="flex items-center mb-4">
              <motion.div
                className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-bold mr-3"
                whileHover={{ scale: 1.1 }}
                transition={{ type: 'spring', stiffness: 400, damping: 10 }}
              >
                W
              </motion.div>
              <div>
                <p className="font-medium">王女士</p>
                <p className="text-sm text-muted-foreground">投资顾问</p>
              </div>
            </div>
            <p className="text-muted-foreground">"界面直观，数据全面，是我向客户推荐期权投资策略的得力助手。"</p>
          </motion.div>
          <motion.div
            className="bg-muted p-4 rounded-lg"
            variants={itemVariants}
            whileHover={{ scale: 1.03, boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)' }}
          >
            <div className="flex items-center mb-4">
              <motion.div
                className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-bold mr-3"
                whileHover={{ scale: 1.1 }}
                transition={{ type: 'spring', stiffness: 400, damping: 10 }}
              >
                Z
              </motion.div>
              <div>
                <p className="font-medium">张先生</p>
                <p className="text-sm text-muted-foreground">个人投资者</p>
              </div>
            </div>
            <p className="text-muted-foreground">"作为期权新手，Nexus的教育资源和分析工具让我快速上手并获得了不错的收益。"</p>
          </motion.div>
        </motion.div>
      </motion.div>
    </main>
  );
}