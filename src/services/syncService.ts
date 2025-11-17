import type { Trade, IBrokerAdapter } from "../types";
import { tokenService } from "./tokenService";
import { normalizeTrades } from "../normalizers/tradeNormalize";
import { ZerodhaRealAdapter } from "../adapters/real/ zerodhaAdapter";
import { MockBrokerAdapter } from "../adapters/mock/mockAdapter";
import { AppError } from "../middleware/errorHandler";
import { logger } from "../utils/logger";

function getBrokerAdapter(brokerName: string, accessToken?: string): IBrokerAdapter {
  switch (brokerName.toLowerCase()) {
    case "zerodha":
    case "zerodha-real":
      return new ZerodhaRealAdapter(accessToken);
    case "mock":
      return new MockBrokerAdapter(accessToken);
    default:
      throw new AppError(`Unsupported broker: ${brokerName}`, 400);
  }
}

export async function syncTrades(userId: string, brokerName: string): Promise<Trade[]> {
  const tokenData = tokenService.getToken(userId, brokerName);
  
  if (!tokenData) {
    throw new AppError(`No token found for user ${userId} with broker ${brokerName}. Please login first.`, 401);
  }

  let currentAccessToken = tokenData.accessToken;
  
  const adapter = getBrokerAdapter(brokerName, currentAccessToken);

  if (adapter.isTokenExpired && adapter.isTokenExpired(tokenData.expiresAt)) {
    logger.info(`Token expired for ${userId}. Attempting refresh...`);
    
    if (adapter.refreshToken) {
      try {
        const newSession = await adapter.refreshToken();
        
        tokenService.setToken({
          userId: newSession.userId,
          broker: brokerName,
          accessToken: newSession.accessToken,
          refreshToken: newSession.refreshToken || tokenData.refreshToken,
          expiresAt: newSession.expiresAt || tokenData.expiresAt,
        });
        
        currentAccessToken = newSession.accessToken;
        
        const refreshedAdapter = getBrokerAdapter(brokerName, currentAccessToken);
        
        const rawTrades = await refreshedAdapter.fetchTrades();
        
        const normalizedTrades = normalizeTrades(rawTrades, brokerName);
        
        return normalizedTrades;
      } catch (error) {
        logger.error({ error }, "Token refresh failed");
        throw new AppError(`Token refresh failed: ${error instanceof Error ? error.message : 'Unknown error'}. Please re-login.`, 401);
      }
    } else {
      throw new AppError(`Token expired and broker ${brokerName} does not support refresh. Please re-login.`, 401);
    }
  }

  const rawTrades = await adapter.fetchTrades();
  
  const normalizedTrades = normalizeTrades(rawTrades, brokerName);
  
  return normalizedTrades;
}
