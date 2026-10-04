# docs/TECH_DESIGN.md (technical design)

### 1. Folder structure

```
src/
  app/            routes, layouts, providers, navigation (bottom nav + rail)
  features/
    today/ closet/ add-item/ style-profile/ outfits/ log/ insights/ plan/ me/ onboarding/
  ui/             design-system components (Button, Sheet, Chip, ...)
  engine/         pure logic: color science, rules, scoring, outfit generation, explanations
  ai/             service interfaces, mock adapters, model manager, workers
  data/           Dexie schema, repositories, migrations, seed data, backup format
  net/            guardedFetch.ts, registry.ts, byte counter
  security/       crypto (WebCrypto), lock state, key handling
  copy/           all user-facing strings, banned-terms list
  styles/         tokens.css, tailwind config
public/           manifest icons, sample SVG cutouts
tests/            e2e (Playwright), fixtures
```

### 2. Data model (Dexie tables, Zod-validated)

```ts
type ID = string;

interface ClothingItem {
  id: ID; isSample?: boolean;
  name: string; category: 'top'|'bottom'|'dress'|'outerwear'|'shoes'|'accessory';
  subtype: string;                        // e.g. 'shirt', 'chinos'
  colors: { hex: string; lab: [number, number, number]; name: string; share: number }[];
  pattern: 'solid'|'striped'|'check'|'floral'|'graphic'|'other';
  styleTags: string[];                    // minimal, classic, street, sporty, creative
  formality: 0|1|2|3|4;                   // 0 loungewear .. 4 formal
  warmth: 0|1|2|3;                        // 0 very light .. 3 heavy
  waterResistant?: boolean;
  fit: 'fitted'|'regular'|'relaxed'|'oversized';
  neckline?: 'crew'|'v'|'open-collar'|'high'|'scoop'|'none';
  length?: 'cropped'|'regular'|'long';
  rise?: 'low'|'mid'|'high';
  material?: string; seasons: ('spring'|'summer'|'autumn'|'winter')[];
  brand?: string; size?: string; price?: number; purchaseDate?: string; store?: string;
  care?: string; notes?: string;
  status: 'clean'|'dirty'|'at-cleaner'|'needs-repair'|'in-storage';
  favorite: boolean; imageOriginalId?: ID; imageCutoutId: ID;   // blobs in image store
  tagConfidence?: Record<string, number>;
  embedding?: Float32Array;               // from Embedder service (mock: hash-based)
  createdAt: number; updatedAt: number;
}

interface StyleProfile {                   // single record, all optional
  displayName?: string;
  skin?: { depth: 'light'|'medium'|'deep'; swatchHex: string; undertone: 'warm'|'cool'|'neutral'|'unsure'; source: 'manual'|'selfie' };
  hair?: { colorHex: string; colorName: string; length: 'short'|'medium'|'long'; texture: 'straight'|'wavy'|'curly'|'coily' };
  faceShape?: 'oval'|'round'|'square'|'heart'|'oblong'|'diamond'|'unsure';
  heightCm?: number; heightUnit: 'cm'|'ftin';
  proportions?: string[]; fitPreference?: number;   // 0 fitted .. 1 relaxed
  taste?: { quizAnswers: { pairId: string; choice: 'a'|'b'|'both'|'neither' }[]; tags: string[] };
  comfortRules: { id: string; label: string; kind: 'builtin'|'custom'; rule?: RuleSpec }[];
  advanced?: { weightKg?: number };                 // collapsed, never displayed in summaries
  completeness: number; updatedAt: number;
}

interface Outfit { id: ID; name: string; itemIds: ID[]; occasion?: string; season?: string; rating?: 1|2|3|4|5; favorite: boolean; wornCount: number; createdAt: number; }
interface WearLog { id: ID; date: string; outfitId?: ID; itemIds: ID[]; context?: { tempC?: number; condition?: string; occasion?: string }; }
interface Feedback { id: ID; outfitSignature: string; kind: 'up'|'down'|'not-me'; reasons: string[]; note?: string; at: number; }
interface Preferences { weights: Record<string, number>; hueAffinity: Record<string, number>; itemAffinity: Record<ID, number>; pairAffinity: Record<string, number>; formalityBias: number; }
interface AppSettings { theme: 'light'|'dark'|'system'; units: 'metric'|'imperial'; weatherMode: 'manual'|'auto'; excludeStyleFromBackup: boolean; lock: { enabled: boolean; autoLockSec: number; biometric: boolean }; onboardingDone: boolean; lastBackupAt?: number; }
```

Images (original and cutout) are stored as Blobs in a separate Dexie table (or OPFS). Request persistent storage with `navigator.storage.persist()` and show storage usage from `navigator.storage.estimate()`.

### 3. Local persistence and migrations

Dexie schema versioning from day one. Repositories wrap tables (no direct Dexie calls in components). A `deleteStyleData()` function clears StyleProfile and Preferences learned from profile-based factors, leaves items, outfits, and logs intact, and sets a flag so the UI disables export/delete for style data.

### 4. Recommendation engine (pure TypeScript in src/engine)

**Inputs:** items, StyleProfile (maybe empty), Preferences, context (tempC, condition, occasion, mood, mustInclude, avoid), recent WearLogs, Feedback.

**Step 1, eligibility (hard filters):** status must be clean; comfort rules (for example "No skinny fits", "Avoid wool", "Never suggest sleeveless", "No high necklines", "Prefer flat shoes" as a strong preference); avoid list; weather (rain prefers closed shoes and water-resistant or layered options; temperature maps to a warmth target band).

**Step 2, candidate assembly:** slots = (top + bottom) or dress, optional outerwear (required below ~14°C or when raining, optional otherwise), shoes, optional accessory. Take the top N per slot by quick single-item score, then combine into candidates (beam search, cap around 2,000 candidates).

**Step 3, scoring factors (each 0 to 1, or null if its input is missing):**
- Color fit: map the profile to a guideline palette. Warm undertone favors warm neutrals and earthy hues (olive, camel, rust, cream, warm browns); cool favors cool neutrals and jewel tones (navy, charcoal, emerald, berry, crisp white); neutral and unsure accept a broad range. Garments near the face (tops, outerwear, scarves) weigh 1.0; bottoms and shoes 0.4. Contrast level (derived from skin depth versus hair lightness) adjusts preference for tonal versus high-contrast pairings. Use Lab color distance, not raw hex.
- Proportion fit: rule table keyed by profile descriptors, for example longer torso favors cropped or short layers and mid/high rise; shorter torso favors tucked or regular-length tops; broad shoulders favors softer shoulder lines and open necklines; narrow shoulders favors structured shoulders; height adjusts length preferences; fit preference slider compares against item fit. Output is a positive "works with" score.
- Face and hair details: neckline and collar guidelines by face shape, and hair-color contrast with garments near the face. Low weight.
- Weather and occasion: warmth versus target band, rain suitability, formality versus occasion target, mood tags.
- Your taste: overlap of item tags with quiz and tag preferences, plus learned affinities from feedback.
- Freshness: penalize items or exact combinations worn recently; reward rediscovering items unworn for 90+ days.
- Harmony (internal, folded into color fit): neutrals mix freely, analogous and complementary pairings score well, clashes are penalized, repeated pattern clashes are penalized.

**Step 4, aggregation:** weighted sum with default weights color 0.22, proportion 0.18, face-hair 0.06, weather-occasion 0.24, taste 0.20, freshness 0.10. When a factor is null (missing profile data), drop it and renormalize the remaining weights. Preferences can shift weights slightly within bounds.

**Step 5, selection:** pick the top three with diversity (maximal marginal relevance so outfits differ by at least two items or by occasion feel).

**Step 6, labels and explanations:** Match label thresholds: High at 0.75 and above, Medium 0.55 to under 0.75, Low below 0.55. If every candidate is Low or fewer than three eligible outfits exist, return `lowConfidence: true`. Explanations come from templates keyed to the highest contributing factors that had real input. Templates are positive, proportion-based, and pass the banned-terms lint. Chips never mention data the user did not provide.

**Step 7, learning from feedback:**
- Not me, Wrong colors: lower hueAffinity for the hues in that outfit.
- Wrong fit: shift the fit-preference estimate toward the item fit tags the user kept.
- Not my style: lower the affinity of the style tags involved.
- Too formal or Too casual: nudge formalityBias.
- Thumbs up/down and Wear this: adjust itemAffinity and pairAffinity with exponential decay.
All updates are bounded, local, and visible in a "What the app has learned" debug view under Me (dev-only or behind an Advanced toggle).

**Swap ranking:** for a chosen slot, rescore the outfit with each alternative and rank by total score, with a short reason from the top changed factor.

**Tests (Vitest, must pass):** deterministic fixtures with the sample closet and sample profile; assert that dirty items and comfort-rule violations never appear; rain changes shoes and outerwear choices; missing profile fields renormalize weights and produce no profile-based chips; feedback changes later rankings; explanations never contain banned terms; the same input gives the same output.

### 5. AI service abstraction (src/ai)

```ts
interface BackgroundRemover { remove(img: Blob, opts?: { signal?: AbortSignal }): Promise<{ cutout: Blob; confidence: number }>; }
interface ItemTagger { tag(cutout: Blob): Promise<{ category: Tag; subtype: Tag; colors: ColorInfo[]; pattern: Tag; styleTags: Tag[]; seasons: Tag[]; confidence: Record<string, number> }>; }
interface SelfieAnalyzer { analyze(photo: Blob): Promise<{ lighting: 'good'|'low'|'uneven'; skin?: {...; confidence: number}; undertone?: {...; confidence: number}; hair?: {...; confidence: number}; faceShape?: {...; confidence: number} }>; }
interface Embedder { embedImage(cutout: Blob): Promise<Float32Array>; embedText(q: string): Promise<Float32Array>; }
interface StyleAssistant { parseRequest(text: string): Promise<{ occasion?: string; mood?: string; avoid?: string[]; include?: string[]; tempHintC?: number }>; }
interface ModelManager { list(): ModelInfo[]; install(id: string, onProgress: (p: number) => void, signal?: AbortSignal): Promise<void>; remove(id: string): Promise<void>; }
```

- Implementations run in Web Workers.
- **Mock adapters (default in this prototype):** deterministic, clearly labeled "simulated". Background removal can use a simple canvas edge/color-key approach that works on plain backgrounds; color extraction uses real k-means on pixels (this is real, not simulated); category/pattern tagging uses simple heuristics plus filename/user hints; the selfie analyzer samples real pixels for lighting and approximate skin/hair color but marks face shape as "estimated" with low confidence; the StyleAssistant is a local keyword parser.
- **Adapter slots for real models later:** ONNX Runtime Web or Transformers.js (CLIP/SigLIP, RMBG-style segmentation, MediaPipe face landmarker). Document the swap points in docs/AI_ADAPTERS.md.
- **Model manager:** simulates download with real progress UI and caches small placeholder files via Cache Storage so offline behavior is realistic. Full vs Lite modes change which adapters are active.
- Never send images to any remote service.

### 6. Selfie handling

Process the photo in memory in a worker, produce derived values only, then explicitly drop references and revoke object URLs. Do not write the photo to IndexedDB or Cache Storage. Test that no selfie blob exists in storage after the flow.

### 7. Security: encryption and lock

- WebCrypto AES-GCM with a key derived from the passphrase via PBKDF2 (SHA-256, at least 600,000 iterations, random salt) in the prototype; document Argon2-WASM as a future upgrade.
- Encrypt sensitive record payloads and image blobs at rest when enabled; keep the derived key in memory only; clear on lock.
- Auto-lock timer and lock screen; biometric unlock is a convenience gate (simulated unless WebAuthn is available) and never replaces the passphrase.
- Passphrase strength meter with clear feedback; the "cannot be recovered" warning requires an explicit acknowledgement.
- Be honest in docs: this protects data at rest against casual access, and a compromised device is out of scope.

### 8. Content Security Policy and network layer

Ship a CSP (meta tag for static hosting, and an example `_headers` file):
`default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' blob: data:; font-src 'self'; connect-src 'self'; worker-src 'self' blob:; manifest-src 'self'; object-src 'none'; base-uri 'self'; form-action 'none'; frame-ancestors 'none'`
Adjust only if the build truly needs it, and document each exception. If the optional weather request is enabled by the user, it goes through guardedFetch, which checks the registry allowlist, sends only rounded coordinates, and records the request size; update `connect-src` via a documented, minimal exception or implement weather as a clearly separate opt-in build/config flag, and explain the choice.

`guardedFetch`:
- Accepts only destinations registered in `registry.ts`.
- Refuses anything disabled in settings.
- Counts request bytes (URL + body) into a persisted counter, separated into "user data bytes" (must be 0 for all registered requests by design) and "app asset bytes".
- The Privacy Center shows the real numbers and the full registry.

### 9. PWA and offline

- Web app manifest with name, short name, theme and background colors, standalone display, maskable icons (generate simple original icons), and shortcuts for Today and Add item.
- Service worker via Workbox: precache the app shell and assets, runtime-cache model placeholder files, offline fallback page, "Update available" prompt (checks only the app's own origin).
- Install prompt guidance for iOS (Add to Home Screen) and Android/desktop, shown in onboarding, with a persistent-storage request and an explanation of why.
- Lighthouse targets (local): PWA installable, Accessibility 95+, Best Practices 95+, Performance 85+ on a mid-range mobile profile. Lazy-load route chunks and heavy features (charts, camera, workers).

### 10. Backup format

A single `.closetbackup` file: versioned header, item/outfit/log JSON, image blobs, optional Style Profile (excluded by default), all sealed with AES-GCM using a passphrase-derived key. Import validates with Zod, shows a preview (item, outfit, wear-log counts), supports Merge or Replace with a confirmation, and rejects invalid files with the "Invalid backup" state. Round-trip test required.

### 11. State management

Zustand stores for UI state (sheets, toasts, current recommendation index); Dexie live queries for data; React Router for navigation with deep links for each tab and sheet-backed routes where sensible. Keep the recommendation result cached per context hash so swapping tabs does not reshuffle.

### 12. Testing strategy

- Unit: engine, color science, copy-lint, backup round-trip, crypto, guardedFetch registry rules.
- Component: key UI pieces (Sheet focus trap, Chip, SwatchPicker, StyleMatchIndicator).
- E2E (Playwright, 3 viewports, light and dark): all eight flows in SPEC section 15.
- Accessibility: axe-core on every route and sheet; keyboard-only run of the main flows.
- Static checks: ESLint network ban, TypeScript strict, bundle-size report.
