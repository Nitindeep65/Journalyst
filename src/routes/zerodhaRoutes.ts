import { Router, type Request, type Response } from "express";
import { ZerodhaRealAdapter } from "../adapters/real/ zerodhaAdapter";
import { tokenService } from "../services/tokenService";
import { syncTrades } from "../services/syncService";
import { asyncHandler, AppError } from "../middleware/errorHandler";
import { validate } from "../middleware/validator";
import { userIdParamSchema, requestTokenSchema } from "../validators/schemas";

const router = Router();

router.get("/login", (req: Request, res: Response) => {
  const adapter = new ZerodhaRealAdapter();
  const loginUrl = adapter.getLoginUrl();
  res.redirect(loginUrl);
});

router.get("/callback", validate(requestTokenSchema), asyncHandler(async (req: Request, res: Response) => {
  const requestToken = req.query.request_token as string;

  const adapter = new ZerodhaRealAdapter();
  const session = await adapter.generateSession(requestToken);

  tokenService.setToken({
    userId: session.userId,
    broker: "zerodha-real",
    accessToken: session.accessToken,
    refreshToken: null,
    expiresAt: session.expiresAt || new Date().toISOString(),
  });

  res.json({
    success: true,
    message: "Zerodha login successful! You can now sync trades.",
    userId: session.userId,
  });
}));

router.get("/sync/:userId", validate(userIdParamSchema), asyncHandler(async (req: Request, res: Response) => {
  const { userId } = req.params;
  
  if (!userId) throw new AppError("userId is required", 400);

  const trades = await syncTrades(userId, "zerodha-real");
  
  res.json({
    success: true,
    userId,
    broker: "zerodha-real",
    tradeCount: trades.length,
    trades,
  });
}));

export default router;
