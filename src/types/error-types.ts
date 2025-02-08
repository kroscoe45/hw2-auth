// src/types

export interface ApiError {
  code: number
  message: string
  details?: Record<string, unknown>
}
