// src/database/repositories/tag-repository.ts
import { Collection, MongoClient } from "mongodb"
import { v4 as uuidv4 } from "uuid"
import {
  TrackTagDocument,
  TrackTagVoteDocument,
  TrackTagId,
  TrackId,
  UserId,
  TrackTagVoteId,
} from "../../types"

export class TagRepository {
  constructor(
    private tagCollection: Collection<TrackTagDocument>,
    private voteCollection: Collection<TrackTagVoteDocument>,
    private client: MongoClient
  ) {}

  async createTagWithVote(
    trackId: TrackId,
    tagName: string,
    createdBy: UserId
  ): Promise<{ tag: TrackTagDocument; vote: TrackTagVoteDocument }> {
    // Now we can access the client directly
    const session = this.client.startSession()

    try {
      session.startTransaction()

      // Create the tag
      const tag: TrackTagDocument = {
        id: `tag-${uuidv4()}` as TrackTagId,
        dbName: "tags",
        taggedTrack: trackId,
        tagName,
        votes: [],
        createdAt: new Date(),
        createdBy,
        lastModifiedAt: new Date(),
        lastModifiedBy: createdBy,
        isDeleted: false,
      }

      // Create the initial vote
      const vote: TrackTagVoteDocument = {
        id: `tvt-${uuidv4()}` as TrackTagVoteId,
        dbName: "tagVotes",
        castBy: createdBy,
        taggedTrack: trackId,
        tagName,
        unweightedVoteValue: 1,
        voteWeight: 1,
        createdAt: new Date(),
        createdBy,
        lastModifiedAt: new Date(),
        lastModifiedBy: createdBy,
        isDeleted: false,
      }

      await this.tagCollection.insertOne(tag, { session })
      await this.voteCollection.insertOne(vote, { session })

      await session.commitTransaction()
      return { tag, vote }
    } catch (error) {
      await session.abortTransaction()
      throw error
    } finally {
      await session.endSession()
    }
  }

  // Get all tags for a track with their vote counts
  async getTrackTags(trackId: TrackId): Promise<
    Array<{
      tagName: string
      score: number
      userCount: number
    }>
  > {
    return this.voteCollection
      .aggregate([
        {
          $match: {
            taggedTrack: trackId,
            isDeleted: false,
          },
        },
        {
          $group: {
            _id: "$tagName",
            score: {
              $sum: { $multiply: ["$unweightedVoteValue", "$voteWeight"] },
            },
            userCount: { $sum: 1 },
          },
        },
        {
          $project: {
            tagName: "$_id",
            score: 1,
            userCount: 1,
            _id: 0,
          },
        },
      ])
      .toArray()
  }

  // Find tracks by tag (positive votes only)
  async findTracksWithTag(tagName: string): Promise<TrackId[]> {
    const results = await this.voteCollection
      .aggregate([
        {
          $match: {
            tagName,
            isDeleted: false,
          },
        },
        {
          $group: {
            _id: "$taggedTrack",
            score: {
              $sum: { $multiply: ["$unweightedVoteValue", "$voteWeight"] },
            },
          },
        },
        {
          $match: {
            score: { $gt: 0 },
          },
        },
      ])
      .toArray()

    return results.map((r) => r._id as TrackId)
  }

  // Delete a tag if it has no more votes
  async deleteIfNoVotes(
    tagId: TrackTagId,
    tagName: string,
    trackId: TrackId
  ): Promise<void> {
    const voteCount = await this.voteCollection.countDocuments({
      tagName,
      taggedTrack: trackId,
      isDeleted: false,
    })

    if (voteCount === 0) {
      await this.tagCollection.updateOne(
        { id: tagId },
        { $set: { isDeleted: true } }
      )
    }
  }
}
