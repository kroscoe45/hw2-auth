// src/types

import { AccessControl } from "./resource-types"
import { ObjectId } from "mongodb"
export enum VOTE {
  UP = 1,
  DOWN = -1,
}

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

export interface PlaylistDocument {
  _id: ObjectId
  userId: string
  name: string
  isPublic: boolean
  tracks: Array<{
    trackId: string
    position: number
  }>
  
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
