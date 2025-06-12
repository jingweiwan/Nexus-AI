// app/api/market/data.ts - 新创建的数据API端点
import { NextResponse } from 'next/server';
import { getMarketData } from '../route';

export async function GET(request: Request): Promise<NextResponse> {
  // 获取查询参数
  const url = new URL(request.url);
  const symbols = url.searchParams.get('symbols');

  const currentMarketData = getMarketData();

  // 如果指定了symbols参数，只返回请求的符号数据
  if (symbols) {
    const requestedSymbols = symbols.split(',');
    const filteredData: Record<string, any> = {};

    requestedSymbols.forEach(symbol => {
      const lowerSymbol = symbol.toLowerCase();
      if (currentMarketData[lowerSymbol]) {
        filteredData[lowerSymbol] = currentMarketData[lowerSymbol];
      }
    });

    return NextResponse.json(filteredData);
  }

  // 返回所有市场数据
  return NextResponse.json(currentMarketData);
}