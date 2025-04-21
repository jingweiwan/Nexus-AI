import { streamText } from 'ai';
import { createDeepSeek } from '@ai-sdk/deepseek';

export async function POST(req: Request) {
  try {
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