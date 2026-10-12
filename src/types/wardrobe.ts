// Wardrobe domain types for MyStyle AI

export type WardrobeCategory =
  | 'Tops'
  | 'Bottoms'
  | 'Outerwear'
  | 'Footwear'
  | 'One-Piece'
  | 'Accessories';

export type AvailabilityStatus =
  | 'Available'
  | 'In Laundry'
  | 'Being Repaired'
  | 'In Storage'
  | 'Unavailable'
  | 'Archived';

export interface WardrobeItem {
  id: string;
  user_id?: string;
  name: string;
  category: WardrobeCategory;
  subcategory?: string;
  primary_color: string;
  secondary_colors: string[];
  pattern?: string;
  brand?: string;
  size?: string;
  fit?: string;
  material?: string;
  formality?: 'Casual' | 'Smart Casual' | 'Business Casual' | 'Formal' | 'Sporty';
  style_tags: string[];
  occasion_tags: string[];
  season_tags: string[];
  price?: number;
  currency?: string;
  purchased_at?: string;
  notes?: string;
  is_favourite: boolean;
  availability_status: AvailabilityStatus;
  status: 'Active' | 'Archived' | 'Deleted';
  image_url?: string;
  wear_count: number;
  last_worn_at?: string;
  created_at: string;
  updated_at: string;
}

export interface WardrobeFilters {
  search?: string;
  category?: WardrobeCategory | 'All';
  primary_color?: string;
  availability_status?: AvailabilityStatus | 'All';
  style_tag?: string;
  occasion?: string;
  is_favourite?: boolean;
  sort_by?: 'created_desc' | 'wear_asc' | 'wear_desc' | 'name_asc';
}

export interface AICarmentAnalysisResult {
  category: WardrobeCategory;
  subcategory: string;
  suggested_name: string;
  primary_color: string;
  secondary_colors: string[];
  pattern: string;
  material: string | null;
  fit: string | null;
  formality: 'Casual' | 'Smart Casual' | 'Business Casual' | 'Formal' | 'Sporty';
  styles: string[];
  seasons: string[];
  occasions: string[];
  visual_description: string;
  confidence: number;
  uncertain_fields: string[];
}
