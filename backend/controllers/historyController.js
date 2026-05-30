import Chat from "../models/Chat.js";

// Get all chats for a user
export async function getChats(req, res) {
  try {
    const userId = req.headers["x-user-id"];
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const chats = await Chat.find({ userId })
      .sort({ updatedAt: -1 })
      .select("_id title updatedAt");

    res.json(chats);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// Get single chat with messages
export async function getChat(req, res) {
  try {
    const userId = req.headers["x-user-id"];
    const chat = await Chat.findOne({ _id: req.params.id, userId });
    if (!chat) return res.status(404).json({ error: "Chat not found" });
    res.json(chat);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// Create new chat
export async function createChat(req, res) {
  try {
    const userId = req.headers["x-user-id"];
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const { title, messages } = req.body;
    const chat = await Chat.create({ userId, title, messages });
    res.json(chat);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// Update chat (add messages, update title)
export async function updateChat(req, res) {
  try {
    const userId = req.headers["x-user-id"];
    const { title, messages } = req.body;

    const chat = await Chat.findOneAndUpdate(
      { _id: req.params.id, userId },
      { title, messages, updatedAt: Date.now() },
      { new: true }
    );

    if (!chat) return res.status(404).json({ error: "Chat not found" });
    res.json(chat);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// Delete chat
export async function deleteChat(req, res) {
  try {
    const userId = req.headers["x-user-id"];
    await Chat.findOneAndDelete({ _id: req.params.id, userId });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}