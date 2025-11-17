import { normalizeZerodhaTrade, normalizeTrades } from "../src/normalizers/tradeNormalize";

describe("Trade Normalizer", () => {
  test("should normalize Zerodha trade", () => {
    const rawTrade = {
      trade_id: "T001",
      tradingsymbol: "RELIANCE",
      transaction_type: "BUY",
      quantity: 10,
      average_price: 2500.5,
      order_timestamp: "2025-01-10T10:30:00Z",
    };

    const normalized = normalizeZerodhaTrade(rawTrade, "zerodha");

    expect(normalized).toEqual({
      id: "T001",
      broker: "zerodha",
      symbol: "RELIANCE",
      side: "BUY",
      quantity: 10,
      price: 2500.5,
      timestamp: new Date("2025-01-10T10:30:00Z"),
    });
  });

  test("should normalize SELL trade", () => {
    const rawTrade = {
      trade_id: "T002",
      tradingsymbol: "TCS",
      transaction_type: "SELL",
      quantity: 5,
      average_price: 3800.75,
      order_timestamp: "2025-01-10T14:15:00Z",
    };

    const normalized = normalizeZerodhaTrade(rawTrade, "zerodha");

    expect(normalized.side).toBe("SELL");
    expect(normalized.symbol).toBe("TCS");
  });

  test("should normalize multiple trades", () => {
    const rawTrades = [
      {
        trade_id: "T001",
        tradingsymbol: "RELIANCE",
        transaction_type: "BUY",
        quantity: 10,
        average_price: 2500.5,
        order_timestamp: "2025-01-10T10:30:00Z",
      },
      {
        trade_id: "T002",
        tradingsymbol: "TCS",
        transaction_type: "SELL",
        quantity: 5,
        average_price: 3800.75,
        order_timestamp: "2025-01-10T14:15:00Z",
      },
    ];

    const normalized = normalizeTrades(rawTrades, "zerodha");

    expect(normalized).toHaveLength(2);
    expect(normalized[0]?.id).toBe("T001");
    expect(normalized[1]?.id).toBe("T002");
  });
});
