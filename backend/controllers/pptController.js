import PptxGenJS from "pptxgenjs";
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

export async function generatePPT(req, res) {
  const { topic } = req.body;
  if (!topic) return res.status(400).json({ error: "Topic required" });

  try {
    const prompt = `Create a professional, detailed PowerPoint presentation on: "${topic}"

Generate exactly 9 slides with rich content. Return ONLY a valid JSON array, no markdown, no backticks, no explanation.

Slide structure:
- Slide 1: Title slide (just title + subtitle, no bullets)
- Slide 2: Agenda/Overview (4 agenda items)
- Slides 3-7: Core content slides (4-5 detailed bullet points each)
- Slide 8: Key Takeaways (4-5 actionable points)
- Slide 9: Conclusion + Thank You

JSON format:
[
  {
    "type": "title",
    "title": "Main Topic Title",
    "subtitle": "A compelling subtitle or tagline",
    "bullets": []
  },
  {
    "type": "content",
    "title": "Slide Title",
    "subtitle": "Brief section description",
    "bullets": ["Detailed point 1", "Detailed point 2", "Detailed point 3", "Detailed point 4"]
  }
]

Rules:
- Make bullet points detailed and informative (not just 2-3 words)
- Each content slide must have a subtitle
- Keep language professional and engaging
- Cover the topic comprehensively`;

    const result = await model.generateContent(prompt);
    const raw = result.response.text().trim()
      .replace(/```json/g, "").replace(/```/g, "").trim();

    let slides;
    try {
      slides = JSON.parse(raw);
    } catch {
      return res.status(500).json({ error: "Failed to parse slide content" });
    }

    // Build .pptx
    const pptx = new PptxGenJS();
    pptx.layout = "LAYOUT_16x9";

    const DARK = "0D1117";
    const PURPLE = "7C3AED";
    const LIGHT_PURPLE = "A78BFA";
    const CYAN = "22D3EE";
    const WHITE = "F8FAFC";
    const GRAY = "94A3B8";
    const CARD = "1E293B";

    slides.forEach((slide, idx) => {
      const s = pptx.addSlide();
      s.background = { color: DARK };

      // Accent bar left
      s.addShape(pptx.ShapeType.rect, {
        x: 0, y: 0, w: 0.08, h: "100%",
        fill: { color: PURPLE },
      });

      // Slide number (skip title)
      if (idx > 0) {
        s.addText(`${idx}`, {
          x: 8.8, y: 4.8, w: 0.5, h: 0.3,
          fontSize: 10, color: "475569", align: "right",
        });
      }

      if (slide.type === "title") {
        // Decorative circle
        s.addShape(pptx.ShapeType.ellipse, {
          x: 7.5, y: -1, w: 4, h: 4,
          fill: { color: "1E1B4B" }, line: { color: "1E1B4B" },
        });
        s.addShape(pptx.ShapeType.ellipse, {
          x: 8, y: 2.5, w: 2.5, h: 2.5,
          fill: { color: "0E0B25" }, line: { color: "0E0B25" },
        });

        // VividAI badge
        s.addText("✦ VividAI", {
          x: 0.4, y: 0.3, w: 2, h: 0.35,
          fontSize: 11, color: CYAN, bold: true,
        });

        // Main title
        s.addText(slide.title, {
          x: 0.4, y: 1.1, w: 7, h: 1.8,
          fontSize: 38, bold: true, color: WHITE,
          charSpacing: 0.5,
        });

        // Purple underline
        s.addShape(pptx.ShapeType.rect, {
          x: 0.4, y: 2.95, w: 2.5, h: 0.06,
          fill: { color: PURPLE },
        });

        // Subtitle
        s.addText(slide.subtitle || `A comprehensive overview`, {
          x: 0.4, y: 3.2, w: 7, h: 0.6,
          fontSize: 16, color: GRAY, italic: true,
        });

        // Bottom bar
        s.addShape(pptx.ShapeType.rect, {
          x: 0.08, y: 4.7, w: "100%", h: 0.55,
          fill: { color: "0A0A1A" },
        });
        s.addText("Powered by Gemini AI  •  VividAI", {
          x: 0.4, y: 4.75, w: 9, h: 0.4,
          fontSize: 10, color: "334155",
        });

      } else {
        // Header background
        s.addShape(pptx.ShapeType.rect, {
          x: 0.08, y: 0, w: "100%", h: 1.1,
          fill: { color: "080D14" },
        });

        // Title
        s.addText(slide.title, {
          x: 0.4, y: 0.12, w: 8.5, h: 0.6,
          fontSize: 22, bold: true, color: LIGHT_PURPLE,
        });

        // Subtitle
        if (slide.subtitle) {
          s.addText(slide.subtitle, {
            x: 0.4, y: 0.7, w: 8.5, h: 0.35,
            fontSize: 12, color: CYAN, italic: true,
          });
        }

        // Bullets as cards
        const bullets = slide.bullets || [];
        const startY = 1.25;
        const cardH = bullets.length > 4 ? 0.62 : 0.72;
        const gap = 0.08;

        bullets.forEach((bullet, bi) => {
          const y = startY + bi * (cardH + gap);

          // Card background
          s.addShape(pptx.ShapeType.roundRect, {
            x: 0.25, y, w: 9.1, h: cardH,
            fill: { color: CARD },
            line: { color: "2D3748", pt: 1 },
            rectRadius: 0.08,
          });

          // Bullet dot
          s.addShape(pptx.ShapeType.ellipse, {
            x: 0.45, y: y + cardH / 2 - 0.07, w: 0.14, h: 0.14,
            fill: { color: PURPLE },
          });

          // Bullet text
          s.addText(bullet, {
            x: 0.7, y: y + 0.08, w: 8.4, h: cardH - 0.16,
            fontSize: 13, color: "CBD5E1",
            valign: "middle", wrap: true,
          });
        });

        // Bottom accent
        s.addShape(pptx.ShapeType.rect, {
          x: 0.08, y: 4.85, w: "100%", h: 0.15,
          fill: { color: PURPLE },
        });
      }
    });

    // Send preview data + base64 file together
    const filename = `${topic.replace(/\s+/g, "_").slice(0, 30)}.pptx`;
    
    const base64 = await pptx.write({ outputType: "base64" });

    res.json({
      slides,
      filename,
      fileData: `data:application/vnd.openxmlformats-officedocument.presentationml.presentation;base64,${base64}`,
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}