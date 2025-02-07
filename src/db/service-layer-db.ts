import { ObjectId } from "mongodb"
import { IUserDatabaseService } from "./user-db-manager"
import { IMainDatabaseService } from "./media-db-manager"
import { PlaylistDocument, TagDocument, UserDbEntry, VOTE } from "../types"

export class ServiceLayer {
  constructor(
    private readonly userDb: IUserDatabaseService,
    private readonly mainDb: IMainDatabaseService
  ) {}

  // User operations
  async createUser(userData: Omit<UserDbEntry, "id">): Promise<UserDbEntry> {
    return this.userDb.create(userData)
  }

  async validateUser(
    username: string,
    hashedPassword: string
  ): Promise<boolean> {
    return this.userDb.validateCredentials(username, hashedPassword)
  }

  async findUserById(id: string | ObjectId): Promise<UserDbEntry | null> {
    return this.userDb.findById(id)
  }

  // Playlist operations
  async createPlaylist(
    playlistData: Omit<PlaylistDocument, "_id">
  ): Promise<PlaylistDocument> {
    // Verify user exists before creating playlist
    const user = await this.userDb.findById(playlistData.userId)
    if (!user) {
      throw new Error("User not found")
    }

    return this.mainDb.createPlaylist(playlistData)
  }

  async updatePlaylistTracks(
    playlistId: string | ObjectId,
    userId: string,
    newOrder: { trackId: string; position: number }[]
  ): Promise<PlaylistDocument> {
    const playlist = await this.mainDb.findPlaylistById(playlistId)
    if (!playlist) {
      throw new Error("Playlist not found")
    }
    if (!this.hasPlaylistWriteAccess(playlist, userId)) {
      throw new Error("User does not have write access to this playlist")
    }
    return this.mainDb.reorderPlaylistTracks(playlistId, newOrder)
  }

  // Tag operations
  async updateTagVote(
    trackId: string,
    userId: string,
    tag: string,
    vote: VOTE
  ): Promise<TagDocument> {
    // Verify user exists before allowing vote
    const user = await this.userDb.findById(userId)
    if (!user) {
      throw new Error("User not found")
    }
    return this.mainDb.updateTagVote(trackId, userId, tag, vote)
  }

  private hasPlaylistWriteAccess(
    playlist: PlaylistDocument,
    userId: string
  ): boolean {
    return playlist.definedAccess.some(
      (access) =>
        access.userId === userId &&
        ["ADMIN", "WRITE"].includes(access.accessType) &&
        new Date(access.expires) > new Date()
    )
  }
}

// Example of usage:
/*
const serviceLayer = new ServiceLayer(
  new UserDatabaseService(userDbConnection),
  new MainDatabaseService(mainDbConnection)

*/
