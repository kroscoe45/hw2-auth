// src/services/user-db.service.ts
import { ObjectId } from "mongodb"
import { UserDbEntry, UserRole } from "../types"

export interface IUserDatabaseService {
  create(data: Omit<UserDbEntry, "id">): Promise<UserDbEntry>
  findById(id: string | ObjectId): Promise<UserDbEntry | null>
  findByUsername(username: string): Promise<UserDbEntry | null>
  update(
    id: string | ObjectId,
    data: Partial<UserDbEntry>
  ): Promise<UserDbEntry | null>
  delete(id: string | ObjectId): Promise<boolean>
  validateCredentials(
    username: string,
    hashedPassword: string
  ): Promise<boolean>
}

export class UserDatabaseService implements IUserDatabaseService {
  private db: any // Replace with your actual DB type

  constructor(dbConnection: any) {
    this.db = dbConnection
  }

  async create(data: Omit<UserDbEntry, "id">): Promise<UserDbEntry> {
    const user: UserDbEntry = {
      id: new ObjectId().toString(),
      ...data,
      roles: data.roles || [UserRole.USER],
      createdAt: new Date(),
    }

    await this.db.collection("users").insertOne(user)
    return user
  }

  async findById(id: string | ObjectId): Promise<UserDbEntry | null> {
    return this.db.collection("users").findOne({ id })
  }

  async findByUsername(username: string): Promise<UserDbEntry | null> {
    return this.db.collection("users").findOne({ username })
  }

  async update(
    id: string | ObjectId,
    data: Partial<UserDbEntry>
  ): Promise<UserDbEntry | null> {
    const result = await this.db
      .collection("users")
      .findOneAndUpdate(
        { id },
        { $set: { ...data, updatedAt: new Date() } },
        { returnDocument: "after" }
      )
    return result.value
  }

  async delete(id: string | ObjectId): Promise<boolean> {
    const result = await this.db.collection("users").deleteOne({ id })
    return result.deletedCount === 1
  }

  async validateCredentials(
    username: string,
    hashedPassword: string
  ): Promise<boolean> {
    const user = await this.findByUsername(username)
    return user?.hashedPassword === hashedPassword
  }
}
