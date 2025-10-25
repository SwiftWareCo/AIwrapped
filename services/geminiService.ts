import { GoogleGenAI, Type } from "@google/genai";
import { AnalyticsResult, IMessage } from "../types";

const API_KEY = process.env.API_KEY;
if (!API_KEY) {
  throw new Error("API_KEY environment variable is not set.");
}
const ai = new GoogleGenAI({ apiKey: API_KEY });

export interface TopicSummary {
  title: string;
  insight: string;
}

export const generateTopicSummary = async (
  userMessages: IMessage[]
): Promise<TopicSummary> => {
  try {
    // Get a representative sample of messages to avoid large prompts
    const sampleSize = 50;
    const shuffled = userMessages.sort(() => 0.5 - Math.random());
    const sample = shuffled.slice(0, sampleSize).map(m => m.content).join('\n---\n');

    if (sample.length === 0) {
      throw new Error("No user messages to analyze.");
    }

    const prompt = `You are an AI analyzing chat history for a "Spotify Wrapped" style summary.
Analyze the following user messages to identify a single, dominant, and interesting theme or topic.
Based on the topic, create a short, fun, one-sentence insight.
The user's messages are:
---
${sample}
---
Respond in JSON format with two keys: "title" (a 2-3 word title for the topic, e.g., "Creative Wordsmith") and "insight" (the fun, one-sentence summary).
Example Response:
{
  "title": "Future Financier",
  "insight": "You've got money on your mind, frequently exploring topics about investing, saving, and the economy!"
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            insight: { type: Type.STRING },
          },
          required: ['title', 'insight'],
        }
      }
    });

    const jsonText = response.text.trim();
    return JSON.parse(jsonText);

  } catch (error) {
    console.error("Gemini topic summary failed:", error);
    // Return a creative fallback on error
    return {
        title: "Deep Thinker",
        insight: "You explored a wide variety of fascinating subjects in your conversations!"
    };
  }
};


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