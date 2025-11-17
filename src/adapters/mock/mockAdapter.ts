import type { IBrokerAdapter, BrokerSession } from "../../types";

export class MockBrokerAdapter implements IBrokerAdapter {
  private accessToken: string | undefined;
  private mockTrades = [
    {
      trade_id: "T001",
      tradingsymbol: "RELIANCE",
      transaction_type: "BUY",
      quantity: 10,
      average_price: 2500.50,
      order_timestamp: new Date("2025-01-10T10:30:00Z"),
    },
    {
      trade_id: "T002",
      tradingsymbol: "TCS",
      transaction_type: "SELL",
      quantity: 5,
      average_price: 3800.75,
      order_timestamp: new Date("2025-01-10T14:15:00Z"),
    },
    {
      trade_id: "T003",
      tradingsymbol: "INFY",
      transaction_type: "BUY",
      quantity: 20,
      average_price: 1450.25,
      order_timestamp: new Date("2025-01-11T09:45:00Z"),
    },
  ];

  constructor(accessToken?: string) {
    this.accessToken = accessToken;
  }

  async fetchTrades(): Promise<any[]> {
    if (!this.accessToken) {
      throw new Error("No access token provided");
    }
    
    await new Promise((resolve) => setTimeout(resolve, 500));
    
    return this.mockTrades;
  }

  async refreshToken(): Promise<BrokerSession> {
    await new Promise((resolve) => setTimeout(resolve, 300));
    
    const newToken = `mock_token_${Date.now()}`;
    const refreshToken = `mock_refresh_${Date.now()}`;
    
    return {
      accessToken: newToken,
      refreshToken,
      userId: "MOCK_USER_123",
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    };
  }

  isTokenExpired(expiresAt: string): boolean {
    return new Date(expiresAt) < new Date();
  }
}
