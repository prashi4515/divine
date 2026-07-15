# CMS Architecture Proposal — Multi-Scripture Publishing Platform

> **Status:** Proposal only. No code, no schema changes, no migrations, no API
> changes. This document defines the target information architecture, sitemap,
> component system, workflows, and phased roadmap for evolving `/admin` from a
> Bhagavad Gita tool into a publishing platform for hundreds of scriptures and
> millions of verses.
>
> **Author role:** Staff Frontend Engineer / Design Lead.
> **Read first:** [Admin](./Admin.md), [Architecture](./Architecture.md),
> [Database-Design](./Database-Design.md), [Content-Import](./Content-Import.md).

---

## 1. Executive Summary

Divine's admin today is a single-corpus, mostly-placeholder dashboard: nine flat
sidebar links, one live read-only table (Chapters), and disabled actions. It
reads as a *CRUD dashboard for the Gita*.

The platform now needs to host **many traditions** — Vedas, Upanishads,
Mahabharata, Ramayana, Bible, Quran, Buddhist and Jain texts, Greek philosophy,
and more — each with multiple editions, languages, translators, and media. That
is not a bigger CRUD app; it is a **content publishing system**. The right
mental models are **Sanity/Strapi** (structured content + roles),
**Notion** (calm hierarchy, slide-over detail, command palette), **Shopify
Admin** (multi-resource operations at scale, bulk actions, saved views), and
**Linear** (speed, keyboard-first, workflow states).

This proposal restructures the admin around **seven product pillars** —
**Content, Publishing, Metadata, Users, Analytics, AI, Settings** — introduces a
**corpus-scoped** navigation model, and specifies the reusable component system,
empty/loading states, accessibility, and performance strategy required to edit
**1M+ verses** without loading them all.

Crucially, this is achievable **without touching the Prisma schema, API
contracts, or `packages/types`**. Screens are designed against the *existing*
data model; anything requiring new persistence (versioning, media, RBAC,
workflow states beyond `isPublished`) is explicitly marked **Future — pending
backend** so the frontend can ship progressively as contracts land.

---

## 2. Current-State Analysis

### 2.1 What exists today

| Route | Purpose | Status |
| ----- | ------- | ------ |
| `/admin` | Dashboard — stat cards, activity, quick links | Design (zeros) |
| `/admin/works` | Scripture corpora | Design placeholder |
| `/admin/chapters` | Chapter structure | **Live, read-only** (`GET /v1/chapters`) |
| `/admin/verses` | Verse catalog | Design placeholder |
| `/admin/translations` | Localized meanings | Design placeholder |
| `/admin/languages` | BCP-47 catalog | Design placeholder |
| `/admin/topics` | Thematic taxonomy | Design placeholder |
| `/admin/emotions` | Emotion tags | Design placeholder |
| `/admin/settings` | CMS preferences | Design placeholder |

**Existing reusable components** (`src/features/admin/`): `AdminSidebar` +
`AdminMobileNav`, `AdminSidebarNav`, `AdminHeader`, `AdminBreadcrumbs`,
`AdminPageHeader`, `AdminToolbar` (search + filter chips), `AdminResourcePage`
(header + toolbar + table shell), `DataTablePlaceholder`, `EmptyState`,
`StatCard`, `skeletons` (`TableSkeleton`, `StatSkeletonGrid`), `chapters-table`.

These are a **solid foundation** — the chrome, empty-state, and skeleton
primitives are already on-brand (hairline borders, muted surfaces, no
decorative gradients) and should be *evolved*, not discarded.

### 2.2 What's limiting

1. **Flat IA.** Nine sibling links don't scale to 20+ surfaces. No grouping, no
   scoping, no sense of "where am I in which corpus."
2. **Gita-shaped mental model.** "Chapters" is a Gita word; the Quran has
   surahs, the Bible has books/chapters, the Upanishads have khandas. The IA
   must speak in **generic structural terms** with per-tradition labels.
3. **No corpus context.** Every screen is global. At hundreds of works, editors
   need to *enter a work* and operate within it (like entering a repo in Linear
   or a store in Shopify).
4. **No workflow surface.** There is `isPublished` (boolean) and nothing that
   represents *review → approve → schedule → publish*.
5. **No scale strategy.** `DataTablePlaceholder` renders a static table; there
   is no pagination, virtualization, faceting, or saved views — all mandatory
   at 1M+ rows.
6. **Single-actor.** No users, roles, audit, or permission scoping.

### 2.3 Data availability (honesty check — drives what can ship now)

| Capability | Backend today | CMS implication |
| ---------- | ------------- | --------------- |
| List works | `GET /v1/works` | Read views ship now |
| List/get chapters | `GET /v1/chapters`, `/:publicId` | Read views ship now |
| Verses, translations, taxonomy CRUD | **None** | Design now, wire when API lands |
| Auth / RBAC | **None** (planned P1) | Model in UI; gate later |
| Media, versioning, workflow states | **None / not in schema** | Future — pending backend |
| Import/export | `tooling/content-import` (v1 JSON, CLI) | Wrap CLI in a UI wizard |

> **Design rule:** every screen must have a *credible read-only or empty state*
> so the CMS looks production-quality before its write APIs exist — exactly as
> the current placeholders intend, but structured for scale.

---

## 3. Constraints & Guardrails

**Non-negotiable (from the task and engineering standards):**

- **No Prisma schema changes. No migrations.**
- **No API contract changes.** Consume only what exists; new needs are logged as
  *future contracts*, never faked.
- **No `packages/types` changes.** Cross-app payloads stay as-is.
- **Frontend only.** `apps/web` route group `/admin` + `src/features/admin/*`.
- One-way dependency flow preserved (`apps/web → packages/*`); web never touches
  the DB — all data over HTTP.

### 3.1 Known tension to log (not fix now)

The `Verse` model stores original text as `sanskritText` (required) +
`transliteration` (optional). For non-Sanskrit corpora (Bible, Quran, Greek),
"sanskrit" is the wrong label. **We do not change the schema.** Instead:

- The CMS labels this field generically per tradition — **"Original text"** /
  "Source text" / "Arabic" / "Koine Greek" — while the wire contract remains
  `sanskritText`.
- A future schema evolution (rename to `originalText` + `script` metadata) is
  filed as a **roadmap item for the backend**, out of scope here.

This keeps the UI tradition-neutral today without violating the freeze.

---

## 4. Product Thesis & Design Principles

Adapted from Sanity, Strapi, Notion, Shopify Admin, and Linear — filtered
through Divine's existing calm, typographic design language.

| Principle | Meaning for this CMS |
| --------- | -------------------- |
| **Structured, not free-form** | Content is typed (work → structure → verse → translation). Editors fill fields, not blobs (Sanity/Strapi). |
| **Scoped context** | You *enter a corpus* and work within it. Global views exist for cross-corpus ops (Shopify store scoping). |
| **Calm hierarchy** | Grouped sidebar, slide-over detail panels, generous whitespace, hairline structure (Notion). Reuse existing tokens. |
| **Keyboard-first & fast** | Command palette (⌘K), quick nav, optimistic edits, inline actions (Linear). |
| **Operate at scale** | Every list is paginated, filterable, virtualizable, with saved views + bulk actions (Shopify). |
| **Publishing is a first-class object** | Draft → review → scheduled → published is visible and governed, not a hidden boolean. |
| **Honest states** | Empty, loading, error, permission-denied, and partial-data states are designed, never afterthoughts. |
| **Progressive capability** | Read-only where APIs exist; clearly-disabled where they don't; no fake writes. |

---

## 5. Information Architecture — The Seven Pillars

The admin reorganizes around seven pillars. Each maps to a sidebar group and a
top-level route segment.

```
CONTENT      What the scriptures ARE            works, structure, verses, media, collections
PUBLISHING   How content GOES LIVE              workflow board, review queue, scheduling, releases
METADATA     How content is CLASSIFIED          languages, translation sources, topics, emotions, tags
USERS        WHO can act (people + access)       members, roles, invitations, activity/audit
ANALYTICS    How content PERFORMS & its HEALTH   reading analytics, coverage/quality reports
AI           MACHINE assistance + governance     AI jobs, moderation queue, search index, prompts
SETTINGS     Platform CONFIGURATION             workspace, import/export, API/webhooks, localization, appearance
```

### 5.1 Corpus scoping model

Two operating altitudes, like Shopify (all-stores vs one store) and GitHub
(all-repos vs one repo):

- **Platform level** (`/admin/...`) — cross-corpus dashboards, global search,
  people, settings, analytics roll-ups.
- **Corpus level** (`/admin/content/works/[work]/...`) — everything scoped to
  one scripture: its structure, verses, translations, media, workflow, history.

A **Corpus Switcher** in the sidebar header (⌘-searchable) is the primary way to
move between works — this is what makes "hundreds of scriptures" navigable.

---

## 6. New Sitemap

Legend: **[now]** ships against current APIs · **[ro]** read-only today ·
**[future]** needs a new (not-yet-existing) contract.

```
/admin                                   Dashboard (platform overview)                     [now: works/chapters counts]

── CONTENT ──────────────────────────────────────────────────────────────────
/admin/content                           Content home / corpus grid                        [ro]
/admin/content/works                     All works (corpora) list                          [ro]
/admin/content/works/new                 Create work                                       [future]
/admin/content/works/[work]              Corpus overview (health, structure, coverage)     [ro]
/admin/content/works/[work]/structure    Structural tree (chapters/books/surahs…)          [ro]
/admin/content/works/[work]/verses       Verses within corpus (virtualized)                [future]
/admin/content/works/[work]/verses/[id]  Verse editor (slide-over or full page)            [future]
/admin/content/works/[work]/history      Version history for corpus                        [future]
/admin/content/verses                    Global verse explorer (cross-corpus search)       [future]
/admin/content/media                     Media library (audio, images)                     [future]
/admin/content/collections               Curated sets / reading plans source               [future]

── PUBLISHING ───────────────────────────────────────────────────────────────
/admin/publishing                        Workflow board (Kanban by state)                  [future]
/admin/publishing/review                 Review queue (assigned to me / all)               [future]
/admin/publishing/scheduled              Scheduled publishes calendar                      [future]
/admin/publishing/releases               Release/changeset log                             [future]

── METADATA ─────────────────────────────────────────────────────────────────
/admin/metadata/languages                Languages (BCP-47)                                [future*]
/admin/metadata/sources                  Translation sources / editions                    [future*]
/admin/metadata/topics                   Thematic taxonomy (hierarchical)                  [future*]
/admin/metadata/emotions                 Emotion tags                                      [future*]
/admin/metadata/tags                     Free taxonomy / labels                            [future]

── TRANSLATIONS (a Content×Metadata workspace) ──────────────────────────────
/admin/translations                      Translation workbench                             [future]
/admin/translations/coverage             Coverage matrix (verse × language × source)       [future]
/admin/translations/glossary             Terminology / glossary                            [future]

── USERS ────────────────────────────────────────────────────────────────────
/admin/people                            Members                                           [future]
/admin/people/roles                      Roles & permissions                               [future]
/admin/people/invitations                Pending invitations                               [future]
/admin/people/activity                   Activity / audit log                              [future]

── ANALYTICS ────────────────────────────────────────────────────────────────
/admin/insights                          Analytics overview                                [future]
/admin/insights/content                  Content performance (reads, popular verses)       [future]
/admin/insights/quality                  Quality & coverage reports                        [future]

── AI ───────────────────────────────────────────────────────────────────────
/admin/ai                                AI overview                                       [future]
/admin/ai/jobs                           AI job runs (tagging, drafts, summaries)          [future]
/admin/ai/moderation                     Moderation queue (human-in-the-loop)              [future]
/admin/ai/search-index                   Embeddings / search index health                  [future]
/admin/ai/prompts                        Prompt & model configuration                      [future]

── SETTINGS ─────────────────────────────────────────────────────────────────
/admin/settings                          Workspace settings                                [ro]
/admin/settings/import                   Import wizard (wraps content-import)              [future→CLI exists]
/admin/settings/export                   Export builder                                     [future]
/admin/settings/api                      API keys & webhooks                                [future]
/admin/settings/localization             Default locales, fallbacks                        [future]
/admin/settings/appearance               Admin appearance                                  [now]
/admin/settings/billing                  Billing (if commercialized)                       [future?]
```

`*` Metadata CRUD needs write APIs; **read** versions of languages/sources/
topics/emotions may ship earlier if list endpoints are added.

---

## 7. Sidebar Structure

Grouped, scoped, keyboard-navigable. Collapses to a drawer on mobile (reusing
the existing `AdminMobileNav` pattern).

```
┌───────────────────────────────┐
│  ॐ  Divine        Admin CMS    │  ← brand
│  ┌─────────────────────────┐  │
│  │ ⌘  Bhagavad Gita     ▾  │  │  ← Corpus Switcher (search hundreds)
│  └─────────────────────────┘  │
│  🔎 Search…            ⌘K      │  ← global command/search entry
├───────────────────────────────┤
│  OVERVIEW                      │
│   ▸ Dashboard                  │
│                                │
│  CONTENT                       │
│   ▸ Works                      │
│   ▸ Structure          (corpus)│
│   ▸ Verses             (corpus)│
│   ▸ Media                      │
│   ▸ Collections                │
│                                │
│  PUBLISHING                    │
│   ▸ Workflow           ● 12    │  ← count badges (assigned/pending)
│   ▸ Review queue       ● 4     │
│   ▸ Scheduled                  │
│   ▸ Releases                   │
│                                │
│  TRANSLATIONS                  │
│   ▸ Workbench                  │
│   ▸ Coverage                   │
│   ▸ Glossary                   │
│                                │
│  METADATA                      │
│   ▸ Languages                  │
│   ▸ Sources                    │
│   ▸ Topics                     │
│   ▸ Emotions                   │
│   ▸ Tags                       │
│                                │
│  INTELLIGENCE                  │
│   ▸ AI jobs                    │
│   ▸ Moderation         ● 7     │
│   ▸ Search index               │
│                                │
│  PEOPLE                        │
│   ▸ Members                    │
│   ▸ Roles                      │
│   ▸ Activity                   │
│                                │
│  INSIGHTS                      │
│   ▸ Content                    │
│   ▸ Quality                    │
├───────────────────────────────┤
│  ▸ Settings                    │  ← pinned bottom
│  👤 Ada  ·  Editor             │  ← user + role
└───────────────────────────────┘
```

**Behaviors**

- Groups are **collapsible**; state persisted per user (localStorage).
- **(corpus)**-tagged items operate on the selected corpus; switching corpus
  keeps you on the same sub-view where possible (Linear-style continuity).
- **Count badges** (`aria-label`ed) surface actionable backlog (review, moderation).
- Groups hidden entirely when the user's role has no access (see §16).
- Respects reduced motion; expand/collapse is instant when preferred.

---

## 8. Page Migration — Which Current Pages Move

| Current | New location | Change |
| ------- | ------------ | ------ |
| `/admin` | `/admin` | Redesigned (see §9 wireframe); becomes platform overview |
| `/admin/works` | `/admin/content/works` | Grouped under **Content**; gains grid + corpus cards |
| `/admin/chapters` | `/admin/content/works/[work]/structure` | Becomes **corpus-scoped**; renamed "Structure" (tradition-neutral); keeps live read-only chapters table |
| `/admin/verses` | `/admin/content/works/[work]/verses` + `/admin/content/verses` | Corpus-scoped primary; global explorer secondary; virtualized |
| `/admin/translations` | `/admin/translations` (workbench) | Elevated to a **workspace** with coverage matrix |
| `/admin/languages` | `/admin/metadata/languages` | Grouped under **Metadata** |
| `/admin/topics` | `/admin/metadata/topics` | Grouped under **Metadata**; gains hierarchy tree (schema already supports `parentId`) |
| `/admin/emotions` | `/admin/metadata/emotions` | Grouped under **Metadata** |
| `/admin/settings` | `/admin/settings` + children | Expanded to a settings section (import/export, API, localization…) |

**Redirects:** keep old paths working via lightweight redirects
(`/admin/chapters → /admin/content/works/bg/structure` default corpus) so no
bookmark breaks during migration.

**Terminology mapping** (label layer only; contract stays `chapters`/`verses`):

| Generic (data) | Gita | Bible | Quran | Upanishads |
| -------------- | ---- | ----- | ----- | ---------- |
| Work | Bhagavad Gita | Bible | Quran | Upanishads |
| Structure unit | Chapter | Book → Chapter | Surah | Upanishad → Khanda |
| Verse | Shloka | Verse | Ayah | Mantra |

---

## 9. Dashboard Wireframe (Platform Overview)

Calm, information-dense, action-oriented — Linear/Shopify home energy.

```
┌──────────────────────────────────────────────────────────────────────────┐
│ Breadcrumbs: Admin › Dashboard                        [⌘K]  [＋ New ▾] 👤 │
├──────────────────────────────────────────────────────────────────────────┤
│ Good morning, Ada. 3 items need your review.                               │
│                                                                            │
│ ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌────────────┐              │
│ │ Works      │ │ Verses     │ │ Languages  │ │ Coverage   │   ← StatCards │
│ │   12       │ │  418,209   │ │    9       │ │   63%      │     (trend ▲) │
│ └────────────┘ └────────────┘ └────────────┘ └────────────┘              │
│                                                                            │
│ ┌───────────────────────────────┐ ┌──────────────────────────────────┐   │
│ │ Needs attention               │ │ Publishing pipeline              │   │
│ │  • 4 in review (Quran, hi)    │ │  Draft 210 │ Review 34 │ Sched 12 │   │
│ │  • 7 AI suggestions to check  │ │  ▁▂▅▇  (mini funnel)             │   │
│ │  • 2 imports awaiting confirm │ │  [Open workflow board →]         │   │
│ │  [Review all →]               │ │                                  │   │
│ └───────────────────────────────┘ └──────────────────────────────────┘   │
│                                                                            │
│ ┌───────────────────────────────┐ ┌──────────────────────────────────┐   │
│ │ Recent activity (audit feed)  │ │ Corpora at a glance              │   │
│ │  Ada published bg.2.47  · 2m  │ │  Bhagavad Gita   100% ▇▇▇▇▇      │   │
│ │  Ravi imported Ramayana · 1h  │ │  Ramayana         42% ▇▇▁▁▁      │   │
│ │  AI tagged 320 verses   · 3h  │ │  Quran            18% ▇▁▁▁▁      │   │
│ │  [View full log →]            │ │  [All corpora →]                 │   │
│ └───────────────────────────────┘ └──────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────────────────┘
```

- **Today:** the four StatCards can bind to real counts derived from
  `GET /v1/works` and `GET /v1/chapters`; everything else renders **empty/zero
  states** until its API exists (matching the current honest-placeholder ethos).
- Each panel is an independent **Suspense boundary** (streamed, skeletoned).

---

## 10. Key Screen Wireframes

### 10.1 Corpus Overview (`/content/works/[work]`)

```
Admin › Content › Works › Bhagavad Gita
┌──────────────────────────────────────────────────────────────────┐
│ Bhagavad Gita   bg   ● Published            [Edit] [Export] [⋯]   │
│ 18 chapters · 700 verses · 3 languages · Coverage 100%           │
├───────────────┬──────────────────────────────────────────────────┤
│ Structure     │  Overview  Verses  Translations  Media  History   │
│  ▸ Ch 1 (47)  │  ┌────────────────────────────────────────────┐  │
│  ▸ Ch 2 (72)  │  │ Health: ✓ published  ✓ all verses  ⚠ hi 80% │  │
│  ▸ Ch 3 (43)  │  │ Recent edits · Assignees · Open reviews     │  │
│  … (lazy)     │  └────────────────────────────────────────────┘  │
└───────────────┴──────────────────────────────────────────────────┘
```

`TreeNav` lazy-loads chapter children on expand (never the full verse set).

### 10.2 Verse Editor (slide-over over the verse list)

```
┌ Verses (Ch 2) ───────────────┐┌ bg.2.47 ─────────────── ● Draft ─ ✕ ┐
│ □ 2.46  …                    ││ Original text (Sanskrit)             │
│ ▣ 2.47  कर्मण्येवाधिकार…      ││ [ कर्मण्येवाधिकारस्ते …            ] │
│ □ 2.48  …                    ││ Transliteration                      │
│ □ 2.49  …                    ││ [ karmaṇy-evādhikāras te …        ] │
│  ↕ virtualized (72 of 700)   ││ ── Translations ──────── + Add ───   │
│                              ││  en · Sivananda   ● Pub  [edit]      │
│                              ││  hi · Prabhupada  ○ Draft [edit]     │
│ [Bulk: Publish ▾] (3)        ││ ── Topics ──  duty ×  action ×  +     │
│                              ││ ── Emotions ──  clarity ×  +          │
│                              ││ Saved ✓ (autosave)   [Submit review] │
└──────────────────────────────┘└──────────────────────────────────────┘
```

- **Autosave** with `aria-live` "Saved" status; optimistic; conflict-safe.
- Topics/Emotions use `weight` (schema supports it) via a relevance slider.
- **Non-destructive:** "Original text" label is UI-only over `sanskritText`.

### 10.3 Translation Workbench + Coverage Matrix

```
Coverage: Bhagavad Gita                     Language ▾  Source ▾  [Only gaps]
        │ en/Sivananda │ hi/Prabhu │ ta/… │ ← languages × sources
  2.46  │     ✓        │    ✓      │  —   │
  2.47  │     ✓        │    ○draft │  —   │   ✓ published  ○ draft  — missing
  2.48  │     ✓        │    —      │  —   │
        [Assign gaps ▾]  [AI draft missing ▾]  [Export locale ▾]
```

- Matrix is **server-computed / paginated** — never client aggregation over 1M
  rows. Click a cell → side-by-side editor (original left, translation right,
  glossary hints).

### 10.4 Import Wizard (wraps `tooling/content-import`)

```
Step 1 Upload  →  Step 2 Validate (dry-run)  →  Step 3 Preview diff  →  Step 4 Commit  →  Report
   drop v1 JSON     schema + issues report        +adds / ~changes         confirm      summary + log
```

Mirrors the existing CLI pipeline (parse → validate → dry-run → import →
report), just as a governed UI with a human confirmation gate.

---

## 11. Component Inventory

Building **on** the existing primitives. **Keep/Evolve** = already present;
**New** = to design.

### 11.1 Shell & navigation
- **AppShell** *(evolve `AdminLayout`)* — sidebar + header + content region.
- **Sidebar / SidebarGroup / SidebarNavItem** *(evolve `AdminSidebarNav`)* —
  grouped, collapsible, badge-capable.
- **CorpusSwitcher** *(new)* — searchable work selector (⌘-openable).
- **CommandPalette** *(new)* — ⌘K global nav + actions + recent.
- **GlobalSearch** *(new)* — cross-corpus verse/work search (index-backed).
- **Breadcrumbs** *(keep `AdminBreadcrumbs`)* — scope-aware.
- **PageHeader** *(keep `AdminPageHeader`)* — title, description, primary action, tabs.

### 11.2 Data & lists (the scale layer)
- **ResourceTable** *(evolve `DataTablePlaceholder` → real)* — virtualized rows,
  column config, sort, row selection, sticky header, horizontal scroll.
- **FilterBar / FacetedFilters** *(evolve `AdminToolbar`)* — typed filters, chips.
- **SavedViews** *(new)* — named filter/sort presets per resource (Shopify-style).
- **Pagination / InfiniteLoader** *(new)* — cursor-based, "load more"/windowed.
- **BulkActionBar** *(new)* — appears on selection; publish/assign/tag/delete.
- **InlineEditCell** *(new)* — edit-in-place with optimistic save.
- **DataGridToolbar** *(new)* — density, column visibility, export.

### 11.3 Detail & editing
- **SlideOverPanel / DetailPeek** *(new)* — Notion-style side detail (verse, user…).
- **RecordEditor / FieldRow / FieldGroup** *(new)* — structured form scaffolding.
- **LocaleTabs** *(new)* — switch languages within a translation editor.
- **RelationPicker** *(new)* — attach topics/emotions/sources with weight slider.
- **TreeNav** *(new)* — lazy work→structure→verse tree.

### 11.4 Publishing & workflow
- **StatusBadge / PublishStatePill** *(new)* — draft/review/scheduled/published/archived.
- **WorkflowBoard (Kanban)** *(new)* — columns by state, drag to transition.
- **WorkflowStepper** *(new)* — linear review progression.
- **ReviewChecklist** *(new)* — gate items before publish.
- **SchedulePicker** *(new)* — date/time publish scheduling.

### 11.5 History & governance
- **VersionTimeline** *(new)* — chronological changes with actor.
- **DiffViewer** *(new)* — before/after field diffs; restore.
- **AuditLogList** *(new)* — filterable activity stream.

### 11.6 Media
- **MediaLibraryGrid** *(new)* — asset thumbnails, virtualized.
- **MediaUploader** *(new)* — drag-drop, progress, chunked.
- **AssetPicker** *(new)* — attach audio/image to verse/work.
- **AudioPreview** *(new)* — inline waveform/player.

### 11.7 AI
- **AIJobCard** *(new)* — run status, inputs, progress.
- **ModerationCard** *(new)* — suggestion + confidence + approve/reject.
- **ConfidenceMeter** *(new)* — visual score.
- **PromptConfigForm** *(new)* — model/prompt settings.

### 11.8 Feedback & states (mostly evolve)
- **EmptyState** *(keep)* — extended with variants (see §12).
- **ErrorState** *(new; generalize the chapters error block)* — retry-aware.
- **Skeletons** *(keep `TableSkeleton`/`StatSkeletonGrid`; add `EditorSkeleton`,
  `TreeSkeleton`, `MatrixSkeleton`)*.
- **Toast / NotificationCenter** *(new)* — save/publish/import results.
- **ConfirmDialog** *(new)* — destructive-action guard.
- **KeyboardShortcutSheet** *(new)* — discoverability for ⌘-actions.
- **StatCard** *(keep)* — add trend/delta slot.

---

## 12. Empty States (designed per surface)

Distinguish **five** empty-ish conditions — never one generic blank:

1. **First-run / no data yet** — "No works yet. Create your first corpus or
   import one." (primary + secondary action). *(evolve `EmptyState`)*
2. **Filtered → no results** — "No verses match these filters." + **Clear
   filters** (distinct from truly empty; avoids "is it broken?").
3. **Not started** — coverage cell / translation missing → "Not translated" with
   inline **Add** / **AI draft**.
4. **Permission-denied** — "You don't have access to this corpus. Ask an admin."
   (no primary action; role-aware).
5. **Error** — "Couldn't load verses. Retry." with correlation id (evolve the
   current chapters `role="alert"` block into shared `ErrorState`).

All empty states: centered icon tile, `h2` title, muted description, optional
action; dashed-border card for in-table variants (already the house style).

---

## 13. Loading States

- **Streaming RSC + Suspense per panel** — dashboard cards, activity, pipeline
  load independently (no single blocking spinner).
- **Skeletons** matched to final layout (rows, editor fields, tree, matrix) —
  extend existing skeleton set. Respect `prefers-reduced-motion` (no shimmer).
- **Optimistic mutations** — verse edits, publish toggles, tag adds apply
  instantly with rollback on failure + toast.
- **Progressive/long tasks** — imports and AI jobs show **determinate progress**
  (steps + %), not a spinner; resumable status on return.
- **Inline saving indicator** — "Saving… / Saved ✓ / Retry" with `aria-live`.
- **Deferred/virtualized loading** — verse lists and media grid fetch windows on
  scroll; tree fetches children on expand.

---

## 14. Mobile Considerations

Admin is **desktop/tablet-first**, but must be *usable* on phones (triage,
review, quick publish) — never a broken desktop table.

- **Navigation** — reuse the existing `AdminMobileNav` drawer; corpus switcher +
  command palette remain reachable; groups collapsible.
- **Tables → cards** — below `md`, `ResourceTable` renders a **stacked card
  list** (key fields + status) instead of horizontal-scroll columns.
- **Editor** — read-first on mobile; editing available but single-column,
  locale tabs stacked; slide-over becomes a full-screen sheet.
- **Bulk actions** — collapse into an overflow menu; selection via long-press.
- **Touch targets** ≥ 44×44px (matches design-system rule); sticky action bar at
  thumb reach.
- **Coverage matrix / board** — offered as scrollable but with a mobile
  "list of gaps" alternative (matrices are inherently wide).
- **Fluid from 320px**; no fixed-width traps.

---

## 15. Accessibility Considerations

Meets WCAG AA (per engineering standards) and adds CMS-specific concerns:

- **Semantic landmarks** — `nav`, `main`, `header`; one `h1` per page; correct
  heading order within panels.
- **Focus management** — slide-overs/dialogs trap focus, restore to trigger on
  close; skip-to-content link.
- **Keyboard-operable data grids** — roving `tabindex`, arrow-key cell nav,
  Enter to edit, Esc to cancel; all bulk/row actions reachable without a mouse.
- **Command palette** — full keyboard model; announced results.
- **Live regions** — autosave status, toasts, import/AI progress via
  `aria-live="polite"`; errors via `role="alert"` (already used).
- **Forms** — real `<label>`s, described-by for hints/errors, required/invalid
  states not by color alone.
- **Visible focus** — keep the existing global `:focus-visible` ring; never
  remove.
- **Contrast & motion** — AA contrast in both themes; honor
  `prefers-reduced-motion` (collapse transitions, no shimmer) — tokens already do
  this.
- **Status semantics** — publish-state pills convey state via text/icon, not hue
  only.

---

## 16. Permissions & Roles (model now, gate later)

No auth exists yet (planned P1), so this is **modeled in the UI** and enforced
when the backend lands — never faked as security.

**Roles (baseline):**

| Role | Can |
| ---- | --- |
| **Owner** | Everything incl. billing, roles, delete corpora |
| **Admin** | Manage content, people, settings; no billing |
| **Editor** | Create/edit/publish content within assigned corpora |
| **Translator** | Edit translations for assigned **languages** only |
| **Reviewer** | Approve/reject in review queue; comment; no publish |
| **Contributor** | Draft only; must submit for review |
| **Viewer** | Read-only |

**Scoping dimensions:** by **corpus** (Editor of Ramayana only) and by
**language** (Translator for `hi` only) — mirrors real editorial teams.

**UI implications:** role-aware sidebar (hide inaccessible groups), disabled +
explained actions ("Requires Editor"), permission-denied empty state,
server-side authorization is the source of truth (client checks are UX only).

---

## 17. Performance at 1M+ Verses

The single most important scaling constraint. Principles:

1. **Never fetch all verses.** All verse/translation surfaces are
   **server-paginated (cursor-based)** and filter-scoped. *(Requires a future
   paginated verses endpoint — logged as a backend contract need; today only
   works/chapters lists exist and are small.)*
2. **Virtualize long lists** (TanStack Virtual or equivalent) — render only the
   visible window for verse tables and media grids.
3. **Lazy tree expansion** — work→chapter loads counts; verses load per chapter
   on demand; nothing eager.
4. **Column projections** — request only displayed fields; detail on open.
5. **Avoid N+1** — leverage API's nested includes (chapters already embed `work`
   summary) rather than per-row fetches.
6. **Dedicated search index** — global verse search via Meilisearch (per roadmap
   P2), never SQL `LIKE` scans across millions of rows.
7. **Server-computed aggregates** — coverage %, counts, quality reports are
   materialized/paginated server-side, not client reductions.
8. **Caching layers** — RSC `revalidate` for stable reads; SWR/stale-while-
   revalidate for client tables; Redis on the API (roadmap P2) for hot content.
9. **Optimistic + batched writes** — bulk operations chunk requests and report
   partial success; UI stays responsive.
10. **Debounced autosave** and request cancellation on rapid navigation.

> These frontend patterns assume list/pagination/search contracts that **do not
> exist today**. They are documented as **required future API capabilities**;
> this proposal changes no current contract.

---

## 18. Workflows

### 18.1 Editorial workflow
`Draft → In Review → Approved → Scheduled → Published → Archived`

- Visualized on the **Workflow Board** (Kanban) and per-record **Stepper**.
- **Constraint:** the schema exposes only `isPublished` (boolean). The CMS models
  the full lifecycle in UI; states beyond draft/published need **future
  workflow-state persistence**. Until then it degrades to draft/published and
  the richer states are marked "pending backend."
- Review gate: `ReviewChecklist` (original present, ≥1 translation, topics
  tagged) before publish.

### 18.2 Translation workflow
- Coverage matrix identifies gaps → assign to a Translator (language-scoped).
- Side-by-side editor (original vs target) with **glossary** consistency hints.
- **AI-assisted first draft** → human review → publish (`Translation.isPublished`
  already exists, enabling **per-locale** publishing).
- Batch "AI-draft all gaps for `hi`" → lands in **moderation** queue.

### 18.3 Media management
- Central **Media Library** (audio recitations, images) with tradition/corpus
  tagging; attach to verse/work via `AssetPicker`.
- Chunked uploads, CDN delivery, alt-text required (a11y), audio waveform preview.
- **No media entity in schema today** → entirely **future backend**; UI designed
  now so it's drop-in.

### 18.4 AI moderation
- All AI output (translations, summaries, topic/emotion suggestions with
  `weight`) enters a **Moderation queue** — human-in-the-loop by default.
- `ModerationCard` shows suggestion + `ConfidenceMeter` + source; approve
  writes through normal content APIs, reject logs feedback.
- Thresholds/prompts configured in `/admin/ai/prompts`.

### 18.5 Import / Export
- **Import wizard** wraps the existing `tooling/content-import` v1 pipeline:
  upload → **dry-run validate** (issues report) → **diff preview** → confirm →
  report. Human gate before commit.
- **Export builder**: pick works/locales/sources → versioned JSON (round-trips
  with the importer schema).

### 18.6 Version history
- `VersionTimeline` + `DiffViewer` per verse/translation/work; restore a prior
  version; attribution per change.
- **No versioning tables in schema** → **future backend** (append-only revision
  store or audit table). UI + interaction designed now.

---

## 19. Suggested Page Hierarchy (route tree)

```
/admin
├── (overview) page.tsx                      Dashboard
├── content/
│   ├── page.tsx                             Content home
│   ├── works/
│   │   ├── page.tsx                         Works list
│   │   ├── new/                             Create work            [future]
│   │   └── [work]/
│   │       ├── page.tsx                     Corpus overview
│   │       ├── structure/                   Chapters tree (live ro)
│   │       ├── verses/                       Verse list + editor    [future]
│   │       └── history/                      Version history        [future]
│   ├── verses/                              Global verse explorer  [future]
│   ├── media/                               Media library          [future]
│   └── collections/                         Collections            [future]
├── publishing/  { page, review, scheduled, releases }              [future]
├── translations/ { page(workbench), coverage, glossary }          [future]
├── metadata/ { languages, sources, topics, emotions, tags }       [future*]
├── people/ { page(members), roles, invitations, activity }        [future]
├── insights/ { page, content, quality }                           [future]
├── ai/ { page, jobs, moderation, search-index, prompts }          [future]
└── settings/
    ├── page.tsx                             Workspace
    ├── import/  export/  api/                                      [future]
    ├── localization/                                               [future]
    └── appearance/                                                 [now]
```

Each `[future]` route ships **first as a designed empty/read-only state**, then
gains behavior when its contract exists — preserving the current honest-
placeholder philosophy at platform scale.

---

## 20. Future Roadmap (phased)

Aligned with `docs/Roadmap.md` (P0 foundation done; P1 accounts; P2 enrichment;
P3 intelligence). CMS-specific layering:

**Phase A — Restructure (frontend only, no new APIs)**
- Introduce grouped/scoped IA, sidebar groups, corpus switcher, command palette.
- Migrate current pages to new routes (+redirects); tradition-neutral labels.
- Evolve `DataTablePlaceholder` → `ResourceTable` (pagination/virtualization
  ready), `AdminToolbar` → `FilterBar`, shared `ErrorState`, extended empty/
  loading states.
- Redesigned dashboard bound to existing works/chapters reads.

**Phase B — Content operations (as write/list APIs land)**
- Verse list (paginated) + verse editor; topics/emotions tagging with weight.
- Metadata CRUD (languages, sources, topics, emotions).
- Import wizard over the existing content-import pipeline.

**Phase C — Publishing & translation**
- Workflow board, review queue, scheduling (needs workflow-state backend).
- Translation workbench + coverage matrix (per-locale publish already possible).
- Glossary.

**Phase D — People & governance**
- Auth/RBAC integration (P1 JWT), roles, invitations, audit log, version history.

**Phase E — Intelligence & media**
- AI jobs + moderation queue, embeddings/search index health (P2/P3).
- Media library + CDN + audio.
- Analytics (content performance, quality/coverage reports).

**Backend contracts this roadmap will eventually require** (logged for planning;
**not** part of this proposal): paginated/filterable verses & translations list
endpoints; workflow-state fields; media entity; revision/audit store; auth/RBAC;
search index. Each is a separate, approved backend change.

---

## 21. Open Questions / Decisions Needed

1. **Corpus-first vs resource-first default** — land on last-used corpus, or
   platform dashboard? (Proposed: platform dashboard, corpus switcher prominent.)
2. **Workflow depth** — is full `draft→review→scheduled→published→archived`
   wanted, or is draft/published enough for v1? (Drives backend scope.)
3. **`sanskritText` rename** — confirm a future schema evolution to
   `originalText` + `script`; until then, UI-label-only is the agreed approach.
4. **Multi-tenant?** — are there separate editorial teams/workspaces, or one
   shared platform with roles? (Affects switcher + billing.)
5. **Translation granularity** — publish per (verse × language × source), which
   the schema supports; confirm this is the editorial unit.
6. **Search backend timing** — global verse search depends on Meilisearch (P2);
   until then global explorer is scoped/paginated only.

---

## 22. Summary of Deliverables (index)

- **New sitemap** — §6
- **Information architecture** — §5 (seven pillars + corpus scoping)
- **Sidebar structure** — §7
- **Dashboard wireframe** — §9 (+ key screens §10)
- **Component inventory** — §11
- **Suggested page hierarchy** — §19
- **Future roadmap** — §20
- Plus: current-state analysis §2, constraints §3, migration map §8, empty §12 /
  loading §13 states, mobile §14, accessibility §15, permissions §16,
  performance §17, workflows §18.

**No code, schema, API, or `packages/types` changes are proposed for
implementation in this document.**
