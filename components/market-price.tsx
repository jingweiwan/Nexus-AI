'use client';

import { motion } from 'framer-motion';
import { useEffect, useState, useRef } from 'react';

type PriceData = {
  price: number;
  change: number;
};

type MarketData = {
  [symbol: string]: PriceData;
};

// 格式化价格，保留2位小数
const formatPrice = (price: number): string => {
  return price.toFixed(2);
};

// 格式化变化百分比，保留1位小数
const formatChange = (change: number): string => {
  return change.toFixed(1);
};

export default function MarketPrices({
  symbols = ['btc', 'eth'],
  showMarketSentiment = false
}: {
  symbols?: string[],
  showMarketSentiment?: boolean
}) {
  const [marketData, setMarketData] = useState<MarketData>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionAttempts, setConnectionAttempts] = useState(0);
  const eventSourceRef = useRef<EventSource | null>(null);
  // 使用ref存储尝试次数，避免闭包问题
  const attemptsRef = useRef(0);
  // 存储重连定时器
  const reconnectTimerRef = useRef<NodeJS.Timeout | null>(null);
  // 存储上一次更新的价格，用于动画效果
  const previousPrices = useRef<Record<string, number>>({});

  // 建立SSE连接获取实时价格
  useEffect(() => {
    console.log('建立SSE连接，请求符号:', symbols);

    const connectSSE = () => {
      // 使用ref更新尝试次数
      attemptsRef.current += 1;
      setConnectionAttempts(attemptsRef.current);

      console.log(`开始连接尝试 #${attemptsRef.current}/5`);

      // 清除现有连接
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }

      // 清除现有定时器
      if (reconnectTimerRef.current) {
        clearTimeout(reconnectTimerRef.current);
        reconnectTimerRef.current = null;
      }

      // 创建SSE连接
      try {
        const eventSource = new EventSource(`/api/market/stream?symbols=${symbols.join(',')}`);
        eventSourceRef.current = eventSource;

        eventSource.onopen = () => {
          console.log('市场数据SSE连接已建立');
          setIsConnected(true);
          setIsLoading(false);
          // 重置连接尝试次数
          attemptsRef.current = 0;
          setConnectionAttempts(0);
        };

        eventSource.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data) as MarketData;
            console.log('收到市场数据:', data);

            // 保存之前的价格用于动画效果
            Object.entries(data).forEach(([symbol, priceData]) => {
              if (!previousPrices.current[symbol]) {
                previousPrices.current[symbol] = priceData.price;
              }
            });

            setMarketData(data);

            // 延迟更新前一个价格值，用于下一次动画效果
            setTimeout(() => {
              Object.entries(data).forEach(([symbol, priceData]) => {
                previousPrices.current[symbol] = priceData.price;
              });
            }, 1000);
          } catch (error) {
            console.error('解析市场数据失败:', error);
          }
        };

        eventSource.onerror = (error) => {
          console.error('SSE连接错误:', error);
          eventSource.close();
          setIsConnected(false);
          setIsLoading(true);

          // 尝试重连，但最多尝试5次
          if (attemptsRef.current < 5) {
            console.log(`尝试重新连接SSE...(${attemptsRef.current}/5)`);

            // 使用引用存储定时器ID
            reconnectTimerRef.current = setTimeout(() => {
              connectSSE();
            }, 3000);
          } else {
            console.log(`达到最大重连次数(${attemptsRef.current}/5)，停止重连`);
            setIsLoading(false);
          }
        };
      } catch (error) {
        console.error('创建SSE连接失败:', error);
        setIsLoading(false);
        setIsConnected(false);

        // 尝试重连逻辑
        if (attemptsRef.current < 5) {
          console.log(`创建连接失败，尝试重新连接...(${attemptsRef.current}/5)`);

          reconnectTimerRef.current = setTimeout(() => {
            connectSSE();
          }, 3000);
        } else {
          console.log(`达到最大重连次数(${attemptsRef.current}/5)，停止尝试`);
        }
      }
    };

    connectSSE();

    return () => {
      // 清理函数：关闭SSE连接和清除定时器
      if (eventSourceRef.current) {
        console.log('关闭SSE连接');
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }

      if (reconnectTimerRef.current) {
        clearTimeout(reconnectTimerRef.current);
        reconnectTimerRef.current = null;
      }

      // 重置尝试计数器
      attemptsRef.current = 0;
    };
  }, [symbols]);

  return (
    <>
      {symbols.map(symbol => {
        // 使用市场数据或提供默认值
        const data = marketData[symbol];
        const hasData = !!data && data.price > 0;
        const prevPrice = previousPrices.current[symbol] || 0;
        // 检查价格是否与上次更新时不同（用于动画效果）
        const priceChanged = hasData && prevPrice > 0 && Math.abs(prevPrice - data.price) >= 0.01;
        const priceIncreased = hasData && data.price > prevPrice;

        return (
          <motion.div
            key={`market-price-${symbol}`}
            className="bg-white/10 backdrop-blur-md rounded-lg p-3 flex items-center"
            whileHover={{ scale: 1.05 }}
            transition={{ type: 'spring', stiffness: 400, damping: 10 }}
          >
            <div className="text-center">
              <div className="text-xs text-gray-300">{symbol.toUpperCase()}</div>
              {isLoading ? (
                <div className="h-5 w-16 bg-white/20 animate-pulse rounded"></div>
              ) : !hasData ? (
                <div className="text-sm font-bold text-gray-400">无数据</div>
              ) : (
                <motion.div
                  className={`text-sm font-bold ${
                    priceChanged ? (priceIncreased ? 'text-green-400' : 'text-red-400') : 'text-white'
                  }`}
                  key={`price-${symbol}-${data.price}`}
                  initial={{ opacity: 0.7, y: priceChanged ? (priceIncreased ? 5 : -5) : 0 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  ${formatPrice(data.price)}
                  {priceChanged && (
                    <motion.span
                      className={`ml-1 text-xs ${priceIncreased ? 'text-green-400' : 'text-red-400'}`}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.2 }}
                    >
                      {priceIncreased ? '↑' : '↓'}
                    </motion.span>
                  )}
                </motion.div>
              )}
              {isLoading ? (
                <div className="h-4 w-12 bg-white/20 animate-pulse rounded mt-1"></div>
              ) : !hasData ? (
                <div className="text-xs text-gray-400">--</div>
              ) : (
                <motion.div
                  className={`text-xs ${data.change >= 0 ? 'text-green-400' : 'text-red-400'}`}
                  key={`change-${symbol}-${data.change}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  {data.change >= 0 ? '+' : ''}{formatChange(data.change)}%
                  <span className="text-xs text-gray-300 ml-1">今日</span>
                </motion.div>
              )}
            </div>
          </motion.div>
        );
      })}

      {showMarketSentiment && (
        <motion.div
          key="market-sentiment"
          className="bg-white/10 backdrop-blur-md rounded-lg p-3 flex items-center"
          whileHover={{ scale: 1.05 }}
          transition={{ type: 'spring', stiffness: 400, damping: 10 }}
        >
          <div className="text-center">
            <div className="text-xs text-gray-300">市场情绪</div>
            <div className="text-sm font-bold text-white">中性</div>
          </div>
        </motion.div>
      )}

      {/* 连接状态指示点 */}
      <div
        key="connection-indicator"
        className={`absolute top-2 right-2 h-2 w-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'}`}
      ></div>
    </>
  );
}