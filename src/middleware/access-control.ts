// src/middleware/access-control.ts
import { Response, NextFunction } from "express"
import { AuthenticatedRequest } from "./auth"
import { toPlaylistId } from "../types/db-types"
import db from "../database"

export const checkPlaylistOwnership = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const playlistId = toPlaylistId(req.params.playlistId)
    const userId = req.user!.id

    const playlist = await db.playlists.findOne({
      id: playlistId,
      ownerId: userId,
      isDeleted: false,
    })

    if (!playlist) {
      return res
        .status(404)
        .json({ error: "Playlist not found or access denied" })
    }

    req.body.playlist = playlist
    next()
  } catch (error) {
    if (
      error instanceof Error &&
      error.message.includes("Invalid playlist ID")
    ) {
      return res.status(400).json({ error: "Invalid playlist ID format" })
    }
    next(error)
  }
}
