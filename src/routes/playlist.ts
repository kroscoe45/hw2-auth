import express from "express"
import db from "../database"
import { authenticateTokenFromCookie } from "../middleware/auth"
import { PlaylistId, TrackId, UserId } from "../types"

const router = express.Router()
router.post("/", authenticateTokenFromCookie, async (req, res) => {
  try {
    const { name, tracks = [] } = req.body
    const userId = (req as any).user.id as UserId

    const playlistId = await db.playlists.createPlaylist(name, userId, tracks)
    res.status(201).json({ message: "Playlist created", playlistId })
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})
router.get("/:id", async (req, res) => {
  try {
    const playlistId = req.params.id as PlaylistId
    const playlist = await db.playlists.getPlaylistById(playlistId)
    if (!playlist) {
      res.status(404).json({ error: "Playlist not found" })
      return
    }
    res.json(playlist)
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})
router.get("/", authenticateTokenFromCookie, async (req, res) => {
  try {
    const userId = (req as any).user.id as UserId
    const playlists = await db.playlists.getPlaylistsByUser(userId)
    res.json(playlists)
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})

// Add a track to a playlist
router.post("/:id/tracks", authenticateTokenFromCookie, async (req, res) => {
  try {
    const playlistId = req.params.id as PlaylistId
    const { trackId } = req.body
    const userId = (req as any).user.id as UserId

    await db.playlists.addTrackToPlaylist(
      playlistId,
      trackId as TrackId,
      userId
    )
    res.json({ message: "Track added to playlist" })
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})

// Remove a track from a playlist
router.delete("/:id/tracks", authenticateTokenFromCookie, async (req, res) => {
  try {
    const playlistId = req.params.id as PlaylistId
    const { trackId } = req.body
    const userId = (req as any).user.id as UserId

    await db.playlists.removeTrackFromPlaylist(
      playlistId,
      trackId as TrackId,
      userId
    )
    res.json({ message: "Track removed from playlist" })
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})

// Delete a playlist
router.delete("/:id", authenticateTokenFromCookie, async (req, res) => {
  try {
    const playlistId = req.params.id as PlaylistId
    const userId = (req as any).user.id as UserId

    await db.playlists.deletePlaylist(playlistId, userId)
    res.json({ message: "Playlist deleted" })
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})

export default router
