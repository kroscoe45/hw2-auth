// src/database/collections.ts
import { Collection } from "mongodb"
import {
  PlaylistDocument,
  TrackTagDocument,
  TrackTagVoteDocument,
  UserDocument,
} from "../types"

export interface DatabaseCollections {
  playlists: Collection<PlaylistDocument>
  trackTags: Collection<TrackTagDocument>
  trackTagVotes: Collection<TrackTagVoteDocument>
  users: Collection<UserDocument>
}
