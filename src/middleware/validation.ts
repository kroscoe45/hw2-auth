// src/middleware/validation.ts
import { Response, NextFunction } from "express"
import { AuthenticatedRequest } from "./auth"

export const validatePlaylistBody = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const { name } = req.body
  if (!name?.trim()) {
    return res.status(400).json({ error: "Playlist name is required" })
  }
  next()
}

export const validateVote = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const { vote } = req.body
  if (vote !== 1 && vote !== -1) {
    return res.status(400).json({ error: "Vote must be 1 or -1" })
  }
  next()
}
