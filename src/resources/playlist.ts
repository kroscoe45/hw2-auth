// src/resources/playlist.ts

import { Router, Request, Response } from "express"
import { PlaylistDocument, UserId, TrackId, ApiResponse, ReorderTracks } from "../types"
import db from "../database"
import { authenticateToken } from "../middleware/auth"
import { ObjectId } from "mongodb"

export class PlaylistResource {
  private router: Router

  constructor() {
    this.router = Router()
    this.initializeRoutes()
  }

  private initializeRoutes(): void {
    this.router.post("/", authenticateToken, this.createPlaylist.bind(this))
    this.router.get("/public", this.listPublicPlaylists.bind(this))
    this.router.get("/my", authenticateToken, this.listUserPlaylists.bind(this))
    this.router.put("/:id", authenticateToken, this.updatePlaylist.bind(this))
    this.router.post("/:id/tracks", authenticateToken, this.addTracks.bind(this))
    this.router.delete("/:id/tracks/:trackId", authenticateToken, this.removeTrack.bind(this))
    this.router.put("/:id/tracks/reorder", authenticateToken, this.reorderTracks.bind(this))
  }

  private async createPlaylist(req: Request, res: Response): Promise<void> {
    try {
      const { name, isPublic, tracks } = req.body
      const userId = req.body.user.id

      // Validate input
      const validationError = this.validateCreatePlaylist(name, isPublic, tracks)
      if (validationError) {
        res.status(400).json({ error: validationError })
        return
      }

      const playlist: Omit<PlaylistDocument, "_id"> = {
        userId,
        name: name.trim(),
        isPublic,
        tracks: tracks?.map((trackId: string, index: number) => ({
          trackId,
          position: index,
        })) || [],
        definedAccess: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      const result = await db.playlists.insertOne(playlist)
      const createdPlaylist = { ...playlist, _id: result.insertedId }

      res.status(201).json({
        data: createdPlaylist,
        links: this.generatePlaylistLinks(createdPlaylist)
      })
    } catch (error) {
      console.error("Failed to create playlist:", error)
      res.status(500).json({ error: "Failed to create playlist" })
    }
  }

  private async listPublicPlaylists(req: Request, res: Response): Promise<void> {
    try {
      const playlists = await db.playlists
        .find({ isPublic: true })
        .sort({ createdAt: -1 })
        .toArray()

      res.json({
        data: playlists,
        links: this.generateCollectionLinks(req)
      })
    } catch (error) {
      console.error("Failed to list public playlists:", error)
      res.status(500).json({ error: "Failed to list public playlists" })
    }
  }

  private async listUserPlaylists(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.body.user.id
      const playlists = await db.playlists
        .find({ userId })
        .sort({ createdAt: -1 })
        .toArray()

      res.json({
        data: playlists,
        links: this.generateCollectionLinks(req)
      })
    } catch (error) {
      console.error("Failed to list user playlists:", error)
      res.status(500).json({ error: "Failed to list user playlists" })
    }
  }

  private async updatePlaylist(req: Request, res: Response): Promise<void> {
    try {
      const playlistId = new ObjectId(req.params.id)
      const userId = req.body.user.id
      const { name, isPublic } = req.body

      // Verify ownership
      const existingPlaylist = await db.playlists.findOne({ 
        _id: playlistId,
        userId 
      })

      if (!existingPlaylist) {
        res.status(404).json({ error: "Playlist not found or unauthorized" })
        return
      }

      const updateData: Partial<PlaylistDocument> = {
        ...(name && { name: name.trim() }),
        ...(typeof isPublic === 'boolean' && { isPublic }),
        updatedAt: new Date()
      }

      const result = await db.playlists.findOneAndUpdate(
        { _id: playlistId },
        { $set: updateData },
        { returnDocument: 'after' }
      )

      if (!result) {
        res.status(404).json({ error: "Failed to update playlist" })
        return
      }

      res.json({
        data: result,
        links: this.generatePlaylistLinks(result)
      })
    } catch (error) {
      console.error("Failed to update playlist:", error)
      res.status(500).json({ error: "Failed to update playlist" })
    }
  }

 
private async addTracks(req: Request, res: Response): Promise<void> {
  try {
    const playlistId = new ObjectId(req.params.id)
    const userId = req.body.user.id
    const { tracks } = req.body

    if (!Array.isArray(tracks)) {
      res.status(400).json({ error: "Tracks must be an array of track IDs" })
      return
    }

    const playlist = await db.playlists.findOne({ _id: playlistId })
    if (!playlist) {
      res.status(404).json({ error: "Playlist not found" })
      return
    }

    if (!this.checkAccess(playlist, userId, AccessType.WRITE)) {
      res.status(403).json({ error: "Insufficient permissions to modify playlist" })
      return
    }

    const updatedPlaylist = await db.playlists.addTracks(playlistId, tracks)

    res.json({
      data: updatedPlaylist,
      links: this.generatePlaylistLinks(updatedPlaylist!)
    })
  } catch (error) {
    console.error("Failed to add tracks:", error)
    res.status(500).json({ error: "Failed to add tracks" })
  }
}

private async removeTrack(req: Request, res: Response): Promise<void> {
  try {
    const playlistId = new ObjectId(req.params.id)
    const trackId = req.params.trackId
    const userId = req.body.user.id

    const playlist = await db.playlists.findOne({ _id: playlistId })
    if (!playlist) {
      res.status(404).json({ error: "Playlist not found" })
      return
    }

    if (!this.checkAccess(playlist, userId, AccessType.WRITE)) {
      res.status(403).json({ error: "Insufficient permissions to modify playlist" })
      return
    }

    const updatedPlaylist = await db.playlists.removeTracks(playlistId, [trackId])

    res.json({
      data: updatedPlaylist,
      links: this.generatePlaylistLinks(updatedPlaylist!)
    })
  } catch (error) {
    console.error("Failed to remove track:", error)
    res.status(500).json({ error: "Failed to remove track" })
  }
}


  private validateCreatePlaylist(
    name?: string,
    isPublic?: boolean,
    tracks?: TrackId[]
  ): string | null {
    if (!name?.trim()) {
      return "Name is required"
    }

    if (typeof isPublic !== "boolean") {
      return "isPublic must be a boolean"
    }

    if (tracks && !Array.isArray(tracks)) {
      return "Tracks must be an array"
    }

    return null
  }

  private generateCollectionLinks(req: Request) {
    return {
      self: { href: `/playlists`, rel: "self" },
      create: { href: `/playlists`, rel: "create", method: "POST" }
    }
  }

  private generatePlaylistLinks(playlist: PlaylistDocument) {
    return {
      self: { href: `/playlists/${playlist._id}`, rel: "self" },
      update: { href: `/playlists/${playlist._id}`, rel: "update", method: "PUT" },
      tracks: { href: `/playlists/${playlist._id}/tracks`, rel: "tracks" }
    }
  }

  public getRouter(): Router {
    return this.router
  }
}