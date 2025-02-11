import db from "./database"

export async function clearDatabase() {
  try {
    if (!db["client"]) {
      await db.connect()
    }
    await Promise.all(
      [
        db.users["userCollection"].deleteMany({}),
        db.playlists["playlistCollection"].deleteMany({}),
        db.tags["tagCollection"].deleteMany({}),
        db.tags["voteCollection"].deleteMany({}),
      ].filter(Boolean)
    )
  } catch (error) {
    console.error("Error clearing database:", error)
    throw error
  }
}

export async function setupTestDb() {
  try {
    await db.connect()
    await clearDatabase()
  } catch (error) {
    console.error("Error setting up test database:", error)
    throw error
  }
}

export async function teardownTestDb() {
  try {
    await clearDatabase()
    await db.disconnect()
  } catch (error) {
    console.error("Error tearing down test database:", error)
    throw error
  }
}
