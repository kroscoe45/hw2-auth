import { Request, Response, NextFunction } from "express"
import jwt from "jsonwebtoken"

const JWT_SECRET = process.env.JWT_SECRET || "default"

// Middleware to check auth token
const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  const token = req.cookies?.token || req.headers.authorization?.split(" ")[1]

  if (!token) {
    res.status(401).json({ error: "Authentication required" })
    return
  }

  try {
    const user = jwt.verify(token, JWT_SECRET)
    req.body.user = user
    next()
  } catch {
    res.status(401).json({ error: "Invalid token" })
  }
}

export { authenticateToken, JWT_SECRET }