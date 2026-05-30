import express from "express";
import { getChats, getChat, createChat, updateChat, deleteChat } from "../controllers/historyController.js";

const router = express.Router();

router.get("/chats", getChats);
router.get("/chats/:id", getChat);
router.post("/chats", createChat);
router.put("/chats/:id", updateChat);
router.delete("/chats/:id", deleteChat);

export default router;