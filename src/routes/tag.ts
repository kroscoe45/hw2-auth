import express from "express"
import db from "../database"
import { authenticateTokenFromCookie } from "../middleware/auth"
import { TrackId, UserId } from "../types"

const router = express.Router()

router.post("/suggest", authenticateTokenFromCookie, async (req, res) => {
  try {
    const { trackId, tagName } = req.body
    if (!trackId || !tagName.trim()) {
      res.status(400).json({ error: "Track ID and tag name are required" })
      return
    }
    const tagId = await db.tags.createTagWithVote(
      trackId as TrackId,
      tagName,
      (req as any).user.id as UserId
    )
    res.status(201).json({ message: "Tag added successfully", tagId })
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})

router.post("/vote", authenticateTokenFromCookie, async (req, res) => {
  try {
    const { tagId, vote } = req.body
    if (!tagId || ![1, -1].includes(vote)) {
      res.status(400).json({ error: "Invalid tag ID or vote value" })
      return
    }

    await db.tags.voteTag(tagId, (req as any).user.id as UserId, vote)
    res.json({ message: "Vote recorded" })
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})

router.get("/:trackId", async (req, res) => {
  try {
    const trackId = req.params.trackId as TrackId
    const tags = await db.tags.getTrackTags(trackId)
    res.json(tags)
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})

export default router
