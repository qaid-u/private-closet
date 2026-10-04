import React, { useState } from 'react';
import { Sheet } from '../../ui/Sheet';
import { Button } from '../../ui/Button';
import { Shield, Sparkles, Check, Thermometer, CloudRain, Sun, Cloud, Wind, Snowflake, Flame } from 'lucide-react';
import { RecommendationContext, OccasionType, MoodType, WeatherCondition } from '../../engine/types';
import { ClothingItem } from '../../data/types';
import { MockStyleAssistant } from '../../ai/mockAdapters';

interface TunePicksSheetProps {
  isOpen: boolean;
  onClose: () => void;
  context: RecommendationContext;
  closetItems: ClothingItem[];
  onApply: (updatedContext: RecommendationContext) => void;
}

const OCCASIONS: { id: OccasionType; label: string }[] = [
  { id: 'casual', label: 'Casual' },
  { id: 'work', label: 'Work' },
  { id: 'class', label: 'Class' },
  { id: 'date', label: 'Date' },
  { id: 'gym', label: 'Gym' },
  { id: 'party', label: 'Party' },
  { id: 'travel', label: 'Travel' },
];

const MOODS: { id: MoodType; label: string }[] = [
  { id: 'cozy', label: 'Cozy' },
  { id: 'polished', label: 'Polished' },
  { id: 'minimal', label: 'Minimal' },
  { id: 'playful', label: 'Playful' },
  { id: 'bold', label: 'Bold' },
];

const WEATHER_CONDITIONS: { id: WeatherCondition; label: string; icon: React.ReactNode }[] = [
  { id: 'rain', label: 'Rain', icon: <CloudRain className="w-3.5 h-3.5 text-primary" /> },
  { id: 'cloudy', label: 'Cloudy', icon: <Cloud className="w-3.5 h-3.5 text-text-secondary" /> },
  { id: 'sunny', label: 'Sunny', icon: <Sun className="w-3.5 h-3.5 text-warning" /> },
  { id: 'cold', label: 'Cold', icon: <Snowflake className="w-3.5 h-3.5 text-primary" /> },
  { id: 'hot', label: 'Hot', icon: <Flame className="w-3.5 h-3.5 text-accent" /> },
  { id: 'windy', label: 'Windy', icon: <Wind className="w-3.5 h-3.5 text-text-secondary" /> },
];

export const TunePicksSheet: React.FC<TunePicksSheetProps> = ({
  isOpen,
  onClose,
  context,
  closetItems,
  onApply,
}) => {
  const [tempC, setTempC] = useState<number>(context.tempC);
  const [condition, setCondition] = useState<WeatherCondition>(context.condition);
  const [occasion, setOccasion] = useState<OccasionType>(context.occasion);
  const [mood, setMood] = useState<MoodType | undefined>(context.mood);
  const [mustInclude, setMustInclude] = useState<string[]>(context.mustInclude || []);
  const [avoid, setAvoid] = useState<string[]>(context.avoid || []);
  const [promptText, setPromptText] = useState(context.userPrompt || '');
  const [isParsing, setIsParsing] = useState(false);

  const styleAssistant = React.useMemo(() => new MockStyleAssistant(), []);

  const handleParsePrompt = async () => {
    if (!promptText.trim()) return;
    setIsParsing(true);
    try {
      const parsed = await styleAssistant.parseRequest(promptText);
      if (parsed.occasion) setOccasion(parsed.occasion as OccasionType);
      if (parsed.mood) setMood(parsed.mood as MoodType);
      if (parsed.tempHintC !== undefined) setTempC(parsed.tempHintC);
      if (parsed.avoid) setAvoid((prev) => [...new Set([...prev, ...parsed.avoid!])]);
    } finally {
      setIsParsing(false);
    }
  };

  const handleApply = () => {
    onApply({
      tempC,
      condition,
      occasion,
      mood,
      mustInclude,
      avoid,
      userPrompt: promptText,
    });
    onClose();
  };

  const toggleMustInclude = (id: string) => {
    setMustInclude((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
    // Remove from avoid if included
    setAvoid((prev) => prev.filter((i) => i !== id));
  };

  const toggleAvoid = (id: string) => {
    setAvoid((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
    // Remove from mustInclude if avoided
    setMustInclude((prev) => prev.filter((i) => i !== id));
  };

  return (
    <Sheet isOpen={isOpen} onClose={onClose} title="Tune today's picks">
      <div className="space-y-6">
        {/* Natural Language Request */}
        <div className="p-4 rounded-card bg-surface-alt border border-border space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-text-primary">
              Describe what you need
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-primary-soft text-primary">
              <Shield className="w-3 h-3" />
              On device
            </span>
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={promptText}
              onChange={(e) => setPromptText(e.target.value)}
              placeholder="e.g., something cozy for 16°C rain, or polished for date"
              className="flex-1 px-3 py-2 rounded-control bg-surface border border-border text-xs text-text-primary placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
            <Button
              variant="secondary"
              size="sm"
              onClick={handleParsePrompt}
              isLoading={isParsing}
              rightIcon={<Sparkles className="w-3.5 h-3.5" />}
            >
              Tune
            </Button>
          </div>
        </div>

        {/* Weather Controls */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-text-primary flex items-center gap-1.5">
              <Thermometer className="w-3.5 h-3.5 text-primary" />
              Weather Settings (Manual)
            </span>
            <span className="text-xs font-semibold text-text-primary">
              {tempC}°C
            </span>
          </div>

          <input
            type="range"
            min="-5"
            max="35"
            value={tempC}
            onChange={(e) => setTempC(parseInt(e.target.value, 10))}
            className="w-full accent-primary h-2 bg-surface-alt rounded-lg cursor-pointer"
          />

          <div className="flex flex-wrap gap-2 pt-1">
            {WEATHER_CONDITIONS.map((cond) => (
              <button
                key={cond.id}
                type="button"
                onClick={() => setCondition(cond.id)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors flex items-center gap-1.5 ${
                  condition === cond.id
                    ? 'bg-primary text-white border-primary shadow-soft'
                    : 'bg-surface border-border text-text-secondary hover:text-text-primary'
                }`}
              >
                {cond.icon}
                <span>{cond.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Occasion Selection */}
        <div className="space-y-2">
          <span className="text-xs font-bold text-text-primary block">
            Occasion
          </span>
          <div className="flex flex-wrap gap-2">
            {OCCASIONS.map((occ) => (
              <button
                key={occ.id}
                type="button"
                onClick={() => setOccasion(occ.id)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors flex items-center gap-1.5 ${
                  occasion === occ.id
                    ? 'bg-primary text-white border-primary shadow-soft'
                    : 'bg-surface border-border text-text-secondary hover:text-text-primary'
                }`}
              >
                <span>{occ.label}</span>
                {occasion === occ.id && <Check className="w-3 h-3" />}
              </button>
            ))}
          </div>
        </div>

        {/* Mood Selection */}
        <div className="space-y-2">
          <span className="text-xs font-bold text-text-primary block">
            Vibe & Mood
          </span>
          <div className="flex flex-wrap gap-2">
            {MOODS.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => setMood(mood === m.id ? undefined : m.id)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors flex items-center gap-1.5 ${
                  mood === m.id
                    ? 'bg-accent text-white border-accent shadow-soft'
                    : 'bg-surface border-border text-text-secondary hover:text-text-primary'
                }`}
              >
                <span>{m.label}</span>
                {mood === m.id && <Check className="w-3 h-3" />}
              </button>
            ))}
          </div>
        </div>

        {/* Must Include Items */}
        <div className="space-y-2">
          <span className="text-xs font-bold text-text-primary block">
            Must Include in Outfit
          </span>
          <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto pr-1">
            {closetItems.filter((i) => i.status === 'clean').map((item) => {
              const isIncluded = mustInclude.includes(item.id);
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => toggleMustInclude(item.id)}
                  className={`px-2.5 py-1 rounded-control text-[11px] font-medium border transition-colors ${
                    isIncluded
                      ? 'bg-primary/15 border-primary text-primary font-semibold'
                      : 'bg-surface border-border text-text-secondary hover:text-text-primary'
                  }`}
                >
                  {item.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* Avoid Items */}
        <div className="space-y-2">
          <span className="text-xs font-bold text-text-primary block">
            Avoid Pieces Today
          </span>
          <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto pr-1">
            {closetItems.map((item) => {
              const isAvoided = avoid.includes(item.id);
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => toggleAvoid(item.id)}
                  className={`px-2.5 py-1 rounded-control text-[11px] font-medium border transition-colors ${
                    isAvoided
                      ? 'bg-danger/15 border-danger text-danger font-semibold'
                      : 'bg-surface border-border text-text-secondary hover:text-text-primary'
                  }`}
                >
                  {item.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-2 flex items-center justify-between border-t border-border">
          <Button
            variant="ghost"
            size="md"
            onClick={() => {
              setTempC(18);
              setCondition('rain');
              setOccasion('casual');
              setMood('cozy');
              setMustInclude([]);
              setAvoid([]);
              setPromptText('');
            }}
          >
            Reset Defaults
          </Button>

          <Button variant="primary" size="md" onClick={handleApply}>
            Apply Changes
          </Button>
        </div>
      </div>
    </Sheet>
  );
};
