import { UserId } from "./db-types"

// define a dictionary that maps a type to whether it is in SQLite3 or MongoDB
const typeToDb = {
  User: "SQLite3",
} as const

export type AccessType = "read" | "write" | "modify" | "delete"

// a missing field in the AccessControl type means
// any NO user can access the resource in that way
export interface AccessControl {
  read?: {
    users: UserId[]
    groups: string[]
  }
  write?: {
    users: UserId[]
    groups: string[]
  }
  modify?: {
    // Can modify access control/resource settings
    users: UserId[]
    groups: string[]
  }
  delete?: {
    users: UserId[]
    groups: string[]
  }
}
