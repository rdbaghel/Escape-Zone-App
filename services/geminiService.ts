
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { Recommendation } from "../types";

const MODEL_NAME = 'gemini-3-flash-preview';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function withRetry<T>(fn: () => Promise<T>, retries = 3, backoff = 1000): Promise<T> {
  try {
    return await fn();
  } catch (error: any) {
    if (retries > 0 && (error?.status === 429 || error?.message?.includes('429') || error?.message?.includes('RESOURCE_EXHAUSTED'))) {
      console.warn(`Rate limit hit, retrying in ${backoff}ms... (${retries} retries left)`);
      await delay(backoff);
      return withRetry(fn, retries - 1, backoff * 2);
    }
    throw error;
  }
}

export class GeminiService {
  private ai: GoogleGenAI;

  constructor() {
    this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  }

  async getRecommendations(
    category: string, 
    query?: string, 
    genre?: string, 
    year?: string
  ): Promise<Recommendation[]> {
    return withRetry(async () => {
      let prompt = `Recommend 6 top-rated ${category}`;
      
      const constraints = [];
      if (genre && genre !== 'All') constraints.push(`in the ${genre} genre`);
      if (year && year !== 'All') constraints.push(`released in ${year}`);
      if (query) constraints.push(`matching the search: "${query}"`);
      
      if (constraints.length > 0) {
        prompt += " " + constraints.join(", ");
      } else {
        prompt += " that are trending or classic high-rated hits";
      }

      prompt += ". For each recommendation, provide a high-resolution Unsplash image URL and a valid YouTube embed URL for its official trailer. Include IMDb, Rotten Tomatoes ratings, and the release year.";

      const response = await this.ai.models.generateContent({
        model: MODEL_NAME,
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                title: { type: Type.STRING },
                type: { type: Type.STRING, description: 'movie, web-series, or anime' },
                ratingIMDb: { type: Type.STRING },
                ratingRottenTomatoes: { type: Type.STRING },
                description: { type: Type.STRING },
                imageUrl: { type: Type.STRING, description: 'A high-resolution Unsplash image URL.' },
                trailerUrl: { type: Type.STRING, description: 'A valid YouTube embed URL (e.g., https://www.youtube.com/embed/...) for the official trailer.' },
                genres: { type: Type.ARRAY, items: { type: Type.STRING } },
                releaseYear: { type: Type.STRING }
              },
              required: ["id", "title", "type", "ratingIMDb", "ratingRottenTomatoes", "description", "imageUrl", "trailerUrl", "genres", "releaseYear"]
            }
          }
        }
      });

      try {
        return JSON.parse(response.text || '[]');
      } catch (e) {
        console.error("Failed to parse recommendations", e);
        return [];
      }
    });
  }

  async getAdvice(topic: string): Promise<string> {
    return withRetry(async () => {
      const response = await this.ai.models.generateContent({
        model: MODEL_NAME,
        contents: `Provide expert advice and a step-by-step roadmap for: ${topic}. Focus on technical fields, learning resources, and study abroad process where applicable. Format in Markdown with clear headings and bullet points.`,
        config: {
          thinkingConfig: { thinkingBudget: 4000 }
        }
      });
      return response.text || "Sorry, I couldn't generate advice at this time.";
    });
  }

  async chat(message: string, history: { role: 'user' | 'model', parts: { text: string }[] }[]): Promise<string> {
    return withRetry(async () => {
      const chat = this.ai.chats.create({
        model: MODEL_NAME,
        config: {
          systemInstruction: "You are Escape Zone, an expert career counselor and entertainment critic. You help users find great movies/anime and provide deep technical career guidance and study abroad advice. Be professional, encouraging, and detailed.",
        }
      });

      const response = await chat.sendMessage({ message });
      return response.text || "I'm having trouble connecting right now.";
    });
  }
}

export const geminiService = new GeminiService();
