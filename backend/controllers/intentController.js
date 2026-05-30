import { GoogleGenerativeAI } from "@google/generative-ai";

export async function detectIntent(req, res) {
  const { text } = req.body;
  if (!text) return res.status(400).json({ isImage: false });

  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const result = await model.generateContent(
      `Does this message ask to generate, create, draw, or show an image or picture? 
       Reply ONLY with "yes" or "no". Message: "${text}"`
    );

    const answer = result.response.text().trim().toLowerCase();
    return res.json({ isImage: answer.startsWith("yes") });
  } catch {
    // Fallback to regex if Gemini fails
    const fallback =
      // Direct creation words + image words
      /\b(generate|create|make|draw|paint|design|show|produce|render|sketch|illustrate|build|craft|forge|imagine|visualize|depict)\b.*\b(image|photo|picture|illustration|art|drawing|painting|sketch|poster|wallpaper|logo|icon|portrait|landscape|scene|view|avatar|thumbnail|banner|graphic|artwork|visual|render|shot|clip|frame|cartoon|anime|realistic|digital|3d|hd)\b/i.test(text) ||
      // Reversed — image word first
      /\b(image|photo|picture|illustration|drawing|painting|sketch|portrait|wallpaper|poster|logo|artwork|banner|graphic)\b.*\b(of|showing|with|about|featuring|depicting|for|from)\b/i.test(text) ||
      // "I want to see / I'd like to see"
      /\b(want|like|need|love)\b.*(see|view|look at|have|get)\b.*(image|photo|picture|art|drawing|illustration)/i.test(text) ||
      // Short triggers
      /^(draw|paint|sketch|illustrate|render|imagine|visualize)\s+/i.test(text.trim()) ||
      // "can you show / give me an image"
      /\b(show|give|send|display)\b.*\b(image|photo|picture|art|illustration)\b/i.test(text) ||
      // "an image of / a picture of / a photo of"
      /\b(an?\s+)(image|photo|picture|illustration|painting|drawing|sketch|artwork)\s+(of|about|showing|with|featuring)\b/i.test(text);
    return res.json({ isImage: fallback });
  }
}