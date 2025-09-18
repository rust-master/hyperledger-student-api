import type { Request, Response } from "express"
import type { Student, ApiResponse, HyperledgerResponse } from "../types/student"
import helper from "../utils/helper"
import logger from "../utils/logger"

const DEFAULT_ORG = process.env.DEFAULT_ORG || "Org1"

export class AuthController {
  // Add a new student
  static async signup(req: Request, res: Response): Promise<void> {
    try {
         const userOrg = DEFAULT_ORG;
         const userName = "zaryab";

      // Validate required fields
      if (!userName || !userOrg  === undefined) {
        res.status(400).json({
          success: false,
          message: "Missing required fields: userName, userOrg",
        } as ApiResponse)
        return
      }

      const response = await helper.registerAndGerSecret(userName, userOrg);
    
      res.send(response);
    
    } catch (error) {
      logger.error(`Error in signup: ${error}`)
      res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error.message,
      } as ApiResponse)
    }
  }
}
