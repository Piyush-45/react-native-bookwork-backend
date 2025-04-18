import express from "express"
import "dotenv/config"
import authRoutes from "./routes/authRoutes.js"
import bookRoutes from "./routes/bookRoutes.js"
import { connectDB } from "./lib/db.js"
import cors from "cors"
const app = express()

const PORT = process.env.PORT || 5000

app.use(express.json()) // 🚨 Very important: this makes req.body work!
app.use(cors())

app.use('/api/auth', authRoutes)
app.use('/api/books', bookRoutes)

app.listen(PORT, () => {
    console.log(`server is running on ${PORT}`)
    connectDB()
})