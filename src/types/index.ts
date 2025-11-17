export type Trade = {
  id: string;
  broker: string;
  symbol: string;
  side: "BUY" | "SELL";
  quantity: number;
  price: number;
  timestamp: Date;
};

export type TokenData = {
  userId: string;
  broker: string;
  accessToken: string;
  refreshToken: string | null;
  expiresAt: string;
};

export type BrokerSession = {
  accessToken: string;
  refreshToken?: string;
  userId: string;
  expiresAt?: string;
};

export interface IBrokerAdapter {
  fetchTrades(): Promise<any[]>;
  refreshToken?(): Promise<BrokerSession>;
  isTokenExpired?(expiresAt: string): boolean;
}
