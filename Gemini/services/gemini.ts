
import { GoogleGenAI } from "@google/genai";

export class GeminiService {
  private ai: GoogleGenAI;

  constructor() {
    // Correctly initialize GoogleGenAI using the process.env.API_KEY directly.
    this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  }

  async chat(message: string, history: { role: 'user' | 'model', parts: { text: string }[] }[]) {
    try {
      const response = await this.ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: [
          ...history,
          { role: 'user', parts: [{ text: message }] }
        ],
        config: {
          systemInstruction: "You are the AI Assistant for 'Alex', a Senior Unity Game Developer. Your goal is to help visitors understand Alex's skills, provide rough project estimates, and generate game ideas. Be professional, slightly gamer-savvy, and helpful. Alex's stack: Unity, C#, 2D/3D, HDRP/URP, Mobile/PC. Keep responses concise.",
          temperature: 0.7,
        }
      });

      return response.text;
    } catch (error) {
      console.error("Gemini Error:", error);
      return "I'm experiencing a minor lag in my processing core. Please try again or contact Alex directly!";
    }
  }
}

export const gemini = new GeminiService();
