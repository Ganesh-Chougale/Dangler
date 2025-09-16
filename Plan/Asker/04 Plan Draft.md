## Phase 1 — Project skeleton & core infra (MVP foundation)

Goal: repo, infra, DB, auth basics, and dev workflow.

* 1.1 Init Next.js (app router) + Tailwind + basic theme.
* 1.2 Node + Express skeleton for API; `.env` for secrets.
* 1.3 MySQL connection (Prisma or Sequelize optional) + migrate basic schema.
* 1.4 Git repo, initial commit, CI stub (lint/test).
* 1.5 Minimal `users` table + auth scaffold (register/login endpoints, bcrypt + JWT).
* Deliverable: Full dev-ready repo with auth and DB connection.

---

## Phase 2 — Reusable date UX + core data models

Goal: solid date handling and core DB tables so everything else plugs in.

* 2.1 Implement reusable `DateInput` React component:

  * AD/BC toggle (era → sign year), Single vs Range, day/month/year inputs, client-side validation (leap years), parse `-` or `/`. Emits normalized `{year,month,day,precision,range_end...}`.
* 2.2 DB models: Entities (Individuals/Entries), Events (knots), Tags, Media, Lifespans, Reports. Add `days_from_epoch` computed field.
* 2.3 Seed dummy data + test parsing + API validation.
* Deliverable: `DateInput` component + backend date parsing + core tables with sample data.

---

## Phase 3 — CRUD: Entities & Events + forms

Goal: create/read/update/delete for entities/events using the shared DateInput.

* 3.1 CRUD APIs: entities, events (normalize date server-side).
* 3.2 Frontend forms: `IndividualForm`, `EventForm` refactored to use `DateInput`.
* 3.3 Event creation modal on individual page (no navigation away).
* 3.4 Input validation & consistent error handling.
* Deliverable: create/edit individuals and events from UI using `DateInput`.

---

## Phase 4 — Individual profile + Visx timeline (core UX)

Goal: fully-working profile page with Visx timeline, zoom, tags and modal.

* 4.1 Complete `/individuals/[id]/page.tsx`:

  * Fetch entity + nested events (including `days_from_epoch`).
  * Compute min/max numeric years to set Visx `scaleTime` domain (support negative years).
  * Integrate Visx vertical rope: knots rendered per event; style by precision/range.
  * Add Visx `Zoom` for zoom/pan.
* 4.2 Integrate `TagSelector` on profile (add/remove tags).
* 4.3 "Add Event" button opens `EventForm` modal (Framer Motion).
* 4.4 Tooltip/modal to show event details + media lazy-load.
* Deliverable: polished Individual page with interactive timeline and event modal.

---

## Phase 5 — Tagging system & moderation

Goal: tag creation, suggestions, inclusion/exclusion search controls, moderation flow.

* 5.1 DB: `tags`, `tag_types`, `entity_tags` (M\:N).
* 5.2 APIs: create/tag/suggest/tag search; tag attach/detach.
* 5.3 Frontend: TagSelector, TagSearch input, tag chips with +/− semantics.
* 5.4 Moderation: report endpoint, review UI (basic).
* Deliverable: full tag pipeline (create, suggest, attach, moderate, filter).

---

## Phase 6 — Search page & robust backend search

Goal: single efficient search API + UX to discover individuals with tag filters.

* 6.1 `/search/page.tsx`: keyword input + TagSearch integration; results grid of `IndividualCard`.
* 6.2 Backend `/api/search` accepts `q`, `include_tags[]`, `exclude_tags[]`, `categories`.

  * Single API call returns paginated results.
* 6.3 Test performance; add full-text or move to OpenSearch if needed.
* Deliverable: integrated search page with inclusion/exclusion chips.

---

## Phase 7 — Comparison mode (core differentiator)

Goal: fetch multiple individuals and render synchronized vertical ropes.

* 7.1 New page `/compare` — search-bar to add ≥2 individuals to compare list.
* 7.2 Backend: optimized `GET /api/compare?ids=1,2,3` returning entities + all events + global min/max `days_from_epoch`.
* 7.3 Frontend:

  * Render side-by-side Visx ropes using shared `y`-scale (global date range).
  * Highlight overlaps (compute using earliest/latest bounds).
  * Options: Align by calendar (default) or normalize by birth (alternate view).
  * Zoom/pan synchronized across timelines.
* Deliverable: synchronize timelines, overlapping highlights, single optimized API call.

---

## Phase 8 — Social & user features

Goal: profiles, favorites, comments, contribution tracking.

* 8.1 User profile page: contributions, created entries/events.
* 8.2 Favorites / like endpoints + frontend list.
* 8.3 Comment system for events/entries with moderation endpoints.
* Deliverable: social layer with moderation hooks.

---

## Phase 9 — UI polish & animations

Goal: UX feel — animations, mobile, themes.

* 9.1 Framer Motion for rope growth, knot hover, modals.
* 9.2 Dark/light toggle; responsive breakpoints for mobile/tablet.
* 9.3 Micro-interactions (tooltips, button states).
* Deliverable: polished, responsive UI.

---

## Phase 10 — Performance, testing & deployment

Goal: make it reliable and production-ready.

* 10.1 Optimize queries (precompute bounds, index `days_from_epoch`, tag counts).
* 10.2 Add caching layer (Redis) where needed.
* 10.3 Pagination for lists; lazy-loading media + CDN.
* 10.4 Full test suite (unit + integration): search, compare, auth, tags, date parsing (including BCE).
* 10.5 Deploy: Frontend → Vercel, Backend → Railway/Heroku; DB in managed MySQL; CI/CD + env var management.
* Deliverable: production deployment + monitoring.

---

## Phase 11 — Extras & future improvements (post-MVP)

* Auto-suggest coexisting people (fast query using bounds).
* Conflict detection (impossible dates).
* Export timelines (CSV/JSON).
* Advanced calendar support (Julian vs proleptic Gregorian) toggle for scholars.
* Move search to OpenSearch for scale + fuzzy matching.

---