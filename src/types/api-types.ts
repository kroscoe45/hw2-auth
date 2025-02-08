import { UserId, TrackId, AlbumId } from "./id"

//region API Response Types
export interface ApiResponse<T> {
    data?: T
    error?: string
    links: Links
}

export interface Links {
    self: Link
    [key: string]: Link
}

export interface Link {
    href: string
    rel: string
    method?: string
}
//endregion API Response Types

//region API Request Types
export interface BaseRequest {
    requestedBy: UserId
    requestReceived: Date
}

export interface PlaylistCreateRequest extends BaseRequest {
    playlistName: string
    isPublic?: boolean 
    tracks?: TrackId[]
}

export interface PlaylistUpdateRequest {
    name?: string
    isPublic?: boolean
}

export interface PlaylistReorderRequest {
    tracks: Array<{
        trackId: string
    }>
}

export interface TagSuggestRequest {
    trackId: TrackId
    tag: string
}

export interface TagVoteRequest {
    trackId: TrackId
    tag: string
    vote: -1 | 1
}
