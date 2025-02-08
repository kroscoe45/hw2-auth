// src/routes

import express, { Request, Response, NextFunction } from "express"
import { UserDbEntry } from "../types"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import { v4 as uuidv4 } from "uuid"
import db from "../database"

const router = express.Router()
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"


router.post("/signup", async (req, res) => {
  const { username, password } = req.body

  if (!username?.trim() || !password?.trim()) {
    res.status(400).json({ error: "Username and password required" })
    return
  }

  try {
    const existing = await db.get("SELECT id FROM users WHERE username = ?", [
      username,
    ])

    if (existing) {
      res.status(409).json({ error: "Username already exists" })
      return
    }

    const hashedPassword = await bcrypt.hash(password, 10)
    const userId = uuidv4()

    await db.run(
      "INSERT INTO users (id, username, password) VALUES (?, ?, ?)",
      [userId, username, hashedPassword]
    )

    const token = jwt.sign({ id: userId, username }, JWT_SECRET)
    res.cookie("token", token, { httpOnly: true })
    res.status(201).json({ message: "User created successfully" })
  } catch (error) {
    console.error("Signup error:", error)
    res.status(500).json({ error: "Server error" })
  }
})

router.post("/login", async (req, res) => {
  const { username, password } = req.body
  if (!username?.trim() || !password?.trim()) {
    res.status(400).json({ error: "Username and password required" })
    return
  }
  try {
    const storedUser: UserDbEntry = (await db.get(
      "SELECT * FROM users WHERE username = ?",
      [username]
    )) as UserDbEntry

    if (
      !storedUser ||
      !(await bcrypt.compare(password, storedUser.hashedPassword))
    ) {
      res.status(401).json({ error: "Invalid credentials" })
    }

    const token = jwt.sign({ id: storedUser.id, username }, JWT_SECRET)
    res.cookie("token", token, { httpOnly: true })
    res.json({ message: "Login successful" })
  } catch (error) {
    console.error("Login error:", error)
    res.status(500).json({ error: "Server error" })
  }
})

router.post("/logout", authenticateToken, (req, res) => {
  res.clearCookie("token")
  res.json({ message: "Logout successful" })
})

export default router
