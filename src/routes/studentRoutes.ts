import { Router } from "express"
import { StudentController } from "../controllers/studentController"

const router = Router()

// POST /api/students - Add a new student
router.post("/", StudentController.addStudent)

// GET /api/students/:id - Get student by ID
router.get("/:id", StudentController.getStudent)

// PUT /api/students/:id/gpa - Update student GPA
router.put("/:id/gpa", StudentController.updateGPA)

// GET /api/students/:id/exists - Check if student exists
router.get("/:id/exists", StudentController.checkStudentExists)

export default router
