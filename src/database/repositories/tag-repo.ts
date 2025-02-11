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
  ): Promise<{ tag: TrackTagDocument; vote: TrackTagVoteDocument | null }> {
    const session = this.client.startSession()

    try {
      session.startTransaction()
      const existingTag = await this.tagCollection.findOne({
        taggedTrack: trackId,
        tagName,
      })
      if (existingTag) {
        return { tag: existingTag, vote: null }
      }
      const tag: TrackTagDocument = {
        id: `tag-${uuidv4()}` as TrackTagId,
        dbName: "tags",
        taggedTrack: trackId,
        tagName,
        accessControl: {},
        votes: [],
        created: new Date(),
        lastModified: new Date(),
        lastModifiedBy: createdBy,
        isDeleted: false,
      }
      const vote: TrackTagVoteDocument = {
        id: `tvt-${uuidv4()}` as TrackTagVoteId,
        dbName: "tagVotes",
        accessControl: {},
        castBy: createdBy,
        taggedTrack: trackId,
        vote: 1,
        created: new Date(),
        lastModified: new Date(),
        lastModifiedBy: createdBy,
        isDeleted: false,
      }

      await this.tagCollection.insertOne(tag, { session })
      await this.voteCollection.insertOne(vote, { session })

      await session.commitTransaction()
      return { tag, vote }
    } catch (error: any) {
      await session.abortTransaction()
      throw new Error(`Failed to create tag: ${error.message}`)
    } finally {
      await session.endSession()
    }
  }

  async getTrackTags(
    trackId: TrackId
  ): Promise<Array<{ tagName: string; score: number; userCount: number }>> {
    const result = await this.voteCollection
      .aggregate<{ tagName: string; score: number; userCount: number }>([
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
          $sort: { score: -1 },
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

    return result
  }

  async voteTag(
    tagId: TrackTagId,
    userId: UserId,
    vote: -1 | 1
  ): Promise<void> {
    const tag = await this.tagCollection.findOne({ id: tagId })
    if (!tag) throw new Error("Tag not found")
    const existingVote = await this.voteCollection.findOne({
      castBy: userId,
      taggedTrack: tag.taggedTrack,
    })

    if (existingVote) {
      await this.voteCollection.updateOne(
        { id: existingVote.id },
        {
          $set: {
            unweightedVoteValue: vote,
            lastModifiedAt: new Date(),
            lastModifiedBy: userId,
          },
        }
      )
    } else {
      const newVote: TrackTagVoteDocument = {
        id: `tvt-${uuidv4()}` as TrackTagVoteId,
        dbName: "tagVotes",
        accessControl: {},
        castBy: userId,
        taggedTrack: tag.taggedTrack,
        vote: 1,
        created: new Date(),
        lastModified: new Date(),
        lastModifiedBy: userId,
        isDeleted: false,
      }

      await this.voteCollection.insertOne(newVote)
    }
  }
}
