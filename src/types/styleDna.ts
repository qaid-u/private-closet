export type MeasurementUnit = 'metric' | 'imperial';
export type UndertoneSelection = 'Warm' | 'Cool' | 'Neutral' | 'Olive' | 'Unsure' | 'Prefer not to specify';
export type ContrastPreference = 'Low' | 'Medium' | 'High' | 'No preference';
export type ColourfulnessPreference = 'Mostly neutral' | 'Balanced' | 'Colourful' | 'No preference';

export interface BodyProportions {
  descriptors: string[];
  custom_description?: string;
}

export interface StyleDnaProfile {
  id?: string;
  user_id?: string;
  display_name?: string | null;
  age_range?: string | null;
  preferred_presentation?: string | null;
  measurement_unit: MeasurementUnit;
  preferred_climate?: string | null;
  height_cm?: number | null;
  weight_kg?: number | null;
  shoulder_cm?: number | null;
  chest_cm?: number | null;
  waist_cm?: number | null;
  hips_cm?: number | null;
  inseam_cm?: number | null;
  preferred_top_size?: string | null;
  preferred_bottom_size?: string | null;
  preferred_shoe_size?: string | null;
  body_proportions: BodyProportions;
  preferred_silhouettes: string[];
  garment_fit_preferences: Record<string, string>;
  skin_tone_selection?: string | null;
  skin_tone_custom_description?: string | null;
  undertone_selection?: UndertoneSelection | null;
  preferred_contrast?: ContrastPreference | null;
  colourfulness_preference?: ColourfulnessPreference | null;
  preferred_colour_combinations: string[];
  favourite_colours: string[];
  avoided_colours: string[];
  preferred_styles: string[];
  preferred_occasions: string[];
  comfort_preference?: string | null;
  custom_fit_notes?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface PersonalisationSettings {
  user_id?: string;
  store_profile_information: boolean;
  enable_body_personalisation: boolean;
  enable_skin_tone_personalisation: boolean;
  allow_profile_data_in_ai_requests: boolean;
  enable_feedback_learning: boolean;
  updated_at?: string;
}

export interface StyleDnaResponse {
  profile: StyleDnaProfile | null;
  settings: PersonalisationSettings;
}

export type FeedbackEventType =
  | 'like'
  | 'dislike'
  | 'save'
  | 'wear_today'
  | 'not_my_style'
  | 'too_casual'
  | 'too_formal'
  | 'change_colours'
  | 'change_fit'
  | 'show_similar';
