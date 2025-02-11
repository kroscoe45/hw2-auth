import { Request, Response, NextFunction } from "express"
import jwt, { VerifyErrors } from "jsonwebtoken"

const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey"

export const authenticateTokenFromCookie = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const token = req.cookies?.token

  if (!token) {
    res.status(401).json({ error: "Access Denied. No token provided." })
    return
  }

  jwt.verify(
    token,
    JWT_SECRET,
    (err: VerifyErrors | null, decoded: any | undefined) => {
      if (err) {
        res.status(403).json({ error: "Invalid Token" })
        return
      }

      if (decoded) {
        ;(req as any).user = decoded
        next()
      } else {
        res.status(403).json({ error: "Invalid Token" })
        return
      }
    }
  )
}
