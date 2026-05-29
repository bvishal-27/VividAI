import { GoogleGenerativeAI } from "@google/generative-ai";

const SYSTEM_PROMPT = `You are VividAI, a helpful assistant. Follow these rules strictly every single response:

FORMATTING RULES:
1. Always wrap ALL code (even single lines) in fenced code blocks with the language name. Example:
\`\`\`java
System.out.println("Hello");
\`\`\`
2. Use numbered lists (1. 2. 3.) for steps or ordered content.
3. Use bullet lists (- item) for unordered content.
4. Use **bold** for important terms or section labels like **Benefits:** or **Example:**.
5. Use plain text for explanations — no raw HTML, no extra symbols.
6. Never write code outside of a fenced code block. Not even one line.
7. Be concise. Answer only what is asked. No filler phrases like "Certainly!" or "Sure!".`;

export async function streamMessage(messages, onToken, onDone, onError) {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

  if (!apiKey || apiKey.includes("your-key-here")) {
    onError("Missing API key. Add VITE_GEMINI_API_KEY to your .env file.");
    return;
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);

    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      systemInstruction: SYSTEM_PROMPT,
    });

    const history = messages.slice(0, -1).map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    }));

    const lastMessage = messages[messages.length - 1].content;
    const chat = model.startChat({ history });
    const result = await chat.sendMessageStream(lastMessage);

    for await (const chunk of result.stream) {
      const text = chunk.text();
      if (text) onToken(text);
    }

    onDone();
  } catch (err) {
    onError(err.message || "Something went wrong.");
  }
}