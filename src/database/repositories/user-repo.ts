import { Collection } from "mongodb"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import { UserDocument, UserId, toUserId } from "../../types"

const JWT_SECRET =
  process.env.JWT_SECRET || "default_secret_go_check_the_env_vars"

export class UserRepository {
  private userCollection: Collection<UserDocument>

  constructor(collection: Collection<UserDocument>) {
    this.userCollection = collection
  }

  async registerUser(username: string, password: string): Promise<UserId> {
    const existingUser = await this.userCollection.findOne({ username })
    if (existingUser) {
      throw new Error("Username already exists")
    }
    const hashedPassword = await bcrypt.hash(password, 10)
    const userId = toUserId(`usr-${new Date().getTime()}`)

    const newUser: UserDocument = {
      id: userId,
      username,
      passHash: hashedPassword,
      groups: ["user"],
      dbName: "users",
      accessControl: {},
      created: new Date(),
      lastModified: new Date(),
      lastModifiedBy: userId,
      isDeleted: false,
    }

    await this.userCollection.insertOne(newUser)
    return userId
  }

  async loginUser(
    username: string,
    password: string
  ): Promise<{ userId: string; token: string }> {
    const user = await this.userCollection.findOne({ username })

    if (!user) throw new Error("Invalid credentials")
    const isValidPassword = await bcrypt.compare(password, user.passHash)
    if (!isValidPassword) throw new Error("Invalid credentials")
    const token = jwt.sign(
      {
        id: user.id,
        username: user.username,
      },
      JWT_SECRET,
      {
        expiresIn: "1h",
      }
    )
    return {
      userId: user.id,
      token,
    }
  }

  async getUserById(userId: UserId): Promise<UserDocument | null> {
    const user = await this.userCollection.findOne(
      { id: userId },
      { projection: { passHash: 0 } }
    )
    return user
  }

  logoutUser(res: any): void {
    res.clearCookie("token")
  }
}
