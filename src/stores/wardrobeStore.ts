import { create } from 'zustand';
import { WardrobeItem, WardrobeFilters, AvailabilityStatus } from '@/types/wardrobe';
import { RecommendedOutfit, OutfitPlan, StyleProfile, OutfitCollection } from '@/types/stylist';
import { INITIAL_DEMO_WARDROBE, INITIAL_SAVED_OUTFITS, INITIAL_PLANS } from '@/lib/demoData';

interface WardrobeState {
  items: WardrobeItem[];
  savedOutfits: RecommendedOutfit[];
  plans: OutfitPlan[];
  collections: OutfitCollection[];
  styleProfile: StyleProfile;
  filters: WardrobeFilters;
  isLoading: boolean;
  isDemoMode: boolean;

  // Actions
  addItem: (item: Omit<WardrobeItem, 'id' | 'created_at' | 'updated_at' | 'wear_count'>) => WardrobeItem;
  updateItem: (id: string, updates: Partial<WardrobeItem>) => void;
  deleteItem: (id: string) => void;
  toggleFavouriteItem: (id: string) => void;
  setItemAvailability: (id: string, status: AvailabilityStatus) => void;

  // Outfits
  saveOutfit: (outfit: RecommendedOutfit) => void;
  deleteOutfit: (id: string) => void;
  toggleFavouriteOutfit: (id: string) => void;
  recordOutfitWorn: (outfitId: string, date?: string) => void;

  // Plans
  addPlan: (plan: Omit<OutfitPlan, 'id' | 'created_at'>) => OutfitPlan;
  removePlan: (planId: string) => void;

  // Collections
  createCollection: (name: string, description?: string) => void;
  addOutfitToCollection: (collectionId: string, outfitId: string) => void;

  // Profile & Filters
  updateStyleProfile: (updates: Partial<StyleProfile>) => void;
  setFilters: (filters: Partial<WardrobeFilters>) => void;
  resetToDemo: () => void;
}

const STORAGE_KEY = 'mystyle_ai_local_store_v1';

function loadStoredState() {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to parse stored state:', e);
  }
  return null;
}

function saveState(state: {
  items: WardrobeItem[];
  savedOutfits: RecommendedOutfit[];
  plans: OutfitPlan[];
  collections: OutfitCollection[];
  styleProfile: StyleProfile;
}) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error('Failed to persist state:', e);
  }
}

export const useWardrobeStore = create<WardrobeState>((set, get) => {
  const stored = loadStoredState();

  const initialItems = stored?.items || INITIAL_DEMO_WARDROBE;
  const initialOutfits = stored?.savedOutfits || INITIAL_SAVED_OUTFITS;
  const initialPlans = stored?.plans || INITIAL_PLANS;
  const initialCollections = stored?.collections || [
    { id: 'col-1', name: 'Work Looks', description: 'Smart and tailored office combinations', outfit_ids: ['outfit-3'], created_at: new Date().toISOString() },
    { id: 'col-2', name: 'Weekend Fits', description: 'Relaxed casual looks', outfit_ids: ['outfit-2'], created_at: new Date().toISOString() },
    { id: 'col-3', name: 'Dinner & Date Night', description: 'Refined evening outfits', outfit_ids: ['outfit-1'], created_at: new Date().toISOString() },
  ];
  const initialProfile: StyleProfile = stored?.styleProfile || {
    style_tags: ['Minimalist', 'Smart Casual', 'Classic'],
    favourite_colours: ['White', 'Navy', 'Black', 'Beige'],
    avoided_colours: ['Neon Yellow', 'Hot Pink'],
    preferred_fits: ['Regular fit', 'Tailored'],
    preferred_occasions: ['Office', 'Dinner', 'Weekend'],
    climate_preference: 'Warm',
    comfort_preference: 'Balanced',
  };

  return {
    items: initialItems,
    savedOutfits: initialOutfits,
    plans: initialPlans,
    collections: initialCollections,
    styleProfile: initialProfile,
    filters: {
      category: 'All',
      sort_by: 'created_desc',
    },
    isLoading: false,
    isDemoMode: true,

    addItem: (itemData) => {
      const now = new Date().toISOString();
      const newItem: WardrobeItem = {
        ...itemData,
        id: `item-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        created_at: now,
        updated_at: now,
        wear_count: 0,
      };

      set((state) => {
        const nextItems = [newItem, ...state.items];
        saveState({ ...state, items: nextItems });
        return { items: nextItems };
      });
      return newItem;
    },

    updateItem: (id, updates) => {
      set((state) => {
        const nextItems = state.items.map((item) =>
          item.id === id ? { ...item, ...updates, updated_at: new Date().toISOString() } : item
        );
        saveState({ ...state, items: nextItems });
        return { items: nextItems };
      });
    },

    deleteItem: (id) => {
      set((state) => {
        const nextItems = state.items.filter((item) => item.id !== id);
        // Also remove from saved outfits
        const nextOutfits = state.savedOutfits.filter((o) => !o.item_ids.includes(id));
        saveState({ ...state, items: nextItems, savedOutfits: nextOutfits });
        return { items: nextItems, savedOutfits: nextOutfits };
      });
    },

    toggleFavouriteItem: (id) => {
      set((state) => {
        const nextItems = state.items.map((item) =>
          item.id === id ? { ...item, is_favourite: !item.is_favourite } : item
        );
        saveState({ ...state, items: nextItems });
        return { items: nextItems };
      });
    },

    setItemAvailability: (id, status) => {
      set((state) => {
        const nextItems = state.items.map((item) =>
          item.id === id ? { ...item, availability_status: status } : item
        );
        saveState({ ...state, items: nextItems });
        return { items: nextItems };
      });
    },

    saveOutfit: (outfit) => {
      set((state) => {
        const exists = state.savedOutfits.some((o) => o.id === outfit.id);
        const nextOutfits = exists
          ? state.savedOutfits.map((o) => (o.id === outfit.id ? outfit : o))
          : [outfit, ...state.savedOutfits];
        saveState({ ...state, savedOutfits: nextOutfits });
        return { savedOutfits: nextOutfits };
      });
    },

    deleteOutfit: (id) => {
      set((state) => {
        const nextOutfits = state.savedOutfits.filter((o) => o.id !== id);
        saveState({ ...state, savedOutfits: nextOutfits });
        return { savedOutfits: nextOutfits };
      });
    },

    toggleFavouriteOutfit: (id) => {
      set((state) => {
        const nextOutfits = state.savedOutfits.map((o) =>
          o.id === id ? { ...o, is_favourite: !o.is_favourite } : o
        );
        saveState({ ...state, savedOutfits: nextOutfits });
        return { savedOutfits: nextOutfits };
      });
    },

    recordOutfitWorn: (outfitId, date = new Date().toISOString()) => {
      set((state) => {
        const outfit = state.savedOutfits.find((o) => o.id === outfitId);
        if (!outfit) return state;

        const nextOutfits = state.savedOutfits.map((o) =>
          o.id === outfitId
            ? { ...o, wear_count: (o.wear_count || 0) + 1, last_worn_at: date }
            : o
        );

        // Update item wear counts
        const outfitItemIds = new Set(outfit.item_ids);
        const nextItems = state.items.map((item) =>
          outfitItemIds.has(item.id)
            ? { ...item, wear_count: item.wear_count + 1, last_worn_at: date }
            : item
        );

        saveState({ ...state, items: nextItems, savedOutfits: nextOutfits });
        return { items: nextItems, savedOutfits: nextOutfits };
      });
    },

    addPlan: (planData) => {
      const now = new Date().toISOString();
      const newPlan: OutfitPlan = {
        ...planData,
        id: `plan-${Date.now()}`,
        created_at: now,
      };

      set((state) => {
        const nextPlans = [newPlan, ...state.plans];
        saveState({ ...state, plans: nextPlans });
        return { plans: nextPlans };
      });
      return newPlan;
    },

    removePlan: (planId) => {
      set((state) => {
        const nextPlans = state.plans.filter((p) => p.id !== planId);
        saveState({ ...state, plans: nextPlans });
        return { plans: nextPlans };
      });
    },

    createCollection: (name, description) => {
      const newCol: OutfitCollection = {
        id: `col-${Date.now()}`,
        name,
        description,
        outfit_ids: [],
        created_at: new Date().toISOString(),
      };
      set((state) => {
        const nextCols = [...state.collections, newCol];
        saveState({ ...state, collections: nextCols });
        return { collections: nextCols };
      });
    },

    addOutfitToCollection: (collectionId, outfitId) => {
      set((state) => {
        const nextCols = state.collections.map((c) =>
          c.id === collectionId
            ? { ...c, outfit_ids: Array.from(new Set([...c.outfit_ids, outfitId])) }
            : c
        );
        saveState({ ...state, collections: nextCols });
        return { collections: nextCols };
      });
    },

    updateStyleProfile: (updates) => {
      set((state) => {
        const nextProfile = { ...state.styleProfile, ...updates };
        saveState({ ...state, styleProfile: nextProfile });
        return { styleProfile: nextProfile };
      });
    },

    setFilters: (newFilters) => {
      set((state) => ({
        filters: { ...state.filters, ...newFilters },
      }));
    },

    resetToDemo: () => {
      set(() => {
        saveState({
          items: INITIAL_DEMO_WARDROBE,
          savedOutfits: INITIAL_SAVED_OUTFITS,
          plans: INITIAL_PLANS,
          collections: [
            { id: 'col-1', name: 'Work Looks', description: 'Smart and tailored office combinations', outfit_ids: ['outfit-3'], created_at: new Date().toISOString() },
            { id: 'col-2', name: 'Weekend Fits', description: 'Relaxed casual looks', outfit_ids: ['outfit-2'], created_at: new Date().toISOString() },
            { id: 'col-3', name: 'Dinner & Date Night', description: 'Refined evening outfits', outfit_ids: ['outfit-1'], created_at: new Date().toISOString() },
          ],
          styleProfile: {
            style_tags: ['Minimalist', 'Smart Casual', 'Classic'],
            favourite_colours: ['White', 'Navy', 'Black', 'Beige'],
            avoided_colours: ['Neon Yellow', 'Hot Pink'],
            preferred_fits: ['Regular fit', 'Tailored'],
            preferred_occasions: ['Office', 'Dinner', 'Weekend'],
            climate_preference: 'Warm',
            comfort_preference: 'Balanced',
          },
        });
        return {
          items: INITIAL_DEMO_WARDROBE,
          savedOutfits: INITIAL_SAVED_OUTFITS,
          plans: INITIAL_PLANS,
        };
      });
    },
  };
});
