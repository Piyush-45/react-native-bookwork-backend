import express from "express"
import "dotenv/config"
import authRoutes from "./routes/authRoutes.js"
import bookRoutes from "./routes/bookRoutes.js"
import { connectDB } from "./lib/db.js"
import cors from "cors"
import bodyParser from "body-parser";

import job from "./lib/cron.js"
const app = express()

const PORT = process.env.PORT || 5000

job.start()
// 🚨 Very important: this makes req.body work!
// app.use(express.json()); // Needed for parsing application/json
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ extended: true, limit: '100mb' }));


app.use(cors())

app.use('/api/auth', authRoutes)
app.use('/api/books', bookRoutes)

app.listen(PORT, () => {
    console.log(`server is running on ${PORT}`)
    connectDB()
})