import { KiteConnect } from "kiteconnect";
import * as dotenv from "dotenv";
import type { IBrokerAdapter, BrokerSession } from "../../types";

dotenv.config();

export class ZerodhaRealAdapter implements IBrokerAdapter {
  private kite: any;

  constructor(accessToken?: string) {
    this.kite = new KiteConnect({
      api_key: process.env.Z_API_KEY!,
    });

    if (accessToken) {
      this.kite.setAccessToken(accessToken);
    }
  }

  getLoginUrl() {
    return this.kite.getLoginURL();
  }

  async generateSession(requestToken: string): Promise<BrokerSession> {
    const session = await this.kite.generateSession(
      requestToken,
      process.env.Z_API_SECRET!
    );

    return {
      accessToken: session.access_token,
      userId: session.user_id,
      expiresAt: new Date(new Date().setHours(23, 59, 59, 999)).toISOString(),
    };
  }

  async fetchTrades(): Promise<any[]> {
    return await this.kite.getTrades();
  }

  async refreshToken(): Promise<BrokerSession> {
    throw new Error("Zerodha does not support token refresh. Please re-login.");
  }

  isTokenExpired(expiresAt: string): boolean {
    return new Date(expiresAt) < new Date();
  }
}
