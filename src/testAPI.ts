import axios from "axios"
import assert from "assert"
import dotenv from "dotenv"
import { setupTestDb, teardownTestDb } from "./testing-utils"

dotenv.config()

const API_BASE_URL = process.env.API_BASE_URL || "http://localhost:3000"
const client = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  validateStatus: () => true,
})

let authToken = ""
let userId = ""
let playlistId = ""
let tagId = ""

// Helper function to send requests with better error handling
async function sendRequest(
  method: "get" | "post" | "delete",
  endpoint: string,
  data: any = {}
) {
  try {
    const config = {
      headers: {},
      withCredentials: true,
    }

    if (authToken) {
      // Set both Cookie header and Authorization header
      config.headers = {
        Cookie: `token=${authToken}`,
        Authorization: `Bearer ${authToken}`,
      }
    }

    let response
    if (method === "get") {
      response = await client.get(endpoint, config)
    } else if (method === "delete") {
      response = await client.delete(endpoint, {
        ...config,
        data, // Pass data for DELETE requests
      })
    } else {
      response = await client.post(endpoint, data, config)
    }

    if (response.status >= 400) {
      console.error(
        `❌ ERROR ${response.status}: ${method.toUpperCase()} ${endpoint}`
      )
      console.error("Response:", response.data)
      throw new Error(`Request failed with status ${response.status}`)
    }

    console.log(`✅ SUCCESS: ${method.toUpperCase()} ${endpoint}`)
    return response.data
  } catch (error: any) {
    console.error(`❌ ERROR: ${method.toUpperCase()} ${endpoint}`)
    console.error("Error details:", error.response?.data || error.message)
    if (error.response?.status === 401) {
      console.error("Authentication error - Current token:", authToken)
    }
    throw error
  }
}

async function runTests() {
  try {
    await setupTestDb()

    console.log("\n🔍 Running API tests...")

    // 1️⃣ Register a new user
    console.log("\n📝 Testing user registration...")
    const signupResponse = await sendRequest("post", "/users/signup", {
      username: "test_user",
      password: "password123",
    })
    userId = signupResponse.userId
    assert(userId, "User ID should be returned on signup")
    console.log(`User registered with ID: ${userId}`)

    // 2️⃣ Log in
    console.log("\n🔑 Testing user login...")
    const loginResponse = await sendRequest("post", "/users/login", {
      username: "test_user",
      password: "password123",
    })
    authToken = loginResponse.token
    assert(authToken, "Login should return an auth token")
    console.log(
      "Login successful, token received:",
      authToken.substring(0, 20) + "..."
    )

    // 3️⃣ Create a new playlist
    console.log("\n🎵 Testing playlist creation...")
    const playlistResponse = await sendRequest("post", "/playlists", {
      name: "Test Playlist",
      tracks: [],
    })
    playlistId = playlistResponse.playlistId
    assert(playlistId, "Playlist ID should be returned")
    console.log(`Playlist created with ID: ${playlistId}`)

    // 4️⃣ Verify playlist exists
    console.log("\n🔍 Testing playlist retrieval...")
    const fetchedPlaylist = await sendRequest("get", `/playlists/${playlistId}`)
    assert(fetchedPlaylist.name === "Test Playlist", "Playlist name mismatch")
    console.log("Playlist verified successfully")

    // 5️⃣ Add a track to the playlist
    console.log("\n➕ Testing track addition...")
    await sendRequest("post", `/playlists/${playlistId}/tracks`, {
      trackId: "trk-123456",
    })
    console.log("Track added successfully")

    // 6️⃣ Remove the track from the playlist
    console.log("\n➖ Testing track removal...")
    await sendRequest("delete", `/playlists/${playlistId}/tracks`, {
      trackId: "trk-123456",
    })
    console.log("Track removed successfully")

    // 7️⃣ Add a tag to a track
    console.log("\n🏷️ Testing tag creation...")
    const tagResponse = await sendRequest("post", "/tags/suggest", {
      trackId: "trk-123456",
      tagName: "Upbeat",
    })
    tagId = tagResponse.tagId
    assert(tagId, "Tag ID should be returned")
    console.log(`Tag created with ID: ${tagId}`)

    // 8️⃣ Vote on the tag
    console.log("\n👍 Testing tag voting...")
    await sendRequest("post", "/tags/vote", {
      tagId,
      vote: 1,
    })
    console.log("Vote recorded successfully")

    // 9️⃣ Logout
    console.log("\n🚪 Testing user logout...")
    await sendRequest("post", "/users/logout")
    console.log("Logout successful")

    await teardownTestDb()
    console.log("\n🎉 ALL TESTS PASSED!")
  } catch (error) {
    console.error("\n❌ TEST SUITE FAILED!")
    console.error(error)

    try {
      await teardownTestDb()
    } catch (cleanupError) {
      console.error("Failed to cleanup after test failure:", cleanupError)
    }

    process.exit(1)
  }
}

// Error handlers
process.on("unhandledRejection", (error) => {
  console.error("❌ UNHANDLED REJECTION:", error)
  process.exit(1)
})

runTests().catch((error) => {
  console.error("❌ UNHANDLED ERROR:", error)
  process.exit(1)
})
