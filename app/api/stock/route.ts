import { NextResponse } from 'next/server';
import WebSocket from 'ws';

// 存储价格数据的对象
let cryptoData = {};

// 存储上次价格的对象
let lastPrices = {};

// 当前订阅的符号列表
let subscribedSymbols = [];

// WebSocket实例
let socket = null;

// 创建WebSocket连接
const setupWebSocket = () => {
  // 关闭已存在的连接
  if (socket) {
    socket.terminate();
  }

  socket = new WebSocket(`wss://ws.finnhub.io?token=${process.env.FINNHUB_API_KEY}`);

  socket.on('open', () => {
    console.log('已连接到Finnhub WebSocket');

    // 订阅所有已添加的符号
    subscribedSymbols.forEach(symbol => {
      socket.send(JSON.stringify({ 'type': 'subscribe', 'symbol': symbol }));
    });
  });

  socket.on('message', (data) => {
    try {
      const message = JSON.parse(data.toString());

      // 处理价格更新消息
      if (message.type === 'trade') {
        message.data.forEach((trade) => {
          const symbol = trade.s;
          const price = trade.p;

          // 从完整符号(如BINANCE:BTCUSDT)中提取货币代码(如BTC)
          const currencyCode = extractCurrencyCode(symbol);

          if (currencyCode && cryptoData[currencyCode] !== undefined) {
            if (lastPrices[currencyCode] > 0) {
              const changePercent = ((price - lastPrices[currencyCode]) / lastPrices[currencyCode]) * 100;
              cryptoData[currencyCode] = {
                price: Math.round(price),
                change: parseFloat(changePercent.toFixed(1))
              };
            } else {
              cryptoData[currencyCode] = {
                price: Math.round(price),
                change: 0
              };
            }
            lastPrices[currencyCode] = price;
          }
        });
      }
    } catch (error) {
      console.error('解析WebSocket消息失败:', error);
    }
  });

  socket.on('error', (error) => {
    console.error('WebSocket错误:', error);
    setTimeout(setupWebSocket, 5000); // 尝试重连
  });

  socket.on('close', () => {
    console.log('WebSocket连接已关闭');
    setTimeout(setupWebSocket, 5000); // 连接关闭时尝试重连
  });

  return socket;
};

// 从交易所符号中提取货币代码
const extractCurrencyCode = (symbol) => {
  // 例如从"BINANCE:BTCUSDT"提取"BTC"
  if (symbol.includes('BTCUSDT')) return 'btc';
  if (symbol.includes('ETHUSDT')) return 'eth';
  // 可以添加更多的映射

  // 通用提取逻辑 (如果符号格式统一)
  const match = symbol.match(/[^:]+:([A-Za-z]+)USDT/);
  if (match && match[1]) {
    return match[1].toLowerCase();
  }

  return null;
};

// 添加新的加密货币到监控列表
const addCryptoToWatch = (code, symbol) => {
  // 小写化代码以保持一致性
  const lowerCode = code.toLowerCase();

  // 如果这个代码还没有被监控
  if (cryptoData[lowerCode] === undefined) {
    // 初始化数据
    cryptoData[lowerCode] = { price: 0, change: 0 };
    lastPrices[lowerCode] = 0;

    // 添加到订阅列表
    if (!subscribedSymbols.includes(symbol)) {
      subscribedSymbols.push(symbol);

      // 如果WebSocket已连接，发送新的订阅请求
      if (socket && socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({ 'type': 'subscribe', 'symbol': symbol }));
      }
    }
  }
};

// 初始化一些默认的加密货币
addCryptoToWatch('btc', 'BINANCE:BTCUSDT');
addCryptoToWatch('eth', 'BINANCE:ETHUSDT');

// 启动WebSocket连接
if (typeof process !== 'undefined') {
  setupWebSocket();
}

export async function GET(request) {
  // 获取查询参数
  const { searchParams } = new URL(request.url);
  const symbols = searchParams.get('symbols');

  // 如果指定了symbols参数
  if (symbols) {
    // 解析请求的符号列表
    const requestedSymbols = symbols.split(',');
    const response = {};

    // 为每个请求的符号添加数据
    requestedSymbols.forEach(code => {
      const lowerCode = code.toLowerCase();

      // 如果已经有这个符号的数据，就添加到响应中
      if (cryptoData[lowerCode]) {
        response[lowerCode] = cryptoData[lowerCode];
      } else {
        // 对于新的符号，添加到监控列表
        // 这里假设符号格式为代码+USDT，如btc -> BINANCE:BTCUSDT
        const exchangeSymbol = `BINANCE:${lowerCode.toUpperCase()}USDT`;
        addCryptoToWatch(lowerCode, exchangeSymbol);
        response[lowerCode] = { price: 0, change: 0, status: 'pending' };
      }
    });

    return NextResponse.json(response);
  }

  // 如果没有指定symbols参数，返回所有数据
  return NextResponse.json(cryptoData);
}

// 添加POST方法允许动态添加新的加密货币
export async function POST(request) {
  try {
    const body = await request.json();

    // 需要提供code和symbol
    if (!body.code || !body.symbol) {
      return NextResponse.json(
        { error: '需要提供code和symbol' },
        { status: 400 }
      );
    }

    // 添加到监控列表
    addCryptoToWatch(body.code, body.symbol);

    return NextResponse.json({
      success: true,
      message: `已添加${body.code}到监控列表`
    });
  } catch (error) {
    return NextResponse.json(
      { error: '请求处理失败', details: error.message },
      { status: 500 }
    );
  }
}
