# CarterPCs Portfolio — Website Architecture Specification

> Source of truth for the interactive portfolio website structure, narrative sequencing, layout mechanics, motion systems, and technical specifications.
> Derived strictly from PROJECT.md, DESIGN.md, CONTENT.md, and RESEARCH.md.

> **Reverification notice:** Any CarterPCs-specific statistic, date, milestone, or platform metric referenced below (as design rationale or as placeholder UI copy) is sourced from `RESEARCH.md` and carries that document's standing warning — it must be reverified before public release. This document does not introduce any new factual claims about CarterPCs.

---

## Global Navigation

The site is a single continuous scroll experience, not a multi-page app with a traditional navbar — consistent with PROJECT.md's "storytelling over dashboards" philosophy and DESIGN.md's instruction to avoid repetitive, dashboard-like UI chrome.

- **Wordmark, top-left, fixed:** Small, static "CARTERPCs" mark. Low visual weight — the section content carries the hierarchy, not the chrome.
- **Section index, right edge, fixed (desktop only):** A vertical stack of numbered markers (01–11) reflecting DESIGN.md's "large section numbering" typography direction. The active section's number is emphasized; others recede. Clicking a marker smooth-scrolls to that section. This doubles as a scroll-progress indicator.
- **Menu overlay:** A single icon (top-right) opens a full-screen overlay listing all 11 sections by name, for direct jump navigation. Uses the same kinetic-typography language as the rest of the site (see Global Motion System) rather than a generic slide-in drawer.
- **No sticky utility navbar, no dropdowns, no multi-level menus** — these read as SaaS-dashboard patterns explicitly ruled out in PROJECT.md.
- **Mobile:** the fixed index collapses to a single slim progress bar (top of viewport); the menu overlay remains the only jump-navigation mechanism.

---

## Global Visual System

### Color

DESIGN.md specifies a restrained, editorial base palette (black, off-white, charcoal, soft gray) with a single subtle accent, and explicitly says "avoid excessive RGB." RESEARCH.md documents CarterPCs' own on-camera studio identity as a vibrant neon cyan/purple/amber palette. Per the project's design constraints, these are reconciled as **base vs. accent**, not blended as equals:

| Role | Value | Source |
| :--- | :--- | :--- |
| Base — background | Near-black (`#0D0D0D`–`#111111` range) | DESIGN.md ("black"), consistent with RESEARCH.md's observed studio backdrop |
| Base — surface | Charcoal / dark slate | DESIGN.md ("charcoal") |
| Base — text | Off-white / soft gray | DESIGN.md |
| Accent — primary | Restrained Electric Cyan (desaturated/dimmed from RESEARCH.md's `#00E5FF`) | RESEARCH.md §4 Visual Identity, used sparingly per DESIGN.md's "subtle electric blue or another restrained tech accent" |
| Accent — secondary | Restrained Deep Purple (desaturated/dimmed from RESEARCH.md's `#9D00FF`) | RESEARCH.md §4, used sparingly |

Accents are reserved for: interactive states (hover/focus/cursor), section-index highlighting, key data callouts, and hardware-glow effects during the Hardware Experience section. They must never dominate a full viewport the way they do in CarterPCs' own thumbnails/studio lighting — that treatment is explicitly what DESIGN.md and the "excessive RGB/neon gaming website" exclusion warn against. Exact hex values are a design decision for implementation and should be finalized against real accessibility contrast checks, not treated as verified brand colors.

### Typography

- Oversized, editorial display type for headlines (DESIGN.md), heavy/geometric sans-serif in the spirit of the weights RESEARCH.md documents in Carter's own caption style (thick, high-contrast) — applied to site headings, not captions.
- Minimal body copy; body text is secondary to typographic composition, per DESIGN.md.
- Large numeric section markers (e.g., "01", "02") as a recurring typographic motif, tying Global Navigation, Section Specifications, and the Page Flow together visually.

### Layout

Full-screen sections, asymmetric compositions, generous whitespace, layered/overlapping type over imagery, occasional horizontal scroll where it serves a specific section (not as a default pattern). Card grids are avoided as a primary layout device — where multiple content items must be shown side-by-side (e.g., Selected Videos), they are presented as large editorial entries, not uniform dashboard cards (CONTENT.md's "Featured Content" example structure — numbered entries with headline pairs — is the reference pattern).

---

## Global Motion System

Built on GSAP + ScrollTrigger (PROJECT.md's technical direction). Motion principles:

- **Scroll-triggered reveals** as the default entrance pattern for text and imagery — content commits to the frame as it enters view, not before.
- **Kinetic typography** for headlines and key stats: word-by-word or character-level reveal, echoing the caption energy RESEARCH.md documents in Carter's videos, but paced for a cinematic site rather than short-form video. See "Pacing philosophy" below — this is a deliberate, important divergence from Carter's own editing cadence.
- **Text masking, image scale/parallax, section transitions, magnetic buttons, hover distortion, subtle depth (parallax layers)** — all per DESIGN.md's Motion Design list.
- **Horizontal scroll sequences** reserved for sections where a linear "unrolling" narrative benefits from it (candidates: Hardware Experience's component breakdown, Creator Journey's timeline) — not used as a global scroll axis.
- **Reduced-motion mode:** every animated pattern above must have a static or near-static fallback (opacity/position only, no parallax/masking) triggered by `prefers-reduced-motion` and reused for the mobile performance profile (see Responsive Strategy).

### Pacing philosophy

RESEARCH.md documents CarterPCs' own content as ultra-rapid (1.5–2.5 cuts per 5 seconds, zero dead air). This is **subject-matter reference, not a motion-pacing template.** PROJECT.md and DESIGN.md both call for a cinematic, premium, intentional feel with "sophisticated transitions" — the opposite pacing register from short-form TikTok editing. The architecture treats Carter's rapid-fire energy as something the site *depicts* (through footage, captions-as-motif, hardware quick-cuts inside the Featured Content and Selected Videos sections) rather than something the site's own scroll motion *performs*. Global transitions stay deliberate and unhurried; localized moments (e.g., a video preview loop, a caption-style callout) may borrow the faster rhythm as a contained motif.

---

## Custom Cursor

Per DESIGN.md's "custom cursor interactions." States:

| State | Trigger | Behavior |
| :--- | :--- | :--- |
| Default | Idle | Minimal dot/ring, low-opacity accent color |
| Link hover | Any interactive text/link | Expands, magnetic pull toward the element |
| Video hover | Featured/Selected video thumbnails | Morphs into a "play" affordance |
| Hardware hover | Hardware Experience components | Morphs into a small crosshair/spec-callout affordance |
| Horizontal-scroll zone | Inside a horizontal scroll sequence | Rotates into a left/right drag indicator |
| Drag/press | Active interaction | Compresses slightly for tactile feedback |

Disabled entirely on touch devices (see Responsive Strategy) — replaced by native touch affordances, never simulated.

---

## Responsive Strategy

DESIGN.md is explicit: mobile must not be a shrunk desktop layout. Strategy:

- **Breakpoint philosophy:** design mobile as its own composition per section (stacked, single-column, larger touch targets) rather than reflowing the desktop asymmetric grid.
- **Cursor → touch:** all custom-cursor affordances are replaced by direct tap/hold feedback (scale/opacity pulses on the element itself).
- **Horizontal scroll sequences:** re-authored as vertical stacks or swipeable carousels with explicit swipe affordances, not a horizontally-scrollable overflow of the desktop layout.
- **Motion budget:** parallax layer count and simultaneous animation count are reduced on mobile for performance; kinetic typography degrades to simpler fade/slide reveals where needed.
- **Reduced motion:** same fallback system as Global Motion System, additionally auto-engaged below a performance threshold (low-end device heuristics), not only via explicit OS preference.

---

## Asset Requirements

All CarterPCs-sourced media (footage, thumbnails, photography) is subject to PROJECT.md's Legal / Attribution requirement — properly attributed or used only where legally appropriate — before inclusion. Required asset categories:

- **Hero:** a short looping cinematic clip or high-impact still representing CarterPCs' content world (placeholder until sourced/cleared).
- **Hardware photography/renders:** exploded PC view, GPU close-up, motherboard detail, CPU, cooling, RAM, storage, complete build — per DESIGN.md's Hardware Presentation list. Real product photography preferred; 3D renders acceptable where photography is unavailable, flagged separately from photographed assets.
- **Video content:** clips/thumbnails for Featured Content and Selected Videos sections, sourced from CarterPCs' public platforms per RESEARCH.md's Notable Videos table — pending licensing/attribution review, and pending reverification of any view-count or date labels shown alongside them.
- **Creator imagery:** for Creator Introduction and Creator Identity sections — subject to the same attribution review.
- **Typography assets:** the chosen display and body typefaces (implementation decision, not specified by source docs beyond "strong sans-serif").
- **Iconography:** minimal custom icon set for menu, cursor states, and section markers — no stock dashboard icon packs (keeps the "not a SaaS dashboard" constraint intact).

---

## Technical Complexity Map

Based on PROJECT.md's stated stack (React, Vite, TypeScript, GSAP, ScrollTrigger, CSS, Three.js "only where true 3D adds value").

| System / Section | Complexity | Notes |
| :--- | :--- | :--- |
| Global Navigation (index + overlay) | Medium | ScrollTrigger-driven active-state tracking |
| Custom Cursor | Medium | Pointer-events + magnetic hover math; must be fully bypassed on touch |
| Kinetic typography (global) | Medium–High | Per-character/word split animations, reused across sections |
| Horizontal scroll sequences | High | Scroll-hijacking requires careful accessibility and momentum handling |
| Intro / Loader | Low–Medium | Short, one-time sequence |
| Hero | Medium | Combines kinetic type + looping media |
| Creator Introduction | Low | Primarily editorial type + imagery |
| Featured Content | Medium–High | Editorial-story layout with per-entry motion |
| Hardware Experience | High–Very High | Candidate for Three.js (exploded-view / component breakdown); scope this down to CSS/GSAP first, escalate only if it clearly earns its complexity per PROJECT.md's Three.js guidance |
| Content Universe | Medium | Category-based archive browsing without falling into card-grid patterns |
| Creator Journey | Medium–High | Timeline sequencing, likely horizontal-scroll candidate |
| Selected Videos | Medium | Video preview/playback handling |
| Creator Identity | Low–Medium | Primarily typographic/editorial |
| Final Cinematic Section | Medium | High-impact closing motion moment |
| Credits / Disclaimer | Low | Static, legally-required content |

---

## Section Specifications

Each section below maps to PROJECT.md's "Main Sections" list and draws its placeholder copy from CONTENT.md (explicitly marked there as unverified placeholder text) and its supporting research framing from RESEARCH.md §10 (Website-Relevant Insights).

### 1. Intro / Loader

**Purpose:** brief, cinematic threshold moment before the experience begins — sets tone (premium, intentional) and masks initial asset loading.
**Layout/Motion:** full-viewport, type-driven (e.g., "CARTERPCs" kinetic reveal per CONTENT.md's Hero headline concept), minimal duration, no interactive controls.
**Content source:** CONTENT.md §Hero (headline concepts reused/foreshadowed here).
**Responsive:** identical structure, shorter duration on mobile to reduce perceived wait.

### 2. Hero

**Purpose:** first full statement of identity and tone.
**Layout/Motion:** full-screen, asymmetric composition; oversized headline (CONTENT.md offers "CARTERPCs" / "Making tech interesting." and the alternative "TECH. HARDWARE. CULTURE." direction — both placeholders pending final copy decision); scroll-triggered reveal into the next section.
**Content source:** CONTENT.md §Hero.
**Responsive:** single-column, headline scales down but remains oversized relative to body text.

### 3. Creator Introduction

**Purpose:** a short editorial bridge establishing who CarterPCs is before diving into content/hardware — not present as a named section in PROJECT.md's list, but required by the 11-section architecture to avoid jumping from Hero directly into content without framing. Structurally distinct from the later, deeper Creator Identity section (9): this is a brief orientation, not the full identity treatment.
**Layout/Motion:** editorial text block + imagery, restrained motion (fade/slide reveals only — this section should feel like a pause, not a spectacle).
**Content source:** derived from RESEARCH.md §2 Creator Overview and §9 Brand/Creator Identity Themes, filtered down to a short introductory statement; any specific figures used must be reverified before use as on-site copy.
**Responsive:** stacked text-then-image.

### 4. Featured Content

**Purpose:** showcase a small set of standout content pieces as large editorial stories, not a video grid.
**Layout/Motion:** CONTENT.md's numbered-entry pattern ("01 — HARDWARE / THIS PC BUILD IS SICK.", "02 — TECH / THE END OF CHEAP GPUs.", "03 — COMMENTARY / THE PROBLEM WITH TECH CHANNELS.") — each entry full-bleed or near-full-bleed with kinetic-type headline over media, scroll- or interaction-advanced.
**Content source:** CONTENT.md §Featured Content (explicitly placeholder copy); real entries should be selected from RESEARCH.md §5 Notable Videos once licensing and figures are verified.
**Responsive:** entries stack vertically, one per viewport.

### 5. Hardware Experience

**Purpose:** the site's signature hardware showcase — directly serves PROJECT.md's "hardware-focused" identity and DESIGN.md's Hardware Presentation sequence.
**Layout/Motion:** sequenced reveal through exploded PC → GPU → motherboard → CPU → cooling → RAM → storage → complete build (DESIGN.md order, matching CONTENT.md's Hardware Sequence list). Strongest candidate for a horizontal-scroll sequence or (if justified) a Three.js-driven exploded assembly; default implementation should be CSS/GSAP-driven per the Technical Complexity Map, with 3D treated as a stretch goal.
**Content source:** CONTENT.md §Hardware Sequence; visual treatment informed by RESEARCH.md §4 Visual Identity and §7 Hardware & Tech Themes' "Website Opportunity" concepts (e.g., interactive build-vs-buy or spec-showcase ideas) as inspiration, not commitments.
**Responsive:** sequence re-authored as a swipeable vertical stack (see Responsive Strategy) rather than horizontal overflow.

### 6. Content Universe

**Purpose:** an archive/overview of the breadth of CarterPCs' content categories — answers "what does he cover" beyond the hand-picked Featured entries.
**Layout/Motion:** category-based presentation (not a card grid) — large typographic category labels with representative imagery, revealed on scroll.
**Content source:** category structure directly from RESEARCH.md §3 Content Categories (PC Hardware & Custom Builds, Smartphones & Mobile Tech, Tech News & Controversies, Scam Tech & Budget Gear, Emerging Tech & AI Tools, Community & Storytelling) and CONTENT.md §Main Content Categories.
**Responsive:** stacked category list, tap-to-expand for representative content.

### 7. Creator Journey

**Purpose:** narrative timeline of CarterPCs' growth.
**Layout/Motion:** horizontal-scroll or vertically-stacked timeline (candidate for horizontal sequence per Technical Complexity Map); kinetic-type chapter headings.
**Content source:** structural placeholder from CONTENT.md §Journey ("01 — THE BEGINNING", "02 — THE GROWTH", "03 — WHAT'S NEXT" — explicitly noted there as needing verified dates/milestones before publishing); RESEARCH.md §6 Creator Timeline and §10's "5 Story Chapters for Creator Journey Timeline" provide a more detailed candidate structure, but every date and milestone must be reverified before use as final copy.
**Responsive:** vertical timeline on mobile.

### 8. Selected Videos

**Purpose:** a broader, browsable set of individual videos beyond the hand-picked Featured Content entries — distinct from Section 4 in that it favors breadth over curation-as-narrative.
**Layout/Motion:** large editorial list/carousel (not a uniform grid), video preview on hover/focus (desktop) or tap (mobile), using the Custom Cursor's video-hover state.
**Content source:** RESEARCH.md §5 Notable Videos table, pending licensing clearance and reverification of view counts/dates before any are shown as on-site copy.
**Responsive:** vertical scrollable list.

### 9. Creator Identity

**Purpose:** the fuller identity/brand statement — expands on Section 3's brief introduction with tone, values, and positioning.
**Layout/Motion:** typography-led (CONTENT.md's keyword set: TECH CREATOR, STORYTELLER, PC ENTHUSIAST, COMMENTATOR), kinetic reveal of each keyword, restrained imagery.
**Content source:** CONTENT.md §Creator Identity; thematic grounding from RESEARCH.md §9 Brand/Creator Identity Themes and §10's "5 Strongest Creator Identity Themes for Site Structure."
**Responsive:** keywords stack vertically, same reveal pattern.

### 10. Final Cinematic Section

**Purpose:** closing emotional/visual high point before Credits — mirrors the Hero's intensity as a bookend.
**Layout/Motion:** full-screen, highest-impact motion moment on the site (largest kinetic-type treatment, most pronounced parallax/depth), then settles before transitioning to Credits.
**Content source:** CONTENT.md §Closing Section ("CARTERPCs" / "MAKING TECH INTERESTING." — placeholder).
**Responsive:** motion intensity reduced per the mobile motion budget, composition remains full-screen.

### 11. Credits / Disclaimer

**Purpose:** legally required unofficial-project disclosure, plus closing attribution.
**Layout/Motion:** minimal, static, high-legibility — no experimental motion here; this is a trust/legal moment, not a spectacle moment.
**Content source:** CONTENT.md §Closing Section disclaimer line ("Independent creative concept. Not affiliated with CarterPCs.") and PROJECT.md §Legal/Attribution, which this section must satisfy in full.
**Responsive:** identical simplified layout across breakpoints.

---

## Page Flow Summary

1. **Intro/Loader → Hero:** threshold moment resolves directly into the site's first full statement; no interruption.
2. **Hero → Creator Introduction:** motion intensity steps down, giving the visitor a breath before the first editorial content.
3. **Creator Introduction → Featured Content:** transition from "who" to "what he makes" — first hardware/content imagery appears.
4. **Featured Content → Hardware Experience:** narrows from curated stories into the site's signature deep-dive; this is the largest complexity jump in the flow and should be sign-posted with a clear transitional motion beat.
5. **Hardware Experience → Content Universe:** zooms back out from one hardware sequence to the full breadth of content categories.
6. **Content Universe → Creator Journey:** shifts from "what he covers" to "how he got here" — content axis to time axis.
7. **Creator Journey → Selected Videos:** timeline resolves into concrete, browsable proof points.
8. **Selected Videos → Creator Identity:** from individual works back to the person/brand behind them.
9. **Creator Identity → Final Cinematic Section:** identity statement builds directly into the site's emotional peak.
10. **Final Cinematic Section → Credits/Disclaimer:** motion intensity drops sharply and deliberately — the closing legal/attribution moment is calm by design, never competing with the cinematic peak that precedes it.

Overall pacing across the flow alternates between high-intensity moments (Hero, Hardware Experience, Final Cinematic Section) and lower-intensity editorial pauses (Creator Introduction, Content Universe, Creator Identity) — avoiding the "excessive RGB/neon gaming site" failure mode by never sustaining peak intensity for more than one section at a time, and avoiding a flat "generic portfolio template" feel by never fully idling either.
