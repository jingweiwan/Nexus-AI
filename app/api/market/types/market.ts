// app/api/market/types/market.ts
export type PriceData = {
  price: number;
  change: number;
};

export type MarketData = {
  [symbol: string]: PriceData;
};

export type SubscriptionMessage = {
  action: 'subscribe';
  symbols: string[];
};

export type TradeData = {
  s: string; // 交易对符号
  p: number; // 价格
  t: number; // 时间戳
  v: number; // 成交量
};

export type FinnhubMessage = {
  type: string;
  data?: TradeData[];
};

// 从交易符号提取资产代码的映射
export const symbolToAssetCode: Record<string, string> = {
  'BINANCE:BTCUSDT': 'btc',
  'BINANCE:ETHUSDT': 'eth',
  'AAPL': 'aapl',
  'MSFT': 'msft',
  'GOOGL': 'googl',
  'AMZN': 'amzn',
  'TSLA': 'tsla',
  // 可以添加更多映射
};

// 资产代码到交易符号的映射
export const assetCodeToSymbol: Record<string, string> = {
  'btc': 'BINANCE:BTCUSDT',
  'eth': 'BINANCE:ETHUSDT',
  'aapl': 'AAPL',
  'msft': 'MSFT',
  'googl': 'GOOGL',
  'amzn': 'AMZN',
  'tsla': 'TSLA',
  // 可以添加更多映射
};