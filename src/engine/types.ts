import { ClothingItem } from '../data/types';

export type WeatherCondition = 'sunny' | 'cloudy' | 'rain' | 'cold' | 'hot' | 'windy';
export type OccasionType = 'casual' | 'class' | 'work' | 'date' | 'gym' | 'party' | 'travel';
export type MoodType = 'cozy' | 'polished' | 'playful' | 'minimal' | 'bold';

export interface RecommendationContext {
  tempC: number;
  condition: WeatherCondition;
  occasion: OccasionType;
  mood?: MoodType;
  mustInclude?: string[];
  avoid?: string[];
  userPrompt?: string;
}

export interface OutfitCandidate {
  top?: ClothingItem;
  bottom?: ClothingItem;
  dress?: ClothingItem;
  outerwear?: ClothingItem;
  shoes?: ClothingItem;
  accessory?: ClothingItem;
}

export interface FactorBreakdown {
  score: number;
  hasInput: boolean;
  reason: string;
}

export interface ScoredOutfit {
  id: string;
  signature: string;
  items: ClothingItem[];
  slots: {
    top?: ClothingItem;
    bottom?: ClothingItem;
    dress?: ClothingItem;
    outerwear?: ClothingItem;
    shoes?: ClothingItem;
    accessory?: ClothingItem;
  };
  totalScore: number;
  matchLabel: 'High' | 'Medium' | 'Low';
  chips: string[];
  title: string;
  factors: {
    color: FactorBreakdown;
    proportion: FactorBreakdown;
    faceHair: FactorBreakdown;
    weatherOccasion: FactorBreakdown;
    taste: FactorBreakdown;
    freshness: FactorBreakdown;
  };
}

export interface RecommendationResult {
  outfits: ScoredOutfit[];
  lowConfidence: boolean;
  totalEligibleItems: number;
  context: RecommendationContext;
}

export interface SwapAlternative {
  item: ClothingItem;
  rank: number;
  score: number;
  matchLabel: 'High' | 'Medium' | 'Low';
  reason: string;
}
