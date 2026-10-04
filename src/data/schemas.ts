import { z } from 'zod';

export const ColorInfoSchema = z.object({
  hex: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
  lab: z.tuple([z.number(), z.number(), z.number()]),
  name: z.string(),
  share: z.number().min(0).max(1),
});

export const CategoryEnum = z.enum(['top', 'bottom', 'dress', 'outerwear', 'shoes', 'accessory']);
export const PatternEnum = z.enum(['solid', 'striped', 'check', 'floral', 'graphic', 'other']);
export const FitEnum = z.enum(['fitted', 'regular', 'relaxed', 'oversized']);
export const ItemStatusEnum = z.enum(['clean', 'dirty', 'at-cleaner', 'needs-repair', 'in-storage']);
export const SeasonEnum = z.enum(['spring', 'summer', 'autumn', 'winter']);

export const ClothingItemSchema = z.object({
  id: z.string().min(1),
  isSample: z.boolean().optional(),
  name: z.string().min(1),
  category: CategoryEnum,
  subtype: z.string(),
  colors: z.array(ColorInfoSchema).min(1),
  pattern: PatternEnum,
  styleTags: z.array(z.string()),
  formality: z.union([z.literal(0), z.literal(1), z.literal(2), z.literal(3), z.literal(4)]),
  warmth: z.union([z.literal(0), z.literal(1), z.literal(2), z.literal(3)]),
  waterResistant: z.boolean().optional(),
  fit: FitEnum,
  neckline: z.enum(['crew', 'v', 'open-collar', 'high', 'scoop', 'none']).optional(),
  length: z.enum(['cropped', 'regular', 'long']).optional(),
  rise: z.enum(['low', 'mid', 'high']).optional(),
  material: z.string().optional(),
  seasons: z.array(SeasonEnum),
  brand: z.string().optional(),
  size: z.string().optional(),
  price: z.number().min(0).optional(),
  purchaseDate: z.string().optional(),
  store: z.string().optional(),
  care: z.string().optional(),
  notes: z.string().optional(),
  status: ItemStatusEnum,
  favorite: z.boolean().default(false),
  imageOriginalId: z.string().optional(),
  imageCutoutId: z.string(),
  tagConfidence: z.record(z.number()).optional(),
  embedding: z.instanceof(Float32Array).optional(),
  createdAt: z.number(),
  updatedAt: z.number(),
});

export const StyleProfileSchema = z.object({
  id: z.literal('current'),
  displayName: z.string().optional(),
  skin: z
    .object({
      depth: z.enum(['light', 'medium', 'deep']),
      swatchHex: z.string(),
      undertone: z.enum(['warm', 'cool', 'neutral', 'unsure']),
      source: z.enum(['manual', 'selfie']),
    })
    .optional(),
  hair: z
    .object({
      colorHex: z.string(),
      colorName: z.string(),
      length: z.enum(['short', 'medium', 'long']),
      texture: z.enum(['straight', 'wavy', 'curly', 'coily']),
    })
    .optional(),
  faceShape: z.enum(['oval', 'round', 'square', 'heart', 'oblong', 'diamond', 'unsure']).optional(),
  heightCm: z.number().min(50).max(250).optional(),
  heightUnit: z.enum(['cm', 'ftin']).default('cm'),
  proportions: z.array(z.string()).optional(),
  fitPreference: z.number().min(0).max(1).optional(),
  taste: z
    .object({
      quizAnswers: z.array(
        z.object({
          pairId: z.string(),
          choice: z.enum(['a', 'b', 'both', 'neither']),
        })
      ),
      tags: z.array(z.string()),
    })
    .optional(),
  comfortRules: z.array(
    z.object({
      id: z.string(),
      label: z.string(),
      kind: z.enum(['builtin', 'custom']),
      rule: z.record(z.unknown()).optional(),
    })
  ),
  advanced: z
    .object({
      weightKg: z.number().min(20).max(300).optional(),
    })
    .optional(),
  completeness: z.number().min(0).max(100),
  updatedAt: z.number(),
});

export const OutfitSchema = z.object({
  id: z.string(),
  name: z.string(),
  itemIds: z.array(z.string()).min(1),
  occasion: z.string().optional(),
  season: z.string().optional(),
  rating: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4), z.literal(5)]).optional(),
  favorite: z.boolean().default(false),
  wornCount: z.number().default(0),
  createdAt: z.number(),
});

export const WearLogSchema = z.object({
  id: z.string(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  outfitId: z.string().optional(),
  itemIds: z.array(z.string()),
  context: z
    .object({
      tempC: z.number().optional(),
      condition: z.string().optional(),
      occasion: z.string().optional(),
    })
    .optional(),
});

export const FeedbackSchema = z.object({
  id: z.string(),
  outfitSignature: z.string(),
  kind: z.enum(['up', 'down', 'not-me']),
  reasons: z.array(z.string()),
  note: z.string().optional(),
  at: z.number(),
});

export const PreferencesSchema = z.object({
  id: z.literal('current'),
  weights: z.record(z.number()),
  hueAffinity: z.record(z.number()),
  itemAffinity: z.record(z.number()),
  pairAffinity: z.record(z.number()),
  formalityBias: z.number(),
});

export const AppSettingsSchema = z.object({
  id: z.literal('current'),
  theme: z.enum(['light', 'dark', 'system']).default('system'),
  units: z.enum(['metric', 'imperial']).default('metric'),
  weatherMode: z.enum(['manual', 'auto']).default('manual'),
  excludeStyleFromBackup: z.boolean().default(true),
  lock: z.object({
    enabled: z.boolean().default(false),
    autoLockSec: z.number().default(300),
    biometric: z.boolean().default(false),
  }),
  onboardingDone: z.boolean().default(false),
  lastBackupAt: z.number().optional(),
});
