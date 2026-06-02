import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import chatRoutes from './routes/chatRoutes.js'
import imageRoutes from "./routes/imageRoutes.js";
import intentRoutes from "./routes/intentRoutes.js";
import { connectDB } from "./db.js";
import historyRoutes from "./routes/historyRoutes.js";
import pptRoutes from "./routes/pptRoutes.js";


dotenv.config()

const app = express()
app.use(cors({
  origin: "http://localhost:5173",
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "x-user-id"]
}))
app.use(express.json({ limit: "5mb" }))
app.use(express.urlencoded({ limit: "5mb", extended: true }))

app.use('/api', chatRoutes)
app.use("/api", imageRoutes);
app.use("/api", intentRoutes);
app.use("/api", historyRoutes);
app.use("/api", pptRoutes);

const PORT = process.env.PORT || 5002

connectDB();
app.listen(PORT, () => console.log(`Server running on port ${PORT}`))