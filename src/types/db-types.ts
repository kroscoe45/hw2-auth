import {
  PlaylistId,
  TrackId,
  TrackTagId,
  TrackTagVoteId,
  UserId,
} from "./types"

export type AccessType = "read" | "write" | "modify" | "delete"

export type UserGroup = "admin" | "user" | "guest"

export interface AccessControlEntry {
  users: UserId[]
  groups: string[]
}

export type AccessControl = Partial<Record<AccessType, AccessControlEntry>>

export type DocumentMetadata = {
  dbName: string
  accessControl: AccessControl
  created: Date
  lastModified: Date
  lastModifiedBy: UserId
  isDeleted: boolean
  deleted?: Date
}

export type UserDocument = DocumentMetadata & {
  id: UserId
  groups: string[]
  username: string
  passHash: string
}

export type PlaylistDocument = DocumentMetadata & {
  id: PlaylistId
  name: string
  ownerId: UserId
  tracks: TrackId[]
}

export type TrackTagDocument = DocumentMetadata & {
  id: TrackTagId
  taggedTrack: TrackId
  tagName: string
  votes: TrackTagVoteDocument[]
}

export type TrackTagVoteDocument = DocumentMetadata & {
  id: TrackTagVoteId
  castBy: UserId
  taggedTrack: TrackId
  vote: -1 | 1
}
