import { generateText, streamText } from 'ai';
import { createDeepSeek } from '@ai-sdk/deepseek';
import { createXai } from "@ai-sdk/xai";
import { createOpenAI, openai } from "@ai-sdk/openai";
import { verifyToken } from '@/app/lib/auth';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { getWeather } from '@/app/lib/ai-tools/get-weather';
import { webSearch } from '@/app/lib/ai-tools/web-search';


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

    const openai = createOpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    switch (model) {
      case 'openai':
        console.log('openai');
        console.log('===========');
        console.log(messages);
        try {
          const openaiResult = streamText({
            model: openai("gpt-4o-mini"),
            tools: {
              getWeather,
              web_search_preview: openai.tools.webSearchPreview()
            },
            messages,
          });
          console.log(openaiResult);
          return openaiResult.toDataStreamResponse();
        } catch (error) {
          console.error('OpenAI API error:', error);
          return Response.json(
            { error: error instanceof Error ? error.message : 'Unknown error occurred' },
            { status: 500 }
          );
        }
      case 'xai':
        try {
        console.log('xai');
          const xaiResult = streamText({
            model: xai("grok-3-mini-beta"),
            tools: {
              getWeather,
              webSearch
            },
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
            getWeather,
            webSearch
          },
          toolChoice: { type: 'tool', toolName: 'webSearch' },
          system: '你是一位智能助手，可以回答各种问题。当用户询问需要最新信息的问题时，你应该主动使用网络搜索工具获取最新数据。获取数据后，请分析搜索结果并用中文提供详细回答。',
          // system: '你是一位经验丰富的美股期权交易专家，擅长分析市场趋势，提供交易策略，并解答交易相关问题。请根据用户的问题，用中文给出详细的分析和建议。',
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