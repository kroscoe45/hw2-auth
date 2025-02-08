// src/resources/base-resource.ts

import { Router, Request, Response } from "express"
import {authenticateToken} from "../middleware/auth"
import { ApiResponse, Links, ApiError, AccessType } from "../types"
import db from "../database"

interface AccessControlled {
  userId: string
  definedAccess: Array<{
    userId: string
    accessType: AccessType
    expires: string
  }>
  isPublic?: boolean
}

export abstract class BaseResource {
  protected router: Router
  protected resourcePath: string

  constructor(resourcePath: string) {
    this.router = Router()
    this.resourcePath = resourcePath
    this.initializeRoutes()
  }

  protected initializeRoutes(): void {
    this.router.get("/", this.list.bind(this))
    this.router.get("/:id", this.get.bind(this))
    this.router.post("/", authenticateToken, this.create.bind(this))
  }

  protected checkAccess<T extends AccessControlled>(
    resource: T,
    userId: string,
    requiredAccess: AccessType
  ): boolean {
    // Creator always has full access
    if (resource.userId === userId) {
      return true
    }

    // Public resources can be read by anyone
    if (resource.isPublic && requiredAccess === AccessType.READ) {
      return true
    }

    // Check access control list
    const userAccess = resource.definedAccess.find(
      (access) => 
        access.userId === userId && 
        new Date(access.expires) > new Date()
    )

    if (!userAccess) {
      return false
    }

    switch (userAccess.accessType) {
      case AccessType.ADMIN:
        return true
      case AccessType.WRITE:
        return requiredAccess === AccessType.WRITE || requiredAccess === AccessType.READ
      case AccessType.READ:
        return requiredAccess === AccessType.READ
      default:
        return false
    }
  }

  protected async findWithAccess<T extends AccessControlled>(
    id: string,
    userId: string,
    requiredAccess: AccessType
  ): Promise<T | null> {
    const resource = await db[this.resourcePath].findOne({ _id: id }) as T

    if (!resource) {
      return null
    }

    if (!this.checkAccess(resource, userId, requiredAccess)) {
      return null
    }

    return resource
  }

  protected async list(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.body.user?.id
      let query = {}

      // If authenticated, include resources where user has access
      if (userId) {
        query = {
          $or: [
            { isPublic: true },
            { userId },
            { "definedAccess.userId": userId }
          ]
        }
      } else {
        // If not authenticated, only show public resources
        query = { isPublic: true }
      }

      const items = await db[this.resourcePath].find(query).toArray()
      const response: ApiResponse<any[]> = {
        data: items,
        links: this.generateCollectionLinks(req),
      }
      res.json(response)
    } catch (error) {
      this.handleError(error, res)
    }
  }

  protected async get(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.body.user?.id
      const resource = await this.findWithAccess(
        req.params.id,
        userId,
        AccessType.READ
      )

      if (!resource) {
        const response: ApiResponse<null> = {
          error: "Resource not found or access denied",
          links: this.generateCollectionLinks(req),
        }
        res.status(404).json(response)
        return
      }

      const response: ApiResponse<any> = {
        data: resource,
        links: this.generateResourceLinks(req, resource),
      }
      res.json(response)
    } catch (error) {
      this.handleError(error, res)
    }
  }

  protected async create(req: Request, res: Response): Promise<void> {
    try {
      await this.validateCreate(req)
      const resource = await this.performCreate(req)
      const response: ApiResponse<any> = {
        data: resource,
        links: this.generateResourceLinks(req, resource),
      }
      res.status(201).json(response)
    } catch (error) {
      this.handleError(error, res)
    }
  }

  protected handleError(error: any, res: Response): void {
    console.error(error)
    const statusCode = (error as ApiError).code || 500
    const message = error.message || "Internal Server Error"
    const response: ApiResponse<null> = {
      error: message,
      links: {
        self: {
          href: `${res.req.protocol}://${res.req.get("host")}${
            res.req.originalUrl
          }`,
          rel: "self",
        },
      },
    }
    res.status(statusCode).json(response)
  }

  protected generateCollectionLinks(req: Request): Links {
    const baseUrl = `${req.protocol}://${req.get("host")}/${this.resourcePath}`
    return {
      self: {
        href: baseUrl,
        rel: "self",
      },
      create: {
        href: baseUrl,
        rel: "create",
        method: "POST",
      },
    }
  }

  // Required abstract methods for operations common to all resources
  protected abstract validateCreate(req: Request): Promise<void>
  protected abstract performCreate(req: Request): Promise<any>
  protected abstract generateResourceLinks(req: Request, resource: any): Links

  public getRouter(): Router {
    return this.router
  }
}