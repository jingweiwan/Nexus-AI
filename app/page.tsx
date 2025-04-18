'use client';

import NexusLogo from '@/components/ui/nexusLogo';
import { ArrowRightIcon } from '@heroicons/react/24/outline';
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
      <div className="flex h-20 shrink-0 items-end rounded-lg bg-primary p-4 md:h-52">
        <NexusLogo />
      </div>
      <div className="mt-4 flex grow flex-col gap-4 md:flex-row">
        <div className="flex flex-col justify-center gap-6 rounded-lg bg-card px-6 py-10 md:w-2/5 md:px-20">
          <div className={styles.shape}></div>
          <p className={`${lusitana.className} text-xl text-card-foreground md:text-3xl md:leading-normal `}>
            <strong>欢迎来到 Nexus.</strong>
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
        </div>
      </div>
    </main>
  );
}