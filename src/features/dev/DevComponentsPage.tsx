import React, { useState, useEffect } from 'react';
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
import { Sun, Moon, Sparkles, Palette, Database, Trash2, Download, RefreshCw, Cpu, HardDrive, CheckCircle2 } from 'lucide-react';
import { seedService } from '../../data/seedService';
import { itemsRepo } from '../../data/repositories/itemsRepo';
import { styleProfileRepo } from '../../data/repositories/styleProfileRepo';
import { storageService, StorageEstimate } from '../../data/repositories/storageService';
import { imagesRepo } from '../../data/repositories/imagesRepo';
import { MockModelManager, AIModelInfo } from '../../ai';

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

  // Phase 2: Data & AI Service Demo State
  const [modelManager] = useState(() => new MockModelManager());
  const [itemCount, setItemCount] = useState<number>(0);
  const [hasSample, setHasSample] = useState<boolean>(false);
  const [hasProfile, setHasProfile] = useState<boolean>(false);
  const [storageEstimate, setStorageEstimate] = useState<StorageEstimate | null>(null);
  const [models, setModels] = useState<AIModelInfo[]>([]);
  const [installingId, setInstallingId] = useState<string | null>(null);
  const [installProgress, setInstallProgress] = useState<number>(0);
  const [sampleItems, setSampleItems] = useState<{ id: string; name: string; category: string; imageUrl?: string }[]>([]);
  const [isDataBusy, setIsDataBusy] = useState<boolean>(false);
  const [dataMessage, setDataMessage] = useState<string>('');

  const refreshDataLayer = React.useCallback(async () => {
    try {
      const count = await itemsRepo.count();
      setItemCount(count);
      const sampleExists = await seedService.hasSampleData();
      setHasSample(sampleExists);
      const profileExists = await styleProfileRepo.hasProfile();
      setHasProfile(profileExists);
      const est = await storageService.getStorageEstimate();
      setStorageEstimate(est);
      const mList = modelManager.list();
      setModels([...mList]);

      if (count > 0) {
        const items = await itemsRepo.getAll();
        const previews = await Promise.all(
          items.slice(0, 10).map(async (item) => {
            const url = await imagesRepo.getUrl(item.imageCutoutId);
            return {
              id: item.id,
              name: item.name,
              category: item.category,
              imageUrl: url,
            };
          })
        );
        setSampleItems(previews);
      } else {
        setSampleItems([]);
      }
    } catch (e) {
      console.error('Error refreshing data layer:', e);
    }
  }, [modelManager]);

  useEffect(() => {
    refreshDataLayer();
  }, [refreshDataLayer]);

  const handleLoadSampleWardrobe = async () => {
    setIsDataBusy(true);
    setDataMessage('Loading 10 sample items and SVG cutouts into IndexedDB...');
    try {
      await seedService.loadSampleWardrobe();
      await refreshDataLayer();
      setDataMessage('Sample wardrobe loaded successfully (10 items).');
    } catch {
      setDataMessage('Failed to load sample wardrobe.');
    } finally {
      setIsDataBusy(false);
    }
  };

  const handleRemoveSampleWardrobe = async () => {
    setIsDataBusy(true);
    setDataMessage('Removing sample items from IndexedDB...');
    try {
      await seedService.removeSampleWardrobe();
      await refreshDataLayer();
      setDataMessage('Sample wardrobe removed successfully.');
    } catch {
      setDataMessage('Failed to remove sample wardrobe.');
    } finally {
      setIsDataBusy(false);
    }
  };

  const handleDeleteStyleData = async () => {
    setIsDataBusy(true);
    setDataMessage('Deleting style profile data (items and wear logs preserved)...');
    try {
      await styleProfileRepo.deleteStyleData();
      await refreshDataLayer();
      setDataMessage('Style profile data deleted. Recommendations will return to general rules.');
    } catch {
      setDataMessage('Failed to delete style data.');
    } finally {
      setIsDataBusy(false);
    }
  };

  const handleInstallModel = async (id: string) => {
    setInstallingId(id);
    setInstallProgress(0);
    try {
      await modelManager.install(id, (p) => setInstallProgress(p));
      const mList = modelManager.list();
      setModels([...mList]);
      setDataMessage(`Model "${id}" installed (simulated).`);
    } catch {
      setDataMessage(`Failed to install model "${id}".`);
    } finally {
      setInstallingId(null);
      setInstallProgress(0);
    }
  };

  const handleRemoveModel = async (id: string) => {
    await modelManager.remove(id);
    const mList = modelManager.list();
    setModels([...mList]);
    setDataMessage(`Model "${id}" removed.`);
  };

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

      {/* Section 9: Phase 2 Data Layer, Repositories, AI Models & Storage */}
      <section aria-labelledby="sec-phase2" className="space-y-6">
        <div className="border-b border-border pb-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-primary" />
            <h2 id="sec-phase2" className="font-serif text-xl font-bold">
              9. Phase 2: Data Layer, Repositories, Seed Data & AI Models
            </h2>
          </div>
          <OnDeviceBadge label="Phase 2 Live" size="sm" />
        </div>

        {dataMessage && (
          <div className="p-3 rounded-lg bg-primary-soft text-text-primary text-sm flex items-center justify-between">
            <span className="font-medium">{dataMessage}</span>
            <Button size="sm" variant="ghost" onClick={() => setDataMessage('')}>
              Dismiss
            </Button>
          </div>
        )}

        {/* Repositories Controls & Status */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-text-secondary uppercase tracking-wider">
                IndexedDB Items
              </span>
              <span className="text-2xl font-bold font-serif text-primary">{itemCount}</span>
            </div>
            <p className="text-xs text-text-secondary">
              Status: {hasSample ? 'Sample closet active (10 items)' : 'No sample items loaded'}
            </p>
            <div className="flex flex-col gap-2 pt-2">
              <Button
                size="sm"
                variant={hasSample ? 'outline' : 'primary'}
                leftIcon={<Download className="w-4 h-4" />}
                onClick={handleLoadSampleWardrobe}
                disabled={isDataBusy}
              >
                Load Sample Wardrobe
              </Button>
              <Button
                size="sm"
                variant="outline"
                leftIcon={<Trash2 className="w-4 h-4 text-danger" />}
                onClick={handleRemoveSampleWardrobe}
                disabled={isDataBusy || !hasSample}
              >
                Remove Sample Wardrobe
              </Button>
            </div>
          </Card>

          <Card className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-text-secondary uppercase tracking-wider">
                Style Profile Data
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-surface-alt">
                {hasProfile ? 'Configured' : 'Empty'}
              </span>
            </div>
            <p className="text-xs text-text-secondary">
              Profile rules: warm undertone, athletic build, proportion rules.
            </p>
            <div className="flex flex-col gap-2 pt-2">
              <Button
                size="sm"
                variant="outline"
                leftIcon={<Trash2 className="w-4 h-4 text-danger" />}
                onClick={handleDeleteStyleData}
                disabled={isDataBusy || !hasProfile}
              >
                Delete Style Data Only
              </Button>
              <Button
                size="sm"
                variant="ghost"
                leftIcon={<RefreshCw className="w-4 h-4" />}
                onClick={refreshDataLayer}
                disabled={isDataBusy}
              >
                Refresh Data Layer
              </Button>
            </div>
          </Card>

          <Card className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-text-secondary uppercase tracking-wider flex items-center gap-1.5">
                <HardDrive className="w-4 h-4" /> Storage Estimate
              </span>
              <span className="text-xs font-mono text-text-secondary">
                {storageEstimate?.isPersisted ? 'Persisted' : 'Transient'}
              </span>
            </div>
            <div className="text-xs space-y-1 text-text-secondary">
              <div>Quota: {(storageEstimate?.quotaBytes ? storageEstimate.quotaBytes / (1024 * 1024) : 0).toFixed(0)} MB</div>
              <div>Usage: {(storageEstimate?.usageBytes ? storageEstimate.usageBytes / 1024 : 0).toFixed(1)} KB</div>
            </div>
            <p className="text-xs text-text-secondary pt-2">
              100% on-device storage in IndexedDB/OPFS with zero cloud backup.
            </p>
          </Card>
        </div>

        {/* Sample Wardrobe Visual Cutouts */}
        {sampleItems.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold">Loaded Cutouts Preview ({sampleItems.length})</h3>
              <span className="text-xs text-text-secondary">Original clean SVGs on surface-alt tiles</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {sampleItems.map((item) => (
                <div
                  key={item.id}
                  className="p-3 rounded-xl bg-surface-alt border border-border flex flex-col items-center text-center space-y-2"
                >
                  <div className="w-16 h-16 flex items-center justify-center">
                    {item.imageUrl ? (
                      <img src={item.imageUrl} alt={item.name} className="w-full h-full object-contain filter drop-shadow-sm" />
                    ) : (
                      <div className="w-10 h-10 rounded bg-border animate-pulse" />
                    )}
                  </div>
                  <span className="text-xs font-medium text-text-primary truncate w-full">{item.name}</span>
                  <span className="text-[10px] text-text-secondary uppercase tracking-wide">{item.category}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* AI Models (Mock Adapters with simulated labels) */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Cpu className="w-4 h-4 text-primary" />
              <h3 className="text-base font-semibold">AI Models & Adapters (TECH_DESIGN Section 5)</h3>
            </div>
            <span className="text-xs text-text-secondary">All simulated models clearly labeled</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {models.map((m) => (
              <Card key={m.id} className="p-3 space-y-2">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-sm font-semibold text-text-primary">{m.name}</h4>
                    <p className="text-xs text-text-secondary">{m.purpose}</p>
                  </div>
                  {m.isSimulated && (
                    <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-warning/10 text-warning border border-warning/20">
                      Simulated
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between text-xs text-text-secondary pt-1">
                  <span>Size: {m.sizeBytes / 1000} KB</span>
                  <span className="flex items-center gap-1">
                    {m.isInstalled ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 text-success" /> Installed
                      </>
                    ) : (
                      'Not Installed'
                    )}
                  </span>
                </div>

                {installingId === m.id && (
                  <ProgressBar value={installProgress} label="Installing model" showPercent={true} />
                )}

                <div className="pt-1">
                  {m.isInstalled ? (
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full text-xs"
                      onClick={() => handleRemoveModel(m.id)}
                      disabled={installingId !== null}
                    >
                      Remove Model
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      variant="primary"
                      className="w-full text-xs"
                      onClick={() => handleInstallModel(m.id)}
                      disabled={installingId !== null}
                    >
                      {installingId === m.id ? 'Installing...' : 'Install Model (Simulated)'}
                    </Button>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};
