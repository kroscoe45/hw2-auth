// src/database/index.ts
import { MongoClient, Db } from "mongodb"
import { dbConfig } from "./config"
import { DatabaseCollections } from "./collections"
import { createIndexes } from "./indexes"
import { UserRepository } from "./repositories/user-repo"
import { PlaylistRepository } from "./repositories/playlist-repo"
import { TagRepository } from "./repositories/tag-repo"

import {
  PlaylistDocument,
  TrackTagDocument,
  TrackTagVoteDocument,
  UserDocument,
} from "../types"

class Database {
  private client: MongoClient
  private db: Db
  private collections: DatabaseCollections

  // Repositories
  private _users: UserRepository
  private _playlists: PlaylistRepository
  private _tags: TagRepository

  constructor() {
    this.client = null!
    this.db = null!
    this.collections = null!
    this._users = null!
    this._playlists = null!
    this._tags = null!
  }

  async connect(): Promise<void> {
    try {
      this.client = await MongoClient.connect(dbConfig.uri)

      this.db = this.client.db(dbConfig.dbName)
      this.collections = {
        users: this.db.collection<UserDocument>("users"),
        playlists: this.db.collection<PlaylistDocument>("playlists"),
        trackTags: this.db.collection<TrackTagDocument>("tags"),
        trackTagVotes: this.db.collection<TrackTagVoteDocument>("tagVotes"),
      }

      // Initialize repositories
      this._users = new UserRepository(this.collections.users)
      this._playlists = new PlaylistRepository(this.collections.playlists)
      this._tags = new TagRepository(
        this.collections.trackTags,
        this.collections.trackTagVotes,
        this.client
      )

      await createIndexes(this.collections)
    } catch (error) {
      throw error
    }
  }

  // Repository getters
  get users(): UserRepository {
    return this._users
  }

  get playlists(): PlaylistRepository {
    return this._playlists
  }

  get tags(): TagRepository {
    return this._tags
  }

  async disconnect(): Promise<void> {
    await this.client?.close()
  }
}

// Export a singleton instance
export default new Database()
