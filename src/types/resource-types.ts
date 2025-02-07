export interface User {
  id: string
  name: string
  email: string
  role: string
}

export interface PlaylistTrack {
  trackId: string
  position: number
}

export enum UserRole {
  ADMIN = "admin",
  USER = "user",
  ONBOARDING = "onboarding",
  ARTIST = "artist",
  LABEL = "label",
}

export interface Playlist {
  id: string
  userId: string
  name: string
  isPublic: boolean
  tracks: PlaylistTrack[]
  createdAt: Date
  updatedAt: Date
}

export interface Tag {
  trackId: string
  tag: string
  userId: string
  vote: -1 | 1
  createdAt: Date
}
