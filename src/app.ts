import express from "express"
import cors from "cors"
import helmet from "helmet"
import morgan from "morgan"
import dotenv from "dotenv"
import studentRoutes from "./routes/studentRoutes"
import auth from "./routes/auth"
import { errorHandler, notFoundHandler } from "./middleware/errorHandler"
import logger from "./utils/logger"

// Load environment variables
dotenv.config()

const app = express()
const PORT = process.env.PORT || 3000

// Middleware
app.use(helmet()) // Security headers
app.use(cors()) // Enable CORS
app.use(morgan("combined")) // HTTP request logging
app.use(express.json({ limit: "10mb" })) // Parse JSON bodies
app.use(express.urlencoded({ extended: true })) // Parse URL-encoded bodies

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Hyperledger Student Records API is running",
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || "1.0.0",
  })
})

// API routes
app.use("/api/students", studentRoutes)
app.use("/api/auth", auth)

// Error handling middleware
app.use(notFoundHandler)
app.use(errorHandler)

// Start server
app.listen(PORT, () => {
  logger.info(`Server is running on port ${PORT}`)
  console.log(`🚀 Hyperledger Student Records API server started on port ${PORT}`)
  console.log(`📚 Health check: http://localhost:${PORT}/health`)
  console.log(`📖 API Documentation: http://localhost:${PORT}/api/students`)
})

export default app
