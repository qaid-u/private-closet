'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Camera,
  Upload,
  Sparkles,
  ArrowLeft,
  CheckCircle2,
  RefreshCw,
  Plus,
  Shirt,
  Info,
} from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import { useWardrobeStore } from '@/stores/wardrobeStore';
import { WardrobeCategory, WardrobeItem } from '@/types/wardrobe';
import { internalFetch } from '@/net/guardedFetch';

export default function AddItemPage() {
  const router = useRouter();
  const addItem = useWardrobeStore((state) => state.addItem);

  const [mode, setMode] = useState<'upload' | 'camera' | 'manual'>('upload');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisDone, setAnalysisDone] = useState(false);

  // Form Fields
  const [name, setName] = useState('');
  const [category, setCategory] = useState<WardrobeCategory>('Tops');
  const [subcategory, setSubcategory] = useState('Shirt');
  const [primaryColor, setPrimaryColor] = useState('White');
  const [pattern, setPattern] = useState('Solid');
  const [brand, setBrand] = useState('');
  const [fit, setFit] = useState('Regular');
  const [material, setMaterial] = useState('Cotton');
  const [formality, setFormality] = useState<'Casual' | 'Smart Casual' | 'Business Casual' | 'Formal' | 'Sporty'>('Smart Casual');
  const [price, setPrice] = useState<number | undefined>(undefined);
  const [notes, setNotes] = useState('');

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        setImagePreview(result);
        triggerAIAnalysis(result, file.name);
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerAIAnalysis = async (imgData: string, hintName?: string) => {
    setIsAnalyzing(true);
    try {
      const res = await internalFetch('/api/wardrobe/analyse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: imgData, hint_name: hintName }),
      });
      const json = await res.json();
      if (json.data) {
        const d = json.data;
        setName(d.suggested_name || name);
        setCategory(d.category || category);
        setSubcategory(d.subcategory || subcategory);
        setPrimaryColor(d.primary_color || primaryColor);
        setPattern(d.pattern || pattern);
        if (d.fit) setFit(d.fit);
        if (d.material) setMaterial(d.material);
        if (d.formality) setFormality(d.formality);
        setAnalysisDone(true);
      }
    } catch (err) {
      console.warn('AI analysis call failed, manual entry continues:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const itemPayload = {
      name: name.trim(),
      category,
      subcategory,
      primary_color: primaryColor,
      secondary_colors: [],
      pattern,
      brand: brand || undefined,
      fit,
      material: material || undefined,
      formality,
      style_tags: ['Minimalist', 'Smart Casual'],
      occasion_tags: ['Office', 'Dinner', 'Everyday'],
      season_tags: ['All Season'],
      price: price ? Number(price) : undefined,
      currency: 'USD',
      notes,
      is_favourite: false,
      availability_status: 'Available',
      status: 'Active',
      image_url: imagePreview || undefined,
    } satisfies Omit<WardrobeItem, 'id' | 'created_at' | 'updated_at' | 'wear_count'>;

    addItem(itemPayload);

    try {
      await internalFetch('/api/wardrobe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...itemPayload,
          image_data_url: imagePreview || undefined,
        }),
      });
    } catch (err) {
      console.warn('Cloud wardrobe persistence failed; local item was saved:', err);
    }

    router.push('/closet');
  };

  return (
    <AppShell>
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 md:py-8 space-y-6">
        {/* Top Header */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="p-2 rounded-xl border border-[#E6E4DE] dark:border-[#35322F] text-[#747570] hover:bg-[#F0EEE9] dark:hover:bg-[#282623] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#222321] dark:text-[#F4F1EC]">
              Add Wardrobe Item
            </h1>
            <p className="text-xs text-[#747570] dark:text-[#A8A29A]">
              Upload a photograph to auto-tag properties, or type manually.
            </p>
          </div>
        </div>

        {/* Input Method Tabs */}
        <div className="grid grid-cols-3 gap-2 bg-[#F0EEE9] dark:bg-[#282623] p-1.5 rounded-2xl">
          <button
            type="button"
            onClick={() => setMode('upload')}
            className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-semibold transition-all ${mode === 'upload' ? 'bg-white dark:bg-[#1E1D1B] shadow-xs text-[#222321] dark:text-[#F4F1EC]' : 'text-[#747570]'
              }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload Photo</span>
          </button>
          <button
            type="button"
            onClick={() => setMode('camera')}
            className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-semibold transition-all ${mode === 'camera' ? 'bg-white dark:bg-[#1E1D1B] shadow-xs text-[#222321] dark:text-[#F4F1EC]' : 'text-[#747570]'
              }`}
          >
            <Camera className="w-3.5 h-3.5" />
            <span>Take Photo</span>
          </button>
          <button
            type="button"
            onClick={() => setMode('manual')}
            className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-semibold transition-all ${mode === 'manual' ? 'bg-white dark:bg-[#1E1D1B] shadow-xs text-[#222321] dark:text-[#F4F1EC]' : 'text-[#747570]'
              }`}
          >
            <Shirt className="w-3.5 h-3.5" />
            <span>Manual Entry</span>
          </button>
        </div>

        {/* Photo Uploader Box */}
        {mode !== 'manual' && (
          <div className="bg-white dark:bg-[#1E1D1B] p-6 rounded-2xl border border-[#E6E4DE] dark:border-[#35322F] text-center shadow-xs">
            {imagePreview ? (
              <div className="space-y-4">
                <div className="w-48 h-48 mx-auto bg-[#F8F7F4] dark:bg-[#282623] rounded-2xl p-4 flex items-center justify-center border border-[#E6E4DE] dark:border-[#35322F]">
                  <img
                    src={imagePreview}
                    alt="Garment preview"
                    className="max-h-full max-w-full object-contain rounded-lg"
                  />
                </div>

                {isAnalyzing ? (
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#E5EEE9] dark:bg-[#253D36] text-[#3B4D42] dark:text-[#6FA898] text-xs font-semibold animate-pulse">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>AI analyzing garment properties...</span>
                  </div>
                ) : analysisDone ? (
                  <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#E5EEE9] dark:bg-[#253D36] text-[#4B8067] text-xs font-semibold">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>AI auto-detected properties filled below</span>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => triggerAIAnalysis(imagePreview, name)}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#3B4D42] text-white text-xs font-semibold hover:bg-[#2E3D34]"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Analyze with AI</span>
                  </button>
                )}
              </div>
            ) : (
              <label className="cursor-pointer block p-8 border-2 border-dashed border-[#E6E4DE] dark:border-[#35322F] rounded-2xl hover:border-[#3B4D42] transition-colors">
                <input
                  type="file"
                  accept="image/*"
                  capture={mode === 'camera' ? 'environment' : undefined}
                  onChange={handleImageFileChange}
                  className="hidden"
                />
                <div className="w-12 h-12 rounded-xl bg-[#E5EEE9] dark:bg-[#253D36] text-[#3B4D42] dark:text-[#6FA898] flex items-center justify-center mx-auto mb-3">
                  {mode === 'camera' ? <Camera className="w-6 h-6" /> : <Upload className="w-6 h-6" />}
                </div>
                <span className="text-sm font-semibold text-[#222321] dark:text-[#F4F1EC] block">
                  {mode === 'camera' ? 'Tap to take clothing photo' : 'Select clothing photo from device'}
                </span>
                <span className="text-xs text-[#747570] dark:text-[#A8A29A] mt-1 block">
                  Supports JPG, PNG, WEBP (up to 10MB)
                </span>
              </label>
            )}
          </div>
        )}

        {/* Metadata Form */}
        <form onSubmit={handleSubmit} className="bg-white dark:bg-[#1E1D1B] p-6 rounded-2xl border border-[#E6E4DE] dark:border-[#35322F] space-y-5 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-[#E6E4DE] dark:border-[#35322F]">
            <h3 className="font-serif text-lg font-bold text-[#222321] dark:text-[#F4F1EC]">
              Item Metadata & Details
            </h3>
            <span className="text-xs text-[#747570] dark:text-[#A8A29A]">Editable</span>
          </div>

          {/* Name */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#747570] dark:text-[#A8A29A] mb-1.5">
              Garment Name *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. White Oxford Button-Down Shirt"
              className="w-full px-4 py-2.5 rounded-xl bg-[#F8F7F4] dark:bg-[#282623] border border-[#E6E4DE] dark:border-[#35322F] text-sm text-[#222321] dark:text-[#F4F1EC] focus:outline-hidden focus:border-[#3B4D42]"
            />
          </div>

          {/* Category & Subcategory */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#747570] dark:text-[#A8A29A] mb-1.5">
                Category *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as WardrobeCategory)}
                className="w-full px-4 py-2.5 rounded-xl bg-[#F8F7F4] dark:bg-[#282623] border border-[#E6E4DE] dark:border-[#35322F] text-sm text-[#222321] dark:text-[#F4F1EC] focus:outline-hidden"
              >
                <option value="Tops">Tops</option>
                <option value="Bottoms">Bottoms</option>
                <option value="Outerwear">Outerwear</option>
                <option value="Footwear">Footwear</option>
                <option value="One-Piece">One-Piece</option>
                <option value="Accessories">Accessories</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#747570] dark:text-[#A8A29A] mb-1.5">
                Subcategory
              </label>
              <input
                type="text"
                value={subcategory}
                onChange={(e) => setSubcategory(e.target.value)}
                placeholder="e.g. Oxford Shirt, Chinos, Loafers"
                className="w-full px-4 py-2.5 rounded-xl bg-[#F8F7F4] dark:bg-[#282623] border border-[#E6E4DE] dark:border-[#35322F] text-sm text-[#222321] dark:text-[#F4F1EC] focus:outline-hidden"
              />
            </div>
          </div>

          {/* Color & Pattern */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#747570] dark:text-[#A8A29A] mb-1.5">
                Primary Colour *
              </label>
              <input
                type="text"
                required
                value={primaryColor}
                onChange={(e) => setPrimaryColor(e.target.value)}
                placeholder="e.g. White, Navy, Black, Beige"
                className="w-full px-4 py-2.5 rounded-xl bg-[#F8F7F4] dark:bg-[#282623] border border-[#E6E4DE] dark:border-[#35322F] text-sm text-[#222321] dark:text-[#F4F1EC] focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#747570] dark:text-[#A8A29A] mb-1.5">
                Pattern
              </label>
              <input
                type="text"
                value={pattern}
                onChange={(e) => setPattern(e.target.value)}
                placeholder="e.g. Solid, Striped, Plaid"
                className="w-full px-4 py-2.5 rounded-xl bg-[#F8F7F4] dark:bg-[#282623] border border-[#E6E4DE] dark:border-[#35322F] text-sm text-[#222321] dark:text-[#F4F1EC] focus:outline-hidden"
              />
            </div>
          </div>

          {/* Formality & Brand */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#747570] dark:text-[#A8A29A] mb-1.5">
                Formality Level
              </label>
              <select
                value={formality}
                onChange={(e) => setFormality(e.target.value as typeof formality)}
                className="w-full px-4 py-2.5 rounded-xl bg-[#F8F7F4] dark:bg-[#282623] border border-[#E6E4DE] dark:border-[#35322F] text-sm text-[#222321] dark:text-[#F4F1EC] focus:outline-hidden"
              >
                <option value="Casual">Casual</option>
                <option value="Smart Casual">Smart Casual</option>
                <option value="Business Casual">Business Casual</option>
                <option value="Formal">Formal</option>
                <option value="Sporty">Sporty</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#747570] dark:text-[#A8A29A] mb-1.5">
                Brand (Optional)
              </label>
              <input
                type="text"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                placeholder="e.g. Ralph Lauren, Uniqlo"
                className="w-full px-4 py-2.5 rounded-xl bg-[#F8F7F4] dark:bg-[#282623] border border-[#E6E4DE] dark:border-[#35322F] text-sm text-[#222321] dark:text-[#F4F1EC] focus:outline-hidden"
              />
            </div>
          </div>

          {/* Fit & Material */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#747570] dark:text-[#A8A29A] mb-1.5">
                Fit / Cut
              </label>
              <input
                type="text"
                value={fit}
                onChange={(e) => setFit(e.target.value)}
                placeholder="e.g. Regular, Fitted, Oversized"
                className="w-full px-4 py-2.5 rounded-xl bg-[#F8F7F4] dark:bg-[#282623] border border-[#E6E4DE] dark:border-[#35322F] text-sm text-[#222321] dark:text-[#F4F1EC] focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#747570] dark:text-[#A8A29A] mb-1.5">
                Price (Optional for Cost-per-wear)
              </label>
              <input
                type="number"
                step="0.01"
                value={price ?? ''}
                onChange={(e) => setPrice(e.target.value ? parseFloat(e.target.value) : undefined)}
                placeholder="e.g. 75.00"
                className="w-full px-4 py-2.5 rounded-xl bg-[#F8F7F4] dark:bg-[#282623] border border-[#E6E4DE] dark:border-[#35322F] text-sm text-[#222321] dark:text-[#F4F1EC] focus:outline-hidden"
              />
            </div>
          </div>

          {/* Submit Action */}
          <button
            type="submit"
            className="w-full py-3.5 rounded-xl bg-[#3B4D42] text-white text-sm font-semibold hover:bg-[#2E3D34] shadow-md transition-all flex items-center justify-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4 text-[#C9B79C]" />
            <span>Save to My Closet</span>
          </button>
        </form>
      </div>
    </AppShell>
  );
}
