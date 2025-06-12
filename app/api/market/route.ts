// app/api/market/route.ts
import { NextResponse } from 'next/server';
import WebSocket from 'ws';
import { MarketData, symbolToAssetCode, assetCodeToSymbol, FinnhubMessage, TradeData } from './types/market';

// 配置
const DEBUG_ENABLED = process.env.DEBUG === 'true';
const MAX_RECONNECT_ATTEMPTS = 5;
const RECONNECT_BASE_DELAY = 5000; // 5秒
const CONNECTION_TIMEOUT = 10000; // 10秒
const PING_INTERVAL = 30000; // 30秒

// 全局市场数据对象 - 不再导出，而是通过函数访问
const marketData: MarketData = {};

// 获取市场数据的函数 - 供其他模块使用
export function getMarketData(): MarketData {
  return { ...marketData }; // 返回副本以避免外部修改
}

// 昨日收盘价，用于计算变化百分比
const lastPrices: Record<string, number> = {};

// 已订阅的符号列表
let subscribedSymbols: string[] = [];

// WebSocket实例
let finnhubSocket: WebSocket | null = null;

// 标记是否已初始化
let isInitialized = false;

// 是否正在重连中
let isReconnecting = false;

// 重连计数器
let reconnectAttempts = 0;

// Ping定时器
let pingIntervalId: NodeJS.Timeout | null = null;

// 调试日志
const logDebug = (message: string, ...args: any[]) => {
  if (DEBUG_ENABLED) {
    console.log(`[DEBUG] ${message}`, ...args);
  }
};

// 信息日志
const logInfo = (message: string, ...args: any[]) => {
  console.log(message, ...args);
};

// 错误日志
const logError = (message: string, ...args: any[]) => {
  console.error(message, ...args);
};

// 获取或设置价格变化
const updateMarketPrice = (code: string, price: number): void => {
  // 保留价格到小数点后2位
  const formattedPrice = parseFloat(price.toFixed(2));

  // 如果是首次设置该资产价格，且没有昨日收盘价
  if (!marketData[code] && !lastPrices[code]) {
    marketData[code] = { price: formattedPrice, change: 0 };
    return;
  }

  // 计算价格变化百分比（相对于昨日收盘价）
  if (lastPrices[code] > 0) {
    const changePercent = ((price - lastPrices[code]) / lastPrices[code]) * 100;
    const newPrice = formattedPrice;
    // 保留变化百分比到小数点后2位
    const newChange = parseFloat(changePercent.toFixed(1));

    // 如果价格或变化百分比发生了显著变化，才记录日志
    const priceChanged = !marketData[code] || Math.abs(marketData[code].price - newPrice) >= 0.01;
    const changeChanged = !marketData[code] || Math.abs(marketData[code].change - newChange) >= 0.1;

    if (priceChanged || changeChanged) {
      logDebug(`${code.toUpperCase()} 价格更新: ${newPrice}, 变化: ${newChange}%`);
    }

    marketData[code] = {
      price: newPrice,
      change: newChange
    };
  } else {
    // 如果没有昨日收盘价，仅更新价格，不计算变化
    if (marketData[code]) {
      marketData[code].price = formattedPrice;
    } else {
      marketData[code] = { price: formattedPrice, change: 0 };
    }
  }
};

// 处理Finnhub的交易消息
const processTrade = (trade: TradeData): void => {
  const symbol = trade.s;
  const price = trade.p;

  // 调试级别日志
  logDebug(`处理交易数据: 符号=${symbol}, 价格=${price}`);

  // 从交易符号中提取资产代码
  const assetCode = symbolToAssetCode[symbol];
  if (assetCode) {
    updateMarketPrice(assetCode, price);
  } else {
    logDebug(`未找到符号 ${symbol} 的映射`);
  }
};

// 清理WebSocket资源
const cleanupWebSocket = () => {
  if (finnhubSocket) {
    try {
      // 移除所有监听器
      finnhubSocket.removeAllListeners();

      // 如果连接处于打开状态，尝试正常关闭
      if (finnhubSocket.readyState === WebSocket.OPEN) {
        finnhubSocket.close(1000, "正常关闭");
      }
    } catch (err) {
      logError('清理WebSocket资源出错:', err);
    }
  }

  // 清除ping定时器
  if (pingIntervalId) {
    clearInterval(pingIntervalId);
    pingIntervalId = null;
  }

  finnhubSocket = null;
};

// 单例模式获取WebSocket实例
const getWebSocketInstance = (): WebSocket => {
  if (!finnhubSocket || finnhubSocket.readyState > 1) { // 如果不存在或已关闭
    if (!isReconnecting) {
      finnhubSocket = setupWebSocket();
    }
  }
  return finnhubSocket as WebSocket;
};

// 创建WebSocket连接
const setupWebSocket = (): WebSocket => {
  // 避免多次重连请求重叠
  if (isReconnecting) {
    logDebug('已有重连请求在进行中，跳过此次重连');
    return finnhubSocket as WebSocket;
  }

  isReconnecting = true;

  // 清理现有连接
  cleanupWebSocket();

  // 创建新的连接
  logInfo('创建新的Finnhub WebSocket连接');
  const socket = new WebSocket(`wss://ws.finnhub.io?token=${process.env.FINNHUB_API_KEY}`);

  // 生成唯一的连接ID用于日志跟踪
  const connectionId = Math.random().toString(36).substring(2, 8);

  // 设置重连尝试超时
  const connectionTimeout = setTimeout(() => {
    if (socket.readyState !== WebSocket.OPEN) {
      logInfo(`[${connectionId}] WebSocket连接超时`);
      socket.close(1000, "连接超时");

      // 递增重连尝试次数
      reconnectAttempts++;
      isReconnecting = false;

      // 如果重连次数未超过最大值，进行重连
      if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
        const reconnectDelay = RECONNECT_BASE_DELAY * Math.pow(2, reconnectAttempts); // 指数退避
        logInfo(`[${connectionId}] 重连尝试 ${reconnectAttempts+1}/${MAX_RECONNECT_ATTEMPTS}，将在${reconnectDelay/1000}秒后重连`);

        setTimeout(() => {
          finnhubSocket = setupWebSocket();
        }, reconnectDelay);
      } else {
        logInfo(`[${connectionId}] 达到最大重连尝试次数，停止重连`);
      }
    }
  }, CONNECTION_TIMEOUT);

  // 设置Ping定时器以保持连接活跃
  pingIntervalId = setInterval(() => {
    if (socket.readyState === WebSocket.OPEN) {
      logDebug(`[${connectionId}] 发送ping保持连接`);
      socket.send(JSON.stringify({'type': 'ping'}));
    }
  }, PING_INTERVAL);

  socket.on('open', () => {
    logInfo(`[${connectionId}] 已连接到Finnhub WebSocket`);

    // 仅在调试模式显示详细信息
    if (DEBUG_ENABLED) {
      logDebug(`[${connectionId}] API密钥是否存在: ${!!process.env.FINNHUB_API_KEY}`);
      logDebug(`[${connectionId}] 即将订阅的符号:`, subscribedSymbols);
    }

    // 连接成功，清除超时和重置重连计数器
    clearTimeout(connectionTimeout);
    reconnectAttempts = 0;
    isReconnecting = false;

    // 先发送认证消息
    socket.send(JSON.stringify({
      'type': 'auth',
      'token': process.env.FINNHUB_API_KEY
    }));

    // 订阅所有已添加的符号
    if (subscribedSymbols.length === 0) {
      logInfo(`[${connectionId}] 警告: 订阅列表为空`);
    }

    subscribedSymbols.forEach(symbol => {
      logDebug(`[${connectionId}] 订阅符号: ${symbol}`);
      socket.send(JSON.stringify({ 'type': 'subscribe', 'symbol': symbol }));
    });
  });

  socket.on('message', (data: any) => {
    try {
      // 使用类型断言处理数据
      const dataString = typeof data === 'string' ? data : Buffer.isBuffer(data) ? data.toString() :
                        Array.isArray(data) ? Buffer.concat(data).toString() : data.toString();

      const message = JSON.parse(dataString) as FinnhubMessage;

      // 仅记录非ping消息或调试模式
      if (message.type !== 'ping' || DEBUG_ENABLED) {
        logDebug(`[${connectionId}] 接收到Finnhub消息类型: ${message.type}`);
      }

      // 处理ping消息 - Finnhub需要回复pong
      if (message.type === 'ping') {
        logDebug(`[${connectionId}] 收到ping消息，发送pong响应`);
        socket.send(JSON.stringify({'type': 'pong'}));
        return;
      }

      // 处理认证响应
      if (message.type === 'auth') {
        logInfo(`[${connectionId}] 认证响应:`, message);
        return;
      }

      // 处理价格更新消息
      if (message.type === 'trade' && message.data && message.data.length > 0) {
        // 仅在调试模式下记录完整数据
        if (DEBUG_ENABLED) {
          logDebug(`[${connectionId}] 收到trade数据: ${message.data.length}条交易记录`);
          logDebug(`[${connectionId}] 示例交易数据:`, message.data[0]);
        }

        message.data.forEach(processTrade);

        // 仅在调试模式下记录更新后的市场数据
        if (DEBUG_ENABLED) {
          logDebug(`[${connectionId}] 更新后的市场数据:`, marketData);
        }
      }
    } catch (error) {
      logError(`[${connectionId}] 解析WebSocket消息失败:`, error);
      // 安全地获取消息内容的字符串表示
      const dataString = typeof data === 'object' && data !== null && 'toString' in data
                       ? data.toString().substring(0, 200) : '无法转换为字符串';
      logError(`[${connectionId}] 原始消息内容:`, dataString); // 只显示前200个字符
    }
  });

  socket.on('error', (error: any) => {
    // 使用unknown类型并安全地访问错误消息
    const errorMessage = error instanceof Error ? error.message : String(error);
    logError(`[${connectionId}] WebSocket错误:`, errorMessage);
    clearTimeout(connectionTimeout);

    // 错误发生时，不要立即重连，而是标记为未连接状态
    socket.close(1000, "错误关闭");

    // 清理资源
    cleanupWebSocket();

    // 递增重连尝试次数
    reconnectAttempts++;
    isReconnecting = false;

    // 如果重连次数未超过最大值，进行重连
    if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
      const reconnectDelay = RECONNECT_BASE_DELAY * Math.pow(2, reconnectAttempts); // 指数退避
      logInfo(`[${connectionId}] 重连尝试 ${reconnectAttempts+1}/${MAX_RECONNECT_ATTEMPTS}，将在${reconnectDelay/1000}秒后重连`);

      setTimeout(() => {
        finnhubSocket = setupWebSocket();
      }, reconnectDelay);
    } else {
      logInfo(`[${connectionId}] 达到最大重连尝试次数，停止重连`);
    }
  });

  socket.on('close', (code: number, reason: string) => {
    logInfo(`[${connectionId}] WebSocket连接已关闭, 代码:${code}, 原因:${reason || "无原因"}`);
    clearTimeout(connectionTimeout);

    // 清理资源
    cleanupWebSocket();

    // 只有当不是由于手动关闭而导致的关闭事件，才尝试重连
    if (code !== 1000) {
      // 递增重连尝试次数
      reconnectAttempts++;
      isReconnecting = false;

      // 如果重连次数未超过最大值，进行重连
      if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
        const reconnectDelay = RECONNECT_BASE_DELAY * Math.pow(2, reconnectAttempts); // 指数退避
        logInfo(`[${connectionId}] 重连尝试 ${reconnectAttempts+1}/${MAX_RECONNECT_ATTEMPTS}，将在${reconnectDelay/1000}秒后重连`);

        setTimeout(() => {
          finnhubSocket = setupWebSocket();
        }, reconnectDelay);
      } else {
        logInfo(`[${connectionId}] 达到最大重连尝试次数，停止重连`);
      }
    } else {
      isReconnecting = false;
    }
  });

  return socket;
};

// 添加新的资产到监控列表
const addAssetToWatch = (code: string): void => {
  const lowerCode = code.toLowerCase();
  const symbol = assetCodeToSymbol[lowerCode];

  if (!symbol) {
    console.error(`未知的资产代码: ${lowerCode}`);
    return;
  }

  console.log(`添加资产到监控: ${lowerCode} => ${symbol}`);

  // 如果这个资产还没有被监控
  if (!marketData[lowerCode]) {
    marketData[lowerCode] = { price: 0, change: 0 };
  }

  // 添加到订阅列表
  if (!subscribedSymbols.includes(symbol)) {
    console.log(`添加符号到订阅列表: ${symbol}`);
    subscribedSymbols.push(symbol);

    // 主动尝试发送订阅请求
    if (finnhubSocket && finnhubSocket.readyState === WebSocket.OPEN) {
      console.log(`立即订阅符号: ${symbol}`);
      finnhubSocket.send(JSON.stringify({ 'type': 'subscribe', 'symbol': symbol }));
    } else {
      console.log(`WebSocket未就绪，符号将在连接后订阅: ${symbol}`);
      // 如果WebSocket未连接，则尝试重新连接
      if (!isReconnecting && (!finnhubSocket || finnhubSocket.readyState > 1)) {
        finnhubSocket = getWebSocketInstance();
      }
    }
  } else {
    console.log(`符号已在订阅列表中: ${symbol}`);
  }
};

// 初始化默认资产
const initializeDefaultAssets = (): void => {
  console.log('初始化默认资产...');

  // 加密货币
  addAssetToWatch('btc');
  addAssetToWatch('eth');

  // 股票
  addAssetToWatch('aapl');
  addAssetToWatch('msft');
  addAssetToWatch('tsla');

  console.log('初始化后的订阅列表:', subscribedSymbols);
};


// 启动WebSocket连接和初始化资产
if (typeof process !== 'undefined' && !isInitialized) {
  console.log('API路由初始化...');
  initializeDefaultAssets();

  try {
    finnhubSocket = getWebSocketInstance();
    isInitialized = true;

    // 获取昨日收盘价和初始价格
    const fetchInitialPrices = async () => {
      try {
        console.log('从Finnhub REST API获取昨日收盘价和初始价格');

        // 判断API密钥是否存在
        if (!process.env.FINNHUB_API_KEY) {
          console.error('缺少FINNHUB_API_KEY环境变量');
          return;
        }

        // 获取资产的历史价格和当前价格
        for (const code of Object.keys(assetCodeToSymbol)) {
          const symbol = assetCodeToSymbol[code];
          if (!symbol) continue;

          try {
            // 获取当前价格
            const quoteResponse = await fetch(`https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${process.env.FINNHUB_API_KEY}`);
            const quoteData = await quoteResponse.json();

            console.log(`${code.toUpperCase()} 当前价格数据:`, quoteData);

            // 设置昨日收盘价
            if (quoteData.pc) {
              lastPrices[code] = quoteData.pc; // pc 是 Finnhub API 中的昨日收盘价字段
              console.log(`${code.toUpperCase()} 昨日收盘价: ${lastPrices[code]}`);
            }

            // 更新当前价格
            if (quoteData.c) {
              updateMarketPrice(code, quoteData.c);
              console.log(`${code.toUpperCase()} 当前价格: ${quoteData.c}, 变化: ${marketData[code]?.change}%`);
            }
          } catch (error) {
            console.error(`获取 ${code.toUpperCase()} 价格数据失败:`, error);
          }
        }

      } catch (error) {
        console.error('获取初始价格失败:', error);
      }
    };

    // 调用一次获取初始价格
    fetchInitialPrices();
  } catch (error) {
    console.error('初始化WebSocket失败:', error);
  }
}

// 获取市场数据的API端点
export async function GET(request: Request): Promise<NextResponse> {
  // 获取查询参数
  const url = new URL(request.url);
  const symbols = url.searchParams.get('symbols');

  console.log(`收到GET请求，symbols参数: ${symbols}`);

  // 如果WebSocket未初始化，确保初始化
  if (!isReconnecting && (!finnhubSocket || finnhubSocket.readyState > 1)) {
    console.log('WebSocket未初始化或已关闭，重新初始化');
    finnhubSocket = getWebSocketInstance();
  }

  // 获取当前市场数据
  const currentMarketData = getMarketData();

  // 如果指定了symbols参数
  if (symbols) {
    // 解析请求的符号列表
    const requestedSymbols = symbols.split(',');
    console.log(`请求的符号列表: ${requestedSymbols}`);
    const response: MarketData = {};

    // 为每个请求的符号添加数据
    requestedSymbols.forEach(code => {
      const lowerCode = code.toLowerCase();

      // 如果已经有这个符号的数据，就添加到响应中
      if (currentMarketData[lowerCode]) {
        console.log(`返回已有数据: ${lowerCode}`);
        response[lowerCode] = currentMarketData[lowerCode];
      } else {
        // 对于新的符号，添加到监控列表
        console.log(`添加新符号到监控: ${lowerCode}`);
        addAssetToWatch(lowerCode);
        response[lowerCode] = { price: 0, change: 0 };
      }
    });

    return NextResponse.json(response);
  }

  // 如果没有指定symbols参数，返回所有数据
  console.log('返回所有市场数据');
  return NextResponse.json(currentMarketData);
}

// 添加新资产的API端点
export async function POST(request: Request): Promise<NextResponse> {
  try {
    const body = await request.json();

    // 需要提供code
    if (!body.code) {
      return NextResponse.json(
        { error: '需要提供资产代码' },
        { status: 400 }
      );
    }

    console.log(`收到POST请求，添加资产: ${body.code}`);

    // 添加到监控列表
    addAssetToWatch(body.code);

    return NextResponse.json({
      success: true,
      message: `已添加${body.code}到监控列表`
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : '未知错误';
    console.error('POST请求处理失败:', errorMessage);
    return NextResponse.json(
      { error: '请求处理失败', details: errorMessage },
      { status: 500 }
    );
  }
}