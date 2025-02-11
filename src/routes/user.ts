import express, { Request, Response } from "express"
import db from "../database"
import { authenticateTokenFromCookie } from "../middleware/auth"

const router = express.Router()

router.post("/signup", async (req: Request, res: Response): Promise<void> => {
  try {
    if (!db.users) {
      res
        .status(500)
        .json({ error: "Internal server error: Users DB not available" })
      return
    }

    const userId = await db.users.registerUser(
      req.body.username,
      req.body.password
    )

    res.status(201).json({ message: "User registered successfully", userId })
  } catch (error: any) {
    res.status(400).json({ error: error.message })
  }
})

router.post("/login", async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId, token } = await db.users.loginUser(
      req.body.username,
      req.body.password
    )
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 1000, // 1 hour
    })

    res.json({
      message: "Login successful",
      userId,
      token,
    })
  } catch (error: any) {
    res.status(401).json({ error: error.message })
  }
})

router.post("/logout", async (req: Request, res: Response): Promise<void> => {
  db.users.logoutUser(res)
  res.json({ message: "Logout successful" })
})

router.get(
  "/me",
  authenticateTokenFromCookie,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const user = await db.users.getUserById((req as any).user.id)
      if (!user) {
        res.status(404).json({ error: "User not found" })
        return
      }

      res.json({ user })
    } catch (error) {
      res.status(500).json({ error: "Server error" })
    }
  }
)

export default router
