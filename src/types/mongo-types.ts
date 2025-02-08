import { UserId, TrackId, PlaylistId } from './id';
import { AccessControl } from './resource-types';

export interface MongoDocBaseResource<T> {
    id: T;
    createdAt: Date;
    updatedAt: Date;
}

export interface PlaylistDocument extends MongoDocBaseResource<PlaylistId> {
    name: string;
    ownerId: UserId;
    tracks: TrackId[];
    accessControl: AccessControl;
}

export interface TagDocument extends MongoDocBaseResource<TrackId> {
    
}


// Example usage:
const playlistPermissions: ResourcePermissions = {
    view: {
        roles: ['public'],  // Everyone can view
        users: []
    },
    edit: {
        roles: ['admin'],
        users: [toUserId('user123')]  // Specific users can edit
    },
    addTracks: {
        roles: ['subscriber'],
        users: []
    }
};