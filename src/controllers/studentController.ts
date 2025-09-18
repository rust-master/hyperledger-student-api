import type { Request, Response } from "express"
import type { Student, ApiResponse, HyperledgerResponse } from "../types/student"
import invokeTransaction from "../utils/invoke-transaction"
import queryTransaction from "../utils/query-transaction"
import logger from "../utils/logger"

const CHANNEL_NAME = process.env.CHANNEL_NAME || "mychannel"
const CHAINCODE_NAME = process.env.CHAINCODE_NAME || "basic"
const DEFAULT_ORG = process.env.DEFAULT_ORG || "Org1"

export class StudentController {
  // Add a new student
  static async addStudent(req: Request, res: Response): Promise<void> {
    try {
      const { id, name, degree, gpa } = req.body
      const { username = "zaryab", org = DEFAULT_ORG } = req.query

      // Validate required fields
      if (!id || !name || !degree || gpa === undefined) {
        res.status(400).json({
          success: false,
          message: "Missing required fields: id, name, degree, gpa",
        } as ApiResponse)
        return
      }

      // Validate GPA range
      if (gpa < 0 || gpa > 4.0) {
        res.status(400).json({
          success: false,
          message: "GPA must be between 0 and 4.0",
        } as ApiResponse)
        return
      }

      logger.info(`Adding student with ID: ${id}`)

      const result: HyperledgerResponse = await invokeTransaction(
        CHANNEL_NAME,
        CHAINCODE_NAME,
        "AddStudent",
        [id, name, degree, gpa.toString()],
        username as string,
        org as string,
      )

      if (result.status === 500) {
        res.status(500).json({
          success: false,
          message: "Failed to add student",
          error: result.error,
        } as ApiResponse)
        return
      }

      res.status(201).json({
        success: true,
        message: "Student added successfully",
        data: { id, name, degree, gpa },
      } as ApiResponse<Student>)
    } catch (error) {
      logger.error(`Error adding student: ${error}`)
      res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error.message,
      } as ApiResponse)
    }
  }

  // Update student GPA
  static async updateGPA(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params
      const { gpa } = req.body
      const { username = "zaryab", org = DEFAULT_ORG } = req.query

      if (!id || gpa === undefined) {
        res.status(400).json({
          success: false,
          message: "Missing required fields: id, gpa",
        } as ApiResponse)
        return
      }

      // Validate GPA range
      if (gpa < 0 || gpa > 4.0) {
        res.status(400).json({
          success: false,
          message: "GPA must be between 0 and 4.0",
        } as ApiResponse)
        return
      }

      logger.info(`Updating GPA for student ID: ${id}`)

      const result: HyperledgerResponse = await invokeTransaction(
        CHANNEL_NAME,
        CHAINCODE_NAME,
        "UpdateGPA",
        [id, gpa.toString()],
        username as string,
        org as string,
      )

      if (result.status === 500) {
        res.status(500).json({
          success: false,
          message: "Failed to update student GPA",
          error: result.error,
        } as ApiResponse)
        return
      }

      res.status(200).json({
        success: true,
        message: "Student GPA updated successfully",
        data: { id, gpa },
      } as ApiResponse)
    } catch (error) {
      logger.error(`Error updating student GPA: ${error}`)
      res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error.message,
      } as ApiResponse)
    }
  }

  // Query a student by ID
  static async getStudent(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params
      const { username = "zaryab", org = DEFAULT_ORG } = req.query

      if (!id) {
        res.status(400).json({
          success: false,
          message: "Student ID is required",
        } as ApiResponse)
        return
      }

      logger.info(`Querying student with ID: ${id}`)

      const result: HyperledgerResponse = await queryTransaction(
        CHANNEL_NAME,
        CHAINCODE_NAME,
        "QueryStudent",
        id,
        username as string,
        org as string,
      )

      if (result.status === 500) {
        res.status(404).json({
          success: false,
          message: "Student not found",
          error: result.error,
        } as ApiResponse)
        return
      }

      const student: Student = JSON.parse(result.result || "{}")

      res.status(200).json({
        success: true,
        message: "Student retrieved successfully",
        data: student,
      } as ApiResponse<Student>)
    } catch (error) {
      logger.error(`Error querying student: ${error}`)
      res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error.message,
      } as ApiResponse)
    }
  }

  // Check if student exists
  static async checkStudentExists(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params
      const { username = "zaryab", org = DEFAULT_ORG } = req.query

      if (!id) {
        res.status(400).json({
          success: false,
          message: "Student ID is required",
        } as ApiResponse)
        return
      }

      logger.info(`Checking if student exists with ID: ${id}`)

      const result: HyperledgerResponse = await queryTransaction(
        CHANNEL_NAME,
        CHAINCODE_NAME,
        "StudentExists",
        id,
        username as string,
        org as string,
      )

      if (result.status === 500) {
        res.status(500).json({
          success: false,
          message: "Failed to check student existence",
          error: result.error,
        } as ApiResponse)
        return
      }

      const exists = result.result === "true"

      res.status(200).json({
        success: true,
        message: `Student ${exists ? "exists" : "does not exist"}`,
        data: { id, exists },
      } as ApiResponse)
    } catch (error) {
      logger.error(`Error checking student existence: ${error}`)
      res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error.message,
      } as ApiResponse)
    }
  }
}
