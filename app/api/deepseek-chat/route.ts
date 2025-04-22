import { streamText } from 'ai';
import { createDeepSeek } from '@ai-sdk/deepseek';
import { verifyToken } from '@/app/lib/auth';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token');

    // 如果没有令牌，返回未授权
    if (!token) {
      return NextResponse.json({ error: '未授权' }, { status: 401 });
    }

    // 验证令牌
    const payload = await verifyToken(token.value);
    if (!payload) {
      return NextResponse.json({ error: '无效的令牌' }, { status: 401 });
    }
    const { messages } = await req.json();
    const deepseek = createDeepSeek({
      apiKey: process.env.DEEPSEEK_API_KEY,
    });

    // 使用流式响应
    const result = streamText({
      model: deepseek('deepseek-chat'),
      system: '你是一位经验丰富的美股期权交易专家，擅长分析市场趋势，提供交易策略，并解答交易相关问题。请根据用户的问题，用中文给出详细的分析和建议。',
      messages,
    });
    // 返回流式响应
    return result.toDataStreamResponse();
  } catch (error) {
    console.error('DeepSeek API error:', error);
    return Response.json(
      { error: error instanceof Error ? error.message : 'Unknown error occurred' },
      { status: 500 }
    );
  }
}