import { UserId, TrackId, AlbumId } from "./db-types"

//region API Response Types
export type ApiResponse<T> = {
  data?: T
  error?: string
  links: Links
}

export type Links = {
  self: Link
  [key: string]: Link
}

export type Link = {
  href: string
  rel: string
  method?: string
}
//endregion API Response Types

//region API Request Types
export type ApiRequest = {
  requestedBy: UserId
  requestReceived: Date
}

export type PlaylistCreateRequest = ApiRequest & {
  playlistName: string
  isPublic?: boolean
  tracks?: TrackId[]
}

export type PlaylistUpdateRequest = ApiRequest & {
  name?: string
  isPublic?: boolean
}

export type PlaylistReorderRequest = ApiRequest & {
  tracks: Array<{
    trackId: string
  }>
}

export type TagSuggestRequest = ApiRequest & {
  trackId: TrackId
  tag: string
}

export type TagVoteRequest = ApiRequest & {
  trackId: TrackId
  tag: string
  vote: -1 | 1
}
