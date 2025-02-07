import { Router, Request, Response } from "express"
import authenticateToken from "../routes/auth"
import { ApiResponse, Links, ApiError } from "../types"
import db from "../database"

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

  protected async list(req: Request, res: Response): Promise<void> {
    try {
      const items = await db[this.resourcePath].find().toArray()
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
      const item = await db[this.resourcePath].findOne({ _id: req.params.id })
      if (!item) {
        const response: ApiResponse<null> = {
          error: "Resource not found",
          links: this.generateCollectionLinks(req),
        }
        res.status(404).json(response)
        return
      }

      const response: ApiResponse<any> = {
        data: item,
        links: this.generateResourceLinks(req, item),
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
  protected handleError(error: any, res: Response): void {
    console.error(error)
    const statusCode = (error as ApiError).statusCode || 500
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
  // Required abstract methods for operations common to all resources
  protected abstract validateCreate(req: Request): Promise<void>
  protected abstract performCreate(req: Request): Promise<any>
  protected abstract generateResourceLinks(req: Request, resource: any): Links

  public getRouter(): Router {
    return this.router
  }
}
