# Asmara Tigrinya Thinking Path

A fully functional, no-audio, Language Transfer-inspired **Eritrean/Asmara Tigrinya** learning website built with **HTML, CSS, JavaScript, and Python**.

The site teaches through guided reasoning rather than flashcard walls: users notice a pattern, guess what changed, check the answer, and transfer the pattern into a new context. Because this version has no audio, it uses a three-stage script support progression for Eritrean/Asmara Tigrinya: beginner lessons show fidel + romanization + meaning, guided lessons hide romanization behind hints, and later review removes romanization so learners practice fidel recognition.

## Major design changes through v1.13

The app now includes **static adaptive review**, keeps the **simple path, deep library** structure, and adds a source-expanded Explore More curriculum based on the uploaded grammars, phrasebooks, communicative textbook, and Eritrean poetry anthology.

- **Core Path:** the short, linear beginner-safe path. It covers course orientation, Eritrean/Asmara first-contact phrases, fidel families, pronouns, identity sentences, and mini-conversations.
- **Explore More:** the deeper optional library. It keeps the broader grammar and vocabulary material without forcing it into the first learner experience.
- **Practice:** now pulls only from completed lessons so users are not quizzed on material they have not unlocked.
- **Adaptive Review:** the browser stores missed items, topic tags, due items, recent mistakes, and consecutive wrong-answer streaks in `localStorage`; no backend is required.
- **Glossary SRS:** the glossary is now an active spaced-repetition deck with next review dates, intervals, and ease factors.
- **Mastery Checkpoints:** checkpoints now require an 80% score, store best scores, and offer retry/review paths.
- **Real-time Weakest Pattern Drill:** repeated misses trigger a pattern-drill recommendation during lessons.
- **Reflection Review:** written reflections are stored locally and can recommend practice from keywords like gender, fidel, questions, negation, or vocabulary.
- **Fidel Fast Match:** a quick drill mode asks for vowel-order names or numbers.
- **Checkpoints:** now separates Core Path checkpoints from Explore More checkpoints.

This keeps the app comprehensive without making it feel comprehensive too early.

## What is included

```text
index.html                  Main website shell
css/styles.css              Responsive styling and app layout
js/app.js                   Interactive app logic, progress, games, checkpoints
js/curriculum.js            Tigrinya curriculum data
python/build_curriculum.py  Normalizes js/curriculum.js formatting
python/validate_curriculum.py  Curriculum validator
python/server.py            Simple local development server
```

## How to run

### Option 1: Open directly

Open `index.html` in a browser. The app does not require internet access.

### Option 2: Run with Python

From the project folder:

```bash
python3 python/server.py
```

Then open:

```text
http://localhost:8000
```

## How to regenerate the curriculum

From the project folder:

```bash
python3 python/build_curriculum.py
python3 python/validate_curriculum.py
```

## Core Path

The main path intentionally stays smaller:

1. Script Support and Thinking Method
2. First Contact
3. Fidel as a System
4. People and Pronouns
5. Being and Identity
6. Mini Conversations

The learner should finish this path feeling that Eritrean/Asmara Tigrinya is learnable, patterned, and usable in very small exchanges.

## Explore More

The deeper library now includes:

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

This preserves the long-term beginner-to-intermediate-low bridge without overloading the first path. The new source-expanded units are intentionally placed in Explore More rather than the Core Path.

## Interactive features

- Dynamic lesson renderer
- Core Path and Explore More separation
- Concept screens
- Pattern-discovery questions
- Multiple-choice games
- Matching games
- Sentence-builder games
- Fidel sorting activities
- Practice modes limited to completed lessons
- Static adaptive review: weak patterns, recent mistakes, due-today items
- Active glossary SRS deck
- Fidel Fast Match quick drill
- Reflection storage and reflection-based recommendations
- Mastery-based Core and Explore checkpoint sections
- Local progress tracking with `localStorage`
- Reset progress button
- Responsive mobile-friendly layout
- Romanization scaffolding that fades from visible support to optional hints to fidel-only review


## Uploaded resources used through v1.10

The curriculum was expanded using the attached beginner-to-advanced resources. Some PDFs were scanned and had limited machine-readable text, so the curriculum pass used a combination of parsed text, visible page images, tables of contents, and page-level snippets. The expansion especially draws on:

- *The Essential Guide to Tigrinya* for broad grammar scope, key phrases, question words, possession/having, tense/negative patterns, and topical vocabulary.
- *The Red Sea Press Tigrinya Phrase Book* for Asmara-oriented phrasebook domains such as meeting people, restaurant, asking the way, travel, shopping, and health.
- *Let’s Speak Tigrinya* for communicative task design: dialogues, functional language use, and classroom-style output practice.
- The grammar works by Amanuel Sahle, John Mason, and Teshaye Teferra for advanced grammar scope and the decision to map rather than dump complex morphology and syntax.
- *Who Needs a Story?* for the culture-and-reading bridge; the site uses original controlled mini-texts and reflection tasks rather than reproducing poems.

## Important language note

This is a strong learning scaffold focused on **Eritrean/Asmara Tigrinya**, not a replacement for native-speaker review. The app intentionally avoids teaching Tigray/Ethiopian regional alternatives, church/liturgical register, or formal written variants as main-path beginner answers. Because the app has no audio, it uses romanization as a temporary Asmara-oriented pronunciation guide, but it cannot fully teach pronunciation, rhythm, listening comprehension, or live speaking fluency. Pair it with Eritrean/Asmara native audio and fluent-speaker correction.

## Reference sources used for core grammar/script assumptions

- Tigrinya grammar overview: https://en.wikipedia.org/wiki/Tigrinya_grammar
- Tigrinya language overview: https://en.wikipedia.org/wiki/Tigrinya_language
- Tigrinya verbs overview: https://en.wikipedia.org/wiki/Tigrinya_verbs
- EthnoMed note on Tigrigna vs. Tigrinya spelling: https://ethnomed.org/resource/navigating-differences-tigrigna-vs-tigrinya/
- MustGo dialect note on Asmara/Eritrean and Tigray/Ethiopian Tigrinya: https://www.mustgo.com/worldlanguages/tigrinya/
- Omniglot phrase reference for greetings and common phrases: https://www.omniglot.com/language/phrases/tigrinya.php
- Elias/Harvard beginning Tigrinya greeting lesson: https://elias.fas.harvard.edu/languages/tigrinya/beginning/4/greetings

## Suggested next additions

- Native-speaker audio layer
- Native-speaker review specifically by Eritrean/Asmara speakers
- Optional backend sync for cross-device adaptive review
- Native-speaker review of all source-expanded examples
- More real-world reading passages
- Teacher review mode
- Exportable progress report

## Adaptive review behavior

Adaptive review is implemented entirely in `js/app.js`. Each interactive question receives a stable item ID and automatically generated topic tags such as `fidel-family`, `gender-address`, `pronouns`, `sentence-building`, `questions`, or `negation`. When a learner answers incorrectly, the site records the miss in the browser's `localStorage`. The Practice page then offers three adaptive decks:

- **Review Weak Patterns:** prioritizes tags with the most misses and highest miss rate.
- **Recent Mistakes:** revisits specific recently missed items.
- **Due Today:** selects unlocked items that have not been reviewed recently or have weak scores.

This works on GitHub Pages or any other static host. A backend would only be needed for accounts, cross-device sync, teacher dashboards, or permanent cloud storage.


## v5 Content Sanity Updates

This version includes a content sanity pass focused on the actual lesson/test items. Changes include: fuller greeting response `ደሓን ኣለኹ` for the Asmara-oriented greeting loop instead of relying only on elliptical `ጽቡቕ`, a corrected rough romanization for `ሓገዝ`, clearer warning that romanization is only a no-audio support, less misleading request-sequence practice, and a small fidel romanization clarification for the first vowel order. Native-speaker review is still recommended before treating the curriculum as authoritative.


## v6 Learning Engine Updates

This version implements the improvement list from the review screenshots:

1. **Glossary SRS deck:** glossary words now have local spaced-repetition records with `nextReviewDate`, `easeFactor`, `interval`, repetitions, and lapses. The Practice page includes **Vocab Review** and the Guide page shows due dates.
2. **Mastery-based checkpoints:** checkpoints require 80% to pass. The app tracks `correct`, total questions, best score, last score, attempts, and retry state.
3. **Weakest Pattern Drill:** the adaptive engine tracks consecutive wrong answers per tag. After repeated misses in a lesson, the app offers a focused pattern drill.
4. **Reflection-based review:** reflection responses are saved in `localStorage`; the Practice page displays past reflections and extracts simple keywords to recommend practice tags.
5. **Fidel Fast Match:** the Practice and Fidel Lab pages include a fast drill for identifying vowel-order names or numbers.
6. **Romanisation Key:** the Guide page now includes a romanisation key, and special romanisation characters carry hover/focus titles.
7. **Continue where you left off:** Home now shows a Resume Lesson button when there is an unfinished lesson with a saved step index.


## v7 Eritrean/Asmara Tigrinya refinement

This version narrows the site to **Eritrean/Asmara Tigrinya** as the default classroom variety. Changes include:

- Site title, metadata, guide copy, and documentation now identify the target as Eritrean/Asmara Tigrinya.
- The Guide includes a Target Variety panel explaining the scope, phrase policy, and what is intentionally out of scope.
- Core greetings now use `ደሓን ኣለኹ` as the main fuller Asmara-friendly response to `ከመይ ኣለኻ/ኣለኺ`.
- Functional communication now includes Eritrean/Asmara request helpers: `በጃኻ`, `በጃኺ`, `ይቕሬታ`, `ደሓን ኩን`, and `ደሓን ኩኒ`.
- Romanization hints and the glossary SRS deck were updated with those Eritrean/Asmara forms.
- Tigray/Ethiopian regional alternatives and church/liturgical register are not presented as main beginner-path answers.

## v8 10/10 no-audio learning-effectiveness polish

This version implements the additional learning-effectiveness feedback from the current review document:

- Added a clear **curriculum contract** to phases and lessons: what the learner is learning, why it matters, what they can do afterward, and how they prove it.
- Made checkpoints more serious by balancing **recognition, meaning, production, repair, and transfer** items when available.
- Added richer checkpoint result feedback: score, strong patterns, weak patterns, and recommended review lessons.
- Improved wrong-answer feedback so mistakes explain the likely confusion, the clue to notice, and the correct pattern.
- Added more communicative production tasks, including “I am at home,” “I want water,” and intent-based sentence-building prompts.
- Added repair tasks throughout the curriculum, not just at the end: address-form repair, copula/agreement repair, preposition repair, and negation repair.
- Expanded fidel practice with more family/order identification and continued Fidel Fast Match support.
- Added **Checkpoint Prep** and **Full Challenge** practice modes.
- Upgraded the glossary from a static word list into a richer learning reference with category, first lesson, example/related forms when available, warning notes, and SRS due dates.
- Expanded controlled reading and mini-conversation practice, especially text-message-style dialogue completion and short passage comprehension.
- Clarified the 10/10 target: excellent no-audio foundation, not full spoken proficiency.

## v10 mastery and production polish

This version builds off the v9 source-expanded curriculum and implements the newest product review priorities:

- Expanded the Core Path payoff: **Mini Conversations** now has six lessons, including addressee adaptation, he/she identity, and a controlled reading exchange.
- Added early survival chunks to the Core Path (`ማይ`, `ሓገዝ`, `በጃኻ/በጃኺ`, `ይቕሬታ`, `ኣይፈልጥን`) while leaving full grammar explanation for Explore More.
- Added a dedicated `checkpointBanks` object: every phase now has an authored 8-item mastery bank with recognition, meaning, production, repair, and transfer items.
- Checkpoints are now gated: the learner must complete the phase before taking its mastery checkpoint, unless retaking a previously passed checkpoint.
- Increased controlled production: current task distribution is **90/331 production-like build/sort tasks (27.2%)**, meeting the 25% target for build/sort production.
- Added repair/transfer coverage to phases that were missing it.
- Added more Fidel automaticity practice inside the curriculum, not only in the Fidel Lab.
- Split glossary SRS into **Unlocked Vocab Review** and **Full Glossary Challenge** so beginners are protected by default.
- Added an explicit content status label: **Pedagogical draft — needs Eritrean/Asmara native-speaker review**.
- Improved accessibility by removing broad `aria-live` from the whole app and reserving polite live feedback for answer feedback regions; the mobile nav label now changes between open/close.

Current counts:

```text
Lessons: 80
Phases: 21
Core Path phases: 6
Explore More phases: 15
Core Path lessons: 27
Explore More lessons: 53
Total lesson steps: 444
Lesson interactive tasks: 339
Combined interactive/checkpoint tasks: 507
Production-like build/sort/type-in tasks: 93 lesson tasks (27.4% of interactive lesson work)
Repair-tagged tasks: 53 lesson tasks plus 21 checkpoint repair items
Transfer-tagged tasks: 48 lesson tasks plus 21 checkpoint transfer items
Checkpoint banks: 21 banks / 168 items
Glossary items: 112
Glossary metadata records: 112
Plain phonetic character cues: 190
Plain word/phrase cues: 476
Romanization/reading-support hint entries: 456
```

## v1.11 Diagnostic and Tutor-Polish Update

This iteration responds to the latest feedback about v1.10. The site now emphasizes not only whether a learner gets an answer correct, but why a wrong answer was tempting.

Implemented in v1.11:

- Added `wrongFeedback` mappings to every multiple-choice lesson item, so wrong answers can produce diagnostic explanations rather than generic correction.
- Added richer `glossaryMeta` for glossary entries: category, first lesson, related forms, usage note, review status, and source-confidence status.
- Made draft/review-needed content status visible inside lessons and step cards, not only in documentation.
- Reordered Explore More so practical Novice/Novice High domains come before abstract capstones: places → time → requests → food/market → travel → health, then verb/syntax/question/read/culture/advanced bridge material.
- Changed p11 and p12 labels from “Intermediate Low” to **Intermediate Low Bridge** to avoid overclaiming.
- Normalized beginner request examples around a default **item/help + please** pattern, while keeping a native-speaker-review warning.
- Added more repair and transfer tasks across phases.
- Added an optional fidel typing step for learners with an Ethiopic keyboard, without making typed romanization a requirement.
- Upgraded Weakest Pattern Drill into a mini-coach card with a rule, examples, and contrast before the practice item.
- Added an “Undo last” button to build tasks for easier mobile and keyboard recovery.

Historical v1.11 count before the v1.12 polish pass: **92 lessons**, **24 phases**, **492 lesson steps**, **370 lesson interactive tasks**, **168 authored checkpoint items**, **112 enriched glossary metadata records**, and **25 fidel families**. For current counts, see the v1.13 section below.


## v1.12 Concrete Mastery and Capstone Polish

This update responds to the latest curriculum review by removing remaining generic assessment items and making the site feel less like a prototype checklist.

Implemented in v1.12:

- Replaced generic checkpoint transfer prompts with concrete language-based transfer items.
- Replaced weak advanced checkpoint items, especially the Advanced Grammar Map checkpoint that previously used a greeting as a placeholder.
- Standardized beginner request practice around **item/help + please** while explicitly explaining that this is a controlled-practice scaffold pending native review.
- Added more fully authored feedback for high-frequency mistake types: gender/address, requests, negation, prepositions, identity/copula, questions, reading, and fidel family/order.
- Added more Fidel sorting, family-order, and lookalike repair games.
- Merged the duplicate `ጽቡቕ` glossary entry and clarified it as both “good/fine” and a masculine singular adjective form.
- Added a stronger final Core Path capstone lesson that asks learners to build, repair, adapt, and read a tiny written exchange.
- Reduced repetitive review-status warnings by keeping one compact lesson-level content note and leaving detailed caveats in the Guide.

Historical v1.12 structural count before v1.13 additions: **92 lessons**, **24 phases**, **492 lesson steps**, **370 lesson interactive tasks**, **562 combined interactive/checkpoint tasks**, **168 authored checkpoint items**, **134 glossary items**, **112 enriched glossary metadata records**, and **25 fidel families**.


## v1.13 Exact Checkpoint and Reading-Ladder Polish

This update implements the next diagnostic cleanup pass. It does not broaden the language claims; it tightens the learning engine.

Implemented in v1.13:

- Every checkpoint bank now matches the exact blueprint: **2 recognition, 2 meaning, 2 production, 1 concrete repair, and 1 transfer item**.
- Remaining generic repair checkpoint prompts were replaced with concrete wrong-form or wrong-sentence repair tasks.
- The duplicated p5 checkpoint item was replaced with a distinct masculine/feminine description production item.
- Checkpoint results now include a **Detailed miss review**: missed item, learner answer, correct answer, pattern tag, and suggested lesson.
- Added more Fidel lookalike, odd-one-out, order-recognition, missing-character, and family-sorting games.
- Re-authored wrong-answer feedback for high-frequency beginner mistakes and removed the misleading fidel-template feedback from non-fidel questions.
- Added a visible eight-level reading ladder from single words to controlled culture/literary bridge reading.
- Updated the validator so checkpoint banks must meet the exact blueprint rather than merely contain all categories.

Historical v1.13 structural count before v1.14: **92 lessons**, **24 phases**, **492 lesson steps**, **370 lesson interactive tasks**, **562 combined interactive/checkpoint tasks**, **168 authored checkpoint items**, **134 glossary items**, **112 enriched glossary metadata records**, and **25 fidel families**.


## v1.14 Plain-English Phonetics and Complete Fidel System

Implemented in v1.14:

- Added a `plainPhonetics` data map with **190 fidel-character/supplemental phonetic cues** and **365 lesson/checkpoint word cues**.
- Every lesson card now exposes a collapsible **Plain English phonetics in this card** panel for all Tigrinya words appearing in the card.
- Tigrinya choices, examples, bank tokens, and Fidel Lab cells now show a plain-English phonetic cue in addition to the existing romanization scaffold.
- Added two systematic Core Path Fidel lessons:
  - **The Whole Fidel System Map**
  - **Fidel Totality: Decode Any Course Character**
- Added a full **25-family × 7-order Fidel system map** in the Fidel Lab and Guide.
- Added a family → order → plain cue → real word decoding routine so learners can grasp fidel as a whole system rather than as scattered characters.

Current structural count after v1.14: **92 lessons**, **24 phases**, **492 lesson steps**, **370 lesson interactive tasks**, **562 combined interactive/checkpoint tasks**, **168 authored checkpoint items**, **134 glossary items**, **112 enriched glossary metadata records**, **190 fidel-character/supplemental phonetic cues**, **508 Tigrinya word/phrase plain-English cues**, and **25 fidel families**.

Plain-English phonetics are intentionally approximate. They are a no-audio reading bridge, not a claim that learners can pronounce accurately without native audio or speaker feedback.

## v1.15 Hideable Plain Cues and Answerable Fidel Matching

This update responds to a usability issue where one matching activity asked learners to match several characters to the same family label. That made the task feel like guessing/clicking around rather than reasoning.

Implemented in v1.15:

- Added a header toggle: **Hide plain cues / Show plain cues**.
- The toggle hides or reveals plain-English phonetic cues across lesson cards, choices, bank tokens, Fidel Lab cells, and the card-level phonetics panel.
- The setting is saved in `localStorage`, so learners can keep cues visible while learning and hide them when they want a fidel-first challenge.
- Replaced the confusing “same family recognition” matching task with an answerable **order-recognition inside one family** task.
- Checked the curriculum for duplicate right-side matching labels; none remain.
- Kept the systematic fidel route: **family shape → order position → plain cue → real word**.

Current structural count after v1.15: **92 lessons**, **24 phases**, **492 lesson steps**, **370 lesson interactive tasks**, **562 combined interactive/checkpoint tasks**, **168 authored checkpoint items**, **134 glossary items**, **112 enriched glossary metadata records**, **190 fidel-character/supplemental phonetic cues**, **508 Tigrinya word/phrase plain-English cues**, and **25 fidel families**.


## v1.16 Corpus-Wide Plain-English/Romanized Support Audit

Implemented in v1.16:

- Audited every Ethiopic word token appearing in lessons, checkpoint banks, glossary entries, examples, choices, build banks, tables, and reading passages.
- Expanded the support maps to **476 plain word/phrase cues** and **488 romanization/reading-support hint entries**.
- Added fallback reading support so words without manually authored romanization still receive a rough cue from the word map or, if needed, character-by-character Fidel cues.
- Updated guided and fidel-only lesson stages so reading support can be revealed instead of randomly disappearing for words that lacked an explicit romanization entry.
- Kept the global **Hide plain cues / Show plain cues** control: learners can hide plain-English scaffolding when they want a Fidel-first challenge.

Current structural count after v1.16: **92 lessons**, **24 phases**, **492 lesson steps**, **370 lesson interactive tasks**, **562 combined interactive/checkpoint tasks**, **168 authored checkpoint items**, **134 glossary items**, **112 enriched glossary metadata records**, **190 fidel-character/supplemental phonetic cues**, **476 Tigrinya word/phrase phonetic cues**, **488 romanization/reading-support hint entries**, and **25 fidel families**.


## v1.17 source-audit curriculum refinement

This version adds three gated Explore More phases derived from the latest attached resources and the audit bundle: **Fidel Extensions and Dictionary Skills**, **Care, Courtesy, and Comfort Scenes**, and **Asmara Culture and Practical Reading Context**. The Core Path remains simple. The additions use the Romanization Table as a systematic Fidel reference, the Zecarias dictionary as a source for dictionary-skill training, the bilingual phrase cards for help/care/comfort reading scenes, and the cultural orientation document for Asmara/public-place/family-context reading. Exact phrase naturalness remains marked review-needed.


### Current v1.17 counts

- 92 lessons
- 24 phases (6 core, 18 explore)
- 492 lesson steps
- 370 lesson interactive tasks
- 192 checkpoint items
- 562 combined interactive/checkpoint tasks
- 134 glossary items
- 190 fidel/supplemental character cues
- 508 Tigrinya word/phrase plain-English cues
- 488 romanization/reading-support hint entries
