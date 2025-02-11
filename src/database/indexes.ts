// src/database/indexes.ts
import { Collection } from "mongodb"
import { DatabaseCollections } from "./collections"

export async function createIndexes(
  collections: DatabaseCollections
): Promise<void> {
  try {
    await collections.users.createIndex({ username: 1 }, { unique: true })
    await collections.users.createIndex({ groups: 1 })
    await collections.playlists.createIndex({ ownerId: 1 })
    await collections.trackTags.createIndex(
      { taggedTrack: 1, tagName: 1 },
      { unique: true }
    )
    await collections.trackTagVotes.createIndex(
      { castBy: 1, taggedTrack: 1 },
      { unique: true }
    )
  } catch (error) {
    throw error
  }
}
