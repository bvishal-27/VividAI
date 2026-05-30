import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import chatRoutes from './routes/chatRoutes.js'
import imageRoutes from "./routes/imageRoutes.js";
import intentRoutes from "./routes/intentRoutes.js";
import { connectDB } from "./db.js";
import historyRoutes from "./routes/historyRoutes.js";

dotenv.config()

const app = express()
app.use(cors({
  origin: "http://localhost:5173",
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "x-user-id"]
}))
app.use(express.json())

app.use('/api', chatRoutes)
app.use("/api", imageRoutes);
app.use("/api", intentRoutes);
app.use("/api", historyRoutes);

const PORT = process.env.PORT || 5002

connectDB();
app.listen(PORT, () => console.log(`Server running on port ${PORT}`))