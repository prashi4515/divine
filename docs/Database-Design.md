# Database Design

> Logical and physical database design for Divine — a multilingual Bhagavad Gita
> learning platform. This document is the source of truth for schema design.
> **No Prisma schema is defined here.** Implementation follows in a later phase.

**Status:** Design only. Neon is connected; zero tables exist by design.  
**Engine:** PostgreSQL 16+ (Neon)  
**Access:** NestJS → Prisma only (never from web/mobile clients)

---

## 1. Design Goals

| Goal | Implication |
| ---- | ----------- |
| Stable public URLs forever | Natural public IDs (`bg.2.47`), never auto-increment in URLs |
| Multilingual without duplication of verse identity | Locale/translation are dimensions on content, not separate verse rows |
| One API for web + Android + iOS + AI | Single relational model; clients share contracts |
| SEO-first content reads | Immutable-ish catalog tables, cache-friendly keys |
| User data isolated from catalog | Clear ownership: content vs identity vs engagement |
| Expand beyond Bhagavad Gita later | `works` table; Gita is the first work, not the schema |
| Search/AI without polluting source of truth | Postgres remains canonical; Meilisearch/vectors are derived indexes |

### Non-goals (this design)

- Sharding or multi-region write topology on day one.
- Storing audio binaries in Postgres (CDN/object storage only).
- Embedding LLM prompt history as unstructured blobs without structure.

---

## 2. Identity & Key Strategy

| Kind | Pattern | Example | Used for |
| ---- | ------- | ------- | -------- |
| Internal PK | UUID (`uuid`, gen_random_uuid()) | `a1b2c3…` | All tables; joins, FKs |
| Public content ID | `{work_code}.{chapter}.{verse}` | `bg.2.47` | URLs, deep links, API paths, SEO |
| Locale code | BCP-47 | `en`, `hi`, `ta`, `te`, `bn` | UI + content language |
| Translation source key | stable slug | `default`, `prabhupada`, `gandhi` | Which rendering within a locale |

**Rules**

- Internal UUID is never exposed in public URLs.
- Public IDs are immutable once published.
- Soft-delete user content where recovery matters; hard-delete catalog only via controlled ops.

---

## 3. Bounded Contexts (Logical Domains)

```
┌─────────────────┐   ┌──────────────────┐   ┌─────────────────┐
│  CONTENT CATALOG │   │  TAXONOMY        │   │  MEDIA          │
│  works, chapters │   │  topics,         │   │  audio_assets   │
│  verses,         │   │  emotions,       │   │                 │
│  translations,   │   │  join tables     │   │                 │
│  commentaries    │   │                  │   │                 │
└────────┬─────────┘   └────────┬─────────┘   └────────┬────────┘
         │                      │                      │
         └──────────────────────┼──────────────────────┘
                                │
┌─────────────────┐   ┌─────────┴────────┐   ┌─────────────────┐
│  IDENTITY       │   │  ENGAGEMENT      │   │  INTELLIGENCE   │
│  users,         │   │  bookmarks,      │   │  ai_chats,      │
│  auth_identities│   │  notes,          │   │  ai_messages,   │
│                 │   │  highlights,     │   │  search_history │
│                 │   │  reading_plans,  │   │                 │
│                 │   │  daily_verses    │   │                 │
└─────────────────┘   └──────────────────┘   └─────────────────┘
```

---

## 4. Entity Catalog

For each entity: **why it exists**, **key attributes**, **lifecycle**.

### 4.1 Content catalog

#### `works`

| | |
| --- | --- |
| **Why** | Allows Bhagavad Gita today and other scriptures later without schema rewrite. |
| **Key attrs** | `id` (UUID), `code` (unique, e.g. `bg`), `title`, `slug`, `sort_order`, `is_published`, timestamps |
| **Lifecycle** | Rarely written; curated by ops/content pipeline |

#### `chapters`

| | |
| --- | --- |
| **Why** | Structural unit of a work (Gita has 18). Locale-independent identity. |
| **Key attrs** | `id`, `work_id` (FK), `number` (1–18), `public_id` optional or derived (`bg.2`), `verse_count`, timestamps |
| **Lifecycle** | Immutable after publish; titles live in `chapter_localizations` |

#### `chapter_localizations`

| | |
| --- | --- |
| **Why** | Chapter titles/summaries differ by language without duplicating chapter rows. |
| **Key attrs** | `id`, `chapter_id`, `locale`, `title`, `summary` (nullable), unique `(chapter_id, locale)` |

#### `verses`

| | |
| --- | --- |
| **Why** | Atomic unit of scripture; stable identity for SEO, bookmarks, AI citations. |
| **Key attrs** | `id`, `chapter_id` (FK), `number`, `public_id` (`bg.2.47`, unique), `sanskrit_text` (source text, Devanagari), `transliteration` (IAST or similar, optional column or separate table — see §5), `sort_order`, timestamps |
| **Lifecycle** | Immutable after publish; corrections via versioned content ops |

> **Note on Sanskrit:** Keep one canonical Sanskrit + transliteration on `verses` (or a 1:1 `verse_source_texts` table if you need multiple scripts). Do **not** put Sanskrit in `translations` — translations are language renderings of meaning.

#### `translation_sources`

| | |
| --- | --- |
| **Why** | Multiple respected translations exist per language (e.g. several Hindi/English sources). Separates *who/what source* from *locale*. |
| **Key attrs** | `id`, `key` (unique slug), `display_name`, `author`, `license`, `is_default`, timestamps |

#### `translations`

| | |
| --- | --- |
| **Why** | Localized meaning of a verse for a given source. |
| **Key attrs** | `id`, `verse_id`, `locale`, `translation_source_id`, `text`, `is_published`, timestamps |
| **Uniqueness** | `(verse_id, locale, translation_source_id)` |

#### `commentaries`

| | |
| --- | --- |
| **Why** | Longer exegesis; optional; multi-author; powers AI grounding later. |
| **Key attrs** | `id`, `verse_id`, `locale`, `translation_source_id` (or `author_id`), `title` (nullable), `body`, `is_published`, timestamps |
| **Uniqueness** | Soft: allow multiple commentaries per verse/locale/source |

#### `authors` (optional early / required by P2)

| | |
| --- | --- |
| **Why** | Normalize translator/commentator identity across sources. |
| **Key attrs** | `id`, `slug`, `name`, `bio`, timestamps |

---

### 4.2 Taxonomy (topics & emotions)

#### `topics`

| | |
| --- | --- |
| **Why** | Thematic browsing (duty, devotion, mind, etc.) independent of chapter order. |
| **Key attrs** | `id`, `slug` (unique), `parent_id` (nullable, self-FK for hierarchy), `sort_order`, `is_published` |

#### `topic_localizations`

| | |
| --- | --- |
| **Why** | Topic labels/descriptions per locale. |
| **Key attrs** | `topic_id`, `locale`, `name`, `description`, unique `(topic_id, locale)` |

#### `verse_topics`

| | |
| --- | --- |
| **Why** | Many-to-many: one verse → many topics; one topic → many verses. |
| **Key attrs** | `verse_id`, `topic_id`, `weight` (optional ranking), unique `(verse_id, topic_id)` |

#### `emotions`

| | |
| --- | --- |
| **Why** | Emotion-based search (“anxiety”, “grief”, “clarity”) as a first-class catalog. |
| **Key attrs** | `id`, `slug` (unique), `sort_order`, `is_published` |

#### `emotion_localizations`

| | |
| --- | --- |
| **Why** | Emotion names differ by language. |
| **Key attrs** | `emotion_id`, `locale`, `name`, `description`, unique `(emotion_id, locale)` |

#### `verse_emotions`

| | |
| --- | --- |
| **Why** | Many-to-many mapping for emotion search; curated + later AI-assisted. |
| **Key attrs** | `verse_id`, `emotion_id`, `weight`, unique `(verse_id, emotion_id)` |

---

### 4.3 Media

#### `audio_assets`

| | |
| --- | --- |
| **Why** | Metadata only; binary lives on CDN/object storage. Supports verse-level (and later chapter) audio. |
| **Key attrs** | `id`, `verse_id` (nullable if chapter-level later), `locale` (nullable), `kind` (`recitation` \| `explanation` \| …), `storage_key` / `cdn_url`, `duration_ms`, `mime_type`, `checksum`, `is_published`, timestamps |
| **Rule** | Never store file bytes in Postgres |

---

### 4.4 Identity

#### `users`

| | |
| --- | --- |
| **Why** | Account root for bookmarks, notes, plans, AI chat, search history. |
| **Key attrs** | `id`, `email` (unique, nullable if phone-only later), `email_verified_at`, `display_name`, `preferred_locale`, `preferred_translation_source_id` (nullable FK), `status` (`active` \| `disabled`), timestamps |
| **Lifecycle** | Soft-disable preferred over hard delete when legal retention applies |

#### `auth_identities`

| | |
| --- | --- |
| **Why** | Supports password + Google OAuth (and future providers) without polluting `users`. |
| **Key attrs** | `id`, `user_id`, `provider` (`password` \| `google` \| …), `provider_subject` (unique per provider), `password_hash` (nullable), timestamps |
| **Uniqueness** | `(provider, provider_subject)` |

> Auth tokens (JWT refresh) may live in `refresh_tokens` later — not required for content design.

#### `refresh_tokens` (P1)

| | |
| --- | --- |
| **Why** | Rotate/revoke sessions for web + mobile. |
| **Key attrs** | `id`, `user_id`, `token_hash`, `expires_at`, `revoked_at`, `user_agent`, `ip` (careful with PII policy) |

---

### 4.5 Engagement

#### `bookmarks`

| | |
| --- | --- |
| **Why** | User saves a verse for later; cross-device sync. |
| **Key attrs** | `id`, `user_id`, `verse_id`, `created_at` |
| **Uniqueness** | `(user_id, verse_id)` |

#### `notes`

| | |
| --- | --- |
| **Why** | Free-form user reflection attached to a verse. |
| **Key attrs** | `id`, `user_id`, `verse_id`, `body`, `created_at`, `updated_at` |
| **Cardinality** | One user may have many notes per verse (or enforce one — product choice; default: **many**) |

#### `highlights`

| | |
| --- | --- |
| **Why** | Span-level annotation on a specific translation text (not just whole verse). |
| **Key attrs** | `id`, `user_id`, `verse_id`, `translation_id` (FK — which text was highlighted), `start_offset`, `end_offset`, `color` (optional), `created_at` |
| **Why `translation_id`** | Offsets only make sense against a specific string; Sanskrit vs English lengths differ |

#### `reading_plans`

| | |
| --- | --- |
| **Why** | Curated or user-created multi-day journeys through verses. |
| **Key attrs** | `id`, `owner_user_id` (nullable for system plans), `slug` (nullable for system), `kind` (`system` \| `user`), `title`, `description`, `duration_days`, `is_published`, timestamps |

#### `reading_plan_items`

| | |
| --- | --- |
| **Why** | Ordered steps in a plan (day N → verse or chapter range). |
| **Key attrs** | `id`, `reading_plan_id`, `day_number`, `verse_id` (nullable), `chapter_id` (nullable), `sort_order`, check: at least one target |

#### `reading_plan_enrollments`

| | |
| --- | --- |
| **Why** | User subscribed to a plan; separates catalog plan from personal progress. |
| **Key attrs** | `id`, `user_id`, `reading_plan_id`, `started_at`, `completed_at`, `status`, unique `(user_id, reading_plan_id)` |

#### `reading_plan_progress`

| | |
| --- | --- |
| **Why** | Per-item completion for an enrollment. |
| **Key attrs** | `id`, `enrollment_id`, `reading_plan_item_id`, `completed_at`, unique `(enrollment_id, reading_plan_item_id)` |

#### `daily_verses`

| | |
| --- | --- |
| **Why** | Editorial calendar: which verse is featured on which date (global and/or per locale). |
| **Key attrs** | `id`, `verse_id`, `locale` (nullable = all locales), `feature_date` (date), `note` (nullable editorial blurb), unique `(feature_date, locale)` |

---

### 4.6 Intelligence & discovery

#### `search_history`

| | |
| --- | --- |
| **Why** | Improve UX (“recent searches”), analytics, and later personalization; optional auth. |
| **Key attrs** | `id`, `user_id` (nullable for anonymous if product allows), `query`, `locale`, `filters` (JSONB: emotion, topic), `result_count`, `created_at` |
| **Privacy** | Retention policy required; purge job; never log secrets |

#### `ai_chats`

| | |
| --- | --- |
| **Why** | Conversation container for AI Guru sessions. |
| **Key attrs** | `id`, `user_id`, `title` (nullable/auto), `locale`, `status`, `created_at`, `updated_at` |

#### `ai_messages`

| | |
| --- | --- |
| **Why** | Ordered turns; store citations as structured data for grounding/audit. |
| **Key attrs** | `id`, `chat_id`, `role` (`user` \| `assistant` \| `system`), `content`, `cited_verse_ids` (UUID[] or join table `ai_message_citations`), `model` (nullable), `token_usage` (nullable JSONB), `created_at` |

#### `ai_message_citations` (preferred over array-only)

| | |
| --- | --- |
| **Why** | First-class FK integrity from AI answers → verses. |
| **Key attrs** | `message_id`, `verse_id`, `rank`, unique `(message_id, verse_id)` |

---

## 5. Relationships (ER Summary)

### Content

```
works 1──* chapters 1──* verses
verses 1──* translations *──1 translation_sources
verses 1──* commentaries
chapters 1──* chapter_localizations
```

### Taxonomy

```
topics 1──* topic_localizations
emotions 1──* emotion_localizations
verses *──* topics      via verse_topics
verses *──* emotions    via verse_emotions
topics may self-reference (parent_id) for hierarchy
```

### Media

```
verses 1──* audio_assets
```

### Identity & engagement

```
users 1──* auth_identities
users 1──* bookmarks *──1 verses
users 1──* notes *──1 verses
users 1──* highlights *──1 verses
highlights *──1 translations
users 1──* reading_plan_enrollments *──1 reading_plans
reading_plans 1──* reading_plan_items
reading_plan_enrollments 1──* reading_plan_progress *──1 reading_plan_items
daily_verses *──1 verses
```

### Intelligence

```
users 1──* search_history
users 1──* ai_chats 1──* ai_messages
ai_messages *──* verses via ai_message_citations
```

### Cardinality decisions (locked for v1)

| Relationship | Cardinality | Rationale |
| ------------ | ----------- | --------- |
| Verse → Translations | 1:N | Many locales/sources |
| User → Bookmark → Verse | N:1 unique pair | One bookmark per verse per user |
| User → Notes → Verse | 1:N | Multiple reflections over time |
| Highlight → Translation | N:1 | Offsets bound to one text |
| Plan → Items | 1:N | Ordered curriculum |
| User → Plan | N:M via enrollment | Shared system plans |

---

## 6. Normalization Design

### Target form

- **3NF** for transactional/user data (users, notes, bookmarks, plans, AI chats).
- **Catalog content** also 3NF, with controlled denormalization only where read path demands it.

### What we normalize

| Concern | Approach |
| ------- | -------- |
| Locale-specific labels | Separate `*_localizations` tables — not columns like `title_en`, `title_hi` |
| Translation vs locale | `locale` + `translation_source_id` — never collapse into one field |
| Topics/emotions | Junction tables — not CSV columns on `verses` |
| Auth providers | `auth_identities` — not `google_id` columns on `users` |
| Plan progress | Enrollment + progress rows — not JSON blob of completion state |

### Controlled denormalization (allowed later)

| Denorm | When | Why |
| ------ | ---- | --- |
| `chapters.verse_count` | After content import | Avoid COUNT(*) on hot chapter pages |
| Cached “default translation” id on verse | If profiling shows join cost | Always regenerable from `translations` |
| Search documents in Meilisearch | P2 | Derived index; Postgres remains source of truth |

### JSONB usage (narrow)

Allowed for:

- `search_history.filters`
- `ai_messages.token_usage` / provider metadata

**Not** allowed for:

- Core verse text collections
- Topic/emotion membership
- Reading plan structure

---

## 7. Index Design

### Principles

1. Index for **actual query paths** (public ID lookup, user×verse, date×locale).
2. Unique indexes enforce **business rules**.
3. Prefer composite indexes matching `WHERE` + `ORDER BY` left-prefix rules.
4. Avoid indexing every FK blindly — add when query plans demand.

### Required unique indexes

| Table | Unique index | Purpose |
| ----- | ------------ | ------- |
| `works` | `(code)` | Stable work codes |
| `chapters` | `(work_id, number)` | One chapter N per work |
| `verses` | `(public_id)` | SEO/API lookup |
| `verses` | `(chapter_id, number)` | Natural ordering |
| `translations` | `(verse_id, locale, translation_source_id)` | No duplicate renderings |
| `chapter_localizations` | `(chapter_id, locale)` | |
| `topic_localizations` | `(topic_id, locale)` | |
| `emotion_localizations` | `(emotion_id, locale)` | |
| `verse_topics` | `(verse_id, topic_id)` | |
| `verse_emotions` | `(verse_id, emotion_id)` | |
| `users` | `(email)` WHERE email IS NOT NULL | |
| `auth_identities` | `(provider, provider_subject)` | |
| `bookmarks` | `(user_id, verse_id)` | |
| `daily_verses` | `(feature_date, locale)` | One feature per day/locale |
| `reading_plan_enrollments` | `(user_id, reading_plan_id)` | |
| `reading_plan_progress` | `(enrollment_id, reading_plan_item_id)` | |

### Required lookup / list indexes

| Table | Index | Query |
| ----- | ----- | ----- |
| `verses` | `(chapter_id, sort_order)` | Chapter reader |
| `translations` | `(locale, translation_source_id)` | Bulk by language/source |
| `translations` | `(verse_id)` | Already covered by unique prefix |
| `commentaries` | `(verse_id, locale)` | Verse page |
| `audio_assets` | `(verse_id, locale, kind)` | Player |
| `bookmarks` | `(user_id, created_at DESC)` | User library |
| `notes` | `(user_id, updated_at DESC)` | |
| `notes` | `(user_id, verse_id)` | Notes on verse |
| `highlights` | `(user_id, verse_id)` | |
| `daily_verses` | `(feature_date)` | Home “verse of the day” |
| `search_history` | `(user_id, created_at DESC)` | Recent searches |
| `ai_chats` | `(user_id, updated_at DESC)` | Chat list |
| `ai_messages` | `(chat_id, created_at)` | Thread load |
| `topics` | `(slug)` | Topic pages |
| `emotions` | `(slug)` | Emotion pages |
| `verse_topics` | `(topic_id, verse_id)` | Topic → verses |
| `verse_emotions` | `(emotion_id, verse_id)` | Emotion → verses |

### Full-text (Postgres, interim)

Before Meilisearch:

- Optional `tsvector` generated column on `translations.text` + GIN index for basic search.
- Emotion/topic filters still use junction tables.

When Meilisearch lands: keep Postgres FTS optional or drop; **do not** make Meilisearch the source of truth.

### Partial indexes (examples)

- `translations (verse_id) WHERE is_published = true`
- `users (email) WHERE status = 'active'` (if helpful)

---

## 8. Scalability Strategy

### Traffic classes vs data

| Class | Tables | Scale approach |
| ----- | ------ | -------------- |
| Anonymous content reads | works…translations, topics, emotions | ISR/CDN first; Redis cache of verse payloads; DB read replica later |
| Taxonomy browse | verse_topics, verse_emotions | Junction indexes; denorm counts later |
| User writes | bookmarks, notes, highlights | Primary Neon; low volume vs content; connection pooling |
| Daily verse | daily_verses | Tiny table; cache by date+locale |
| Search | search_history + Meilisearch | History append-only with retention; search offloaded |
| AI | ai_chats, ai_messages | Append-heavy; partition by time later if needed; rate-limit at API |

### Connection & Neon

- Runtime: **pooled** URL (`DIVINE_DATABASE_URL`).
- Migrations: **direct** URL (`DIVINE_DIRECT_URL`).
- Keep API instances **stateless**; no in-memory session store.

### Growth ladder (aligned with architecture)

1. **S0:** Single Neon primary, ISR, no Redis — current target.
2. **S1:** Redis for hot verse JSON; PgBouncer already via Neon pooler.
3. **S2:** Read replica for content SELECTs; Meilisearch HA.
4. **S3:** Partition `ai_messages` / `search_history` by month; extract AI workers; still one logical content DB.

### What we will not do early

- Shard by user_id.
- Separate microservice DB per domain.
- Store vectors in the primary OLTP tables without a clear product need (use dedicated vector store or pgvector extension later as an **additive** decision).

---

## 9. Future Expansion

| Expansion | How the design absorbs it |
| --------- | ------------------------- |
| More scriptures | New `works` rows; same chapter/verse pattern |
| More languages | New locale rows in localizations + translations — no ALTER for each language |
| New translation sources | New `translation_sources` + translations rows |
| Hierarchical topics | `topics.parent_id` already planned |
| Chapter-level audio | `audio_assets.chapter_id` nullable FK (additive) |
| Social / share cards | Derived from `verses.public_id` + translation; no schema change |
| Offline mobile sync | `updated_at` on user tables + sync cursors table later |
| Content versioning | Add `content_revisions` or `published_at` / `supersedes_id` without changing public_id |
| Moderation | `reports` table referencing note/highlight/message |
| Organizations / teachers | `organizations`, `memberships` — new context, FKs to plans/content |
| pgvector embeddings | Side table `verse_embeddings (verse_id, model, vector)` — does not alter verse identity |

### Explicitly deferred tables (document, don’t invent early)

- `notifications`, `subscriptions`/`billing`, `feature_flags` (env/config first), `admin_audit_log` (add with admin).

---

## 10. Implementation Phasing (schema rollout)

| Phase | Tables to introduce | Notes |
| ----- | ------------------- | ----- |
| **P0** | `works`, `chapters`, `chapter_localizations`, `verses`, `translation_sources`, `translations` | Minimum readable Gita |
| **P0.5** | `topics*`, `emotions*`, junctions | Browse/search prep |
| **P1** | `users`, `auth_identities`, `refresh_tokens`, `bookmarks`, `notes`, `reading_plans*` | Accounts |
| **P1.5** | `highlights`, `daily_verses` | Engagement polish |
| **P2** | `audio_assets`, `commentaries`, `search_history` | Media + search |
| **P3** | `ai_chats`, `ai_messages`, `ai_message_citations` | AI Guru |

No Prisma models until P0 schema is approved for implementation.

---

## 11. Integrity & Operational Rules

- **FK ON DELETE:** Restrict on catalog parents (cannot delete chapter with verses); Cascade on user-owned children (delete user → delete bookmarks) *or* soft-delete user and retain per legal policy — decide at P1.
- **Publish flags:** `is_published` on content; APIs filter unpublished for public clients.
- **Migrations:** expand/contract; never rewrite applied migration history.
- **Content import:** via `tooling/content-import`, not hand SQL in production.
- **PII:** email, IP, search queries — minimize logging; retention jobs for `search_history` and AI transcripts.

---

## 12. Open Product Decisions (resolve before Prisma)

1. **Notes:** many per user×verse (recommended) vs one?
2. **Anonymous search history:** store or only authenticated?
3. **Daily verse:** global calendar vs per-locale calendars? (schema supports both via nullable `locale`)
4. **Transliteration:** column on `verses` vs separate table for multiple schemes (IAST, Harvard-Kyoto)?
5. **Highlights:** character offsets vs word indices (mobile clients may prefer word indices)?

---

## 13. References

- [Database](./Database.md) — connection, Neon dual URL, migration commands
- [Architecture](./Architecture.md) — system topology
- [API](./API.md) — resource naming that must match `public_id`
- [Roadmap](./Roadmap.md) — phase alignment
- Engineering standards: stable `bg.chapter.verse` IDs; UUID internal PKs; only `apps/api` touches the DB

---

## Document control

| | |
| --- | --- |
| Version | 1.0 (design) |
| Prisma schema | **Not generated** |
| Tables in Neon | **Zero** (expected until first migration) |
