import type { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { AppError } from "../middleware/errorHandler";

export const validate = (schema: z.ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = {
        ...req.body,
        ...req.params,
        ...req.query,
      };
      
      schema.parse(data);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const message = error.errors.map((e) => e.message).join(", ");
        next(new AppError(message, 400));
      } else {
        next(error);
      }
    }
  };
};
