# Asmara Tigrinya Thinking Path

A fully functional, no-audio, Language Transfer-inspired **Eritrean/Asmara Tigrinya** learning website built with **HTML, CSS, JavaScript, and Python**.

This version keeps the beginner **Core Path** small, but revises the whole **Explore More** curriculum so it behaves less like a grammar encyclopedia and more like an everyday Eritrean/Asmara-style conversation library. Grammar and vocabulary are now framed through family/community introductions, school/work, home visits, hospitality, phone/text check-ins, plans, public places, care/comfort, relationship language, and reading-to-reply practice.

## Current v1.20 structure

```text
128 lessons
26 phases
6 Core Path phases
20 Explore More phases
654 lesson steps
493 lesson interactive tasks
208 checkpoint items
701 combined interactive/checkpoint tasks
185 glossary items
190 fidel/supplemental character cues
587 Tigrinya word/phrase plain-English cues
567 romanization/reading-support hint entries
25 fidel families
```

## What changed in v1.20

- Reordered Explore More around everyday conversation before abstract grammar.
- Retitled and reframed every Explore More phase around a real social/use setting.
- Added conversation-bridge lessons to the abstract grammar phases so learners see how each pattern is used in ordinary written exchanges.
- Added/strengthened everyday domains: family identity, describing people, school/work, location, age/time/plans, requests/help, coffee/food/hospitality, public places, care/comfort, relationship boundaries, texting, reading-to-reply, and culture-with-humility.
- Added a visible **Everyday Conversation Ladder** in the Guide.
- Updated the reading ladder to move from fidel → words → chunks → one-line answers → family/school/work exchanges → public/visit dialogues → text replies → culture/relationship bridge.
- Expanded glossary and corpus-wide plain-English phonetic support for new words.

## Core Path

The Core Path intentionally remains small:

1. Script Support and Thinking Method
2. First Contact
3. Fidel as a System
4. People and Pronouns
5. Being and Identity
6. Mini Conversations

The learner should finish this path feeling that Eritrean/Asmara Tigrinya is learnable, patterned, and usable in very small exchanges.

## Explore More: everyday conversation order

1. Everyday Family, School, and Work Conversation
2. Describing People in Conversation
3. Family, Possession, and Belonging
4. Fidel, Spelling, and Dictionary Skills for Real Messages
5. Where People Are: Home, School, Work, Town
6. Time, Age, and Plans
7. Needs, Requests, and Help
8. Food, Coffee, Market, and Hospitality
9. Getting Around Asmara and Public Places
10. Checking In: Health, Feelings, and Problems
11. Care, Courtesy, and Comfort Scenes
12. Affection, Relationships, and Respectful Flirting
13. Daily Actions and Verb Logic
14. Longer Everyday Messages
15. Questions, Clarification, and Saying No
16. Everyday Functional Exchanges
17. Reading and Replying to Real-Life Messages
18. Asmara Public Life and Community Reading
19. Culture, Poetry, and Everyday Meaning
20. Advanced Conversation Grammar Map

Explore More is still comprehensive, but it now asks: **Where would a learner actually use this with family, community members, friends, elders, at school/work, during visits, in public, or in a text message?**

## Interactive features

- Dynamic lesson renderer
- Core Path and Explore More separation
- Concept screens
- Pattern-discovery questions
- Multiple-choice games with item-specific wrong-answer feedback
- Matching games
- Sentence-builder games with undo support
- Fidel sorting/lookalike/order activities
- Practice modes limited to completed lessons
- Static adaptive review: weak patterns, recent mistakes, due-today items
- Active glossary SRS deck
- Fidel Fast Match quick drill
- Reflection storage and reflection-based recommendations
- Mastery-based Core and Explore checkpoint sections
- Detailed checkpoint miss review
- Local progress tracking with `localStorage`
- Responsive mobile-friendly layout
- Hide/show plain-English phonetic cues
- Romanization scaffolding that fades from visible support to optional hints to fidel-only review

## How to run

Open `index.html` in a browser, or run:

```bash
python3 python/server.py
```

Then open:

```text
http://localhost:8000
```

## How to validate

```bash
python3 python/build_curriculum.py
python3 python/validate_curriculum.py
node --check js/app.js
node --check js/curriculum.js
```

## Source-use note

This curriculum has been refined using the uploaded grammars, phrasebooks, bilingual phrase cards, romanization table, bilingual dictionary, cultural orientation material, and poetry/culture resources. Several PDFs are scanned or partially parsed, so the curriculum uses searchable text, visible page images, tables of contents, and source-audit logic rather than pretending every phrase is fully verified.

Especially important source roles:

- Tigrinya names/father-name identity and family naming patterns inform the family/community strand.
- Hospitality, meals, public life, restaurants, marketplace, education, urban work, healthcare, and family life inform the everyday conversation domains.
- The Romanization Table and dictionary support systematic fidel/lookup/spelling-variant work.
- The Essential Guide supports grammar mapping, request/need/negative/question patterns, and the “miss” distinction.
- Poetry/culture material informs controlled culture-reading tasks without reproducing copyrighted poems.

## Important language note

This is a strong learning scaffold focused on **Eritrean/Asmara Tigrinya**, not a replacement for native-speaker review. The app intentionally avoids teaching Tigray/Ethiopian regional alternatives, church/liturgical register, or formal written variants as main-path beginner answers. Because the app has no audio, it uses romanization and plain-English phonetic cues as temporary supports, but it cannot fully teach pronunciation, rhythm, listening comprehension, or live speaking fluency. Pair it with Eritrean/Asmara native audio and fluent-speaker correction.

## Suggested next additions

- Native-speaker review specifically by Eritrean/Asmara speakers
- Native-speaker audio layer
- More authentic but permission-cleared everyday dialogues
- Optional backend sync for cross-device adaptive review
- Teacher review mode
- Exportable progress report
