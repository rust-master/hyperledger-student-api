import type { Request, Response, NextFunction } from "express"
import logger from "../utils/logger"

export const errorHandler = (error: Error, req: Request, res: Response, next: NextFunction): void => {
  logger.error(`Error: ${error.message}`, { stack: error.stack })

  res.status(500).json({
    success: false,
    message: "Internal server error",
    error: process.env.NODE_ENV === "production" ? "Something went wrong" : error.message,
  })
}

export const notFoundHandler = (req: Request, res: Response): void => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
  })
}
