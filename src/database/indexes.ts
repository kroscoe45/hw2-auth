// src/database/indexes.ts
import { Collection } from "mongodb"
import { DatabaseCollections } from "./collections"

export async function createIndexes(
  collections: DatabaseCollections
): Promise<void> {
  // User indexes
  await collections.users.createIndex({ username: 1 }, { unique: true })
  await collections.users.createIndex({ groups: 1 })

  // Playlist indexes
  await collections.playlists.createIndex({ ownerId: 1 })
  await collections.playlists.createIndex({ "accessControl.read.users": 1 })
  await collections.playlists.createIndex({ "accessControl.read.groups": 1 })

  // Tag indexes
  await collections.tags.createIndex({ trackId: 1 })
  await collections.tags.createIndex({ trackId: 1, tag: 1 }, { unique: true })

  // TagVote indexes
  await collections.tagVotes.createIndex(
    { userId: 1, trackId: 1, tag: 1 },
    { unique: true }
  )
}
