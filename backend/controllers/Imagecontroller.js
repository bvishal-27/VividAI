export async function generateImage(req, res) {
  try {
    const { prompt } = req.body;
    if (!prompt) return res.status(400).json({ error: "Prompt required" });

    const cleaned = prompt
      .replace(/^(generate|create|make|draw|design|show|paint|produce)\s+(an?\s+)?(image|photo|picture|illustration|art|drawing|painting)\s+(of\s+|showing\s+|with\s+|depicting\s+)?/i, "")
      .trim();

    const encoded = encodeURIComponent(cleaned || prompt);
    const imageUrl = `https://image.pollinations.ai/prompt/${encoded}?width=768&height=512&nologo=true&seed=${Date.now()}`;

    // Fetch image as buffer on backend (bypasses CORS)
    const imageRes = await fetch(imageUrl);
    if (!imageRes.ok) throw new Error("Image generation failed");

    const buffer = await imageRes.arrayBuffer();
    const base64 = Buffer.from(buffer).toString("base64");

    return res.status(200).json({
      imageData: `data:image/jpeg;base64,${base64}`,
      prompt: cleaned || prompt,
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}