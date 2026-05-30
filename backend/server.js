import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import chatRoutes from './routes/chatRoutes.js'
import imageRoutes from "./routes/imageRoutes.js";

import intentRoutes from "./routes/intentRoutes.js";

dotenv.config()
const app = express()
app.use(cors())
app.use(express.json())
app.use('/api', chatRoutes)
app.use("/api", imageRoutes);
app.use("/api", intentRoutes);

const PORT = process.env.PORT || 5002
app.listen(PORT, () => console.log(`Server running on port ${PORT}`))