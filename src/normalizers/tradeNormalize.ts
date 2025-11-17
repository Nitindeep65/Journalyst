import type { Trade } from "../types";

export function normalizeZerodhaTrade(rawTrade: any, broker: string = "zerodha"): Trade {
  return {
    id: rawTrade.trade_id || rawTrade.order_id || String(Math.random()),
    broker,
    symbol: rawTrade.tradingsymbol || rawTrade.symbol || "UNKNOWN",
    side: rawTrade.transaction_type === "BUY" ? "BUY" : "SELL",
    quantity: rawTrade.quantity || rawTrade.filled_quantity || 0,
    price: rawTrade.average_price || rawTrade.price || 0,
    timestamp: rawTrade.order_timestamp 
      ? new Date(rawTrade.order_timestamp) 
      : rawTrade.exchange_timestamp
      ? new Date(rawTrade.exchange_timestamp)
      : new Date(),
  };
}

export function normalizeZerodhaTrades(rawTrades: any[], broker: string = "zerodha"): Trade[] {
  return rawTrades.map((trade) => normalizeZerodhaTrade(trade, broker));
}

export function getNormalizer(brokerName: string): (rawTrade: any, broker: string) => Trade {
  switch (brokerName.toLowerCase()) {
    case "zerodha":
    case "zerodha-real":
      return normalizeZerodhaTrade;
    case "mock":
      return normalizeZerodhaTrade;
    default:
      throw new Error(`No normalizer found for broker: ${brokerName}`);
  }
}

export function normalizeTrades(rawTrades: any[], brokerName: string): Trade[] {
  const normalizer = getNormalizer(brokerName);
  return rawTrades.map((trade) => normalizer(trade, brokerName));
}