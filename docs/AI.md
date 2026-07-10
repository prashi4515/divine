# AI

> AI Guru and emotion-based search — intelligence features for the Divine
> platform. These are later-phase capabilities (P2–P3).

## 1. Overview

- **AI Guru:** conversational guidance grounded in the Gita and its commentaries.
- **Emotion-based search:** find verses by feeling/intent, not just keywords.
- **Status:** _not implemented; design phase._

## 2. Goals & Non-Goals

- **Goals:** faithful, source-grounded answers; multilingual; safe.
- **Non-Goals:** speculative theology, ungrounded generation, medical/legal advice.
- _TODO — refine guardrails and scope._

## 3. AI Guru Architecture

- Pattern: retrieval-augmented generation (RAG) over the verse/commentary corpus.
- Facade lives behind the NestJS API (centralized prompts, rate limits, auditing).
- _TODO — component diagram (retriever, ranker, LLM, cache)._

## 4. Retrieval & Indexing

- Source of truth: PostgreSQL content.
- Vector/keyword index: _TODO — choose embedding + store._
- _TODO — chunking strategy for verses/commentaries._

## 5. Emotion-Based Search

- Emotion tags as a catalog + search dimension.
- Powered by Meilisearch (+ tags) with AI-assisted mapping.
- _TODO — emotion taxonomy and mapping approach._

## 6. Prompting & Grounding

- System prompts enforce citation of source verses.
- _TODO — prompt templates and citation format._

## 7. Model Strategy

- _TODO — provider/model selection, fallbacks, cost controls._
- Config via env (`DIVINE_AI_API_KEY`, planned).

## 8. Safety, Abuse & Rate Limiting

- Queue + rate limits; identical-prompt caching.
- AI must never block the content API.
- _TODO — moderation and abuse-prevention plan._

## 9. Evaluation

- _TODO — quality metrics, groundedness checks, human review._

## 10. Privacy

- _TODO — data retention, user query handling, opt-outs._

## References

- See [Architecture](./Architecture.md), [Database](./Database.md), [Roadmap](./Roadmap.md).
