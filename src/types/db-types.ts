import { accessSync } from "fs"
import { UserRole } from "./resource-types"
import { ObjectId } from "mongodb"
import exp from "constants"
export enum VOTE {
  UP = 1,
  DOWN = -1,
}

export interface UserDbEntry {
  id: string
  username: string
  hashedPassword: string
  roles: UserRole[]
  createdAt: Date
}

export interface ResourceMetadata {
  key: string
  value: string
}

export interface AccessControl<IDType extends string> {}

export abstract class BaseResource<IDType extends string> {
  constructor(
    public _id: IDType,
    public createdAt: Date = new Date(),
    public updatedAt: Date = new Date(),
    public lastFetched?: Date,
    public accessControl?: AccessControl[]
  ) {}
}

interface TrackData {
  title: string
  artist: string
  duration: number
}

interface UserData {
  name: string
  email: string
}

interface AlbumData {
  title: string
  releaseYear: number
}

export enum AccessType {
  READ = "read",
  WRITE = "write",
  ADMIN = "admin",
}

export interface PlaylistAccess {
  userId: string
  accessType: AccessType
  expires: string // ISO date string
}

export interface PlaylistDocument {
  _id: ObjectId
  userId: string
  name: string
  isPublic: boolean
  tracks: Array<{
    trackId: string
    position: number
  }>
  definedAccess: PlaylistAccess[]
  createdAt: Date
  updatedAt: Date
}

export interface userVoteDocument {
  _id: ObjectId
  userId: string
  trackId: string
  vote: -1 | 1
}

export interface TagDocument {
  _id: ObjectId
  trackId: string
  tag: string
  votes: Array<{
    userId: string
    value: VOTE.DOWN | VOTE.UP
  }>
  voteCount: number
  createdAt: Date
  updatedAt: Date
}
