import React, { useState } from 'react';
import { Plus, Search, Sparkles, Filter } from 'lucide-react';
import { Button } from '../../ui/Button';

export const ClosetScreen: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState('All');
  const filters = ['All', 'Suits my palette', 'Tops', 'Bottoms', 'Outerwear', 'Shoes', 'Dresses', 'Accessories', 'Care'];

  // Sample items representing SPEC section 13
  const sampleItems = [
    { name: 'Cream knit sweater', category: 'Tops', color: '#F2EBDC', paletteMatch: true },
    { name: 'Navy linen shirt', category: 'Tops', color: '#1B263B', paletteMatch: true },
    { name: 'Olive chinos', category: 'Bottoms', color: '#586445', paletteMatch: true },
    { name: 'White leather sneakers', category: 'Shoes', color: '#FFFFFF', paletteMatch: true },
    { name: 'Black wool coat', category: 'Outerwear', color: '#1A1A1A', paletteMatch: false },
    { name: 'Denim jacket', category: 'Outerwear', color: '#415A77', paletteMatch: true },
    { name: 'Striped tee', category: 'Tops', color: '#E0E1DD', paletteMatch: true },
    { name: 'Grey tailored trousers', category: 'Bottoms', color: '#778DA9', paletteMatch: false },
    { name: 'Tan boots', category: 'Shoes', color: '#A3704C', paletteMatch: true },
    { name: 'Floral summer dress', category: 'Dresses', color: '#DDBEA9', paletteMatch: true },
  ];

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header per SPEC Section 6 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-text-primary">
            Wardrobe Closet
          </h1>
          <p className="text-xs sm:text-sm text-text-secondary mt-0.5">
            {sampleItems.length} items &bull; 8 suit your warm palette
          </p>
        </div>

        <Button variant="primary" size="md" leftIcon={<Plus className="w-4 h-4" />}>
          Add item
        </Button>
      </div>

      {/* Search & Filter Bar */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-text-secondary absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search by color, pattern, style, or season..."
              className="w-full min-h-touch pl-10 pr-4 py-2 rounded-control bg-surface border border-border text-sm text-text-primary placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <Button variant="secondary" size="md" leftIcon={<Filter className="w-4 h-4" />}>
            Sort & Filter
          </Button>
        </div>

        {/* Filter Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {filters.map((f) => {
            const isActive = activeFilter === f;
            return (
              <button
                key={f}
                type="button"
                onClick={() => setActiveFilter(f)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap min-h-touch transition-all flex items-center gap-1.5 select-none ${
                  isActive
                    ? 'bg-primary text-white font-semibold'
                    : 'bg-surface border border-border text-text-secondary hover:text-text-primary hover:bg-surface-alt'
                }`}
              >
                {f === 'Suits my palette' && <Sparkles className="w-3.5 h-3.5" />}
                <span>{f}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Item Grid (2 cols mobile, 4 cols tablet, 5 cols desktop per SPEC Section 12) */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
        {sampleItems.map((item, i) => (
          <div
            key={i}
            className="group bg-surface border border-border rounded-card p-3 sm:p-4 flex flex-col justify-between hover:shadow-card transition-all cursor-pointer relative"
          >
            {item.paletteMatch && (
              <span className="absolute top-2.5 right-2.5 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-primary-soft text-primary">
                <Sparkles className="w-3 h-3" />
                Suits you
              </span>
            )}

            <div className="aspect-square w-full rounded-control bg-surface-alt flex items-center justify-center relative overflow-hidden mb-3">
              <div
                className="w-16 h-16 rounded-full shadow-soft"
                style={{ backgroundColor: item.color }}
              />
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-text-secondary">
                {item.category}
              </span>
              <h3 className="font-semibold text-xs sm:text-sm text-text-primary truncate">
                {item.name}
              </h3>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
