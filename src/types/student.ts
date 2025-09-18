export interface Student {
  id: string
  name: string
  degree: string
  gpa: number
}

export interface ApiResponse<T = any> {
  success: boolean
  message: string
  data?: T
  error?: string
}

export interface HyperledgerResponse {
  result?: string
  status?: number
  error?: string
}
