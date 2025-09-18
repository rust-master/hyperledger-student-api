import { Router } from "express"
import { AuthController } from "../controllers/authController"

const router = Router()

// POST /api/auth/signup - Add a new student
router.post("/signup", AuthController.signup)


export default router
