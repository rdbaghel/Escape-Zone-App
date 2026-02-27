
import { GoogleGenAI, Type, GenerateContentResponse, ThinkingLevel } from "@google/genai";
import { Recommendation } from "../types";

const MODEL_NAME = 'gemini-3-flash-preview';

const cache = new Map<string, any>();

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
    const cacheKey = `rec_${category}_${query || ''}_${genre || ''}_${year || ''}`;
    if (cache.has(cacheKey)) return cache.get(cacheKey);

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

      prompt += ". Provide high-quality Unsplash image URLs. Include IMDb, Rotten Tomatoes ratings, and release year.";

      const response = await this.ai.models.generateContent({
        model: MODEL_NAME,
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
          temperature: 0.2, // Lower temperature for faster, more deterministic results
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                title: { type: Type.STRING },
                type: { type: Type.STRING },
                ratingIMDb: { type: Type.STRING },
                ratingRottenTomatoes: { type: Type.STRING },
                description: { type: Type.STRING },
                imageUrl: { type: Type.STRING },
                trailerUrl: { type: Type.STRING },
                genres: { type: Type.ARRAY, items: { type: Type.STRING } },
                releaseYear: { type: Type.STRING }
              },
              required: ["id", "title", "type", "ratingIMDb", "ratingRottenTomatoes", "description", "imageUrl", "trailerUrl", "genres", "releaseYear"]
            }
          }
        }
      });

      try {
        const results = JSON.parse(response.text || '[]');
        cache.set(cacheKey, results);
        return results;
      } catch (e) {
        console.error("Failed to parse recommendations", e);
        return [];
      }
    });
  }

  async getAdvice(topic: string): Promise<string> {
    const cacheKey = `advice_${topic}`;
    if (cache.has(cacheKey)) return cache.get(cacheKey);

    return withRetry(async () => {
      const response = await this.ai.models.generateContent({
        model: MODEL_NAME,
        contents: `Provide expert advice and a step-by-step roadmap for: ${topic}. Focus on technical fields, learning resources, and study abroad process where applicable. Format in Markdown with clear headings and bullet points.`,
        config: {
          thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
          temperature: 0.2
        }
      });
      const result = response.text || "Sorry, I couldn't generate advice at this time.";
      cache.set(cacheKey, result);
      return result;
    });
  }

  async chat(message: string, history: { role: 'user' | 'model', text: string }[]): Promise<string> {
    return withRetry(async () => {
      const chat = this.ai.chats.create({
        model: MODEL_NAME,
        config: {
          systemInstruction: `You are "Escape Zone Assistant", a highly intelligent, precise, and interactive AI. 
          Your goal is to provide perfect and precious responses that strictly follow the user's prompt.
          
          GUIDELINES:
          1. ANALYSIS: Carefully analyze the user's intent and specific questions. Do not give generic answers.
          2. FORMATTING: Always use clean Markdown formatting. Use:
             - Paragraphs for explanations.
             - Bullet points or numbered lists for steps, features, or lists.
             - Bold text for emphasis.
             - Clear headings (###) for structured responses.
          3. INTERACTION: Respond with a conversational feel. Acknowledge the user's specific query.
          4. PRECISION: Follow the exact text or questions asked. If a user asks for a list, give a list. If they ask for a paragraph, give a paragraph.
          5. EXPERTISE: You are an expert in:
             - Entertainment (Movies, Anime, TV Shows, Web Series).
             - Career Guidance (Tech, Engineering, Design, Management).
             - Study Abroad (University selection, Visa processes, Exams like GRE/TOEFL/IELTS).
          
          Be smart, responsive, and ensure your answers are visually structured and easy to read.`,
          thinkingConfig: { thinkingLevel: ThinkingLevel.LOW }
        },
        history: history.map(h => ({
          role: h.role,
          parts: [{ text: h.text }]
        }))
      });

      const response = await chat.sendMessage({ message });
      return response.text || "I'm having trouble connecting right now.";
    });
  }
}

export const geminiService = new GeminiService();
