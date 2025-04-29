import {
  type UIMessage,
  appendResponseMessages,
  createDataStreamResponse,
  smoothStream,
  streamText,
  tool,
  ToolExecutionError
} from 'ai';
import { verifyToken } from '@/app/lib/auth';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { getWeather } from '@/app/lib/ai-tools/get-weather';
import { webSearch } from '@/app/lib/ai-tools/web-search';
import { createDeepSeek } from '@ai-sdk/deepseek';
import { createXai } from "@ai-sdk/xai";
import { createOpenAI, openai as openaiClient } from "@ai-sdk/openai";

export const maxDuration = 60;

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

    const { messages, model, useWebSearch } = await req.json();

    const deepseek = createDeepSeek({
      apiKey: process.env.DEEPSEEK_API_KEY,
    });

    const xai = createXai({
      apiKey: process.env.GROK_API_KEY,
    });

    const openai = createOpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const getModelProvider = (modelType: string) => {
      switch (modelType) {
        case 'openai':
          return openai("gpt-4o-mini");
        case 'xai':
          return xai("grok-3-mini-beta");
        case 'deepseek':
          return deepseek('deepseek-chat');
        default:
          return openai("gpt-4o-mini");
      }
    };

    const getSystemPrompt = (modelType: string) => {
      if (useWebSearch) {
        const basePrompt = '你是一位智能助手，可以回答各种问题。当用户询问需要最新信息的问题时，你应该主动使用网络搜索工具获取最新数据。获取数据后，请分析搜索结果并用中文提供详细回答。请以markdown格式回答用户的问题。';

        if (modelType === 'deepseek') {
          return '你是一位智能助手，擅长回答各种问题，尤其是需要最新数据的查询。当用户询问股票价格等需要实时信息的问题时，主动使用 webSearch 工具获取最新数据。获取搜索结果后，仔细分析结果，提取最相关和最新的信息（例如股票价格、数据来源和日期），并用简洁、准确的中文提供详细回答。回答应包括：1）明确回答用户的问题；2）引用搜索结果中的关键数据；3）说明数据的来源和时间。如果搜索结果不足以回答问题，说明原因并提供替代建议。在使用工具后，请返回结果 请以markdown格式回答用户的问题。';
        }

        return basePrompt;
      }

      return '你是一位智能助手，可以回答各种问题。请以markdown格式回答用户的问题。';
    };

    const getTools = (modelType: string) => {
      // 基础工具对象
      const baseTools = { getWeather };

      // 如果不使用网络搜索，只返回基础工具
      if (!useWebSearch) {
        return baseTools;
      }

      // 根据模型类型返回不同的工具集
      if (modelType === 'openai') {
        return {
          ...baseTools,
          webSearch: openaiClient.tools.webSearchPreview()
        };
      }
      return { ...baseTools, webSearch };
    };

    const result = streamText({
      model: getModelProvider(model),
      system: getSystemPrompt(model),
      messages,
      maxSteps: 5,
      tools: getTools(model),
      experimental_transform: [smoothStream({ chunking: 'word' })],
      toolCallStreaming: true,
      maxTokens: 1000,
      experimental_telemetry: {
        isEnabled: true,
        functionId: 'stream-text',
      },
      onFinish: async ({ response }) => {
        console.log('Chat completed successfully');
      },
      onError: (error) => {
        if (error instanceof ToolExecutionError) {
          console.error(`Tool execution error:`, error);
        } else {
          console.error(`API error:`, error);
        }
      },
    });

    return result.toDataStreamResponse({
      getErrorMessage: (error) => {
        if (error instanceof ToolExecutionError) {
          return error.message;
        }
        return '抱歉，处理您的请求时发生错误！';
      }
    });
  } catch (error) {
    console.error('API error:', error);
    const stream = new TransformStream();
    const writer = stream.writable.getWriter();
    writer.write(new TextEncoder().encode('抱歉，处理您的请求时发生错误！'));
    writer.close();
    return new Response(stream.readable);
  }
}