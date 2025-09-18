import type { Request, Response, NextFunction } from "express"
import { body, param, query, validationResult } from "express-validator"

export const validateStudent = [
  body("id").notEmpty().withMessage("Student ID is required"),
  body("name").notEmpty().withMessage("Student name is required"),
  body("degree").notEmpty().withMessage("Student degree is required"),
  body("gpa").isFloat({ min: 0, max: 4.0 }).withMessage("GPA must be between 0 and 4.0"),
]

export const validateGPAUpdate = [
  param("id").notEmpty().withMessage("Student ID is required"),
  body("gpa").isFloat({ min: 0, max: 4.0 }).withMessage("GPA must be between 0 and 4.0"),
]

export const validateStudentId = [param("id").notEmpty().withMessage("Student ID is required")]

export const validateQuery = [query("username").optional().isString(), query("org").optional().isString()]

export const handleValidationErrors = (req: Request, res: Response, next: NextFunction): void => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    res.status(400).json({
      success: false,
      message: "Validation errors",
      errors: errors.array(),
    })
    return
  }
  next()
}
