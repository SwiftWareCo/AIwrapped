import { GoogleGenAI } from "@google/genai";
import { AnalyticsResult } from "../types";

const API_KEY = process.env.API_KEY;
if (!API_KEY) {
  throw new Error("API_KEY environment variable is not set.");
}
const ai = new GoogleGenAI({ apiKey: API_KEY });

export const generatePersonaDescription = async (
  persona: AnalyticsResult['userPersona'],
  wordFrequency: AnalyticsResult['wordFrequency']
): Promise<string> => {
  try {
    const topWords = wordFrequency.slice(0, 10).map(w => w.text).join(', ');
    
    const prompt = `You are a witty and bombastic announcer for an "AI Wrapped" experience. Based on the following user persona and their most used words in AI chats, generate a fun, over-the-top, and flattering personality description. Keep it to 2-3 short, impactful sentences. Be creative and celebratory.

    **User Persona:**
    - Title: "${persona.title}"
    - Base Description: "${persona.description}"

    **Their Top Words:**
    - ${topWords}

    Now, reveal their grand, bombastic persona! Make it sound epic.`;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
    });

    return response.text;
  } catch (error) {
    console.error("Gemini API call failed:", error);
    // Return a creative fallback description on error
    return `You're the **${persona.title}**! ${persona.description} Your conversations are truly one-of-a-kind, shaping the digital cosmos with every word.`;
  }
};
