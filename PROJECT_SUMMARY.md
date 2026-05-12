# v1.10 Mastery, Production, and Review-Scope Update

This iteration keeps the Core Path small while expanding Explore More with source-informed units from the uploaded grammars, phrasebooks, communicative textbook, and Eritrean poetry anthology. The site now contains 78 lessons across 21 phases: 6 Core Path phases and 15 Explore More phases. New Explore units cover time/numbers, requests and having/needing, food/market, travel/directions, health/help, culture-and-poetry reading, and an advanced grammar map.

The expansion follows the earlier 10/10 no-audio feedback: lessons are objective-based, production/repair oriented, and checkpoint-friendly, while pronunciation/listening claims remain explicitly out of scope. Scanned PDFs were used through visible rendered pages and extractable text where available, so the language examples still require fluent Eritrean/Asmara review.

# Project Summary

This project is a complete static web app for learning **Eritrean/Asmara Tigrinya** through a Language Transfer-inspired method. It is deliberately no-audio, so the learning emphasis is on visual recognition, guided reasoning, fidel patterning, grammar logic, sentence construction, and self-correction.

The current version targets Eritrean/Asmara Tigrinya and avoids assuming prior fidel knowledge by beginning with visible romanization support and gradually fading that support. It also avoids overwhelming beginners by separating the app into a short **Core Path** and a deeper **Explore More** library. Practice now includes static adaptive review based on missed tags, recent mistakes, due items, a glossary SRS deck, reflection-based recommendations, and fidel quick drills stored in the browser.

## Main user flow

1. User opens Home.
2. User clicks Start / continue core path.
3. App opens the next incomplete Core Path lesson.
4. Lesson moves through concept, noticing, games, and transfer tasks.
5. Completion is saved in localStorage.
6. Practice becomes available from completed lesson material only.
7. Adaptive Review prioritizes the user's weak patterns, recent mistakes, and due items.
8. After the core, user can open Explore More for deeper grammar and vocabulary.

## Core Path

The Core Path contains six phases:

1. Script Support and Thinking Method
2. First Contact
3. Fidel as a System
4. People and Pronouns
5. Being and Identity
6. Mini Conversations

This is designed to make the learner feel that Eritrean/Asmara Tigrinya is patterned and approachable before they see the broader grammar map.

## Explore More

Explore More contains fifteen deeper phases:

1. Nouns, Gender, and Description
2. Possession and Relationships
3. Places and Direction
4. Time, Numbers, and Schedules
5. Having, Needing, and Requests
6. Food, Market, and Courtesy
7. Travel, Directions, and Public Places
8. Health, Help, and Problems
9. Verb Logic
10. Sentence Architecture
11. Questions and Negation
12. Functional Communication
13. Reading and Self-Correction
14. Reading Culture and Poetry Bridge
15. Advanced Grammar Map

These lessons preserve comprehensiveness while keeping the first user experience simple.

## Core philosophy

The app avoids asking learners to type romanized Tigrinya, and the romanization that appears is treated as rough Eritrean/Asmara support, but it does not reject romanization entirely. Romanization is used as a temporary scaffold: visible in beginner lessons, tucked behind hints in guided lessons, and mostly removed in fidel-only review. The tested skills remain fidel recognition, meaning choice, form changes, sentence building, and pattern explanation.

## Adaptive review

Adaptive review is static and browser-local. The app assigns stable item IDs and topic tags to completed lesson steps. Each attempt updates `localStorage` with item stats, tag stats, recent mistakes, and last-attempt dates. The Practice page uses those stats to generate Review Weak Patterns, Recent Mistakes, and Due Today decks. This does not require GitHub Pages specifically, but a stable hosted URL makes browser storage more reliable than opening the files directly from disk.

## Validation

The included validator checks:

- every lesson has a known phase
- every lesson has steps
- choice answers exist in their choices
- build/sort answers exist in their token bank
- match steps have valid pairs
- fidel families have seven orders
- support stages are assigned to all lessons
- core and explore phase IDs are valid, complete, and non-overlapping

Run:

```bash
python3 python/validate_curriculum.py
```


## v5 Content Sanity Updates

This version includes a content sanity pass focused on the actual lesson/test items. Changes include: fuller Asmara-oriented greeting response `ደሓን ኣለኹ` instead of relying only on elliptical `ጽቡቕ`, a corrected rough romanization for `ሓገዝ`, clearer warning that romanization is only a no-audio support, less misleading request-sequence practice, and a small fidel romanization clarification for the first vowel order. Native-speaker review is still recommended before treating the curriculum as authoritative.


## v6 implemented improvements

- Added **Continue where you left off** using `lastLessonId` and `lastStepIndex` in saved progress.
- Added a **Romanisation Key** in the Guide view and hover titles for special romanisation characters.
- Added **Fidel Fast Match** as a quick drill mode for vowel-order names and numbers.
- Added reflection storage and a **Your past reflections** Practice panel with keyword-based recommendations.
- Added **Weakest Pattern Drill** behavior through consecutive wrong-answer tracking by tag.
- Made checkpoints **mastery-based** with an 80% passing score, best-score storage, and retry flow.
- Turned the glossary into an active **SRS deck** with local interval/ease/next-review records.


## v7 Eritrean/Asmara refinement

- Reframed the entire site as **Asmara Tigrinya Thinking Path**.
- Added a `dialectProfile` object to `js/curriculum.js` and the Python generator.
- Added Guide copy explaining that the target variety is Eritrean/Asmara Tigrinya.
- Changed the main greeting response to `ደሓን ኣለኹ`.
- Added Eritrean/Asmara request and politeness forms: `በጃኻ`, `በጃኺ`, `ይቕሬታ`, `ደሓን ኩን`, and `ደሓን ኩኒ`.
- Updated the glossary SRS and romanization hints to include the new Asmara-focused forms.

## v8 10/10 no-audio polish

This iteration responds to the latest learning-effectiveness feedback by making the app more tutor-like rather than simply more content-heavy. The biggest improvements are objective-based phase/lesson contracts, diagnostic wrong-answer feedback, balanced mastery checkpoints, repair tasks throughout the curriculum, stronger text-based production, richer reading passages, text-message-style mini-dialogues, and more transparent adaptive review.

New/reinforced practice modes include **Checkpoint Prep** and **Full Challenge**. The Guide now states the course's exact 10/10 lane: a no-audio Asmara/Eritrean Tigrinya foundation for fidel, reading, grammar pattern recognition, sentence building, repair, and text-based communication—not full pronunciation/listening/speaking fluency.

## v10 implementation notes

- `data.checkpointBanks` now provides dedicated 8-item mastery banks for every phase, using recognition, meaning, production, repair, and transfer categories.
- Phase checkpoint cards are locked until phase lessons are complete; passing still requires 80%.
- The Core Mini Conversations phase now has six lessons and closes with a controlled reading exchange.
- Production-like build/sort work is now 27.2% of interactive lesson tasks, with additional intent-based build/sort prompts across phases.
- The glossary review now defaults to completed-lesson vocabulary only; a separate Full Glossary Challenge remains available.
- A visible content-status panel reminds users and reviewers that examples need Eritrean/Asmara native-speaker review before classroom use.
- Accessibility polish removed broad `aria-live` from the full app shell and keeps live feedback scoped to answer-feedback regions.


## v11 diagnostic/tutor polish

This update addresses the newest feedback on v10 by moving the app closer to a tutor-like static course. Every multiple-choice item now has per-option `wrongFeedback`; glossary entries have richer metadata; lesson/step review status is visible in the UI; Explore More is reordered for practical use before abstract capstones; p11/p12 are labeled Intermediate Low Bridge; beginner request order is normalized around item/help + please; Weakest Pattern Drill now displays a short rule, examples, and contrast before the practice item; and optional fidel typing is supported for users with an Ethiopic keyboard.

Historical v11 counts before the v12 polish pass: 77 lessons, 21 phases, 415 lesson steps, 317 interactive tasks, 168 checkpoint items, 112 enriched glossary metadata records, and 25 fidel families.


## v12 concrete mastery/capstone polish

This update removes the remaining generic checkpoint transfer items, replaces weak advanced checkpoint placeholders, standardizes beginner request order around item/help + please with an explicit scaffold note, expands authored diagnostic feedback for high-frequency errors, adds more Fidel order/lookalike practice, merges the duplicate `ጽቡቕ` glossary item, strengthens the final Core Path capstone, reduces repetitive review-status warnings, and cleans the current documentation counts.

Current counts: 78 lessons, 21 phases, 432 lesson steps, 331 lesson interactive tasks, 499 combined interactive/checkpoint tasks, 168 checkpoint items, 112 glossary items, 112 enriched glossary metadata records, and 25 fidel families.


## v13 exact checkpoint / diagnostic polish

This update completes the remaining checkpoint and feedback cleanup pass. Checkpoint banks now follow the exact 8-item blueprint for every phase, and the validator enforces that blueprint. Generic repair prompts were replaced with concrete repair tasks, the duplicated p5 checkpoint item was replaced, and checkpoint results now show detailed miss review with the learner answer, correct answer, pattern tag, and suggested lesson. The app also adds a visible reading ladder and more Fidel lookalike, odd-one-out, order-recognition, missing-character, and sorting games.

Current counts: 78 lessons, 21 phases, 432 lesson steps, 331 lesson interactive tasks, 499 combined interactive/checkpoint tasks, 168 checkpoint items, 112 glossary items, 112 enriched glossary metadata records, and 25 fidel families.
