import type { TokenData } from "../types";

class TokenService {
  private tokens: Map<string, TokenData> = new Map();

  private getKey(userId: string, broker: string): string {
    return `${userId}:${broker}`;
  }

  setToken(tokenData: TokenData): void {
    const key = this.getKey(tokenData.userId, tokenData.broker);
    this.tokens.set(key, tokenData);
  }

  getToken(userId: string, broker: string): TokenData | null {
    const key = this.getKey(userId, broker);
    return this.tokens.get(key) || null;
  }

  deleteToken(userId: string, broker: string): boolean {
    const key = this.getKey(userId, broker);
    return this.tokens.delete(key);
  }

  hasToken(userId: string, broker: string): boolean {
    const key = this.getKey(userId, broker);
    return this.tokens.has(key);
  }

  getAllTokens(): TokenData[] {
    return Array.from(this.tokens.values());
  }
}

export const tokenService = new TokenService();
