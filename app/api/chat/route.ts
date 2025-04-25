import { generateText, streamText } from 'ai';
import { createDeepSeek } from '@ai-sdk/deepseek';
import { createXai } from "@ai-sdk/xai";
import { verifyToken } from '@/app/lib/auth';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { getWeather } from '@/app/lib/ai-tools/get-weather';


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
    const { messages, model } = await req.json();

    const deepseek = createDeepSeek({
      apiKey: process.env.DEEPSEEK_API_KEY,
    });

    const xai = createXai({
      apiKey: process.env.GROK_API_KEY,
    });
    switch (model) {
      case 'xai':
        console.log('xai');
        console.log('===========');
        console.log(messages);
        try {
          const xaiResult = streamText({
            model: xai("grok-3-beta"),
            messages,
          });
          console.log(xaiResult);
          return xaiResult.toDataStreamResponse();
        } catch (error) {
          console.error('XAI API error:', error);
          return Response.json(
            { error: error instanceof Error ? error.message : 'Unknown error occurred' },
            { status: 500 }
          );
        }
      case 'deepseek':
        // 使用流式响应
        const result = streamText({
          model: deepseek('deepseek-chat'),
          tools: {
            getWeather
          },
          system: '你是一位经验丰富的美股期权交易专家，擅长分析市场趋势，提供交易策略，并解答交易相关问题。请根据用户的问题，用中文给出详细的分析和建议。',
          messages,
        });
        console.log(result);
        // 返回流式响应
        return result.toDataStreamResponse();
      default:
        break;
    }



  } catch (error) {
    console.error('DeepSeek API error:', error);
    return Response.json(
      { error: error instanceof Error ? error.message : 'Unknown error occurred' },
      { status: 500 }
    );
  }
}