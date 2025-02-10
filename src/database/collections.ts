// src/database/collections.ts
import { Collection } from "mongodb"
import {
  PlaylistDocument,
  TagDocument,
  TagVoteDocument,
  UserDocument,
} from "../types"

export interface DatabaseCollections {
  playlists: Collection<PlaylistDocument>
  tags: Collection<TagDocument>
  tagVotes: Collection<TagVoteDocument>
  users: Collection<UserDocument>
}
