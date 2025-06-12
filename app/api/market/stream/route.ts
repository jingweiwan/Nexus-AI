// app/api/market/stream/route.ts
import { NextRequest } from 'next/server';
import { marketData } from '../route';
import { PriceData } from '../types/market';

export async function GET(request: NextRequest): Promise<Response> {
  const requestId = Math.random().toString(36).substring(2, 10);
  console.log(`[${requestId}] 收到SSE连接请求`);

  // 获取查询参数
  const { searchParams } = new URL(request.url);
  const symbols = searchParams.get('symbols')?.split(',') || [];
  console.log(`[${requestId}] SSE请求的符号:`, symbols);

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      let counter = 0;
      let isActive = true;

      // 发送初始连接成功消息
      controller.enqueue(encoder.encode(`event: connected\ndata: {"status":"connected","requestId":"${requestId}"}\n\n`));

      const sendUpdate = () => {
        // 如果流已关闭，不再发送数据
        if (!isActive) return;

        try {
          counter++;
          // 减少日志频率，仅在开始和每10次更新时记录
          if (counter === 1 || counter % 10 === 0) {
            console.log(`[${requestId}] SSE发送更新 #${counter}`);
          }

          // 检查marketData中是否有数据
          const hasRealData = symbols.some(code => {
            const lowerCode = code.toLowerCase();
            return marketData[lowerCode] && marketData[lowerCode].price > 0;
          });

          // 如果指定了symbols，只返回请求的符号数据
          if (symbols.length > 0) {
            const filteredData: Record<string, PriceData> = {};
            symbols.forEach(code => {
              const lowerCode = code.toLowerCase();
              if (marketData[lowerCode] && marketData[lowerCode].price > 0) {
                filteredData[lowerCode] = marketData[lowerCode];
              } else if (counter === 1) {
                // 仅在首次发送时记录缺失数据的警告
                console.log(`[${requestId}] 警告: 未找到${lowerCode}的价格数据`);
              }
            });

            // 仅在数据变化或首次发送时记录
            if (counter === 1 || Object.keys(filteredData).length > 0) {
              console.log(`[${requestId}] SSE发送数据:`,
                hasRealData ? '实时数据' : '测试数据',
                counter === 1 ? filteredData : '(数据已省略)'
              );
            }

            controller.enqueue(encoder.encode(`data: ${JSON.stringify(filteredData)}\n\n`));
          } else {
            // 否则返回所有数据
            const allData = Object.keys(marketData).length > 0
              ? marketData // 使用真实数据
              : {};  // 使用测试数据

            if (counter === 1) {
              console.log(`[${requestId}] SSE发送所有数据:`,
                Object.keys(allData).length > 0 ? '有数据' : '无数据'
              );
            }

            controller.enqueue(encoder.encode(`data: ${JSON.stringify(allData)}\n\n`));
          }
        } catch (error) {
          console.error(`[${requestId}] SSE数据发送错误:`, error);

          // 尝试发送错误消息
          try {
            controller.enqueue(encoder.encode(`event: error\ndata: ${JSON.stringify({
              error: 'Data processing error',
              message: error instanceof Error ? error.message : String(error)
            })}\n\n`));
          } catch (e) {
            console.error(`[${requestId}] 无法发送错误消息:`, e);
          }
        }
      };

      // 立即发送一次数据
      sendUpdate();

      // 设置定时发送更新
      const interval = setInterval(sendUpdate, 3000);

      // 处理连接关闭
      request.signal.addEventListener('abort', () => {
        console.log(`[${requestId}] SSE连接关闭`);
        clearInterval(interval);
        isActive = false;

        try {
          // 发送关闭事件
          controller.enqueue(encoder.encode(`event: close\ndata: {"status":"closed"}\n\n`));
          controller.close();
        } catch (e) {
          // 流可能已经关闭，忽略错误
        }
      });

      // 设置最大连接时间 (5分钟)
      const timeout = setTimeout(() => {
        console.log(`[${requestId}] SSE连接超时关闭 (5分钟限制)`);
        clearInterval(interval);
        isActive = false;

        try {
          // 发送超时事件
          controller.enqueue(encoder.encode(`event: timeout\ndata: {"status":"timeout","message":"Connection timeout after 5 minutes"}\n\n`));
          controller.close();
        } catch (e) {
          // 流可能已经关闭，忽略错误
        }
      }, 5 * 60 * 1000);

      request.signal.addEventListener('abort', () => {
        clearTimeout(timeout);
      });
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no' // 禁用Nginx缓冲
    }
  });
}