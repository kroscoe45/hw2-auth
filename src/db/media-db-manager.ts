// src/services/main-db.service.ts
import { ObjectId } from "mongodb"
import {
  PlaylistDocument,
  TagDocument,
  AccessType,
  VOTE,
  UserId,
  TrackId,
  PlaylistId,
} from "../types"

export interface IMainDatabaseService {
  // Playlist operations
  createPlaylist(data: Omit<PlaylistDocument, "_id">): Promise<PlaylistDocument>
  findPlaylistById(id: string | ObjectId): Promise<PlaylistDocument | null>
  updatePlaylist(
    id: string | ObjectId,
    data: Partial<PlaylistDocument>
  ): Promise<PlaylistDocument | null>
  deletePlaylist(id: string | ObjectId): Promise<boolean>
  reorderPlaylistTracks(
    id: string | ObjectId,
    newOrder: { trackId: TrackId; position: number }[]
  ): Promise<PlaylistDocument>

  // Tag operations
  createTag(trackId: TrackId, tag: string, userId: UserId): Promise<TagDocument>
  findTagById(id: string | ObjectId): Promise<TagDocument | null>
  updateTagVote(
    trackId: TrackId,
    userId: UserId,
    tag: string,
    vote: VOTE
  ): Promise<TagDocument>
  getTagsByTrack(trackId: TrackId): Promise<TagDocument[]>
}

export class MainDatabaseService implements IMainDatabaseService {
  private db: any // Replace with your actual DB type

  constructor(dbConnection: any) {
    this.db = dbConnection
  }

  // Playlist operations
  async createPlaylist(
    data: Omit<PlaylistDocument, "_id">
  ): Promise<PlaylistDocument> {
    const playlist: PlaylistDocument = {
      _id: new ObjectId(),
      ...data,
      tracks: data.tracks || [],
      definedAccess: data.definedAccess || [],
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    await this.db.collection("playlists").insertOne(playlist)
    return playlist
  }

  async findPlaylistById(
    id: string | ObjectId
  ): Promise<PlaylistDocument | null> {
    return this.db.collection("playlists").findOne({ _id: new ObjectId(id) })
  }

  async updatePlaylist(
    id: string | ObjectId,
    data: Partial<PlaylistDocument>
  ): Promise<PlaylistDocument | null> {
    const result = await this.db.collection("playlists").findOneAndUpdate(
      { _id: new ObjectId(id) },
      {
        $set: {
          ...data,
          updatedAt: new Date(),
        },
      },
      { returnDocument: "after" }
    )
    return result.value
  }

  async deletePlaylist(id: string | ObjectId): Promise<boolean> {
    const result = await this.db
      .collection("playlists")
      .deleteOne({ _id: new ObjectId(id) })
    return result.deletedCount === 1
  }

  async reorderPlaylistTracks(
    id: string | ObjectId,
    newOrder: { trackId: TrackId; position: number }[]
  ): Promise<PlaylistDocument> {
    const playlist = await this.findPlaylistById(id)
    if (!playlist) {
      throw new Error("Playlist not found")
    }

    playlist.tracks = newOrder
    playlist.updatedAt = new Date()

    await this.db
      .collection("playlists")
      .updateOne(
        { _id: new ObjectId(id) },
        { $set: { tracks: newOrder, updatedAt: playlist.updatedAt } }
      )

    return playlist
  }

  // Tag operations
  async createTag(
    trackId: TrackId,
    tag: string,
    userId: UserId
  ): Promise<TagDocument> {
    const tagDoc: TagDocument = {
      _id: new ObjectId(),
      trackId,
      tag,
      votes: [
        {
          userId,
          value: VOTE.UP,
        },
      ],
      voteCount: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    await this.db.collection("tags").insertOne(tagDoc)
    return tagDoc
  }

  async findTagById(id: string | ObjectId): Promise<TagDocument | null> {
    return this.db.collection("tags").findOne({ _id: new ObjectId(id) })
  }

  async updateTagVote(
    trackId: TrackId,
    userId: UserId,
    tag: string,
    vote: VOTE
  ): Promise<TagDocument> {
    const existingTag = await this.db
      .collection("tags")
      .findOne({ trackId, tag })

    if (!existingTag) {
      return this.createTag(trackId, tag, userId)
    }

    const userVoteIndex = existingTag.votes.findIndex(
      (v: { userId: UserId; value: VOTE }) => v.userId === userId
    )
    if (userVoteIndex >= 0) {
      existingTag.votes[userVoteIndex].value = vote
    } else {
      existingTag.votes.push({ userId, value: vote })
    }

    existingTag.voteCount = existingTag.votes.reduce(
      (sum: number, v: { userId: UserId; value: VOTE }) => sum + v.value,
      0
    )
    existingTag.updatedAt = new Date()

    await this.db
      .collection("tags")
      .updateOne({ _id: existingTag._id }, { $set: existingTag })

    return existingTag
  }

  async getTagsByTrack(trackId: TrackId): Promise<TagDocument[]> {
    return this.db
      .collection("tags")
      .find({ trackId })
      .sort({ voteCount: -1 })
      .toArray()
  }
}
