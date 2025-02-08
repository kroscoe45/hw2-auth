// Branded types for different IDs
export type UserId = string & { readonly __brand: unique symbol };
export type TrackId = string & { readonly __brand: unique symbol };
export type AlbumId = string & { readonly __brand: unique symbol };
export type PlaylistId = string & { readonly __brand: unique symbol };

// Type assertion functions
export function toUserId(id: string): UserId {
    return id as UserId;
}

export function toTrackId(id: string): TrackId {
    return id as TrackId;
}

export function toAlbumId(id: string): AlbumId {
    return id as AlbumId;
}

export function toPlaylistId(id: string): PlaylistId {
    return id as PlaylistId;
}

// Type guards
export function isUserId(id: string): id is UserId {
    return id.startsWith('us-') && id.length >= 4; // Ensure some content after prefix
}

export function isTrackId(id: string): id is TrackId {
    return id.startsWith('tr-') && id.length >= 4;
}

export function isAlbumId(id: string): id is AlbumId {
    return id.startsWith('al-') && id.length >= 4;
}

export function isPlaylistId(id: string): id is PlaylistId {
    return id.startsWith('pl-') && id.length >= 4;
}