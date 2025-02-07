export interface GetAuthenticationToken {
  body: { username: string; password: string }
}

export interface CreatePlaylist {
  name: string
  isPublic: boolean
  tracks?: string[]
}

export interface UpdatePlaylis {
  name?: string
  isPublic?: boolean
}

export interface ReorderTracks {
  tracks: { trackId: string; position: number }[]
}

export interface TagVoteRequest {
  vote: -1 | 1
}
