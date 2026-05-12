
(() => {
  const data = window.TTP_CURRICULUM;
  const CORE_PHASE_IDS = data.corePathPhaseIds || ['p0', 'p1', 'p2', 'p3', 'p4'];
  const EXPLORE_PHASE_IDS = data.explorePhaseIds || data.phases.filter(phase => !CORE_PHASE_IDS.includes(phase.id)).map(phase => phase.id);
  const app = document.querySelector('#app');
  const nav = document.querySelector('#mainNav');
  const menuToggle = document.querySelector('#menuToggle');
  const resetProgressBtn = document.querySelector('#resetProgress');
  const STORE_KEY = 'ttp-progress-v1';
  const CHECKPOINT_PASSING_SCORE = 0.8;
  const romanMap = new Map();
  (data.glossary || []).forEach(item => {
    if (item[0] && item[2]) romanMap.set(item[0], item[2]);
  });
  Object.entries(data.romanizationHints || {}).forEach(([tg, roman]) => romanMap.set(tg, roman));

  const ROMANISATION_KEY = [
    { char: 'ḥ', title: "like 'h' but pharyngeal/stronger; used here for ሓ-style sounds", example: 'ḥagez', note: 'Used as a rough cue for emphatic/pharyngeal h-like sounds.' },
    { char: 'ṣ', title: "emphatic 's' sound", example: 'ṣebuq', note: 'A rough cue for stronger s-like sounds.' },
    { char: 'ṭ', title: "emphatic 't' sound", example: 'ṭebib', note: 'A rough cue for stronger t-like sounds.' },
    { char: 'ʾ', title: 'glottal stop or vowel onset', example: 'ʾane', note: 'Marks a catch or vowel onset when useful.' },
    { char: "'", title: 'rough glottal stop marker', example: "mimtsa'", note: 'Plain apostrophe is used as an ASCII fallback for glottal sounds.' },
    { char: 'ʿ', title: 'pharyngeal/ayin-like consonant', example: 'ʿaddi', note: 'Used only when a rough guide needs to mark this contrast.' },
    { char: 'ä', title: "open central vowel; roughly between 'a' and 'e'", example: 'hä', note: 'Used to distinguish the first fidel order from the fourth order.' },
    { char: 'ə', title: 'reduced central vowel', example: 'mə', note: 'Used sparingly as a guide, not as a strict phonetic system.' },
    { char: 'ā', title: 'longer a-like vowel when marked', example: 'selām', note: 'Length is not consistently marked in this prototype.' },
  ];

  const romanTitleMap = new Map(ROMANISATION_KEY.map(item => [item.char, item.title]));

  const PATTERN_COACHES = {
    'gender-address': {
      rule: 'Address forms change depending on whether you are speaking to one male or one female person.',
      examples: ['ከመይ ኣለኻ? = how are you? to one male', 'ከመይ ኣለኺ? = how are you? to one female'],
      contrast: 'Look for -ኻ versus -ኺ.'
    },
    'fidel-family': {
      rule: 'Fidel is learned through families and seven vowel orders, not isolated symbols.',
      examples: ['ሰ ሱ ሲ ሳ ሴ ስ ሶ', 'ሀ ሁ ሂ ሃ ሄ ህ ሆ'],
      contrast: 'The family shape stays related while the vowel order changes.'
    },
    'prepositions': {
      rule: 'Use ኣብ for at/in, ናብ for to/toward, and ካብ for from.',
      examples: ['ኣብ ገዛ = at home', 'ናብ ሆቴል = to the hotel'],
      contrast: 'Location, destination, and source are different clues.'
    },
    'negation': {
      rule: 'The beginner negative frame often needs both ኣይ near the start and ን at the end.',
      examples: ['ኣይፈልጥን = I do not know', 'Look for the final ን.'],
      contrast: 'Do not stop after only seeing ኣይ.'
    },
    'identity': {
      rule: 'Identity sentences align the person being described with the copula form.',
      examples: ['ኣነ ተማሃራይ እየ = I am a student', 'ንሳ ተማሃሪት እያ = she is a student'],
      contrast: 'Check the pronoun, person word, and final copula together.'
    },
    'requests': {
      rule: 'This prototype uses item/help + please as the default beginner request pattern.',
      examples: ['ማይ በጃኻ = water please, to one male', 'ሓገዝ በጃኺ = help please, to one female'],
      contrast: 'Natural request order still needs Eritrean/Asmara speaker review.'
    },
    'questions': {
      rule: 'Question words point to the type of answer you need.',
      examples: ['መን = who', 'ኣበይ = where', 'ክንደይ = how much'],
      contrast: 'Do not answer a where question with a price word.'
    },
  };


  const state = {
    view: 'home',
    lessonId: null,
    stepIndex: 0,
    practiceMode: null,
    currentFamily: data.fidel.families[0].base,
    checkpoint: null,
    progress: loadProgress(),
  };

  function loadProgress() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORE_KEY) || '{}');
      return normalizeProgress(saved);
    } catch (error) {
      return normalizeProgress({});
    }
  }

  function normalizeProgress(saved = {}) {
    return {
      lessons: saved.lessons || {},
      checkpoints: normalizeCheckpoints(saved.checkpoints || {}),
      lastLessonId: saved.lastLessonId || null,
      lastStepIndex: Number.isInteger(saved.lastStepIndex) ? saved.lastStepIndex : 0,
      reflections: Array.isArray(saved.reflections) ? saved.reflections : [],
      vocabSRS: normalizeVocabSRS(saved.vocabSRS || {}),
      adaptive: normalizeAdaptive(saved.adaptive),
    };
  }

  function normalizeCheckpoints(checkpoints = {}) {
    const normalized = {};
    Object.entries(checkpoints).forEach(([phaseId, value]) => {
      if (value && typeof value === 'object') {
        normalized[phaseId] = {
          passed: !!value.passed,
          bestScore: Number(value.bestScore || 0),
          lastScore: Number(value.lastScore || 0),
          attempts: Number(value.attempts || 0),
          lastAttempt: value.lastAttempt || null,
        };
      } else if (value) {
        normalized[phaseId] = { passed: true, bestScore: 1, lastScore: 1, attempts: 1, lastAttempt: null };
      }
    });
    return normalized;
  }

  function saveProgress() {
    localStorage.setItem(STORE_KEY, JSON.stringify(state.progress));
  }

  function defaultAdaptive() {
    return {
      attempts: 0,
      correct: 0,
      incorrect: 0,
      itemStats: {},
      tagStats: {},
      recentMistakes: [],
      reviewLog: {},
      consecutiveWrong: {},
      lastSession: null,
    };
  }

  function normalizeAdaptive(saved = {}) {
    const base = defaultAdaptive();
    return {
      ...base,
      ...saved,
      itemStats: saved.itemStats || {},
      tagStats: saved.tagStats || {},
      recentMistakes: saved.recentMistakes || [],
      reviewLog: saved.reviewLog || {},
      consecutiveWrong: saved.consecutiveWrong || {},
    };
  }

  function normalizeVocabSRS(saved = {}) {
    const records = saved.records || {};
    const normalized = { records };
    (data.glossary || []).forEach(item => {
      const [tg, en, roman] = item;
      if (!tg || !en) return;
      const id = vocabId(tg);
      if (!normalized.records[id]) {
        normalized.records[id] = {
          id,
          tg,
          en,
          roman: roman || '',
          interval: 0,
          easeFactor: 2.5,
          repetitions: 0,
          nextReviewDate: null,
          lastReviewed: null,
          lapses: 0,
        };
      } else {
        normalized.records[id] = {
          id,
          tg,
          en,
          roman: roman || '',
          interval: Number(normalized.records[id].interval || 0),
          easeFactor: Number(normalized.records[id].easeFactor || 2.5),
          repetitions: Number(normalized.records[id].repetitions || 0),
          nextReviewDate: normalized.records[id].nextReviewDate || null,
          lastReviewed: normalized.records[id].lastReviewed || null,
          lapses: Number(normalized.records[id].lapses || 0),
        };
      }
    });
    return normalized;
  }

  function vocabId(tigrinya) {
    return `vocab-${stableHash(tigrinya)}`;
  }

  function allVocabRecords() {
    const records = state.progress.vocabSRS?.records || {};
    return Object.values(records).filter(item => item.tg && item.en);
  }

  function dateOnly(offsetDays = 0) {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() + offsetDays);
    return d.toISOString().slice(0, 10);
  }

  function isVocabDue(record) {
    if (!record.nextReviewDate) return true;
    return record.nextReviewDate <= dateOnly(0);
  }

  function updateVocabSRS(step, correct) {
    if (!step.vocabId) return;
    const store = state.progress.vocabSRS || normalizeVocabSRS({});
    state.progress.vocabSRS = store;
    const record = store.records[step.vocabId];
    if (!record) return;
    const now = nowISO();
    if (correct) {
      record.repetitions = Number(record.repetitions || 0) + 1;
      if (record.repetitions === 1) record.interval = 1;
      else if (record.repetitions === 2) record.interval = 3;
      else record.interval = Math.max(4, Math.round(Number(record.interval || 3) * Number(record.easeFactor || 2.5)));
      record.easeFactor = Math.min(3.2, Number(record.easeFactor || 2.5) + 0.08);
      record.nextReviewDate = dateOnly(record.interval);
    } else {
      record.repetitions = 0;
      record.interval = 1;
      record.easeFactor = Math.max(1.3, Number(record.easeFactor || 2.5) - 0.2);
      record.lapses = Number(record.lapses || 0) + 1;
      record.nextReviewDate = dateOnly(1);
    }
    record.lastReviewed = now;
  }

  function generateVocabReviewStep(mode = 'unlocked') {
    const records = mode === 'full' ? allVocabRecords() : unlockedVocabRecords();
    if (!records.length) return null;
    const due = records.filter(isVocabDue);
    const pool = due.length ? due : records.sort((a, b) => String(a.nextReviewDate || '').localeCompare(String(b.nextReviewDate || '')));
    const record = shuffle(pool.slice(0, Math.min(12, pool.length)))[0];
    const askMeaning = Math.random() >= 0.4;
    const distractors = shuffle(records.filter(item => item.id !== record.id)).slice(0, 3);
    if (askMeaning) {
      return {
        type: 'choice',
        skill: 'meaning',
        itemId: `${record.id}:meaning`,
        vocabId: record.id,
        lessonTitle: mode === 'full' ? 'Full Glossary Challenge' : 'Unlocked Glossary SRS Deck',
        phaseId: mode === 'full' ? 'vocab-challenge' : 'vocab-srs',
        supportStage: 'guided',
        tags: ['vocabulary', 'srs', 'meaning'],
        title: 'Vocab Review',
        prompt: `What does ${record.tg} mean?`,
        choices: shuffle([record.en, ...distractors.map(item => item.en)]),
        answer: record.en,
        feedback: `${record.tg} means ${record.en}.`,
      };
    }
    return {
      type: 'choice',
      skill: 'recognition',
      itemId: `${record.id}:fidel`,
      vocabId: record.id,
      lessonTitle: mode === 'full' ? 'Full Glossary Challenge' : 'Unlocked Glossary SRS Deck',
      phaseId: mode === 'full' ? 'vocab-challenge' : 'vocab-srs',
      supportStage: 'guided',
      tags: ['vocabulary', 'srs', 'fidel'],
      title: 'Vocab Review',
      prompt: `Which Tigrinya form means “${record.en}”?`,
      choices: shuffle([record.tg, ...distractors.map(item => item.tg)]),
      answer: record.tg,
      feedback: `${record.en} = ${record.tg}.`,
    };
  }

  function saveReflection(step, value) {
    const text = String(value || '').trim();
    if (!text) return;
    const reflection = {
      id: `reflection-${Date.now()}`,
      lessonId: step.lessonId || state.lessonId || null,
      lessonTitle: step.lessonTitle || lessonById(step.lessonId || state.lessonId)?.title || 'Reflection',
      prompt: step.prompt || '',
      response: text,
      keywords: extractReflectionKeywords(text),
      timestamp: nowISO(),
    };
    state.progress.reflections = [reflection, ...(state.progress.reflections || [])].slice(0, 40);
    saveProgress();
  }

  function extractReflectionKeywords(text = '') {
    const lower = text.toLowerCase();
    const rules = [
      { keys: ['gender', 'male', 'female', 'masculine', 'feminine', 'ኻ', 'ኺ'], tag: 'gender-address' },
      { keys: ['fidel', 'script', 'letter', 'character', 'order', 'vowel'], tag: 'fidel-family' },
      { keys: ['pronoun', 'he', 'she', 'you', 'i '], tag: 'pronouns' },
      { keys: ['sentence', 'order', 'build'], tag: 'sentence-building' },
      { keys: ['question', 'who', 'what', 'where', 'ዶ'], tag: 'questions' },
      { keys: ['negative', 'negation', 'not', 'no'], tag: 'negation' },
      { keys: ['word', 'vocab', 'meaning', 'remember'], tag: 'vocabulary' },
      { keys: ['roman', 'pronunciation', 'sound'], tag: 'romanization-support' },
    ];
    return rules.filter(rule => rule.keys.some(key => lower.includes(key))).map(rule => rule.tag);
  }

  function reflectionRecommendations() {
    const counts = {};
    (state.progress.reflections || []).forEach(item => {
      (item.keywords || []).forEach(tag => { counts[tag] = (counts[tag] || 0) + 1; });
    });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 4).map(([tag, count]) => ({ tag, count }));
  }

  function generateFidelFastStep() {
    const family = shuffle(data.fidel.families)[0];
    const orderIndex = Math.floor(Math.random() * family.orders.length);
    const char = family.orders[orderIndex];
    const askOrderNumber = Math.random() > 0.5;
    if (askOrderNumber) {
      const correct = String(orderIndex + 1);
      return {
        type: 'choice',
        skill: 'fidel',
        itemId: `fidel-fast:${family.base}:${orderIndex}:number`,
        lessonTitle: 'Fidel Fast Match',
        phaseId: 'fidel-fast',
        supportStage: 'guided',
        tags: ['fidel', 'fidel-family', 'fidel-fast'],
        title: 'Fidel Fast Match',
        prompt: `What vowel order number is ${char}?`,
        choices: shuffle(['1', '2', '3', '4', '5', '6', '7']),
        answer: correct,
        feedback: `${char} is order ${correct}: ${data.fidel.orderNames[orderIndex]}.`,
      };
    }
    return {
      type: 'choice',
      skill: 'fidel',
      itemId: `fidel-fast:${family.base}:${orderIndex}:name`,
      lessonTitle: 'Fidel Fast Match',
      phaseId: 'fidel-fast',
      supportStage: 'guided',
      tags: ['fidel', 'fidel-family', 'fidel-fast'],
      title: 'Fidel Fast Match',
      prompt: `Which order name matches ${char}?`,
      choices: shuffle(data.fidel.orderNames),
      answer: data.fidel.orderNames[orderIndex],
      feedback: `${char} belongs to the ${data.fidel.orderNames[orderIndex]} position in the ${family.base} family.`,
    };
  }

  function nowISO() {
    return new Date().toISOString();
  }

  function daysSince(iso) {
    if (!iso) return 999;
    const then = new Date(iso).getTime();
    if (Number.isNaN(then)) return 999;
    return Math.max(0, Math.floor((Date.now() - then) / 86400000));
  }

  function stableHash(value) {
    const text = String(value || '');
    let hash = 0;
    for (let i = 0; i < text.length; i += 1) {
      hash = ((hash << 5) - hash) + text.charCodeAt(i);
      hash |= 0;
    }
    return Math.abs(hash).toString(36);
  }

  function escapeHTML(value) {
    return String(value ?? '').replace(/[&<>'"]/g, char => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
    })[char]);
  }

  function hasEthiopic(value) {
    return /[\u1200-\u137F]/.test(String(value));
  }

  function romanFor(value) {
    const key = String(value ?? '').trim();
    return romanMap.get(key) || '';
  }

  function romanWithTitlesHTML(roman = '') {
    return String(roman).split('').map(char => {
      const title = romanTitleMap.get(char);
      if (!title) return escapeHTML(char);
      return `<span class="roman-char" title="${escapeHTML(title)}" aria-label="${escapeHTML(`${char}: ${title}`)}">${escapeHTML(char)}</span>`;
    }).join('');
  }

  function romanHintHTML(value, supportStage = 'guided', explicitRoman = '') {
    const roman = explicitRoman || romanFor(value);
    if (!roman || supportStage === 'fidel') return '';
    const romanHTML = romanWithTitlesHTML(roman);
    if (supportStage === 'beginner') {
      return `<span class="roman-hint" aria-label="romanisation guide" title="Rough no-audio guide, not a full pronunciation system">${romanHTML}</span>`;
    }
    return `<details class="roman-details"><summary>pronunciation guide</summary><span class="roman-hint">${romanHTML}</span></details>`;
  }

  function formatChoice(value, supportStage = 'guided') {
    const safe = escapeHTML(value);
    if (!hasEthiopic(value)) return safe;
    return `<span class="choice-content"><span class="tg">${safe}</span>${romanHintHTML(value, supportStage)}</span>`;
  }

  function supportStageLabel(stage = 'guided') {
    const labels = {
      beginner: 'Beginner support',
      guided: 'Guided support',
      fidel: 'Fidel-only review',
    };
    return labels[stage] || labels.guided;
  }

  function supportStageDescription(stage = 'guided') {
    return (data.supportStages && data.supportStages[stage]) || 'Fidel and meaning stay primary; romanization appears only when useful.';
  }

  function shuffle(array) {
    const copy = [...array];
    for (let i = copy.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }

  function lessonById(id) {
    return data.lessons.find(lesson => lesson.id === id);
  }

  function phaseById(id) {
    return data.phases.find(phase => phase.id === id);
  }

  function phaseLessons(phaseId) {
    return data.lessons.filter(lesson => lesson.phase === phaseId);
  }

  function phaseComplete(phaseId) {
    const lessons = phaseLessons(phaseId);
    return lessons.length > 0 && lessons.every(lesson => state.progress.lessons[lesson.id]);
  }

  function lessonContainsText(lesson, needle) {
    if (!lesson || !needle) return false;
    return [lesson.title, lesson.goal, lesson.principle, lesson.vocab, lesson.steps].map(value => JSON.stringify(value || '')).join(' ').includes(needle);
  }

  function isVocabUnlocked(record) {
    if (!record || !record.tg) return false;
    return data.lessons.some(lesson => state.progress.lessons[lesson.id] && lessonContainsText(lesson, record.tg));
  }

  function unlockedVocabRecords() {
    return allVocabRecords().filter(isVocabUnlocked);
  }

  function isCorePhase(phaseId) {
    return CORE_PHASE_IDS.includes(phaseId);
  }

  function isCoreLesson(lesson) {
    return lesson && isCorePhase(lesson.phase);
  }

  function coreLessons() {
    return CORE_PHASE_IDS.flatMap(phaseId => phaseLessons(phaseId));
  }

  function exploreLessons() {
    return EXPLORE_PHASE_IDS.flatMap(phaseId => phaseLessons(phaseId));
  }

  function lessonTrack(lesson) {
    return isCoreLesson(lesson) ? coreLessons() : phaseLessons(lesson.phase);
  }

  function nextLessonId(currentId) {
    const current = lessonById(currentId);
    if (!current) return null;
    const track = lessonTrack(current);
    const idx = track.findIndex(lesson => lesson.id === currentId);
    return track[idx + 1]?.id || null;
  }

  function recommendedCoreLessonId() {
    const lessons = coreLessons();
    return lessons.find(lesson => !state.progress.lessons[lesson.id])?.id || lessons[0]?.id || data.lessons[0].id;
  }

  function recommendedExploreLessonId() {
    const lessons = exploreLessons();
    return lessons.find(lesson => !state.progress.lessons[lesson.id])?.id || lessons[0]?.id || data.lessons[0].id;
  }

  function recommendedLessonId() {
    const unfinishedCore = coreLessons().find(lesson => !state.progress.lessons[lesson.id]);
    if (unfinishedCore) return unfinishedCore.id;
    const unfinishedExplore = exploreLessons().find(lesson => !state.progress.lessons[lesson.id]);
    return unfinishedExplore?.id || coreLessons()[0]?.id || data.lessons[0].id;
  }

  function checkpointPassed(phaseId) {
    const value = state.progress.checkpoints?.[phaseId];
    return value === true || !!value?.passed;
  }

  function checkpointBestScore(phaseId) {
    const value = state.progress.checkpoints?.[phaseId];
    if (value === true) return 1;
    return Number(value?.bestScore || 0);
  }

  function resumeInfo() {
    const lesson = lessonById(state.progress.lastLessonId);
    if (!lesson || state.progress.lessons[lesson.id]) return null;
    const stepIndex = Math.min(Math.max(Number(state.progress.lastStepIndex || 0), 0), Math.max(lesson.steps.length - 1, 0));
    return { lesson, stepIndex, stepCount: lesson.steps.length };
  }



  const TAG_LABELS = {
    'method': 'How to use the course',
    'romanization-support': 'Romanization support',
    'fidel': 'Fidel recognition',
    'fidel-family': 'Fidel families',
    'greetings': 'Greetings',
    'pronouns': 'Pronouns',
    'gender-address': 'Masculine/feminine forms',
    'identity': 'Identity sentences',
    'sentence-building': 'Sentence building',
    'family-people': 'Family and people',
    'places': 'Places and direction',
    'verbs': 'Verb logic',
    'questions': 'Questions',
    'negation': 'Negation',
    'possession': 'Possession',
    'reading': 'Reading and self-correction',
    'recognition': 'Recognition',
    'production': 'Production',
    'meaning': 'Meaning choice',
    'pattern': 'Pattern discovery',
    'vocabulary': 'Vocabulary',
    'srs': 'Spaced repetition',
    'fidel-fast': 'Fidel Fast Match',
    'repair': 'Repair and self-correction',
    'dialogue': 'Mini-dialogues',
    'communicative-intent': 'Communicative intent',
    'prepositions': 'Prepositions',
    'transfer': 'Transfer',
    'checkpoint-prep': 'Checkpoint prep',
    'full-challenge': 'Full challenge',
    'requests': 'Requests and politeness',
    'numbers': 'Numbers',
    'time': 'Time and schedules',
    'food': 'Food and market',
    'travel': 'Travel and directions',
    'health': 'Health and safety',
    'poetry': 'Culture and poetry',
    'imperatives': 'Commands and suggestions',
    'advanced-map': 'Advanced grammar map',
  };

  function readableTag(tag) {
    const clean = String(tag || '').replace(/^skill:/, '').replace(/^type:/, '').replace(/^support:/, '');
    return TAG_LABELS[tag] || TAG_LABELS[clean] || clean.split('-').map(part => part.charAt(0).toUpperCase() + part.slice(1)).join(' ');
  }

  function stepText(step = {}, lesson = {}) {
    return [
      lesson.title,
      lesson.goal,
      lesson.phase,
      step.title,
      step.prompt,
      step.body,
      step.skill,
      step.answer,
      step.choices,
      step.bank,
      step.pairs,
      step.examples,
    ].map(value => JSON.stringify(value || '')).join(' ').toLowerCase();
  }

  function autoTags(step = {}, lesson = {}) {
    const tags = new Set();
    if (step.skill) tags.add(step.skill);
    if (step.type) tags.add(`type:${step.type}`);
    if (lesson.supportStage) tags.add(`support:${lesson.supportStage}`);
    const text = stepText(step, lesson);
    const contains = (...needles) => needles.some(needle => text.includes(needle));
    if (contains('romanization', 'pronunciation guide', 'support fade')) tags.add('romanization-support');
    if (contains('fidel', 'family ladder', 'vowel order', 'ሀ', 'ሁ', 'ሂ')) tags.add('fidel-family');
    if (contains('hello', 'greeting', 'peace', 'ሰላም', 'how are you', 'ከመይ')) tags.add('greetings');
    if (contains('pronoun', ' i ', ' he ', ' she ', ' you ', 'ኣነ', 'ንሱ', 'ንሳ', 'ንስኻ', 'ንስኺ')) tags.add('pronouns');
    if (contains('masculine', 'feminine', 'male', 'female', 'ኣለኻ', 'ኣለኺ', 'ንስኻ', 'ንስኺ')) tags.add('gender-address');
    if (contains('identity', ' i am', ' he is', ' she is', 'student', 'teacher', 'እየ', 'እዩ', 'እያ')) tags.add('identity');
    if (step.type === 'build' || step.type === 'sort' || contains('sentence', 'word order', 'build')) tags.add('sentence-building');
    if (contains('mother', 'father', 'sister', 'brother', 'friend', 'family', 'people')) tags.add('family-people');
    if (contains('place', 'where', 'home', 'school', 'direction', 'go to')) tags.add('places');
    if (contains('verb', 'action', 'eat', 'drink', 'go', 'come', 'want', 'have')) tags.add('verbs');
    if (contains('question', 'who', 'what', 'where', 'why', 'how', 'ዶ')) tags.add('questions');
    if (contains('negation', 'not', 'no ', 'ኣይ')) tags.add('negation');
    if (contains('my ', 'your ', 'his ', 'her ', 'possession', 'possessive')) tags.add('possession');
    if (contains('read', 'reading', 'self-correction', 'paragraph', 'decode')) tags.add('reading');
    return [...tags];
  }

  function usefulTags(tags = []) {
    return [...new Set(tags)].filter(tag => !String(tag).startsWith('type:') && !String(tag).startsWith('support:'));
  }

  function annotateStep(step = {}, lesson = {}, index = 0) {
    const tags = usefulTags([...(step.tags || []), ...autoTags(step, lesson)]);
    const phase = lesson.phase || step.phaseId || '';
    return {
      ...step,
      itemId: step.itemId || `${lesson.id || 'loose'}:step-${index}`,
      lessonId: lesson.id || step.lessonId || null,
      lessonTitle: lesson.title || step.lessonTitle || 'Practice item',
      phaseId: phase,
      supportStage: lesson.supportStage || step.supportStage || 'guided',
      tags,
    };
  }

  function correctAnswerSummary(step = {}) {
    if (step.type === 'choice') return String(step.answer || '');
    if (step.type === 'build' || step.type === 'sort') return (step.answer || []).join(' ');
    if (step.type === 'match') return 'matching pairs';
    return '';
  }

  function checkpointType(step = {}) {
    if (step.checkpointType) return step.checkpointType;
    const tags = usefulTags(step.tags || []);
    if (step.skill === 'repair' || tags.includes('repair')) return 'repair';
    if (step.skill === 'recognition' || step.type === 'match' || step.skill === 'fidel') return 'recognition';
    if (step.type === 'build' || step.type === 'sort' || step.skill === 'production') return 'production';
    if (tags.includes('transfer') || step.skill === 'transfer') return 'transfer';
    return 'meaning';
  }

  function checkpointTypeLabel(type = 'meaning') {
    const labels = {
      recognition: 'Recognition',
      meaning: 'Meaning',
      production: 'Production',
      repair: 'Repair',
      transfer: 'Transfer',
    };
    return labels[type] || readableTag(type);
  }

  function firstUsefulTag(step = {}) {
    const tags = usefulTags(step.tags || []);
    return tags.find(tag => !['meaning', 'production', 'recognition', 'transfer'].includes(tag)) || tags[0] || checkpointType(step);
  }

  function diagnosticFeedbackHTML(step = {}, correct = false, selected = '') {
    const base = step.feedback || (correct ? 'Correct.' : 'Check the pattern and try again.');
    if (correct) return escapeHTML(base);
    let diagnostic = '';
    if (step.wrongFeedback && selected && step.wrongFeedback[selected]) {
      diagnostic = step.wrongFeedback[selected];
    }
    if (!diagnostic && step.diagnosticFeedback) {
      if (typeof step.diagnosticFeedback === 'string') diagnostic = step.diagnosticFeedback;
      else diagnostic = step.diagnosticFeedback[selected] || step.diagnosticFeedback.default || '';
    }
    const tags = usefulTags(step.tags || []);
    const answer = correctAnswerSummary(step);
    if (!diagnostic && tags.includes('gender-address')) {
      if (String(selected).includes('ኻ') && String(answer).includes('ኺ')) {
        diagnostic = 'You chose the male-address form. Since the context points to one female addressee, look for the -ኺ ending.';
      } else if (String(selected).includes('ኺ') && String(answer).includes('ኻ')) {
        diagnostic = 'You chose the female-address form. Since the context points to one male addressee, look for the -ኻ ending.';
      } else {
        diagnostic = 'Check who is being addressed; Asmara Tigrinya often marks male/female address in the ending.';
      }
    }
    if (!diagnostic && tags.includes('negation')) diagnostic = 'Look for the whole negative frame, not just one marker: ኣይ near the start and ን at the end.';
    if (!diagnostic && (tags.includes('places') || tags.includes('prepositions'))) diagnostic = 'Ask whether the phrase means location, destination, or source: ኣብ = at/in, ናብ = to/toward, ካብ = from.';
    if (!diagnostic && tags.includes('identity')) diagnostic = 'Check alignment between the pronoun, person word, and copula form.';
    if (!diagnostic && tags.includes('fidel-family')) diagnostic = 'Compare the family shape and the vowel order instead of treating the symbol as isolated.';
    if (!diagnostic) diagnostic = `You selected “${selected}.” Look for the ${readableTag(firstUsefulTag(step))} clue.`;
    return `<strong>Not quite.</strong> ${escapeHTML(diagnostic)} <span class="answer-note">Correct answer: ${escapeHTML(answer || base)}</span>`;
  }

  function recordAttempt(step = {}, correct = false, source = 'practice') {
    if (!['choice', 'match', 'build', 'sort', 'type-in'].includes(step.type)) return;
    const adaptive = state.progress.adaptive || defaultAdaptive();
    state.progress.adaptive = adaptive;
    const itemId = step.itemId || `item-${stableHash(`${step.title}|${step.prompt}|${step.answer}`)}`;
    const timestamp = nowISO();
    const tags = usefulTags(step.tags && step.tags.length ? step.tags : autoTags(step, lessonById(step.lessonId) || {}));
    adaptive.attempts += 1;
    adaptive.lastSession = timestamp;
    if (correct) adaptive.correct += 1;
    else adaptive.incorrect += 1;

    const item = adaptive.itemStats[itemId] || {
      attempts: 0,
      correct: 0,
      wrong: 0,
      tags,
      title: step.title || 'Practice item',
      prompt: step.prompt || '',
      lessonTitle: step.lessonTitle || '',
      lessonId: step.lessonId || null,
      phaseId: step.phaseId || null,
      answer: correctAnswerSummary(step),
    };
    item.attempts += 1;
    if (correct) item.correct += 1;
    else item.wrong += 1;
    item.tags = tags;
    item.lastAttempt = timestamp;
    item.source = source;
    if (!correct) item.lastWrong = timestamp;
    adaptive.itemStats[itemId] = item;

    const severeTags = [];
    adaptive.consecutiveWrong = adaptive.consecutiveWrong || {};
    tags.forEach(tag => {
      const stat = adaptive.tagStats[tag] || { attempts: 0, correct: 0, wrong: 0, lastAttempt: null, lastWrong: null, consecutiveWrong: 0 };
      stat.attempts += 1;
      if (correct) {
        stat.correct += 1;
        stat.consecutiveWrong = 0;
        adaptive.consecutiveWrong[tag] = 0;
      } else {
        stat.wrong += 1;
        stat.consecutiveWrong = Number(stat.consecutiveWrong || 0) + 1;
        adaptive.consecutiveWrong[tag] = Number(adaptive.consecutiveWrong[tag] || 0) + 1;
        if (adaptive.consecutiveWrong[tag] >= 3 || stat.consecutiveWrong >= 3) severeTags.push(tag);
      }
      stat.lastAttempt = timestamp;
      if (!correct) stat.lastWrong = timestamp;
      adaptive.tagStats[tag] = stat;
    });

    if (!correct) {
      adaptive.recentMistakes = [
        {
          itemId,
          title: step.title || 'Practice item',
          prompt: step.prompt || '',
          lessonTitle: step.lessonTitle || '',
          answer: correctAnswerSummary(step),
          tags,
          timestamp,
        },
        ...(adaptive.recentMistakes || []).filter(item => item.itemId !== itemId),
      ].slice(0, 30);
    }
    updateVocabSRS(step, correct);
    saveProgress();
    return { tags, severeTags: [...new Set(severeTags)] };
  }

  function scoreItemForReview(step) {
    const stat = state.progress.adaptive?.itemStats?.[step.itemId];
    if (!stat) return 4;
    const wrongRate = stat.attempts ? stat.wrong / stat.attempts : 0;
    const age = daysSince(stat.lastAttempt);
    return (stat.wrong * 3) + (wrongRate * 4) + Math.min(age, 7) * 0.35 + (stat.correct === 0 ? 1 : 0);
  }

  function topWeakTags(limit = 5) {
    const statsObj = state.progress.adaptive?.tagStats || {};
    return Object.entries(statsObj)
      .filter(([tag, stat]) => usefulTags([tag]).length && stat.wrong > 0)
      .map(([tag, stat]) => ({
        tag,
        ...stat,
        score: (stat.wrong * 3) + ((stat.wrong / Math.max(stat.attempts, 1)) * 4) + Math.min(daysSince(stat.lastWrong), 7) * 0.2,
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }

  function completedInteractiveSteps() {
    return completedLessonSteps().filter(step => ['choice', 'match', 'build', 'sort', 'type-in'].includes(step.type));
  }

  function allInteractiveSteps() {
    return data.lessons.flatMap(lesson => lesson.steps.map((step, index) => annotateStep(step, lesson, index)))
      .filter(step => ['choice', 'match', 'build', 'sort', 'type-in'].includes(step.type));
  }

  function currentCheckpointPrepPool() {
    const phases = CORE_PHASE_IDS.concat(EXPLORE_PHASE_IDS);
    const target = phases.find(phaseId => {
      const lessons = phaseLessons(phaseId);
      return lessons.some(lesson => state.progress.lessons[lesson.id]) && !checkpointPassed(phaseId);
    }) || phases.find(phaseId => phaseLessons(phaseId).some(lesson => state.progress.lessons[lesson.id]));
    if (!target) return completedInteractiveSteps();
    return phaseLessons(target)
      .filter(lesson => state.progress.lessons[lesson.id])
      .flatMap(lesson => lesson.steps.map((step, index) => annotateStep(step, lesson, index)))
      .filter(step => ['choice', 'match', 'build', 'sort', 'type-in'].includes(step.type));
  }

  function stepMapByItemId() {
    const map = new Map();
    completedInteractiveSteps().forEach(step => map.set(step.itemId, step));
    return map;
  }

  function selectAdaptiveStep(mode, fallbackPool) {
    const all = completedInteractiveSteps();
    if (!all.length) return null;
    const byId = stepMapByItemId();
    let candidates = [];
    let reason = 'selected from completed lessons';
    if (mode === 'adaptive-mistakes') {
      candidates = (state.progress.adaptive?.recentMistakes || [])
        .map(item => byId.get(item.itemId))
        .filter(Boolean);
      reason = 'selected from recent mistakes';
    } else if (mode === 'adaptive-due') {
      candidates = all
        .filter(step => daysSince(state.progress.adaptive?.itemStats?.[step.itemId]?.lastAttempt) >= 2 || scoreItemForReview(step) >= 4)
        .sort((a, b) => scoreItemForReview(b) - scoreItemForReview(a));
      reason = 'selected because it is due or under-practiced';
    } else if (mode === 'adaptive-checkpoint') {
      candidates = currentCheckpointPrepPool().sort((a, b) => scoreItemForReview(b) - scoreItemForReview(a));
      reason = 'selected as checkpoint prep from the current unfinished phase';
    } else {
      const weak = topWeakTags(4).map(item => item.tag);
      candidates = all
        .filter(step => step.tags?.some(tag => weak.includes(tag)) || (state.progress.adaptive?.itemStats?.[step.itemId]?.wrong || 0) > 0)
        .sort((a, b) => scoreItemForReview(b) - scoreItemForReview(a));
      reason = weak.length ? `selected from weak pattern: ${readableTag(weak[0])}` : 'selected from patterns that need more attempts';
    }
    if (!candidates.length) candidates = fallbackPool?.length ? fallbackPool : all;
    const top = candidates.slice(0, Math.min(6, candidates.length));
    return { step: shuffle(top)[0], reason };
  }

  function adaptiveSummaryHTML() {
    const adaptive = state.progress.adaptive || defaultAdaptive();
    const weak = topWeakTags(4);
    const total = Math.max(adaptive.attempts || 0, 1);
    const accuracy = Math.round(((adaptive.correct || 0) / total) * 100);
    const completedCount = completedInteractiveSteps().length;
    const dueCount = completedInteractiveSteps().filter(step => daysSince(adaptive.itemStats?.[step.itemId]?.lastAttempt) >= 2 || scoreItemForReview(step) >= 5).length;
    const vocabDue = unlockedVocabRecords().filter(isVocabDue).length;
    const weakHTML = weak.length
      ? weak.map(item => `<span class="weak-chip">${escapeHTML(readableTag(item.tag))}<small>${item.wrong} miss${item.wrong === 1 ? '' : 'es'}</small></span>`).join('')
      : '<span class="small">No weak patterns yet. Missed answers will appear here.</span>';
    return `
      <section class="panel adaptive-panel">
        <div class="adaptive-header">
          <div>
            <p class="eyebrow">Adaptive Review</p>
            <h2>Practice reacts to your mistakes.</h2>
            <p>Every completed lesson item has tags. When you miss one, the browser stores the pattern locally and brings similar items back more often.</p>
          </div>
          <div class="adaptive-metrics">
            <div><strong>${adaptive.attempts || 0}</strong><span>attempts</span></div>
            <div><strong>${adaptive.attempts ? accuracy : '—'}${adaptive.attempts ? '%' : ''}</strong><span>accuracy</span></div>
            <div><strong>${dueCount}</strong><span>due items</span></div>
            <div><strong>${vocabDue}</strong><span>vocab due</span></div>
          </div>
        </div>
        <div class="weak-row"><strong>Current weak patterns:</strong><div>${weakHTML}</div></div>
        <div class="practice-actions">
          <button class="primary-button" data-practice-mode="adaptive-weak" ${completedCount ? '' : 'disabled'}>Review Weak Patterns</button>
          <button class="secondary-button" data-practice-mode="adaptive-mistakes" ${completedCount ? '' : 'disabled'}>Recent Mistakes</button>
          <button class="secondary-button" data-practice-mode="adaptive-due" ${completedCount ? '' : 'disabled'}>Due Today</button>
          <button class="secondary-button" data-practice-mode="adaptive-checkpoint" ${completedCount ? '' : 'disabled'}>Checkpoint Prep</button>
          <button class="secondary-button" data-practice-mode="full-challenge">Full Challenge</button>
          <button class="secondary-button" data-practice-mode="vocab-srs">Unlocked Vocab Review</button>
          <button class="secondary-button" data-practice-mode="vocab-challenge">Full Glossary Challenge</button>
        </div>
      </section>`;
  }

  function showToast(message) {
    document.querySelector('.toast')?.remove();
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 2600);
  }

  function setView(view, options = {}) {
    state.view = view;
    if (options.lessonId !== undefined) state.lessonId = options.lessonId;
    if (options.stepIndex !== undefined) state.stepIndex = options.stepIndex;
    if (options.practiceMode !== undefined) state.practiceMode = options.practiceMode;
    if (options.checkpoint !== undefined) state.checkpoint = options.checkpoint;
    updateNav();
    render();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function updateNav() {
    document.querySelectorAll('.nav-link').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.view === state.view);
    });
  }

  function stats() {
    const core = coreLessons();
    const explore = exploreLessons();
    return {
      completed: Object.values(state.progress.lessons).filter(Boolean).length,
      lessons: data.lessons.length,
      coreCompleted: core.filter(lesson => state.progress.lessons[lesson.id]).length,
      coreLessons: core.length,
      exploreLessons: explore.length,
      phases: data.phases.length,
      corePhases: CORE_PHASE_IDS.length,
      explorePhases: EXPLORE_PHASE_IDS.length,
      families: data.fidel.families.length,
      checkpoints: Object.values(state.progress.checkpoints).filter(item => item === true || item?.passed).length,
    };
  }

  function render() {
    switch (state.view) {
      case 'home': renderHome(); break;
      case 'path': renderPath(); break;
      case 'lesson': renderLesson(); break;
      case 'practice': renderPractice(); break;
      case 'explore': renderExplore(); break;
      case 'fidel': renderFidel(); break;
      case 'checkpoints': renderCheckpoints(); break;
      case 'guide': renderGuide(); break;
      default: renderHome();
    }
  }


  function readingLadderHTML(compact = false) {
    const ladder = data.readingLadder || [];
    if (!ladder.length) return '';
    return `<section class="panel reading-ladder-panel"><p class="eyebrow">Visible reading ladder</p><h2>How reading grows in this no-audio course.</h2><div class="reading-ladder ${compact ? 'compact' : ''}">${ladder.map(item => `
      <article class="reading-rung">
        <span class="rung-number">${escapeHTML(item.level)}</span>
        <div><h3>${escapeHTML(item.name)}</h3><p>${escapeHTML(item.canDo)}</p><p class="small tigrinya">${escapeHTML(item.example)}</p></div>
      </article>`).join('')}</div></section>`;
  }

  function renderHome() {
    const s = stats();
    const rec = lessonById(recommendedLessonId());
    const resume = resumeInfo();
    const coreDone = s.coreCompleted === s.coreLessons;
    app.innerHTML = `
      <section class="hero">
        <div class="hero-card">
          <p class="eyebrow">${escapeHTML(data.meta.subtitle)}</p>
          <h2>Start small. Build the system.</h2>
          <p class="lead">This no-audio Eritrean/Asmara Tigrinya course now separates the beginner-safe Core Path from the deeper Explore More library. The main path gives small Language Transfer-style wins first: support, notice, guess, check, and transfer.</p>
          <div class="hero-actions">
            <button class="primary-button" data-action="start">${coreDone ? 'Continue into Explore More' : 'Start / continue core path'}</button>
            <button class="secondary-button" data-view-go="path">View Core Path</button>
            <button class="secondary-button" data-view-go="explore">Open Explore More</button>
          </div>
        </div>
        <aside class="card sidebar-card">
          ${resume ? `
            <p class="eyebrow">Continue where you left off</p>
            <h3>${escapeHTML(resume.lesson.title)}</h3>
            <p>Resume at step ${resume.stepIndex + 1} of ${resume.stepCount}.</p>
            <button class="primary-button" data-action="resume-lesson">Resume lesson</button>
            <hr class="soft-rule" />
          ` : ''}
          <p class="eyebrow">Next recommended lesson</p>
          <h3>${escapeHTML(rec.title)}</h3>
          <p>${escapeHTML(rec.goal)}</p>
          <button class="primary-button" data-lesson-id="${rec.id}">Open lesson</button>
        </aside>
      </section>
      <section class="stats-grid">
        <div class="stat-card"><strong>${s.coreCompleted}/${s.coreLessons}</strong><span>core lessons complete</span></div>
        <div class="stat-card"><strong>${s.exploreLessons}</strong><span>optional deeper lessons</span></div>
        <div class="stat-card"><strong>${s.families}</strong><span>fidel families in the lab</span></div>
      </section>
      <section class="panel path-note">
        <p class="eyebrow">Simple path, deep library</p>
        <h2>The site is comprehensive, but the learner does not see everything at once.</h2>
        <p>The Core Path focuses on the first Eritrean/Asmara patterns: course orientation, greetings, fidel families, pronouns, identity sentences, and mini-conversations. Explore More holds the broader grammar and vocabulary material for learners who are ready.</p>
      </section>
      ${readingLadderHTML(true)}
      <section class="section-title"><div><p class="eyebrow">Teaching philosophy</p><h2>Not a flashcard wall.</h2></div></section>
      <section class="method-grid">
        <article class="method-card"><h3>1. Support</h3><p>Early lessons show fidel, romanization, and meaning together so no one has to already know the script.</p></article>
        <article class="method-card"><h3>2. Notice</h3><p>The learner predicts the pattern before receiving the explanation.</p></article>
        <article class="method-card"><h3>3. Transfer</h3><p>Each new pattern is reused in a choice, match, build, or dialogue task before the learner moves on.</p></article>
      </section>
      ${data.contentStatus ? `<section class="panel content-status"><p class="eyebrow">Content status</p><h2>${escapeHTML(data.contentStatus.label)}</h2><p>${escapeHTML(data.contentStatus.meaning)}</p></section>` : ''}
      <section class="panel">
        <h2>Honest scope</h2>
        <p>This app can build reading recognition, grammar awareness, sentence construction, beginner dialogue logic, and fidel confidence. Because it has no audio, it cannot fully teach pronunciation, listening, rhythm, or live speaking fluency. It is designed as a foundation for later native audio and conversation practice.</p>
      </section>
    `;
  }

  function renderPath() {
    const s = stats();
    const coreDone = s.coreCompleted === s.coreLessons;
    const corePhases = CORE_PHASE_IDS.map(id => phaseById(id)).filter(Boolean);
    app.innerHTML = `
      <section class="section-title">
        <div>
          <p class="eyebrow">Core Path</p>
          <h2>The small, linear foundation.</h2>
          <p class="lead">This path intentionally avoids showing the whole language too early. Finish these phases first to learn how the course thinks: script support, first phrases, fidel families, pronouns, identity sentences, and mini-conversations.</p>
        </div>
        ${coreDone ? `<button class="primary-button" data-view-go="explore">Open Explore More</button>` : `<button class="primary-button" data-lesson-id="${recommendedCoreLessonId()}">Continue core</button>`}
      </section>
      <section class="panel path-note">
        <p><strong>Design choice:</strong> the deeper grammar sequence still exists, but it has been moved out of the main path. The first path should make Tigrinya feel learnable before it becomes comprehensive.</p>
      </section>
      <section class="phase-list">
        ${corePhases.map((phase, index) => renderPhaseCard(phase, index, 'core')).join('')}
      </section>
      <section class="panel">
        <h2>Ready for more?</h2>
        <p>After the core, use Explore More for possession, places, verbs, sentence architecture, questions, negation, functional communication, and reading/self-correction.</p>
        <button class="secondary-button" data-view-go="explore">Browse Explore More</button>
      </section>
    `;
  }

  function renderExplore() {
    const explorePhases = EXPLORE_PHASE_IDS.map(id => phaseById(id)).filter(Boolean);
    app.innerHTML = `
      <section class="section-title">
        <div>
          <p class="eyebrow">Explore More</p>
          <h2>The deeper language library.</h2>
          <p class="lead">This section keeps the site comprehensive without overloading the beginner path. Use it when the core patterns feel familiar, or jump in when you need a specific topic.</p>
        </div>
        <button class="primary-button" data-lesson-id="${recommendedExploreLessonId()}">Continue deeper study</button>
      </section>
      <section class="method-grid">
        <article class="method-card"><h3>Grammar Lab</h3><p>Possession, gender agreement, verb logic, questions, and negation.</p></article>
        <article class="method-card"><h3>Vocabulary in patterns</h3><p>Family, place, direction, needs, requests, and communication contexts.</p></article>
        <article class="method-card"><h3>Intermediate bridge</h3><p>Sentence architecture, short reading, and self-correction practice.</p></article>
      </section>
      <section class="phase-list explore-list">
        ${explorePhases.map((phase, index) => renderPhaseCard(phase, index, 'explore')).join('')}
      </section>
    `;
  }

  function lessonContractHTML(lesson = {}, phase = {}) {
    const contract = lesson.contract || {};
    const items = [
      ['What am I learning?', contract.learn || lesson.goal || 'A small reusable Tigrinya pattern.'],
      ['Why does it matter?', contract.matter || lesson.principle || 'It gives you a pattern you can transfer.'],
      ['What can I do after this?', contract.canDo || phase.outcome || 'Use the pattern in a controlled task.'],
      ['How will I prove it?', contract.prove || phase.proof || 'Answer a recognition, production, or repair question.'],
    ];
    return `<div class="contract-grid">${items.map(([label, text]) => `<article><strong>${escapeHTML(label)}</strong><span>${escapeHTML(text)}</span></article>`).join('')}</div>`;
  }

  function renderPhaseCard(phase, index, track = 'core') {
    const lessons = phaseLessons(phase.id);
    const done = lessons.filter(lesson => state.progress.lessons[lesson.id]).length;
    const checkpointDone = checkpointPassed(phase.id);
    const bestScore = checkpointBestScore(phase.id);
    return `
      <article class="phase-card">
        <div class="phase-card-header">
          <div>
            <span class="level-badge">${escapeHTML(phase.level)}</span>
            <h3>${track === 'core' ? `Core ${index + 1}` : `Explore ${index + 1}`}: ${escapeHTML(phase.title)}</h3>
            <p>${escapeHTML(phase.goal)}</p>
            ${phase.outcome ? `<p class="small"><strong>Can-do outcome:</strong> ${escapeHTML(phase.outcome)}</p>` : ''}
            ${phase.proof ? `<p class="small"><strong>How you prove it:</strong> ${escapeHTML(phase.proof)}</p>` : ''}
          </div>
          <span class="status-badge ${done === lessons.length ? 'done' : ''}">${done}/${lessons.length} lessons</span>
        </div>
        <div class="lesson-list">
          ${lessons.map(lesson => `
            <button class="lesson-mini" data-lesson-id="${lesson.id}">
              <strong>${state.progress.lessons[lesson.id] ? '✓ ' : ''}${escapeHTML(lesson.title)}</strong>
              <span>${escapeHTML(lesson.goal)}</span>
            </button>
          `).join('')}
        </div>
        <div class="row-actions"><button class="secondary-button" data-start-checkpoint="${phase.id}">${checkpointDone ? `Retake checkpoint (${Math.round(bestScore * 100)}% best)` : 'Take checkpoint'}</button></div>
      </article>
    `;
  }

  function renderLesson() {
    const lesson = lessonById(state.lessonId || recommendedLessonId());
    if (!lesson) return renderPath();
    state.progress.lastLessonId = lesson.id;
    state.progress.lastStepIndex = state.stepIndex;
    saveProgress();
    const phase = phaseById(lesson.phase);
    const phaseList = phaseLessons(lesson.phase);
    const supportStage = lesson.supportStage || 'guided';
    const step = annotateStep(lesson.steps[state.stepIndex] || lesson.steps[0], lesson, state.stepIndex);
    const pct = Math.round((state.stepIndex / Math.max(lesson.steps.length, 1)) * 100);
    app.innerHTML = `
      <section class="lesson-layout">
        <aside class="card lesson-nav">
          <strong>${escapeHTML(phase.title)}</strong>
          ${phaseList.map(item => `<button data-lesson-id="${item.id}" class="${item.id === lesson.id ? 'active' : ''}">${state.progress.lessons[item.id] ? '✓ ' : ''}${escapeHTML(item.title)}</button>`).join('')}
          <button class="secondary-button" data-view-go="${isCorePhase(phase.id) ? 'path' : 'explore'}">${isCorePhase(phase.id) ? 'Core Path' : 'Explore More'}</button>
        </aside>
        <article class="lesson-shell">
          <header class="lesson-header">
            <span class="level-badge">${escapeHTML(phase.level)}</span>
            <h2>${escapeHTML(lesson.title)}</h2>
            <p>${escapeHTML(lesson.goal)}</p>
            <p><strong>Language Transfer principle:</strong> ${escapeHTML(lesson.principle)}</p>
            <p class="review-status-note compact"><strong>Content status:</strong> ${escapeHTML(data.contentStatus?.label || lesson.reviewStatus || 'pedagogical draft')} · see Guide for native-review notes.</p>
            ${lessonContractHTML(lesson, phase)}
            <div class="support-banner"><strong>${escapeHTML(supportStageLabel(supportStage))}</strong><span>${escapeHTML(supportStageDescription(supportStage))}</span></div>
            <div class="progress-line"><span style="width:${pct}%"></span></div>
            <p class="small">Step ${state.stepIndex + 1} of ${lesson.steps.length}</p>
          </header>
          <div class="step-area" id="stepArea"></div>
        </article>
      </section>
    `;
    renderInteractiveStep(document.querySelector('#stepArea'), step, {
      nav: true,
      canContinue: ['concept', 'table', 'reflection'].includes(step.type) || (step.type === 'type-in' && step.optional),
      onPrev: () => {
        state.stepIndex = Math.max(0, state.stepIndex - 1);
        renderLesson();
      },
      onNext: () => completeOrAdvanceLesson(lesson),
      supportStage,
      reviewSource: 'lesson',
    });
  }

  function completeOrAdvanceLesson(lesson) {
    state.progress.lastLessonId = lesson.id;
    state.progress.lastStepIndex = state.stepIndex;
    if (state.stepIndex >= lesson.steps.length - 1) {
      state.progress.lessons[lesson.id] = true;
      state.progress.lastLessonId = lesson.id;
      state.progress.lastStepIndex = 0;
      saveProgress();
      showToast(`Lesson complete: ${lesson.title}`);
      const next = nextLessonId(lesson.id);
      if (next) {
        setView('lesson', { lessonId: next, stepIndex: 0 });
      } else if (isCoreLesson(lesson)) {
        setView('path');
      } else {
        setView('explore');
      }
      return;
    }
    state.stepIndex += 1;
    state.progress.lastLessonId = lesson.id;
    state.progress.lastStepIndex = state.stepIndex;
    saveProgress();
    renderLesson();
  }

  function renderInteractiveStep(container, step, options = {}) {
    container.innerHTML = stepHTML(step, options);
    const nextBtn = container.querySelector('[data-action="next-step"]');
    const prevBtn = container.querySelector('[data-action="prev-step"]');
    if (prevBtn) prevBtn.addEventListener('click', options.onPrev || (() => {}));
    if (nextBtn) nextBtn.addEventListener('click', () => {
      if (step.type === 'reflection') {
        const textarea = container.querySelector('[data-reflection-input]');
        saveReflection(step, textarea?.value || '');
      }
      (options.onNext || (() => {}))();
    });
    const onAttempt = (correct, learnerAnswer = '') => {
      const result = recordAttempt(step, correct, options.reviewSource || state.view || 'practice') || {};
      if (typeof options.onAttempt === 'function') options.onAttempt(correct, step, learnerAnswer);
      if (!correct && options.reviewSource === 'lesson' && result.severeTags?.length) {
        injectDrillOffer(container, result.severeTags, step);
      }
      if (correct || step.type === 'choice' || (step.type === 'type-in' && step.optional)) enableNext(container);
    };
    if (step.type === 'choice') bindChoice(container, step, onAttempt);
    if (step.type === 'match') bindMatch(container, step, onAttempt);
    if (step.type === 'build' || step.type === 'sort') bindBuild(container, step, onAttempt);
    if (step.type === 'type-in') bindTypeIn(container, step, onAttempt);
  }

  function stepHTML(step, options = {}) {
    if (step.type === 'concept') return conceptHTML(step, options);
    if (step.type === 'choice') return choiceHTML(step, options);
    if (step.type === 'match') return matchHTML(step, options);
    if (step.type === 'build' || step.type === 'sort') return buildHTML(step, options);
    if (step.type === 'type-in') return typeInHTML(step, options);
    if (step.type === 'table') return tableHTML(step, options);
    if (step.type === 'reflection') return reflectionHTML(step, options);
    return conceptHTML({ title: 'Study', body: 'Review this pattern.', examples: [] }, options);
  }

  function cardHTML(title, body, step = null) {
    const status = '';
    return `<div class="step-card"><h3>${escapeHTML(title)}</h3>${status}${body}</div>`;
  }

  function examplesHTML(examples = [], supportStage = 'guided') {
    if (!examples.length) return '';
    return `<div class="example-grid">${examples.map(ex => `
      <div class="example-card">
        <div class="example-script"><p class="tigrinya">${escapeHTML(ex.tg)}</p>${romanHintHTML(ex.tg, supportStage, ex.roman || '')}</div>
        <div><p><strong>${escapeHTML(ex.en)}</strong></p>${ex.note ? `<p class="note">${escapeHTML(ex.note)}</p>` : ''}</div>
      </div>`).join('')}</div>`;
  }

  function navHTML(options = {}) {
    if (!options.nav) return '';
    const disabled = options.canContinue ? '' : 'disabled aria-disabled="true"';
    const backDisabled = state.stepIndex === 0 ? 'disabled aria-disabled="true"' : '';
    const nextText = state.view === 'lesson' && state.lessonId && state.stepIndex >= (lessonById(state.lessonId)?.steps.length || 1) - 1 ? 'Finish lesson' : 'Continue';
    return `<div class="lesson-actions"><button class="secondary-button" data-action="prev-step" ${backDisabled}>Back</button><button class="primary-button" data-action="next-step" ${disabled}>${nextText}</button></div>`;
  }

  function conceptHTML(step, options) {
    return cardHTML(step.title, `<p>${escapeHTML(step.body)}</p>${examplesHTML(step.examples, options.supportStage)}<p class="coach">${escapeHTML(step.coach || 'Pause and explain the pattern before moving on.')}</p>${navHTML({ ...options, canContinue: true })}`, step);
  }

  function choiceHTML(step, options) {
    return cardHTML(step.title, `<p>${escapeHTML(step.prompt)}</p><div class="choice-list">${step.choices.map(choice => `<button class="answer-button" data-choice="${escapeHTML(choice)}">${formatChoice(choice, options.supportStage)}</button>`).join('')}</div><p class="feedback" id="feedback" aria-live="polite"></p>${navHTML(options)}`, step);
  }

  function matchHTML(step, options) {
    const left = shuffle(step.pairs.map((pair, index) => ({ id: index, text: pair[0] })));
    const right = shuffle(step.pairs.map((pair, index) => ({ id: index, text: pair[1] })));
    return cardHTML(step.title, `<p>${escapeHTML(step.prompt)}</p><div class="match-grid"><div class="match-column">${left.map(item => `<button class="answer-button match-token" data-side="left" data-id="${item.id}">${formatChoice(item.text, options.supportStage)}</button>`).join('')}</div><div class="match-column">${right.map(item => `<button class="answer-button match-token" data-side="right" data-id="${item.id}">${formatChoice(item.text, options.supportStage)}</button>`).join('')}</div></div><p class="feedback" id="feedback" aria-live="polite">Select one item on the left, then its match on the right.</p>${navHTML(options)}`, step);
  }

  function buildHTML(step, options) {
    return cardHTML(step.title, `<p>${escapeHTML(step.prompt)}</p><div class="answer-strip" id="answerStrip"><span class="small">Tap tokens below to build your answer. Use Clear to undo the whole answer if needed.</span></div><div class="bank-list">${step.bank.map((token, index) => `<button class="bank-token" data-token="${escapeHTML(token)}" data-index="${index}">${formatChoice(token, options.supportStage)}</button>`).join('')}</div><div class="lesson-actions"><button class="secondary-button" data-action="clear-build">Clear</button><button class="secondary-button" data-action="undo-build">Undo last</button><button class="primary-button" data-action="check-build">Check</button></div><p class="feedback" id="feedback" aria-live="polite"></p>${navHTML(options)}`, step);
  }

  function typeInHTML(step, options) {
    const optional = step.optional ? '<p class="small"><strong>Optional:</strong> This builds fidel motor memory. Skip it if you do not have an Ethiopic keyboard.</p>' : '';
    return cardHTML(step.title, `<p>${escapeHTML(step.prompt)}</p>${optional}<label class="typein-label"><span>Your fidel answer</span><input class="typein-input" data-typein-input autocomplete="off" inputmode="text" /></label><div class="lesson-actions"><button class="primary-button" data-action="check-typein">Check</button></div><p class="feedback" id="feedback" aria-live="polite"></p>${navHTML(options)}`, step);
  }

  function tableHTML(step, options) {
    return cardHTML(step.title, `<div class="table-wrap"><table><thead><tr>${step.columns.map(col => `<th>${escapeHTML(col)}</th>`).join('')}</tr></thead><tbody>${step.rows.map(row => `<tr>${row.map(cell => `<td>${formatChoice(cell, options.supportStage)}</td>`).join('')}</tr>`).join('')}</tbody></table></div><p class="coach">${escapeHTML(step.note || '')}</p>${navHTML({ ...options, canContinue: true })}`, step);
  }

  function reflectionHTML(step, options) {
    return cardHTML(step.title, `<p>${escapeHTML(step.prompt)}</p><textarea data-reflection-input placeholder="Write a quick response. It stays in your browser only."></textarea><p class="coach"><strong>Sample direction:</strong> ${escapeHTML(step.sample)}</p><p class="small">Your reflection will appear later in Practice, where it can suggest review topics like fidel, gender, questions, or negation.</p>${navHTML({ ...options, canContinue: true })}`, step);
  }

  function enableNext(container) {
    const btn = container.querySelector('[data-action="next-step"]');
    if (btn) {
      btn.disabled = false;
      btn.removeAttribute('aria-disabled');
    }
  }

  function injectDrillOffer(container, tags = [], step = {}) {
    const tag = usefulTags(tags)[0];
    if (!tag || container.querySelector('[data-action="drill-pattern"]')) return;
    const feedback = container.querySelector('#feedback') || container.querySelector('.step-card');
    const message = document.createElement('div');
    message.className = 'drill-offer';
    message.innerHTML = `<strong>Weakest Pattern Drill unlocked:</strong> You have missed ${escapeHTML(readableTag(tag))} several times in a row. <button class="secondary-button" data-action="drill-pattern" data-drill-tag="${escapeHTML(tag)}">Drill this pattern</button>`;
    feedback?.insertAdjacentElement('afterend', message);
  }

  function bindChoice(container, step, onSolved) {
    container.querySelectorAll('[data-choice]').forEach(button => {
      button.addEventListener('click', () => {
        const correct = button.dataset.choice === step.answer;
        container.querySelectorAll('[data-choice]').forEach(btn => {
          btn.disabled = true;
          if (btn.dataset.choice === step.answer) btn.classList.add('correct');
        });
        if (!correct) button.classList.add('wrong');
        const feedback = container.querySelector('#feedback');
        if (feedback) {
          feedback.innerHTML = diagnosticFeedbackHTML(step, correct, button.dataset.choice);
          feedback.className = `feedback ${correct ? 'good' : 'bad'}`;
        }
        onSolved(correct, button.dataset.choice);
      });
    });
  }

  function bindMatch(container, step, onSolved) {
    let selected = null;
    let matched = 0;
    container.querySelectorAll('.match-token').forEach(button => {
      button.addEventListener('click', () => {
        if (button.classList.contains('matched')) return;
        if (!selected) {
          selected = button;
          button.classList.add('selected');
          return;
        }
        if (selected === button) {
          selected.classList.remove('selected');
          selected = null;
          return;
        }
        const good = selected.dataset.side !== button.dataset.side && selected.dataset.id === button.dataset.id;
        const feedback = container.querySelector('#feedback');
        if (good) {
          selected.classList.remove('selected');
          selected.classList.add('matched');
          button.classList.add('matched');
          selected.disabled = true;
          button.disabled = true;
          matched += 1;
          if (feedback) {
            feedback.innerHTML = matched === step.pairs.length ? 'All matches complete. Pattern recognized.' : 'Correct match. Keep going.';
            feedback.className = 'feedback good';
          }
          if (matched === step.pairs.length) onSolved(true, 'all pairs matched');
        } else {
          selected.classList.remove('selected');
          button.classList.add('wrong');
          if (feedback) {
            feedback.innerHTML = diagnosticFeedbackHTML(step, false, 'that pair');
            feedback.className = 'feedback bad';
          }
          const attemptedPair = `${selected.textContent.trim()} ↔ ${button.textContent.trim()}`;
          onSolved(false, attemptedPair);
          setTimeout(() => button.classList.remove('wrong'), 550);
        }
        selected = null;
      });
    });
  }

  function bindBuild(container, step, onSolved) {
    const strip = container.querySelector('#answerStrip');
    container.querySelectorAll('.bank-token').forEach(button => {
      button.addEventListener('click', () => {
        strip.querySelector('.small')?.remove();
        const clone = button.cloneNode(true);
        clone.classList.remove('bank-token');
        clone.classList.add('choice-token');
        clone.dataset.answerToken = button.dataset.token;
        clone.addEventListener('click', () => {
          button.disabled = false;
          clone.remove();
          if (!strip.querySelector('[data-answer-token]')) {
            strip.innerHTML = '<span class="small">Tap tokens below to build your answer.</span>';
          }
        });
        strip.appendChild(clone);
        button.disabled = true;
      });
    });
    container.querySelector('[data-action="clear-build"]')?.addEventListener('click', () => {
      strip.innerHTML = '<span class="small">Tap tokens below to build your answer.</span>';
      container.querySelectorAll('.bank-token').forEach(btn => { btn.disabled = false; btn.classList.remove('correct', 'wrong'); });
      const feedback = container.querySelector('#feedback');
      if (feedback) feedback.textContent = '';
    });
    container.querySelector('[data-action="undo-build"]')?.addEventListener('click', () => {
      const tokens = [...container.querySelectorAll('[data-answer-token]')];
      const last = tokens[tokens.length - 1];
      if (!last) return;
      const source = [...container.querySelectorAll('.bank-token')].find(btn => btn.dataset.token === last.dataset.answerToken && btn.disabled);
      if (source) source.disabled = false;
      last.remove();
      if (!strip.querySelector('[data-answer-token]')) {
        strip.innerHTML = '<span class="small">Tap tokens below to build your answer.</span>';
      }
    });
    container.querySelector('[data-action="check-build"]')?.addEventListener('click', () => {
      const answer = [...container.querySelectorAll('[data-answer-token]')].map(token => token.dataset.answerToken);
      const correct = JSON.stringify(answer) === JSON.stringify(step.answer);
      const feedback = container.querySelector('#feedback');
      if (feedback) {
        feedback.innerHTML = correct ? escapeHTML(step.feedback || 'Correct.') : diagnosticFeedbackHTML(step, false, answer.join(' '));
        feedback.className = `feedback ${correct ? 'good' : 'bad'}`;
      }
      container.querySelectorAll('[data-answer-token]').forEach(token => token.classList.add(correct ? 'correct' : 'wrong'));
      onSolved(correct, answer.join(' '));
    });
  }

  function reflectionsPanelHTML() {
    const reflections = state.progress.reflections || [];
    const recs = reflectionRecommendations();
    if (!reflections.length) {
      return `<section class="panel reflection-panel"><p class="eyebrow">Your past reflections</p><h2>No reflections saved yet.</h2><p>Reflection steps in lessons will be saved here. When you mention things like “gender,” “fidel,” or “questions,” the site will recommend relevant review.</p></section>`;
    }
    const recHTML = recs.length
      ? `<div class="weak-row"><strong>Reflection-based recommendations:</strong><div>${recs.map(item => `<button class="weak-chip clickable" data-drill-tag="${escapeHTML(item.tag)}" data-action="drill-pattern">${escapeHTML(readableTag(item.tag))}<small>${item.count} note${item.count === 1 ? '' : 's'}</small></button>`).join('')}</div></div>`
      : '<p class="small">No keywords detected yet. Try mentioning what felt hard: fidel, gender, questions, negation, or vocabulary.</p>';
    return `<section class="panel reflection-panel"><p class="eyebrow">Your past reflections</p><h2>Metacognition becomes review.</h2>${recHTML}<div class="reflection-list">${reflections.slice(0, 5).map(item => `<article class="reflection-card"><strong>${escapeHTML(item.lessonTitle)}</strong><p>${escapeHTML(item.response)}</p><p class="small">${(item.keywords || []).map(readableTag).join(' · ') || 'No keyword tags'} · ${new Date(item.timestamp).toLocaleDateString()}</p></article>`).join('')}</div></section>`;
  }

  function bindTypeIn(container, step, onSolved) {
    const input = container.querySelector('[data-typein-input]');
    const check = container.querySelector('[data-action="check-typein"]');
    const feedback = container.querySelector('#feedback');
    const accepted = new Set([step.answer, ...(step.accepted || [])].filter(Boolean).map(value => String(value).trim()));
    const evaluate = () => {
      const value = String(input?.value || '').trim();
      const correct = accepted.has(value);
      if (feedback) {
        feedback.innerHTML = correct ? escapeHTML(step.feedback || 'Correct.') : diagnosticFeedbackHTML(step, false, value || 'blank answer');
        feedback.className = `feedback ${correct ? 'good' : 'bad'}`;
      }
      onSolved(correct, value || 'blank answer');
    };
    check?.addEventListener('click', evaluate);
    input?.addEventListener('keydown', event => {
      if (event.key === 'Enter') evaluate();
    });
  }

  function patternCoachHTML(tag) {
    const coach = PATTERN_COACHES[tag];
    if (!coach) return '';
    return `<article class="pattern-coach"><p class="eyebrow">Weakest Pattern Drill</p><h3>${escapeHTML(readableTag(tag))}</h3><p><strong>Rule:</strong> ${escapeHTML(coach.rule)}</p><ul>${coach.examples.map(ex => `<li>${escapeHTML(ex)}</li>`).join('')}</ul><p class="small"><strong>Contrast:</strong> ${escapeHTML(coach.contrast)}</p></article>`;
  }

  function renderPractice() {
    const modes = [
      { id: 'meaning', title: 'Meaning Choice', desc: 'Choose what a Tigrinya form means.' },
      { id: 'pattern', title: 'Pattern Discovery', desc: 'Answer why a form changes.' },
      { id: 'recognition', title: 'Matching', desc: 'Pair Tigrinya items with meanings.' },
      { id: 'production', title: 'Sentence Builder', desc: 'Build sentences and ordered patterns from blocks.' },
      { id: 'fidel', title: 'Fidel Review', desc: 'Practice families and vowel-order sorting.' },
      { id: 'fidel-fast', title: 'Fidel Fast Match', desc: 'Quickly identify vowel order names or numbers for fidel characters.' },
      { id: 'vocab-srs', title: 'Unlocked Vocab Review', desc: 'Review due words from completed lessons only.' },
      { id: 'vocab-challenge', title: 'Full Glossary Challenge', desc: 'Optional challenge mode using the whole glossary.' },
      { id: 'adaptive-checkpoint', title: 'Checkpoint Prep', desc: 'Practice items from the current unfinished phase before a mastery test.' },
      { id: 'full-challenge', title: 'Full Challenge', desc: 'Optional challenge mode that can pull from the whole course.' },
      { id: 'mixed', title: 'Mixed Review', desc: 'Random transfer questions.' },
    ];
    app.innerHTML = `
      <section class="section-title"><div><p class="eyebrow">Practice</p><h2>Review through games.</h2><p class="lead">Practice only pulls from completed lessons. Adaptive Review also uses completed material, but prioritizes what you miss and what is due.</p></div></section>
      ${adaptiveSummaryHTML()}
      ${reflectionsPanelHTML()}
      <section class="section-title practice-section-title"><div><p class="eyebrow">Standard review</p><h2>Choose a practice mode.</h2></div></section>
      <section class="practice-grid">${modes.map(mode => `<article class="game-card"><h3>${escapeHTML(mode.title)}</h3><p>${escapeHTML(mode.desc)}</p><button class="primary-button" data-practice-mode="${mode.id}">Start</button></article>`).join('')}</section>
      <section id="practiceArea"></section>
    `;
    if (state.practiceMode) renderPracticeRound(state.practiceMode);
  }

  function completedLessonSteps() {
    return data.lessons
      .filter(lesson => state.progress.lessons[lesson.id])
      .flatMap(lesson => lesson.steps.map((step, index) => annotateStep(step, lesson, index)));
  }

  function collectSteps(predicate = () => true) {
    return completedLessonSteps().filter(predicate);
  }

  function renderPracticeRound(mode) {
    const area = document.querySelector('#practiceArea');
    if (mode === 'vocab-srs' || mode === 'vocab-challenge' || mode === 'fidel-fast') {
      const step = mode === 'fidel-fast' ? generateFidelFastStep() : generateVocabReviewStep(mode === 'vocab-challenge' ? 'full' : 'unlocked');
      if (!step) {
        area.innerHTML = `<section class="panel empty-state"><h2>No review item found.</h2><p>The glossary or fidel data is not available.</p></section>`;
        return;
      }
      area.innerHTML = `<section class="panel"><p class="eyebrow">Practice mode: ${escapeHTML(mode === 'fidel-fast' ? 'Fidel Fast Match' : (mode === 'vocab-challenge' ? 'Full Glossary Challenge' : 'Unlocked Vocab Review'))}</p><h2>${escapeHTML(step.title)}</h2><div id="practiceStep"></div><div class="practice-actions"><button class="secondary-button" data-practice-mode="${mode}">New question</button></div></section>`;
      renderInteractiveStep(document.querySelector('#practiceStep'), step, { nav: false, supportStage: step.supportStage || 'guided', reviewSource: mode });
      return;
    }
    if (!completedLessonSteps().length) {
      area.innerHTML = `<section class="panel empty-state"><h2>Complete one lesson first.</h2><p>Practice is locked to completed lessons so the site does not quiz you on patterns you have not studied yet.</p><button class="primary-button" data-lesson-id="${recommendedCoreLessonId()}">Start the core path</button></section>`;
      return;
    }
    let pool;
    let selected;
    let reason = 'completed lessons only';
    if (mode.startsWith('drill:')) {
      const tag = mode.slice('drill:'.length);
      pool = collectSteps(step => ['choice', 'match', 'build', 'sort', 'type-in'].includes(step.type) && step.tags?.includes(tag));
      reason = `selected for drill pattern: ${readableTag(tag)}`;
    } else if (mode === 'full-challenge') {
      pool = allInteractiveSteps();
      reason = 'full challenge can include material from the whole course';
    } else if (mode === 'adaptive-checkpoint') {
      pool = currentCheckpointPrepPool();
      reason = 'checkpoint prep from the current unfinished phase';
    } else if (mode === 'mixed') pool = collectSteps(step => ['choice', 'match', 'build', 'sort', 'type-in'].includes(step.type));
    else if (mode === 'production') pool = collectSteps(step => ['build', 'sort', 'type-in'].includes(step.type));
    else if (mode === 'recognition') pool = collectSteps(step => step.type === 'match');
    else if (mode === 'fidel') pool = collectSteps(step => step.skill === 'fidel' || step.tags?.includes('fidel-family') || step.type === 'sort');
    else if (mode.startsWith('adaptive-')) pool = collectSteps(step => ['choice', 'match', 'build', 'sort', 'type-in'].includes(step.type));
    else pool = collectSteps(step => step.type === 'choice' && (step.skill === mode || step.tags?.includes(mode) || (!step.skill && mode === 'meaning')));
    if (!pool.length) pool = collectSteps(step => ['choice', 'match', 'build', 'sort', 'type-in'].includes(step.type));

    if (mode.startsWith('adaptive-')) {
      const adaptiveSelection = selectAdaptiveStep(mode, pool);
      selected = adaptiveSelection?.step;
      reason = adaptiveSelection?.reason || 'selected adaptively from completed lessons';
    } else {
      selected = shuffle(pool)[0];
    }
    const step = selected;
    if (!step) {
      area.innerHTML = `<section class="panel empty-state"><h2>No review item found.</h2><p>Complete another lesson or choose a different practice mode.</p></section>`;
      return;
    }
    const tagText = usefulTags(step.tags || []).slice(0, 4).map(readableTag).join(' · ') || 'general review';
    const coachTag = mode.startsWith('drill:') ? mode.slice('drill:'.length) : (mode === 'adaptive-weak' ? firstUsefulTag(step) : '');
    area.innerHTML = `
      <section class="panel">
        <p class="eyebrow">Practice mode: ${escapeHTML(mode.replace('adaptive-', 'adaptive: '))}</p>
        <h2>${mode.startsWith('adaptive-') ? 'Adaptive question' : 'Practice question'}</h2>
        <p class="small"><strong>Why this item?</strong> ${escapeHTML(reason)}. <strong>Tags:</strong> ${escapeHTML(tagText)}.</p>
        ${patternCoachHTML(coachTag)}
        <div id="practiceStep"></div>
        <div class="practice-actions"><button class="secondary-button" data-practice-mode="${mode}">New question</button></div>
      </section>`;
    renderInteractiveStep(document.querySelector('#practiceStep'), step, { nav: false, supportStage: step.supportStage || 'guided', reviewSource: mode });
  }

  function renderFidel() {
    const family = data.fidel.families.find(item => item.base === state.currentFamily) || data.fidel.families[0];
    app.innerHTML = `
      <section class="section-title"><div><p class="eyebrow">Fidel Lab</p><h2>One family at a time.</h2><p class="lead">Study the Geʽez/Ethiopic script as repeating family ladders rather than one giant chart. Use Fidel Fast Match when you want automaticity.</p></div><button class="primary-button" data-practice-mode="fidel-fast" data-view-jump="practice">Fidel Fast Match</button></section>
      <section class="panel">
        <div class="fidel-toolbar">${data.fidel.families.map(item => `<button class="chip-button ${item.base === family.base ? 'active' : ''}" data-family="${escapeHTML(item.base)}"><span class="tigrinya">${escapeHTML(item.base)}</span> ${escapeHTML(item.name)}</button>`).join('')}</div>
        <article class="fidel-card">
          <h3><span class="tigrinya">${escapeHTML(family.base)}</span> family: ${escapeHTML(family.name)}</h3>
          <p>The consonant family stays visually related while vowel order changes.</p>
          <div class="fidel-grid">${family.orders.map((char, i) => `<div class="fidel-cell"><strong class="tigrinya">${escapeHTML(char)}</strong><span>${escapeHTML(data.fidel.orderNames[i])}</span></div>`).join('')}</div>
          <div class="lesson-actions"><button class="primary-button" data-fidel-quiz="${escapeHTML(family.base)}">Quiz this family</button></div>
        </article>
      </section>
      <section id="fidelQuizArea"></section>
    `;
  }

  function renderFidelQuiz(base) {
    const family = data.fidel.families.find(item => item.base === base);
    if (!family) return;
    const step = { type: 'sort', skill: 'fidel', itemId: `fidel:${family.base}:sort`, lessonTitle: 'Fidel Lab', phaseId: 'fidel-lab', supportStage: 'guided', tags: ['fidel', 'fidel-family'], title: `Sort the ${family.base} family`, prompt: 'Tap the characters in the seven-order sequence.', bank: shuffle(family.orders), answer: family.orders, feedback: 'Correct. You reconstructed the family ladder.' };
    const area = document.querySelector('#fidelQuizArea');
    area.innerHTML = `<section class="panel"><div id="fidelQuizStep"></div></section>`;
    renderInteractiveStep(document.querySelector('#fidelQuizStep'), step, { nav: false, supportStage: 'guided', reviewSource: 'fidel-lab' });
  }

  function selectCheckpointQuestions(phaseId) {
    if (data.checkpointBanks && data.checkpointBanks[phaseId]?.length) {
      return shuffle(data.checkpointBanks[phaseId].map((step, index) => ({
        ...step,
        itemId: step.itemId || `checkpoint:${phaseId}:${index}`,
        lessonId: null,
        lessonTitle: step.lessonTitle || `${phaseById(phaseId)?.title || 'Phase'} checkpoint`,
        phaseId,
        supportStage: step.supportStage || 'guided',
        tags: usefulTags([...(step.tags || []), 'checkpoint-bank', checkpointType(step)]),
      })));
    }
    const lessons = phaseLessons(phaseId);
    const all = lessons.flatMap(lesson => lesson.steps.map((step, index) => annotateStep(step, lesson, index)))
      .filter(step => ['choice', 'match', 'build', 'sort', 'type-in'].includes(step.type));
    const buckets = { recognition: [], meaning: [], production: [], repair: [], transfer: [] };
    all.forEach(step => {
      const bucket = buckets[checkpointType(step)] ? checkpointType(step) : 'meaning';
      buckets[bucket].push(step);
    });
    const selected = [];
    ['recognition', 'meaning', 'production', 'repair', 'transfer'].forEach(bucket => {
      if (buckets[bucket].length) selected.push(shuffle(buckets[bucket])[0]);
    });
    const used = new Set(selected.map(step => step.itemId));
    const remainder = shuffle(all.filter(step => !used.has(step.itemId)));
    while (selected.length < Math.min(10, all.length) && remainder.length) selected.push(remainder.shift());
    return shuffle(selected);
  }


  function correctAnswerForStep(step = {}) {
    if (step.type === 'match') return (step.pairs || []).map(pair => `${pair[0]} → ${pair[1]}`).join(' · ');
    if (step.type === 'build' || step.type === 'sort') return (step.answer || []).join(' ');
    if (step.type === 'type-in') return step.answer || '';
    return step.answer || '';
  }

  function primaryPatternTag(step = {}) {
    return usefulTags(step.tags || []).find(tag => !['checkpoint-bank', 'meaning', 'recognition', 'production', 'repair', 'transfer'].includes(tag)) || checkpointType(step);
  }

  function suggestedLessonForStep(step = {}, phaseId = '') {
    const explicit = step.suggestedLessonId ? lessonById(step.suggestedLessonId) : null;
    if (explicit) return explicit;
    const tag = primaryPatternTag(step);
    const phaseLesson = phaseLessons(phaseId).find(lesson => lesson.steps.some((s, index) => annotateStep(s, lesson, index).tags?.includes(tag)));
    return phaseLesson || phaseLessons(phaseId)[0] || null;
  }

  function missedReviewHTML(missed = []) {
    if (!missed.length) return '<p class="small">No missed items in this attempt.</p>';
    return `<div class="missed-review-list">${missed.map(item => `
      <article class="missed-review-card">
        <p class="eyebrow">${escapeHTML(checkpointTypeLabel(item.type))} · ${escapeHTML(readableTag(item.patternTag))}</p>
        <h3>${escapeHTML(item.title || 'Checkpoint item')}</h3>
        <p><strong>Prompt:</strong> ${escapeHTML(item.prompt || 'Review the item prompt.')}</p>
        <p><strong>Your answer:</strong> ${escapeHTML(item.learnerAnswer || 'Skipped')}</p>
        <p><strong>Correct answer:</strong> ${escapeHTML(item.correctAnswer || '')}</p>
        <p><strong>Suggested review:</strong> ${item.suggestedLessonId ? `<button class="text-button" data-lesson-id="${escapeHTML(item.suggestedLessonId)}">${escapeHTML(item.suggestedLessonTitle || 'Open lesson')}</button>` : escapeHTML(item.suggestedLessonTitle || 'Adaptive Review')}</p>
      </article>`).join('')}</div>`;
  }

  function checkpointResultSummary(cp) {
    const tagResults = {};
    (cp.answerLog || []).forEach(item => {
      usefulTags(item.tags || []).forEach(tag => {
        if (!tagResults[tag]) tagResults[tag] = { correct: 0, wrong: 0 };
        if (item.correct) tagResults[tag].correct += 1;
        else tagResults[tag].wrong += 1;
      });
    });
    const strong = Object.entries(tagResults)
      .filter(([, stat]) => stat.correct > 0 && stat.wrong === 0)
      .sort((a, b) => b[1].correct - a[1].correct)
      .slice(0, 4)
      .map(([tag]) => readableTag(tag));
    const needs = Object.entries(tagResults)
      .filter(([, stat]) => stat.wrong > 0)
      .sort((a, b) => b[1].wrong - a[1].wrong)
      .slice(0, 4)
      .map(([tag]) => tag);
    const phaseLessonsForReview = phaseLessons(cp.phaseId);
    const reviewLessons = needs.map(tag => phaseLessonsForReview.find(lesson => lesson.steps.some((step, index) => annotateStep(step, lesson, index).tags?.includes(tag))))
      .filter(Boolean)
      .filter((lesson, index, arr) => arr.findIndex(other => other.id === lesson.id) === index)
      .slice(0, 3);
    const missed = (cp.answerLog || []).filter(item => !item.correct);
    return {
      strong: strong.length ? strong : ['basic recognition'],
      needs,
      reviewLessons,
      missed,
    };
  }

  function checkpointCard(phase) {
    const passed = checkpointPassed(phase.id);
    const best = checkpointBestScore(phase.id);
    const complete = phaseComplete(phase.id);
    const disabled = complete || passed ? '' : 'disabled aria-disabled="true"';
    const status = complete || passed ? (passed ? 'Ready · passed before' : 'Ready') : 'Complete the phase first';
    return `<article class="game-card"><span class="level-badge">${escapeHTML(phase.level)}</span><h3>${passed ? '✓ ' : ''}${escapeHTML(phase.title)}</h3><p>${escapeHTML(phase.goal)}</p><p class="small">${best ? `Best score: ${Math.round(best * 100)}% · Passing score: 80%` : 'Passing score: 80%'} · ${escapeHTML(status)}</p><button class="primary-button" data-start-checkpoint="${phase.id}" ${disabled}>${passed ? 'Retake' : 'Start'} checkpoint</button></article>`;
  }

  function renderCheckpoints() {
    const corePhases = CORE_PHASE_IDS.map(id => phaseById(id)).filter(Boolean);
    const explorePhases = EXPLORE_PHASE_IDS.map(id => phaseById(id)).filter(Boolean);
    app.innerHTML = `
      <section class="section-title"><div><p class="eyebrow">Checkpoints</p><h2>Transfer tests after each phase.</h2><p class="lead">Core checkpoints come first. Explore checkpoints stay available, but they no longer crowd the beginner path.</p></div></section>
      <section class="panel"><h2>Core Path checkpoints</h2><div class="checkpoint-grid">${corePhases.map(checkpointCard).join('')}</div></section>
      <section class="panel"><h2>Explore More checkpoints</h2><div class="checkpoint-grid">${explorePhases.map(checkpointCard).join('')}</div></section>
      <section id="checkpointArea"></section>
    `;
    if (state.checkpoint) renderCheckpointQuestion();
  }

  function startCheckpoint(phaseId) {
    if (!phaseComplete(phaseId) && !checkpointPassed(phaseId)) {
      showToast('Complete this phase before taking its mastery checkpoint.');
      return;
    }
    const pool = selectCheckpointQuestions(phaseId);
    state.checkpoint = { phaseId, questions: pool, index: 0, answered: 0, correct: 0, results: {}, answerLog: [] };
    setView('checkpoints');
  }

  function recordCheckpointAnswer(correct, step, learnerAnswer = '') {
    if (!state.checkpoint || !step) return;
    const key = step.itemId || `${state.checkpoint.index}`;
    if (state.checkpoint.results[key] !== undefined) return;
    state.checkpoint.results[key] = !!correct;
    const suggested = suggestedLessonForStep(step, state.checkpoint.phaseId);
    state.checkpoint.answerLog = state.checkpoint.answerLog || [];
    state.checkpoint.answerLog.push({
      itemId: key,
      correct: !!correct,
      tags: step.tags || [],
      type: checkpointType(step),
      title: step.title || '',
      prompt: step.prompt || step.title || '',
      learnerAnswer: String(learnerAnswer || (correct ? correctAnswerForStep(step) : 'Skipped')),
      correctAnswer: correctAnswerForStep(step),
      patternTag: primaryPatternTag(step),
      suggestedLessonId: suggested?.id || '',
      suggestedLessonTitle: suggested?.title || 'Adaptive Review',
    });
    state.checkpoint.answered += 1;
    if (correct) state.checkpoint.correct += 1;
  }

  function renderCheckpointQuestion() {
    const cp = state.checkpoint;
    const phase = phaseById(cp.phaseId);
    const area = document.querySelector('#checkpointArea');
    if (!cp.questions.length) {
      area.innerHTML = `<section class="panel"><p>No checkpoint items available for this phase yet.</p></section>`;
      return;
    }
    if (cp.index >= cp.questions.length) {
      const total = Math.max(cp.questions.length, 1);
      const score = cp.correct / total;
      const existing = state.progress.checkpoints[cp.phaseId] || {};
      const bestScore = Math.max(Number(existing.bestScore || 0), score);
      const passed = score >= CHECKPOINT_PASSING_SCORE;
      state.progress.checkpoints[cp.phaseId] = {
        passed: !!(existing.passed || passed),
        bestScore,
        lastScore: score,
        attempts: Number(existing.attempts || 0) + 1,
        lastAttempt: nowISO(),
      };
      saveProgress();
      const summary = checkpointResultSummary(cp);
      const needsHTML = summary.needs.length ? summary.needs.map(tag => `<span class="weak-chip">${escapeHTML(readableTag(tag))}</span>`).join('') : '<span class="small">No major weak pattern detected.</span>';
      const strongHTML = summary.strong.map(label => `<span class="strong-chip">${escapeHTML(label)}</span>`).join('');
      const reviewHTML = summary.reviewLessons.length ? `<ul>${summary.reviewLessons.map(lesson => `<li><button class="text-button" data-lesson-id="${escapeHTML(lesson.id)}">${escapeHTML(lesson.title)}</button></li>`).join('')}</ul>` : '<p class="small">Use Adaptive Review to keep the pattern warm.</p>';
      const missHTML = `<section class="panel checkpoint-missed-review"><p class="eyebrow">Detailed miss review</p><h2>What to fix before retrying</h2>${missedReviewHTML(summary.missed)}</section>`;
      area.innerHTML = `<section class="panel checkpoint-result ${passed ? 'passed' : 'needs-review'}"><p class="eyebrow">${passed ? 'Checkpoint passed' : 'Retry needed'}</p><h2>${escapeHTML(phase.title)}</h2><p>You scored <strong>${cp.correct}/${total}</strong> — <strong>${Math.round(score * 100)}%</strong>. Passing requires <strong>80%</strong>. Best score: <strong>${Math.round(bestScore * 100)}%</strong>.</p><div class="checkpoint-breakdown"><article><strong>Strong</strong><div>${strongHTML}</div></article><article><strong>Needs review</strong><div>${needsHTML}</div></article><article><strong>Recommended review</strong>${reviewHTML}</article></div>${passed ? `<p>You have shown enough mastery to move on. Retake later if you want a stronger score.</p><button class="primary-button" data-view-go="${isCorePhase(cp.phaseId) ? 'path' : 'explore'}">Return to ${isCorePhase(cp.phaseId) ? 'Core Path' : 'Explore More'}</button>` : `<p>Review the missed patterns, then retry the same checkpoint. This keeps checkpoints meaningful instead of click-through.</p><div class="lesson-actions"><button class="primary-button" data-start-checkpoint="${cp.phaseId}">Retry checkpoint</button><button class="secondary-button" data-practice-mode="adaptive-checkpoint" data-view-jump="practice">Checkpoint prep</button><button class="secondary-button" data-practice-mode="adaptive-weak" data-view-jump="practice">Review weak patterns</button></div>`}</section>${missHTML}`;
      return;
    }
    const step = cp.questions[cp.index];
    area.innerHTML = `<section class="panel"><p class="eyebrow">${escapeHTML(phase.title)} · Question ${cp.index + 1} of ${cp.questions.length} · ${escapeHTML(checkpointTypeLabel(checkpointType(step)))}</p><p class="small">Exact blueprint: 2 recognition, 2 meaning, 2 production, 1 repair, and 1 transfer item. Current score: ${cp.correct}/${cp.questions.length}. Passing score: 80%.</p><div id="checkpointStep"></div><div class="lesson-actions"><button class="secondary-button" data-action="checkpoint-next">Skip / next</button></div></section>`;
    renderInteractiveStep(document.querySelector('#checkpointStep'), step, { nav: false, supportStage: step.supportStage || 'guided', reviewSource: 'checkpoint', onAttempt: (correct, attemptedStep, learnerAnswer) => recordCheckpointAnswer(correct, attemptedStep, learnerAnswer) });
  }

  function checkpointNext() {
    if (!state.checkpoint) return;
    const step = state.checkpoint.questions[state.checkpoint.index];
    if (step) recordCheckpointAnswer(false, step, 'Skipped');
    state.checkpoint.index += 1;
    renderCheckpoints();
  }

  function glossaryDetails(tg) {
    const authored = data.glossaryMeta?.[tg];
    if (authored) {
      return {
        category: authored.category || 'Vocabulary',
        firstLesson: authored.firstLesson || 'Reference item',
        example: authored.example || '',
        related: authored.related || [],
        warning: authored.usageNote || 'Romanisation is a rough guide only.',
        reviewStatus: authored.reviewStatus || 'review-needed',
        sourceConfidence: authored.sourceConfidence || 'pedagogical draft',
      };
    }
    const matches = [];
    data.lessons.forEach(lesson => {
      lesson.steps.forEach((step, index) => {
        const annotated = annotateStep(step, lesson, index);
        if (stepText(step, lesson).includes(String(tg).toLowerCase())) matches.push({ lesson, step: annotated });
      });
    });
    const first = matches[0]?.lesson;
    const tags = usefulTags(matches.flatMap(item => item.step.tags || []));
    const category = tags.length ? readableTag(tags[0]) : 'Vocabulary';
    const exampleStep = matches.find(item => (item.step.examples || []).some(ex => ex.tg && ex.tg.includes(tg)))?.step;
    const example = exampleStep?.examples?.find(ex => ex.tg && ex.tg.includes(tg));
    const relatedMap = {
      'ኣለኻ': ['ኣለኺ', 'ኣለኹ'],
      'ኣለኺ': ['ኣለኻ', 'ኣለኹ'],
      'ንስኻ': ['ንስኺ', 'ንሱ', 'ንሳ'],
      'ንስኺ': ['ንስኻ', 'ንሱ', 'ንሳ'],
      'እየ': ['እዩ', 'እያ'],
      'እዩ': ['እየ', 'እያ'],
      'እያ': ['እየ', 'እዩ'],
      'ናብ': ['ኣብ', 'ካብ'],
      'ኣብ': ['ናብ', 'ካብ'],
      'ካብ': ['ኣብ', 'ናብ'],
      'ተማሃራይ': ['ተማሃሪት'],
      'ተማሃሪት': ['ተማሃራይ'],
    };
    const warning = hasEthiopic(tg) && (String(tg).includes('ኻ') || String(tg).includes('ኺ')) ? 'Watch the address/gender ending.' : (String(tg).includes('ኣይ') ? 'Look for the full negative frame.' : 'Romanisation is a rough guide only.');
    return {
      category,
      firstLesson: first?.title || 'Reference item',
      example: example ? `${example.tg} — ${example.en}` : '',
      related: relatedMap[tg] || [],
      warning,
    };
  }

  function renderGuide() {
    const glossary = data.glossary.map(item => ({ tg: item[0], en: item[1], roman: item[2] })).filter(item => item.tg);
    app.innerHTML = `
      <section class="section-title"><div><p class="eyebrow">Guide and sources</p><h2>Coverage, limits, and reference notes.</h2></div></section>
      <section class="panel"><h2>Language coverage map</h2><p>This course is organized as a simple Core Path plus a deeper Explore More library. The core covers romanization scaffolding, fidel basics, greetings, pronouns, identity sentences, and mini-conversations. Explore More preserves the broader beginner-to-intermediate-low material: noun/adjective agreement, possession, prepositions, verbs as subject-carrying forms, sentence architecture, questions, negation, time, requests, food and market language, travel/directions, health/help, culture-and-poetry reading, functional dialogue, and self-correction.</p><p><strong>Dialect policy:</strong> this version uses Eritrean/Asmara Tigrinya as the default classroom variety. It avoids presenting Tigray/Ethiopian regional alternatives, liturgical forms, or formal written variants as main-path beginner answers.</p><p><strong>Romanization policy:</strong> early lessons show rough Eritrean/Asmara-oriented romanization because there is no audio. Middle lessons hide it behind pronunciation-guide hints. Later review removes it so users practice fidel recognition.</p><p><strong>Important limit:</strong> no-audio learning cannot fully teach pronunciation, listening, intonation, or live fluency. Use this app as a thinking scaffold, then pair it with Eritrean/Asmara native audio and fluent-speaker correction.</p></section>
      ${data.polishTarget ? `<section class="panel"><p class="eyebrow">10/10 no-audio target</p><h2>${escapeHTML(data.polishTarget.lane)}</h2><p>${escapeHTML(data.polishTarget.learnerPromise)}</p><p class="small"><strong>Not claimed:</strong> ${escapeHTML(data.polishTarget.notClaimed)}</p></section>` : ''}
      ${data.contentStatus ? `<section class="panel content-status"><p class="eyebrow">Content status</p><h2>${escapeHTML(data.contentStatus.label)}</h2><p>${escapeHTML(data.contentStatus.meaning)}</p></section>` : ''}
      ${data.dialectProfile ? `<section class="panel dialect-panel"><p class="eyebrow">Target variety</p><h2>${escapeHTML(data.dialectProfile.name)}</h2><div class="method-grid"><article class="method-card"><h3>Scope</h3><p>${escapeHTML(data.dialectProfile.scope)}</p></article><article class="method-card"><h3>Phrase policy</h3><p>${escapeHTML(data.dialectProfile.phrasePolicy)}</p></article><article class="method-card"><h3>What this avoids</h3><p>${escapeHTML(data.dialectProfile.outOfScope)}</p></article></div><p class="small">${escapeHTML(data.dialectProfile.nativeReviewNote)}</p></section>` : ''}
      ${data.resourceDigest ? `<section class="panel"><p class="eyebrow">Uploaded resource digest</p><h2>How the new references shaped v1.9</h2><div class="method-grid">${data.resourceDigest.map(item => `<article class="method-card"><h3>${escapeHTML(item.source)}</h3><p>${escapeHTML(item.takeaway)}</p></article>`).join('')}</div><p class="small">Scanned pages were used through visible page images and available parsed text; examples are still marked for fluent Eritrean/Asmara review.</p></section>` : ''}
      ${readingLadderHTML(false)}
      <section class="panel roman-key-panel"><h2>Romanisation Key</h2><p>The guide is intentionally rough because this is a no-audio Eritrean/Asmara Tigrinya prototype. Hover or focus special romanisation characters throughout the app to see what they are cueing.</p><div class="roman-key-grid">${ROMANISATION_KEY.map(item => `<article class="roman-key-card"><strong class="roman-symbol" title="${escapeHTML(item.title)}">${escapeHTML(item.char)}</strong><span>${escapeHTML(item.title)}</span><em>${escapeHTML(item.example)}</em><p class="small">${escapeHTML(item.note)}</p></article>`).join('')}</div></section>
      <section class="panel"><h2>Grammar notes</h2><div class="method-grid"><article class="method-card"><h3>Script</h3><p>Tigrinya, including the Eritrean/Asmara variety, uses the Geʽez/Ethiopic abugida: characters normally represent consonant + vowel syllables, organized by families and vowel orders.</p></article><article class="method-card"><h3>Gender</h3><p>Second and third person forms distinguish gender. Adjectives and determiners also agree with nouns.</p></article><article class="method-card"><h3>Verbs</h3><p>Verb forms carry person, number, and gender information, so independent pronouns are not always necessary.</p></article></div></section>
      <section class="panel"><div class="adaptive-header"><div><h2>Glossary SRS deck</h2><p>The glossary is now an active spaced-repetition deck. Default review only uses words from completed lessons; Full Glossary Challenge is optional.</p></div><button class="primary-button" data-practice-mode="vocab-srs" data-view-jump="practice">Review unlocked vocab</button><button class="secondary-button" data-practice-mode="vocab-challenge" data-view-jump="practice">Full glossary challenge</button></div><div class="glossary-grid">${glossary.map(item => { const record = state.progress.vocabSRS?.records?.[vocabId(item.tg)] || {}; const detail = glossaryDetails(item.tg); return `<div class="glossary-item rich-glossary"><strong class="tigrinya">${escapeHTML(item.tg)}</strong><span>${escapeHTML(item.en)}</span>${item.roman ? `<span class="small">${romanWithTitlesHTML(item.roman)}</span>` : ''}<span class="small"><strong>Category:</strong> ${escapeHTML(detail.category)}</span><span class="small"><strong>First lesson:</strong> ${escapeHTML(detail.firstLesson)}</span>${detail.example ? `<span class="small"><strong>Example:</strong> ${escapeHTML(detail.example)}</span>` : ''}${detail.related.length ? `<span class="small"><strong>Related:</strong> ${detail.related.map(escapeHTML).join(' · ')}</span>` : ''}<span class="small"><strong>Note:</strong> ${escapeHTML(detail.warning)}</span><span class="small"><strong>Content:</strong> ${escapeHTML(detail.reviewStatus || 'review-needed')} · ${escapeHTML(detail.sourceConfidence || 'pedagogical draft')}</span><span class="small"><strong>SRS:</strong> next review ${escapeHTML(record.nextReviewDate || 'today')}</span></div>`; }).join('')}</div></section>
      <section class="source-grid">${data.sources.map(src => `<article class="source-card"><h3>${escapeHTML(src.label)}</h3><p>${escapeHTML(src.uses)}</p><p class="small">${escapeHTML(src.url)}</p></article>`).join('')}</section>
    `;
  }

  document.body.addEventListener('click', event => {
    const target = event.target.closest('button');
    if (!target) return;
    if (target.dataset.view) setView(target.dataset.view);
    if (target.dataset.viewGo) setView(target.dataset.viewGo);
    if (target.dataset.viewJump) {
      const mode = target.dataset.practiceMode;
      if (mode) state.practiceMode = mode;
      setView(target.dataset.viewJump, mode ? { practiceMode: mode } : {});
      return;
    }
    if (target.dataset.lessonId) setView('lesson', { lessonId: target.dataset.lessonId, stepIndex: 0 });
    if (target.dataset.action === 'start') setView('lesson', { lessonId: recommendedLessonId(), stepIndex: 0 });
    if (target.dataset.action === 'resume-lesson') {
      const resume = resumeInfo();
      if (resume) setView('lesson', { lessonId: resume.lesson.id, stepIndex: resume.stepIndex });
    }
    if (target.dataset.action === 'drill-pattern') {
      const tag = target.dataset.drillTag;
      if (tag) {
        state.practiceMode = `drill:${tag}`;
        setView('practice', { practiceMode: state.practiceMode });
      }
    }
    if (target.dataset.practiceMode) {
      state.practiceMode = target.dataset.practiceMode;
      renderPractice();
    }
    if (target.dataset.family) {
      state.currentFamily = target.dataset.family;
      renderFidel();
    }
    if (target.dataset.fidelQuiz) renderFidelQuiz(target.dataset.fidelQuiz);
    if (target.dataset.startCheckpoint) startCheckpoint(target.dataset.startCheckpoint);
    if (target.dataset.action === 'checkpoint-next') checkpointNext();
  });

  menuToggle?.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    menuToggle.setAttribute('aria-expanded', String(open));
    menuToggle.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
  });

  resetProgressBtn?.addEventListener('click', () => {
    if (!window.confirm('Reset all lesson and checkpoint progress?')) return;
    localStorage.removeItem(STORE_KEY);
    state.progress = loadProgress();
    showToast('Progress reset.');
    render();
  });

  render();
})();
