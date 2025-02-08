// src/types/resource-types.ts

import { UserId, PlaylistId, TrackId } from './id';

// a missing field in the AccessControl type means
// any user can access - use empty array to specify NO access (weirdo)
export interface AccessControl {
  read? : {
    users : UserId[]
    groups : string[]
  }
  write? : {
    users : UserId[]
    groups : string[]
  }
  modify? : { // Can modify access control/resource settings
    users : UserId[]
    groups : string[]
  } 
  delete? : {
    users : UserId[]
    groups : string[]
  }
}

export interface Resource {
  createdAt: Date;
  updatedAt: Date;
  owner?: UserId; // no owner means it is managed by the server
  accessControl: AccessControl[];
}

export interface User extends Resource {
  id: UserId;
  username: string;
  hashedPassword: string;
}

export interface Playlist extends Resource {
  id: PlaylistId;
  name: string;
  tracks: TrackId[];
}

export interface Tag extends Resource {
  id : string
  trackId: TrackId;
  tag: string;
  createdBy : UserId;
  votes : {
    up : UserId[]
    down : UserId[]
  }
}