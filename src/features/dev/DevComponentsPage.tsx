import React, { useState } from 'react';
import {
  TopAppBar,
  OnDeviceBadge,
  StyleMatchIndicator,
  WhyChip,
  ItemCard,
  OutfitCard,
  RecommendationCard,
  StatCard,
  ProfileSectionRow,
  SwatchPicker,
  QuizPairCard,
  SearchBar,
  FilterChips,
  SegmentedControl,
  Toggle,
  Slider,
  Field,
  Input,
  Button,
  Card,
  Sheet,
  ConfirmDialog,
  Modal,
  Toast,
  OfflineBanner,
  ProgressBar,
  Skeleton,
  EmptyState,
  BottomNav,
  DestinationTab,
} from '../../ui';
import { useUiStore } from '../../stores/uiStore';
import { Sun, Moon, Sparkles, Palette } from 'lucide-react';

export const DevComponentsPage: React.FC<{ onBackToApp?: () => void }> = ({ onBackToApp }) => {
  const { setTheme, isDarkMode } = useUiStore();
  const isDark = isDarkMode();

  // State demos
  const [activeNavTab, setActiveNavTab] = useState<DestinationTab>('today');
  const [searchValue, setSearchValue] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [selectedSegment, setSelectedSegment] = useState('overview');
  const [toggleState, setToggleState] = useState(true);
  const [sliderValue, setSliderValue] = useState(20);
  const [selectedSwatch, setSelectedSwatch] = useState('warm-1');
  const [quizChoice, setQuizChoice] = useState<'a' | 'b' | 'both' | 'neither'>('a');
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showToast, setShowToast] = useState(true);

  const filterOptions = [
    { id: 'all', label: 'All', count: 18 },
    { id: 'palette', label: 'Suits my palette', count: 12, hasSparkle: true },
    { id: 'tops', label: 'Tops', count: 6 },
    { id: 'bottoms', label: 'Bottoms', count: 4 },
  ];

  const segmentOptions = [
    { id: 'overview', label: 'Overview' },
    { id: 'details', label: 'Details', badge: 3 },
    { id: 'history', label: 'History' },
  ];

  const swatchOptions = [
    { id: 'warm-1', name: 'Terracotta', hex: '#C8745A' },
    { id: 'warm-2', name: 'Olive Sage', hex: '#2F5D50' },
    { id: 'warm-3', name: 'Warm Cream', hex: '#F2EFEA' },
    { id: 'warm-4', name: 'Espresso', hex: '#1C1B1A' },
  ];

  return (
    <div className="min-h-screen bg-background text-text-primary p-4 sm:p-8 space-y-10 antialiased max-w-6xl mx-auto">
      {/* Top Bar */}
      <TopAppBar
        title="UI Component Library Showcase"
        subtitle="Live catalog of all 26 design system components"
        onBack={onBackToApp}
        badge={<OnDeviceBadge label="Dev Only" size="sm" />}
        actions={
          <Button
            variant="outline"
            size="sm"
            onClick={() => setTheme(isDark ? 'light' : 'dark')}
            leftIcon={isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          >
            {isDark ? 'Light Mode' : 'Dark Mode'}
          </Button>
        }
      />

      <OfflineBanner message="You're offline. Everything still works (100% device-local)." />

      {/* Section 1: Navigation Components */}
      <section aria-labelledby="sec-nav" className="space-y-4">
        <h2 id="sec-nav" className="font-serif text-xl font-bold border-b border-border pb-2">
          1. Navigation: BottomNav & Rails
        </h2>
        <Card variant="default" padding="md" className="space-y-3">
          <p className="text-xs text-text-secondary">
            BottomNav (4-tab, mobile standard, 44x44 targets, no center Add button):
          </p>
          <div className="relative border border-border rounded-control p-2 max-w-sm bg-surface">
            <BottomNav activeTab={activeNavTab} onSelectTab={setActiveNavTab} />
          </div>
        </Card>
      </section>

      {/* Section 2: Badges & Indicators */}
      <section aria-labelledby="sec-indicators" className="space-y-4">
        <h2 id="sec-indicators" className="font-serif text-xl font-bold border-b border-border pb-2">
          2. Badges, Indicators & Why Chips
        </h2>
        <Card variant="default" padding="lg" className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <OnDeviceBadge label="On device" />
            <OnDeviceBadge label="Zero Cloud Telemetry" size="sm" />
            <StyleMatchIndicator level="High" onClick={() => alert('High Match clicked')} />
            <StyleMatchIndicator level="Medium" onClick={() => alert('Medium Match clicked')} />
            <StyleMatchIndicator level="Low" onClick={() => alert('Low Match clicked')} />
          </div>

          <div className="pt-3 border-t border-border flex flex-wrap gap-2">
            <WhyChip label="Olive suits your warm undertone" category="color" />
            <WhyChip label="Short jacket balances a longer torso" category="proportion" />
            <WhyChip label="Light layers for 18°C and rain" category="weather" />
            <WhyChip label="Relaxed fit follows your comfort rules" category="comfort" />
            <WhyChip label="Minimalist styling matches your taste" category="taste" />
          </div>
        </Card>
      </section>

      {/* Section 3: Cards */}
      <section aria-labelledby="sec-cards" className="space-y-4">
        <h2 id="sec-cards" className="font-serif text-xl font-bold border-b border-border pb-2">
          3. Cards: ItemCard, OutfitCard & StatCard
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <ItemCard
            id="item-1"
            name="Navy Linen Shirt"
            category="Tops"
            colorHex="#1B263B"
            isFavorite={true}
            suitsPalette={true}
            status="clean"
            onClick={() => {}}
          />

          <ItemCard
            id="item-2"
            name="Olive Chinos"
            category="Bottoms"
            colorHex="#586445"
            isFavorite={false}
            suitsPalette={true}
            status="dirty"
            onClick={() => {}}
          />

          <StatCard
            label="Cost Per Wear"
            value="$4.20"
            subtext="Calculated from 24 recorded wears"
            icon={<Sparkles className="w-5 h-5" />}
            trend={{ text: "Top 10% most worn item", positive: true }}
          />
        </div>

        <OutfitCard
          id="outfit-1"
          name="Easy Smart Casual"
          occasion="Work"
          season="Autumn"
          rating={5}
          isFavorite={true}
          wornCount={6}
          items={[
            { name: 'Navy Linen Shirt', category: 'Top', colorHex: '#1B263B' },
            { name: 'Olive Chinos', category: 'Bottom', colorHex: '#586445' },
            { name: 'Denim Jacket', category: 'Layer', colorHex: '#415A77' },
            { name: 'White Sneakers', category: 'Shoes', colorHex: '#FFFFFF' },
          ]}
        />
      </section>

      {/* Section 4: RecommendationCard */}
      <section aria-labelledby="sec-rec" className="space-y-4">
        <h2 id="sec-rec" className="font-serif text-xl font-bold border-b border-border pb-2">
          4. Marquee Recommendation Card
        </h2>
        <RecommendationCard
          index={1}
          total={3}
          title="Easy Smart Casual"
          matchLevel="High"
          items={[
            { slot: 'Top', name: 'Navy Linen Shirt', colorHex: '#1B263B' },
            { slot: 'Bottom', name: 'Olive Chinos', colorHex: '#586445' },
            { slot: 'Layer', name: 'Denim Jacket', colorHex: '#415A77' },
            { slot: 'Shoes', name: 'White Sneakers', colorHex: '#FFFFFF' },
          ]}
          reasons={[
            { label: 'Olive suits your warm undertone', category: 'color' },
            { label: 'Short jacket balances a longer torso', category: 'proportion' },
            { label: 'Light layers for 18°C and rain', category: 'weather' },
          ]}
          onWearThis={() => alert('Wear this clicked')}
          onSwapItem={() => alert('Swap item clicked')}
          onNotMe={() => alert('Not me clicked')}
          onThumbsUp={() => alert('Thumbs up')}
          onThumbsDown={() => alert('Thumbs down')}
        />
      </section>

      {/* Section 5: Form Controls & Inputs */}
      <section aria-labelledby="sec-forms" className="space-y-4">
        <h2 id="sec-forms" className="font-serif text-xl font-bold border-b border-border pb-2">
          5. Form Controls, Search, Filter & Sliders
        </h2>
        <Card variant="default" padding="lg" className="space-y-6">
          <SearchBar
            value={searchValue}
            onChange={setSearchValue}
            placeholder="Search clothes by color, fabric, or occasion..."
          />

          <FilterChips
            options={filterOptions}
            selectedId={selectedFilter}
            onSelect={setSelectedFilter}
          />

          <SegmentedControl
            options={segmentOptions}
            selectedId={selectedSegment}
            onChange={setSelectedSegment}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
            <Toggle
              label="Automatic Weather Forecast"
              description="Coordinates rounded to 2 decimals (~1.1 km precision). Zero identifiers."
              checked={toggleState}
              onChange={setToggleState}
            />

            <Slider
              label="Temperature Target"
              min={0}
              max={40}
              value={sliderValue}
              onChange={setSliderValue}
              minLabel="0°C Cold"
              maxLabel="40°C Hot"
              valueFormatter={(v) => `${v}°C`}
            />
          </div>

          <Field label="Wardrobe Notes" description="Keep tailoring or wash instructions local.">
            <Input placeholder="e.g. Wash cold, air dry only" />
          </Field>
        </Card>
      </section>

      {/* Section 6: Profile & Quiz Components */}
      <section aria-labelledby="sec-profile" className="space-y-4">
        <h2 id="sec-profile" className="font-serif text-xl font-bold border-b border-border pb-2">
          6. Profile Rows, Swatches & Taste Quiz
        </h2>
        <div className="space-y-4">
          <ProfileSectionRow
            title="Color Season & Undertone"
            description="Warm Autumn &bull; Rich earthy neutrals"
            value="Configured"
            isComplete={true}
            icon={<Palette className="w-5 h-5" />}
            onClick={() => alert('Edit Color Season')}
          />

          <SwatchPicker
            label="Skin & Palette Swatches"
            options={swatchOptions}
            selectedId={selectedSwatch}
            onSelect={setSelectedSwatch}
          />

          <QuizPairCard
            id="quiz-1"
            pairNumber={1}
            totalPairs={6}
            optionA={{ label: 'Structured Blazer', description: 'Crisp lapels and tailored shoulders' }}
            optionB={{ label: 'Oversized Knit', description: 'Relaxed drape and tactile softness' }}
            selectedChoice={quizChoice}
            onSelectChoice={setQuizChoice}
          />
        </div>
      </section>

      {/* Section 7: Dialogs, Sheets & Modals */}
      <section aria-labelledby="sec-dialogs" className="space-y-4">
        <h2 id="sec-dialogs" className="font-serif text-xl font-bold border-b border-border pb-2">
          7. Modals, Sheets & Confirm Dialogs
        </h2>
        <Card variant="default" padding="md" className="flex flex-wrap gap-3">
          <Button variant="primary" onClick={() => setIsModalOpen(true)}>
            Open Accessible Modal
          </Button>
          <Button variant="secondary" onClick={() => setIsSheetOpen(true)}>
            Open Bottom/Slide Sheet
          </Button>
          <Button variant="danger" onClick={() => setIsConfirmOpen(true)}>
            Open Confirm Dialog
          </Button>
        </Card>

        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Accessible Modal"
          description="Focus-trapped and closes on Escape key."
        >
          <div className="space-y-4">
            <p className="text-xs text-text-secondary">
              This modal complies with WCAG 2.1 AA dialog specifications.
            </p>
            <Button variant="primary" onClick={() => setIsModalOpen(false)}>
              Close
            </Button>
          </div>
        </Modal>

        <Sheet
          isOpen={isSheetOpen}
          onClose={() => setIsSheetOpen(false)}
          title="Item Detail Sheet"
          description="Slide-over on desktop, bottom sheet on mobile."
        >
          <div className="space-y-4">
            <p className="text-xs text-text-secondary">
              Traps focus and restores focus to the triggering element on close.
            </p>
            <Button variant="primary" onClick={() => setIsSheetOpen(false)}>
              Close Sheet
            </Button>
          </div>
        </Sheet>

        <ConfirmDialog
          isOpen={isConfirmOpen}
          onClose={() => setIsConfirmOpen(false)}
          onConfirm={() => {
            alert('Confirmed!');
            setIsConfirmOpen(false);
          }}
          title="Delete Style Profile Data?"
          description="Closet items, outfits, and wear history remain intact. Today recommendations will return to general rules."
          confirmLabel="Delete Data"
          isDestructive={true}
        />
      </section>

      {/* Section 8: Feedback, Progress, Skeletons & Empty State */}
      <section aria-labelledby="sec-feedback" className="space-y-4">
        <h2 id="sec-feedback" className="font-serif text-xl font-bold border-b border-border pb-2">
          8. Feedback, Progress, Skeletons & Empty State
        </h2>
        {showToast && (
          <Toast
            id="demo-toast"
            variant="success"
            message="Recommendation updated (saved on device)"
            onDismiss={() => setShowToast(false)}
            actionLabel="Undo"
            onAction={() => alert('Undo action invoked')}
          />
        )}

        <ProgressBar value={75} label="Style Profile Setup" showPercent={true} />

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Skeleton variant="tile" />
          <Skeleton variant="tile" />
          <Skeleton variant="card" className="col-span-2" />
        </div>

        <EmptyState
          title="Your first outfit is waiting in your closet."
          description="Add a few pieces you love wearing, and we'll create complete outfits for your morning routine."
          primaryActionLabel="Add first items"
          onPrimaryAction={() => alert('Add items')}
          secondaryActionLabel="Try with a sample closet"
          onSecondaryAction={() => alert('Sample closet')}
        />
      </section>
    </div>
  );
};
