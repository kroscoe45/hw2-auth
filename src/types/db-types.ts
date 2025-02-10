export type ResourceId =
  | UserId
  | TrackId
  | AlbumId
  | PlaylistId
  | TrackTagId
  | TrackTagVoteId

// All ID types in one place
export type UserId = string & { readonly __brand: "UserId" }
export type TrackId = string & { readonly __brand: "TrackId" }
export type AlbumId = string & { readonly __brand: "AlbumId" }
export type PlaylistId = string & { readonly __brand: "PlaylistId" }
export type TrackTagId = string & { readonly __brand: "TrackTagId" }
export type TrackTagVoteId = string & { readonly __brand: "TrackTagVoteId" }
export const toUserId = (id: string): UserId => {
  if (!isUserId(id)) throw new Error("Invalid user ID format")
  return id as UserId
}

export const toTrackId = (id: string): TrackId => {
  if (!isTrackId(id)) throw new Error("Invalid track ID format")
  return id as TrackId
}

export const toAlbumId = (id: string): AlbumId => {
  if (!isAlbumId(id)) throw new Error("Invalid album ID format")
  return id as AlbumId
}

export const toPlaylistId = (id: string): PlaylistId => {
  if (!isPlaylistId(id)) throw new Error("Invalid playlist ID format")
  return id as PlaylistId
}

export const toTrackTagId = (id: string): TrackTagId => {
  if (!isTrackTagId(id)) throw new Error("Invalid track tag ID format")
  return id as TrackTagId
}

export const toTrackTagVoteId = (id: string): TrackTagVoteId => {
  if (!isTrackTagVoteId(id)) throw new Error("Invalid track tag vote ID format")
  return id as TrackTagVoteId
}

export const isUserId = (id: string): id is UserId =>
  id.startsWith("usr-") && id.length >= 8

export const isTrackId = (id: string): id is TrackId =>
  id.startsWith("trk-") && id.length >= 8

export const isAlbumId = (id: string): id is AlbumId =>
  id.startsWith("alb-") && id.length >= 8

export const isPlaylistId = (id: string): id is PlaylistId =>
  id.startsWith("plt-") && id.length >= 8

export const isTrackTagId = (id: string): id is TrackTagId =>
  id.startsWith("tag-") && id.length >= 8

export const isTrackTagVoteId = (id: string): id is TrackTagVoteId =>
  id.startsWith("tvt-") && id.length >= 8

export type BaseDocument<T extends ResourceId> = {
  id: T
  dbName: string
  createdAt: Date
  createdBy: UserId
  lastModifiedAt: Date
  lastModifiedBy: UserId
  isDeleted: boolean
}

export type PlaylistDocument = BaseDocument<PlaylistId> & {
  name: string
  ownerId: UserId
  isPublic: boolean
  tracks: TrackId[]
}

export type TrackTagDocument = BaseDocument<TrackTagId> & {
  id: TrackTagId
  taggedTrack: TrackId
  tagName: string
  votes: TrackTagVoteDocument[]
}

export type TrackTagVoteDocument = BaseDocument<TrackTagVoteId> & {
  castBy: UserId
  taggedTrack: TrackId
  unweightedVoteValue: -1 | 1
  voteWeight: number
  tagName: string
}
