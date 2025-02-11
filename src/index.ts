import express from "express"
import dotenv from "dotenv"
import cookieParser from "cookie-parser"
import db from "./database"
import userRoutes from "./routes/user"
import playlistRoutes from "./routes/playlist"
import tagRoutes from "./routes/tag"

dotenv.config()
const app = express()
app.use(express.json())
app.use(cookieParser())
db.connect().catch(console.error)
app.use("/users", userRoutes)
app.use("/playlists", playlistRoutes)
app.use("/tags", tagRoutes)

const PORT = process.env.PORT || 3000
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`))
