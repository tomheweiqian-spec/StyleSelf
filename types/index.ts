export interface User {
  id: string;
  email: string;
  name?: string;
  avatarUrl?: string;
  createdAt: string;
}

export interface BodyProfile {
  height: number;
  weight: number;
  bust: number;
  waist: number;
  hips: number;
  shoeSize: number;
  skinTone: string;
  gender: "male" | "female" | "non-binary";
}

export type WardrobeCategory =
  | "tops"
  | "bottoms"
  | "dresses"
  | "outerwear"
  | "shoes"
  | "accessories"
  | "hairstyles";

export interface WardrobeItem {
  id: string;
  userId: string;
  name: string;
  category: WardrobeCategory;
  imageUrl: string;
  sourceUrl?: string;
  brand?: string;
  color?: string;
  tags?: string[];
  createdAt: string;
}

export interface TryOnResult {
  id: string;
  userId: string;
  itemId: string;
  resultImageUrl: string;
  userPhotoUrl: string;
  createdAt: string;
}

export interface OutfitAnalysis {
  id: string;
  userId: string;
  imageUrl: string;
  fitScore: number;
  colorScore: number;
  styleScore: number;
  overallScore: number;
  items: string[];
  feedback: string;
  suggestions: string[];
  createdAt: string;
}
