// src/middleware/auth.ts
import { Request, Response, NextFunction } from "express"
import jwt from "jsonwebtoken"
import { UserId } from "../types"

const JWT_SECRET = process.env.JWT_SECRET || "default-secret-change-this"

export interface AuthenticatedUser {
  id: UserId
  username: string
}

export interface AuthenticatedRequest extends Request {
  user?: AuthenticatedUser
}

export const authenticateToken = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const token = req.cookies?.token || req.headers.authorization?.split(" ")[1]

  if (!token) {
    return res.status(401).json({ error: "Authentication required" })
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AuthenticatedUser
    req.user = decoded
    next()
  } catch (err) {
    return res.status(401).json({ error: "Invalid token" })
  }
}

export const generateToken = (user: AuthenticatedUser): string => {
  return jwt.sign(user, JWT_SECRET, { expiresIn: "24h" })
}
