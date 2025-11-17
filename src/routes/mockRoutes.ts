import { Router, type Request, type Response } from "express";
import { tokenService } from "../services/tokenService";
import { syncTrades } from "../services/syncService";
import { asyncHandler, AppError } from "../middleware/errorHandler";
import { validate } from "../middleware/validator";
import { loginSchema, userIdParamSchema } from "../validators/schemas";

const router = Router();

router.post("/login", validate(loginSchema), asyncHandler(async (req: Request, res: Response) => {
  const { userId } = req.body;

  const mockToken = `mock_token_${Date.now()}`;
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();

  tokenService.setToken({
    userId,
    broker: "mock",
    accessToken: mockToken,
    refreshToken: `mock_refresh_${Date.now()}`,
    expiresAt,
  });

  res.json({
    success: true,
    message: "Mock login successful!",
    userId,
    expiresAt,
    note: "Token expires in 5 minutes for testing refresh logic",
  });
}));

router.get("/sync/:userId", validate(userIdParamSchema), asyncHandler(async (req: Request, res: Response) => {
  const { userId } = req.params;
  
  if (!userId) throw new AppError("userId is required", 400);

  const trades = await syncTrades(userId, "mock");

  res.json({
    success: true,
    userId,
    broker: "mock",
    tradeCount: trades.length,
    trades,
  });
}));

router.get("/token-status/:userId", validate(userIdParamSchema), asyncHandler(async (req: Request, res: Response) => {
  const { userId } = req.params;
  
  if (!userId) throw new AppError("userId is required", 400);
  
  const tokenData = tokenService.getToken(userId, "mock");

  if (!tokenData) {
    throw new AppError("No token found for this user", 404);
  }

  const isExpired = new Date(tokenData.expiresAt) < new Date();

  res.json({
    success: true,
    userId,
    broker: "mock",
    isExpired,
    expiresAt: tokenData.expiresAt,
  });
}));

export default router;
