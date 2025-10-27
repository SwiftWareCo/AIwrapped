import { AnalyticsResult, IMessage } from "../types";

const API_KEY = process.env.GROQ_API_KEY;
if (!API_KEY) {
  throw new Error("GROQ_API_KEY environment variable is not set.");
}

const GROQ_API_ENDPOINT = "https://api.groq.com/openai/v1/chat/completions";

// Helper function to add randomization for unique persona generation
const getRandomSeed = () => Math.random().toString(36).substring(7);
const getTimestamp = () => new Date().toISOString();

async function callGroqAPI(prompt: string, isJsonMode: boolean = false) {
  const response = await fetch(GROQ_API_ENDPOINT, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "mixtral-8x7b-32768",
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 500,
      response_format: isJsonMode ? { type: "json_object" } : undefined,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Groq API error: ${error.error?.message || "Unknown error"}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

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

    // Add randomization to ensure unique generation each time
    const uniqueId = getRandomSeed();
    const timestamp = getTimestamp();

    const prompt = `You are an AI analyzing chat history for a "Spotify Wrapped" style summary.
Analyze the following user messages to identify a single, dominant, and interesting theme or topic.
Based on the topic, create a short, fun, one-sentence insight.

Generation ID: ${uniqueId} (Timestamp: ${timestamp}) - Please ensure this response is unique and creative.

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

    const response = await callGroqAPI(prompt, true);
    const jsonText = response.trim();

    // Parse the JSON response
    const parsed = JSON.parse(jsonText);
    return {
      title: parsed.title || "Deep Thinker",
      insight: parsed.insight || "You explored fascinating subjects in your conversations!"
    };

  } catch (error) {
    console.error("Groq topic summary failed:", error);
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

    // Add randomization to ensure unique generation each time
    const uniqueId = getRandomSeed();
    const timestamp = getTimestamp();

    const prompt = `You are a witty and bombastic announcer for an "AI Wrapped" experience. Based on the following user persona and their most used words in AI chats, generate a fun, over-the-top, and flattering personality description. Keep it to 2-3 short, impactful sentences. Be creative and celebratory. Make it UNIQUE and different from generic responses.

IMPORTANT: Do NOT use markdown formatting like ** or __ or any other markdown. Return plain text only.

Generation ID: ${uniqueId} (Timestamp: ${timestamp})

User Persona:
- Title: "${persona.title}"
- Base Description: "${persona.description}"

Their Top Words:
- ${topWords}

Now, reveal their grand, bombastic persona! Make it sound epic and totally unique to them. Use plain text without markdown formatting.`;

    const response = await callGroqAPI(prompt, false);
    return response.trim();
  } catch (error) {
    console.error("Groq API call failed:", error);
    // Return a creative fallback description on error
    return `You're ${persona.title}! ${persona.description} Your conversations are truly one-of-a-kind, shaping the digital cosmos with every word.`;
  }
};