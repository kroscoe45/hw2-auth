import { Collection } from "mongodb"
import { v4 as uuidv4 } from "uuid"
import { PlaylistDocument, PlaylistId, TrackId, UserId } from "../../types"

export class PlaylistRepository {
  constructor(private playlistCollection: Collection<PlaylistDocument>) {}

  // Create a new playlist
  async createPlaylist(
    name: string,
    ownerId: UserId,
    tracks: TrackId[] = []
  ): Promise<PlaylistId> {
    const playlistId = `plt-${uuidv4()}` as PlaylistId

    const newPlaylist: PlaylistDocument = {
      id: playlistId,
      name,
      ownerId,
      tracks,
      dbName: "playlists",
      accessControl: {},
      created: new Date(),
      lastModified: new Date(),
      lastModifiedBy: ownerId,
      isDeleted: false,
    }

    await this.playlistCollection.insertOne(newPlaylist)
    return playlistId
  }
  async getPlaylistById(
    playlistId: PlaylistId
  ): Promise<PlaylistDocument | null> {
    return await this.playlistCollection.findOne({
      id: playlistId,
      isDeleted: false,
    })
  }

  async getPlaylistsByUser(ownerId: UserId): Promise<PlaylistDocument[]> {
    return await this.playlistCollection
      .find({ ownerId, isDeleted: false })
      .toArray()
  }

  async addTrackToPlaylist(
    playlistId: PlaylistId,
    trackId: TrackId,
    userId: UserId
  ): Promise<void> {
    const playlist = await this.getPlaylistById(playlistId)
    if (!playlist) throw new Error("Playlist not found")
    if (playlist.ownerId !== userId) throw new Error("Unauthorized action")

    if (!playlist.tracks.includes(trackId)) {
      await this.playlistCollection.updateOne(
        { id: playlistId },
        {
          $push: { tracks: trackId },
          $set: { lastModified: new Date(), lastModifiedBy: userId },
        }
      )
    }
  }

  async removeTrackFromPlaylist(
    playlistId: PlaylistId,
    trackId: TrackId,
    userId: UserId
  ): Promise<void> {
    const playlist = await this.getPlaylistById(playlistId)
    if (!playlist) throw new Error("Playlist not found")
    if (playlist.ownerId !== userId) throw new Error("Unauthorized action")

    if (playlist.tracks.includes(trackId)) {
      await this.playlistCollection.updateOne(
        { id: playlistId },
        {
          $pull: { tracks: trackId },
          $set: { lastModified: new Date(), lastModifiedBy: userId },
        }
      )
    }
  }

  async deletePlaylist(playlistId: PlaylistId, userId: UserId): Promise<void> {
    const playlist = await this.getPlaylistById(playlistId)
    if (!playlist) throw new Error("Playlist not found")
    if (playlist.ownerId !== userId) throw new Error("Unauthorized action")

    await this.playlistCollection.updateOne(
      { id: playlistId },
      {
        $set: {
          isDeleted: true,
          lastModified: new Date(),
          lastModifiedBy: userId,
        },
      }
    )
  }
}
