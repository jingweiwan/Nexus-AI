"use client";

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

type UserData = {
  name: string;
  email: string;
  password: string;
};

export default function RegisterForm() {
  const router = useRouter();
  const [formData, setFormData] = useState<UserData>({
    name: '',
    email: '',
    password: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'age' ? (value ? parseInt(value) : undefined) : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '注册失败');
      }

      setSuccess(true);
      setFormData({ name: '', email: '', password: ''});
      router.push('/login');
    } catch (err) {
      setError(err instanceof Error ? err.message : '发生未知错误');
    } finally {
      setLoading(false);
    }
  };

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md mx-auto w-full"
      >
        <Card className="w-full shadow-xl bg-white/90 backdrop-blur-sm">
          <CardHeader className="bg-gradient-to-r from-gray-100 to-gray-200 rounded-t-lg">
            <CardTitle className="text-2xl font-bold text-center text-gray-800">用户注册</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-4"
              >
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              </motion.div>
            )}

            {success && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-4"
              >
                <Alert variant="default" className="bg-gray-100 text-gray-700 border-gray-200">
                  <AlertDescription>注册成功！</AlertDescription>
                </Alert>
              </motion.div>
            )}

            <motion.form
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              onSubmit={handleSubmit}
              className="space-y-5"
            >
              <motion.div variants={itemVariants} className="mb-4 space-y-2">
                <Label htmlFor="name" className="text-gray-700">姓名</Label>
                <Input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full bg-white/70 backdrop-blur-sm border-gray-300 focus:border-black focus:ring-black"
                />
              </motion.div>

              <motion.div variants={itemVariants} className="mb-4 space-y-2">
                <Label htmlFor="password" className="text-gray-700">密码</Label>
                <Input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="w-full bg-white/70 backdrop-blur-sm border-gray-300 focus:border-black focus:ring-black"
                />
              </motion.div>

              <motion.div variants={itemVariants} className="mb-4 space-y-2">
                <Label htmlFor="email" className="text-gray-700">电子邮箱</Label>
                <Input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full bg-white/70 backdrop-blur-sm border-gray-300 focus:border-black focus:ring-black"
                />
              </motion.div>

              <motion.div variants={itemVariants}>
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-medium py-2 rounded-md shadow-md"
                >
                  {loading ? '处理中...' : '注册'}
                </Button>
              </motion.div>

              <motion.div
                variants={itemVariants}
                className="text-center mt-6 text-gray-600"
              >
                已有账号？
                <Link href="/login" className="text-orange-600 hover:text-orange-800 ml-1 font-medium">
                  登录
                </Link>
              </motion.div>
            </motion.form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};