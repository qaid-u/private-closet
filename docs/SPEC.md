# docs/SPEC.md (product specification)

### 1. Product summary

Private Closet digitizes a wardrobe and answers "What should I wear today?" with complete outfits from the user's own closet. Recommendations are personalized with an optional Style Profile (skin tone and undertone, hair, face shape, height, build and proportions, taste, fit preference, comfort rules). The app is free and open source, requires no account, works offline after a one-time model download, and keeps all personal data on the device.

### 2. Principles

1. Today comes first. Everything else supports it.
2. Photo first. Clothing cutouts are the hero; interface chrome is quiet.
3. Privacy is visible, never just claimed.
4. Honest AI: suggestions, confidence, edit paths, no false certainty.
5. Never block the user: every profile field is optional and recommendations work with general rules.
6. Kind language about bodies: proportion-based and positive.

### 3. Design system

**Color tokens (CSS variables, with light and dark themes)**

| Token | Light | Dark |
|---|---|---|
| background | #FAF8F5 | #141413 |
| surface | #FFFFFF | #1E1D1B |
| surface-alt | #F2EFEA | #282623 |
| border | #E8E4DE | #35322F |
| text-primary | #1C1B1A | #F4F1EC |
| text-secondary | #6B665F | #A8A29A |
| primary | #2F5D50 | #6FA898 |
| primary-soft | #E5EEE9 | #253D36 |
| accent | #C8745A | #E0937A |
| accent-soft | #F7E9E4 | #4B3028 |
| success | #3B7A57 | #67A97E |
| warning | #B7791F | #D49A42 |
| danger | #B3402F | #DF7464 |

Verify AA contrast for every text/background pairing actually used (including text on primary, accent, and soft fills). If a pairing fails, adjust the usage (for example use text-primary on soft fills) rather than the brand tokens, and document it.

**Typography:** Inter for UI. Fraunces (or a similar soft serif) only for large headlines and onboarding. Scale: Display 32/38, Title 24/30, Heading 18/24, Body 16/24, Caption 13/18, Label 12/16 medium. Support browser text scaling to at least 200%.

**Spacing and shape:** 4-pt scale (4, 8, 12, 16, 24, 32, 48). Mobile side padding 16. Radius: controls 8, cards 16, sheets 24, chips and avatars full. 1px borders. Soft shadows only on floating elements (sheets, toasts, FAB-like buttons).

**Icons:** one outline family (for example Lucide), 24px, ~1.5px stroke, accessible name on every icon-only button. No emoji as icons.

**Motion:** 200 to 300 ms ease-out transitions, sheets slide up, toasts fade and slide, subtle button press. Disable or reduce all motion under prefers-reduced-motion.

**Imagery:** the ten sample items need original cutout illustrations drawn as clean SVGs (flat, soft shading, no brands or logos), shown on a surface-alt tile with a subtle ground shadow. Real user photos are processed into cutouts by the BackgroundRemover service.

### 4. Information architecture

Four destinations: **Today, Closet, Style, Me**.
- Mobile: four-tab bottom navigation, no center Add button.
- Tablet and desktop: persistent left navigation rail (wider on desktop).
- Secondary destinations (reachable but not competing with Today): Outfit Builder, Weekly Planner, Packing Planner, Care and laundry views.

### 5. Today (primary)

**Header:** greeting ("Good morning, Maya." uses the profile display name if set, otherwise "Good morning."), date, weather chip, "On device" badge.

**Weather behavior:** default is manual (temperature slider and a simple condition picker) with no network call. "Automatic local forecast" is an opt-in setting that enables the single optional weather request (coordinates only, rounded, no identifiers). The demo/sample mode shows "18°C, light rain" as a preset.

**Recommendations:** three complete outfits.
- Mobile: one card at a time, horizontally paged or vertically swipeable, pagination dots and "1 of 3".
- Tablet: all three side by side. Desktop: left rail, Today feed in the center, Style Profile summary panel on the right.

**Each card:** large cutouts on a soft tile; outfit title (for example "Easy smart casual"); Style match indicator (High, Medium, Low when needed); two or three "Why it suits you" chips; actions: Wear this (primary), Swap an item (secondary), Not me, thumbs up, thumbs down.

Example chips: "Olive suits your warm undertone"; "Short jacket balances a longer torso"; "Light layers for 18°C and rain"; "Navy complements dark brown hair"; "Relaxed fit follows your comfort rules". Chips are generated from real scoring results and are only shown for inputs the user actually provided.

**Style match sheet:** opens from the indicator. Lists Color fit, Proportion fit, Face and hair details, Weather and occasion, Your taste, Freshness, each with a plain-language reason (no numeric body scores). Factors without data show "Add [field] to your Style Profile for sharper picks" instead of a made-up reason. Footer: "These are suggestions. Edit anything that doesn't feel accurate."

**Not me sheet:** reasons (Wrong colors, Wrong fit, Not my style, Too formal, Too casual, Other) plus optional text. Saving records feedback locally, advances to a new recommendation, and shows the toast "Recommendation updated".

**Swap an item sheet:** ranked alternatives from the closet. Each shows rank, cutout, name, short reason, High/Medium/Low fit label. Ranking uses palette fit, proportion fit, harmony with the rest of the outfit, weather suitability, taste, and comfort rules. Selecting one updates the outfit and returns to Today with a confirmation toast.

**Tune today's picks sheet:** occasion chips (Class, Work, Date, Gym, Party, Travel); mood chips (Cozy, Polished, Playful, Minimal, Bold); weather (automatic if enabled, otherwise manual slider); Must include picker; Avoid picker; "Describe what you need" text field with the "On device" badge (parsed locally into filters by the StyleAssistant service).

**States:** complete profile (high-confidence picks); incomplete profile (gentle completion prompt, recommendations still work with general rules, never blocking); low confidence ("Fewer matches than usual. Add more items?" with Add item); fewer than ten items ("Add 6 more items for better picks" with progress and Add item; compute the number from the real count); brand-new user (headline "Your first outfit is waiting in your closet.", primary "Add first items", secondary "Set up Style Profile first", and a clearly labeled "Try with a sample closet" option).

### 6. Closet

- Header: title, item count, Add item button.
- Natural-language search (local, uses tags/colors/embedding-style scoring from the Embedder service).
- Filter chips: All, Suits my palette, Tops, Bottoms, Outerwear, Shoes, Dresses, Accessories, Care. Sort and filter button opens a sheet (color swatches, season, status, last worn, price range).
- Palette badge: "Suits you" with a sparkle icon on matching items; result text such as "18 items suit your palette" (real count).
- Item card: cutout, name, meta line, favorite action, optional care status, optional "Suits you" badge. Long-press or checkbox mode enables multi-select with an action bar (Add to outfit, Mark dirty, Delete).
- Item detail: large image carousel (original and cutout); name; favorite; tags; times worn; cost per wear; last worn; status selector (Clean, Dirty, At cleaner, Needs repair, In storage); outfits with this item; wear history; overflow (Edit, Duplicate, Mark for resale or donate, Delete). "Why this suits you" card with honest, kind wording, for example "Navy works with your medium contrast and dark hair." and, for weaker matches, neutral wording such as "This creates stronger contrast than your usual palette." / "It still works well as an accent." Include a "You haven't worn this in 90 days" nudge when true.
- Care and laundry: status view with swipe or button actions (Mark clean, Mark dirty) and a seasonal rotation suggestion card. Items not Clean are excluded from recommendations.

### 7. Add item flow

1. **Capture:** camera with guide frame, shutter, gallery picker, Batch mode toggle, tip "Lay the item flat on a plain surface." File input fallback when camera permission is denied.
2. **Batch tray:** thumbnails with count and remove.
3. **Processing:** steps "Removing background", "Detecting type and color", "Suggesting tags"; "On device" badge; cancel.
4. **Review tags:** large cutout; Category, Type, Colors, Pattern, Style, Season; AI labels with confidence indicators; low-confidence fields highlighted.
5. **Details form:** name, brand, size, price, purchase date, store, care instructions, notes, status; optional fields collapsed initially.
6. **Duplicate warning:** "You may already own something similar", side-by-side comparison, Keep both / Skip this one.
7. **Saved:** item card, Add another, View closet. On first launch continue to the first Today recommendations.
Failure path: background removal failed offers "Keep original photo".

### 8. Style tab (segmented: Profile, Outfits, Log, Insights, Plan)

**Profile:** summary card, completeness ring, note "Used only to choose outfits for you. Stored only on this device." Sections (all optional): skin tone and undertone (inclusive swatch picker; Warm, Cool, Neutral, Not sure; optional selfie check); hair (color, length, texture); face shape (Oval, Round, Square, Heart, Oblong, Diamond, Not sure, with illustrations); height (number input, cm and ft/in toggle); build and proportions (chips: Broad shoulders, Narrow shoulders, Longer torso, Shorter torso, Longer legs, Shorter legs, Athletic build, Soft build, Balanced; plus fit slider Fitted to Relaxed); taste (six-pair "this or that" quiz with Both and Neither, plus style tags Minimal, Classic, Street, Sporty, Creative); comfort rules (Never suggest sleeveless, No skinny fits, Avoid wool, No high necklines, Prefer flat shoes, custom rules). Weight: not required or prominent; only inside a collapsed Advanced section; never in summaries; never BMI.

**Setup wizard order:** skin tone and undertone, hair, face shape, height, build and proportions, six-pair taste quiz, comfort rules, summary. Every step: progress indicator, Back, Skip, one-line reason, "Stored only on this device", Continue. "Do this later" is available throughout.

**Optional selfie check:** (1) explanation "We analyze your photo on this device, keep only a few style values, and delete the photo."; (2) lighting guidance "Use daylight and face a window for accurate color."; (3) camera with oval guide, live lighting check, low-light warning; (4) processing with "On device" badge ("Checking lighting", "Reading skin and hair color", "Estimating face shape"); (5) results for skin tone, undertone, hair color, face shape, each with a confidence label and Edit; (6) manual fallback via "This doesn't look right" (swatches, undertone options, hair colors, face-shape illustrations); (7) confirmation "Photo deleted. Only your style values were saved." The photo must actually be discarded from memory and storage.

**Outfits:** saved outfit cards (occasion, season, rating filters, favorite, times worn), Build outfit action. Outfit Builder (Secondary): canvas, draggable cutouts, layer handles, Undo, Redo, Save, closet tray with search and category tabs, "Check my outfit" feedback sheet.

**Log:** monthly calendar with thumbnails, Log today, day-detail sheet, choose saved outfit or individual items, summary (days logged, unique items, repeats).

**Insights:** Month, Year, All time. Cards: monthly recap, cost per wear, never worn, color balance, category balance, gap analysis. Charts use labels or patterns in addition to color. Gap analysis is palette-aware and wardrobe-aware, for example "Add a stone or warm-grey trouser." with reasons: suits your warm undertone, balances nine dark tops, creates twelve new outfit combinations (computed from real data), fits your comfort and taste preferences; shows suggested color swatches and Add to wishlist.

**Plan (both Secondary):** Weekly Planner (seven day slots, weather, drag handles, Fill my week); Packing Planner (destination, dates, weather, activities, packing checklist, outfit count, Swap item).

### 9. Me tab

Settings, Privacy Center, AI models, Storage, Backup and restore, Encryption and app lock, Units and location, About and licenses, Style Profile data.

- **Style Profile data:** Export style data; Delete only style data; Exclude Style Profile data from backups (on by default). Deleting requires a confirmation sheet that explains Closet, outfits, and wear history remain and Today returns to general rules; afterward the export and delete controls are disabled.
- **Privacy Center ("Nothing leaves your device."):** live counter "Data sent about you: 0 bytes" computed from the real network registry (counts bytes of any request carrying user data); complete outgoing request list (model download "One time, from our static host"; weather off by default, coordinates only if enabled; app update check to our own origin only; analytics and tracking "None"); View source code; How we protect you.
- **AI models:** name, purpose, size, version, installed state, Delete, Re-download, and a storage breakdown (app, photos, models). Simulated models are labeled as such.
- **App lock and encryption:** Encrypt data at rest, passphrase with strength meter, biometric unlock toggle (simulated if not available), auto-lock timing, warning "If you forget this passphrase, your data cannot be recovered."
- **Backup and restore:** last backup status, Export encrypted backup (passphrase, file-size estimate), Import drop zone with preview (clothing items, saved outfits, wear history), reminder setting, "Invalid backup" error.
- **About:** free and open source, version, open-source libraries, model licenses, source code link, donation action with the exact text "A donation unlocks nothing. Every feature stays free for everyone."

### 10. Onboarding

Order: Welcome, Privacy promise, Style Profile quick setup, optional selfie branch, Install and persistent storage, AI model setup (Full vs Lite, Wi-Fi only toggle, progress, retry), Add first items with batch capture, first Today recommendations with a celebration state. "Do this later" is allowed throughout Style Profile setup.

### 11. System states

Empty (Today, Closet, saved outfits, wear logs, insights); loading skeletons (closet grid, item detail, insights, AI processing); offline banner "You're offline. Everything still works."; full model not installed offers Lite mode; errors (camera permission denied, storage almost full, model download failed, invalid backup, background removal failed with Keep original photo); selfie errors (low light, failed detection, manual fallback); confirmations (delete item, delete all data, delete Style Profile data); toasts (Saved, Undone, Copied, Outfit logged, Recommendation updated, Style Profile updated, Style Profile data deleted).

### 12. Responsive behavior

- Mobile 390x844: bottom nav, bottom sheets, one recommendation at a time, two-column grid.
- Tablet 768: left rail, four-column grid, three recommendations side by side, persistent filter panels where useful.
- Desktop 1280: wider rail, centered Today feed with right Style summary panel, five-column grid, split Item detail, expanded Insights. On desktop, bottom sheets may become centered dialogs or side panels.

### 13. Sample data and tone

**Sample items:** Cream knit sweater, Navy linen shirt, Olive chinos, White leather sneakers, Black wool coat, Denim jacket, Striped tee, Grey tailored trousers, Tan boots, Floral summer dress. Give each realistic tags, colors, formality, warmth, price, and purchase date. Sample data is flagged `isSample` and can be removed in one action.

**Sample Style Profile:** warm undertone; medium contrast; dark brown, medium-length, wavy hair; oval face; 175 cm; athletic build; broad shoulders; longer torso; relaxed fit; minimal, classic, sporty taste; no skinny fits; avoid wool; prefer flat shoes.

**Tone:** friendly, brief, reassuring, non-judgmental. Examples: "Your photos never leave this device." "A few details can make picks feel more like you." "Works with your proportions." "Recommendations still work using general rules." Avoid legalistic wording and the banned terms in AGENTS.md.

### 14. Delivery phases

0. Plan and scaffold. 1. Design system and component library. 2. Data layer, services, seed data. 3. Onboarding and Style Profile. 4. Closet, Add item, Item detail. 5. Recommendation engine and Today. 6. Style tab. 7. Me tab. 8. PWA, offline, system states, performance. 9. QA hardening and final report. (Detailed prompts in Part 5.)

### 15. Connected flows (must be clickable and covered by Playwright)

1. First launch: Welcome, Privacy, Style Profile, optional selfie, Install, AI, Add items, first Today.
2. Today, Wear this, toast, Wear Log updated.
3. Today, Not me, reasons, new recommendation.
4. Today, Swap an item, pick ranked alternative, updated outfit.
5. Style, Profile, edit skin tone, Save, Today recommendations change.
6. Me, Style Profile data, Delete, confirmation, general-rules Today.
7. Me, Privacy Center, Network activity.
8. Me, Backup and restore, Export, success.
