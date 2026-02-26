
export interface Recommendation {
  id: string;
  title: string;
  type: 'movie' | 'web-series' | 'anime';
  ratingIMDb: string;
  ratingRottenTomatoes: string;
  description: string;
  imageUrl: string;
  trailerUrl: string;
  genres: string[];
  releaseYear: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}

export interface AdviceTopic {
  id: string;
  title: string;
  icon: string;
  description: string;
}

export enum AppSection {
  RECOMMENDATIONS = 'recommendations',
  ADVICE = 'advice',
  CHAT = 'chat'
}
