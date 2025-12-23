import { GoogleGenAI, GenerateContentResponse } from "@google/genai";

const apiKey = process.env.API_KEY || '';

// Initialize the client only if the key is present (handled gracefully in UI if not)
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

export const generateIslamicGuidance = async (prompt: string): Promise<string> => {
  if (!ai) {
    throw new Error("API Key is missing. Please configure the environment.");
  }

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        systemInstruction: `You are "Nuswally Bot", a knowledgeable, compassionate, and humble Islamic assistant for the application "Nuswally Lillah". 
        
        Your goals:
        1. Provide accurate information based on the Quran and authentic Hadith.
        2. Be respectful of different schools of thought (Madhabs). If there is a difference of opinion, briefly mention it.
        3. For specific Fiqh rulings (legal verdicts), always advise the user to consult a local scholar or Imam, while providing general knowledge.
        4. Tone: Gentle, encouraging, and dignified.
        5. Structure: Use Markdown for clarity (bullet points, bold text).
        6. Citations: Whenever possible, mention the Surah/Verse number or the Hadith collection.
        
        If the user asks about something harmful, hateful, or extremist, gently redirect them to the principles of peace and mercy in Islam, or refuse to answer if it violates safety policies.`,
        thinkingConfig: { thinkingBudget: 0 } // Low latency preferred for chat
      },
    });

    return response.text || "I apologize, I could not generate a response at this moment.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("Unable to connect to the knowledge base.");
  }
};
