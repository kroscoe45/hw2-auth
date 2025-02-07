import { Router, Request, Response } from "express"
import {
  PlaylistDocument,
  UserId,
  TrackId,
  AccessType,
  ApiResponse,
} from "../types"
import db from "../database"
import { authenticateToken } from "../middleware/auth"

interface CreatePlaylistRequest {
  name: string
  isPublic: boolean
  tracks?: TrackId[]
}

export class PlaylistResource {
  private router: Router

  constructor() {
    this.router = Router()
    this.initializeRoutes()
  }

  private initializeRoutes(): void {
    this.router.post("/", authenticateToken, this.createPlaylist.bind(this))
  }

  private async createPlaylist(req: Request, res: Response): Promise<void> {
    try {
      const { name, isPublic, tracks } = req.body as CreatePlaylistRequest
      const userId = req.body.user.id as UserId

      // Validate input
      const validationError = this.validateCreatePlaylist(
        name,
        isPublic,
        tracks
      )
      if (validationError) {
        res.status(400).json({ error: validationError })
        return
      }

      const playlist: Omit<PlaylistDocument, "_id"> = {
        userId,
        name: name.trim(),
        isPublic,
        tracks:
          tracks?.map((trackId, index) => ({
            trackId,
            position: index,
          })) || [],
        definedAccess: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      const result = await db.playlists.insertOne(playlist)

      const createdPlaylist = { ...playlist, _id: result.insertedId }

      const response: ApiResponse<PlaylistDocument> = {
        data: createdPlaylist,
        links: this.generatePlaylistLinks(createdPlaylist),
      }

      res.status(201).json(response)
    } catch (error) {
      console.error("Failed to create playlist:", error)
      res.status(500).json({ error: "Failed to create playlist" })
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

    if (tracks) {
      if (!Array.isArray(tracks)) {
        return "Tracks must be an array"
      }

      // Validate each track ID
      for (const track of tracks) {
        if (typeof track !== "string" || !track.trim()) {
          return "Invalid track ID in tracks array"
        }
      }
    }

    return null
  }

  private generatePlaylistLinks(playlist: PlaylistDocument) {
    return {
      self: {
        href: `/playlists/${playlist._id}`,
        rel: "self",
      },
      update: {
        href: `/playlists/${playlist._id}`,
        rel: "update",
        method: "PUT",
      },
      tracks: {
        href: `/playlists/${playlist._id}/tracks`,
        rel: "tracks",
        method: "GET",
      },
    }
  }

  public getRouter(): Router {
    return this.router
  }
}
