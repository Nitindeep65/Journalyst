import express from "express";
import type { Request, Response } from "express";
import helmet from "helmet";
import cors from "cors";
import rateLimit from "express-rate-limit";
import pinoHttp from "pino-http";
import zerodhaRoutes from "./src/routes/zerodhaRoutes";
import mockRoutes from "./src/routes/mockRoutes";
import { errorHandler } from "./src/middleware/errorHandler";
import { logger } from "./src/utils/logger";

const app = express();

app.use(helmet());
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(",") || "*",
  credentials: true,
}));
app.use(pinoHttp({ logger }));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: "Too many requests from this IP, please try again later",
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

app.use(express.json());

app.get("/", (req: Request, res: Response) => {
  res.json({
    service: "Broker Sync Backend",
    version: "1.0.0",
    status: "running",
    endpoints: {
      zerodha: {
        login: "GET /zerodha/login",
        callback: "GET /zerodha/callback?request_token=xxx",
        sync: "GET /zerodha/sync/:userId",
      },
      mock: {
        login: "POST /mock/login (body: {userId})",
        sync: "GET /mock/sync/:userId",
        tokenStatus: "GET /mock/token-status/:userId",
      },
    },
  });
});

app.use("/zerodha", zerodhaRoutes);
app.use("/mock", mockRoutes);

app.use(errorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  logger.info(`🚀 Broker Sync Server listening on port ${PORT}`);
  logger.info(`📊 Available endpoints:`);
  logger.info(`   - Health: http://localhost:${PORT}/`);
  logger.info(`   - Mock Demo: POST http://localhost:${PORT}/mock/login`);
  logger.info(`   - Zerodha: GET http://localhost:${PORT}/zerodha/login`);
});

export default app;
