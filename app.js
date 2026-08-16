'use strict';

/* =========================================================================
   BrightBand IELTS — app.js
   -------------------------------------------------------------------------
   Vanilla JS app: no build step, no framework. Everything is driven by a
   single `state` object; localStorage is used as a mock database so
   materials and the user's plan survive a page refresh.

   Sections in this file:
     1. Constants & mock data
     2. State
     3. Persistence (localStorage)
     4. Init & navigation
     5. Score tracker
     6. Material grid & filtering
     7. Material detail / paywall
     8. AI analyzer
     9. Pricing / subscriptions
     10. Admin (auth + CRUD)
     11. Modal / toast helpers
     12. Event wiring
     13. Small utilities
   ========================================================================= */

/* ---------------------------------------------------------------------- *
 * 1. CONSTANTS & MOCK DATA
 * ---------------------------------------------------------------------- */

const STORAGE_KEYS = {
  MATERIALS: 'brightband_materials_v1',
  USER: 'brightband_user_v1',
};

// Mock admin password. This is a client-side demo only — never a real
// auth scheme. Anyone with dev tools open can read this.
const ADMIN_PASSWORD = 'admin123';

// Human-readable labels for the tag slugs used across materials. Shared by
// material cards, the material modal, and the AI analyzer.
const TAG_LABELS = {
  'true-false-not-given': 'True/False/Not Given',
  'matching-headings': 'Matching Headings',
  'summary-completion': 'Summary Completion',
  'matching-features': 'Matching Features',
  'skimming-scanning': 'Skimming & Scanning',
  'note-completion': 'Note Completion',
  'form-completion': 'Form Completion',
  'map-labeling': 'Map & Plan Labelling',
  'multiple-choice': 'Multiple Choice',
  'table-completion': 'Table Completion',
  'task-2': 'Task 2 Essays',
  'essay-writing': 'Essay Writing',
  'cue-card': 'Cue Cards',
  'fluency': 'Fluency & Coherence',
};

// The default material catalogue. Seeded into localStorage on first visit,
// then localStorage becomes the source of truth (so Admin edits persist).
const DEFAULT_MATERIALS = [
  { id: 'seed-1', title: 'True/False/Not Given Mastery', section: 'Reading', difficulty: 'Medium', tier: 'Free', tags: ['true-false-not-given'], description: 'Learn to tell "False" apart from "Not Given" with three targeted passages and full explanations.' },
  { id: 'seed-2', title: 'Matching Headings Practice Set 1', section: 'Reading', difficulty: 'Easy', tier: 'Free', tags: ['matching-headings'], description: 'Build paragraph-skimming speed with twenty warm-up matching-headings questions.' },
  { id: 'seed-3', title: 'Cambridge 18 Academic Reading — Full Mock', section: 'Reading', difficulty: 'Hard', tier: 'Premium', tags: ['true-false-not-given', 'matching-headings', 'summary-completion'], description: 'A complete timed reading mock test with examiner-style answer explanations for every question.' },
  { id: 'seed-4', title: 'Summary Completion Drills', section: 'Reading', difficulty: 'Medium', tier: 'Premium', tags: ['summary-completion'], description: 'Practice locating exact-word answers under time pressure across four short summary tasks.' },
  { id: 'seed-5', title: 'Skimming & Scanning Speed Techniques', section: 'Reading', difficulty: 'Easy', tier: 'Free', tags: ['skimming-scanning'], description: 'A short technique guide plus drills to help you read passages faster without losing accuracy.' },
  { id: 'seed-6', title: 'Matching Features & Sentence Endings', section: 'Reading', difficulty: 'Hard', tier: 'Premium', tags: ['matching-features'], description: 'Advanced practice on two of the trickiest Reading question types, with detailed error analysis.' },
  { id: 'seed-7', title: 'Yes/No/Not Given for General Training', section: 'Reading', difficulty: 'Medium', tier: 'Premium', tags: ['true-false-not-given'], description: 'General Training-focused practice on the Yes/No/Not Given format, with common traps explained.' },
  { id: 'seed-8', title: 'Listening Section 1: Everyday Conversations', section: 'Listening', difficulty: 'Easy', tier: 'Free', tags: ['note-completion', 'form-completion'], description: 'Warm up with three short-conversation recordings and form-completion questions.' },
  { id: 'seed-9', title: 'Map & Plan Labelling Bootcamp', section: 'Listening', difficulty: 'Medium', tier: 'Premium', tags: ['map-labeling'], description: 'Master directional vocabulary and keep pace with fast-moving map descriptions.' },
  { id: 'seed-10', title: 'Multiple Choice Listening Traps', section: 'Listening', difficulty: 'Medium', tier: 'Free', tags: ['multiple-choice'], description: 'Learn to recognise paraphrased distractors before the audio moves on.' },
  { id: 'seed-11', title: 'Academic Lecture Note-Taking (Section 4)', section: 'Listening', difficulty: 'Hard', tier: 'Premium', tags: ['note-completion', 'summary-completion'], description: 'Practice sustained note-taking on a full monologue lecture, Section 4 style.' },
  { id: 'seed-12', title: 'Full Mock Listening Test — Cambridge 17', section: 'Listening', difficulty: 'Hard', tier: 'Premium', tags: ['multiple-choice', 'map-labeling', 'note-completion'], description: 'A complete 40-question timed listening mock covering all four sections.' },
  { id: 'seed-13', title: 'Form & Note Completion Practice Set 2', section: 'Listening', difficulty: 'Easy', tier: 'Free', tags: ['note-completion'], description: 'Ten short-answer questions to sharpen your number, date, and spelling accuracy.' },
  { id: 'seed-14', title: 'Diagram & Table Completion', section: 'Listening', difficulty: 'Medium', tier: 'Premium', tags: ['table-completion', 'map-labeling'], description: 'Practice transferring spoken detail onto diagrams and tables without losing your place.' },
  { id: 'seed-15', title: 'Task 2 Essay Structures & Model Answers', section: 'Writing', difficulty: 'Medium', tier: 'Premium', tags: ['task-2', 'essay-writing'], description: 'A bank of high-scoring model essays with structure breakdowns.' },
  { id: 'seed-16', title: 'Part 2 Cue Card Bank', section: 'Speaking', difficulty: 'Medium', tier: 'Free', tags: ['cue-card', 'fluency'], description: '100+ real cue cards with sample answers and fluency tips.' },
];

const DEFAULT_USER = {
  plan: 'free', // 'free' | 'pro' | 'vip'
  scores: { listening: 7.0, reading: 8.0, writing: 6.0, speaking: 6.5 },
};

// Simulated weak points for the AI analyzer. Each maps to a tag so
// recommendations can be pulled straight from the material catalogue.
const WEAK_POINTS = [
  { tag: 'true-false-not-given', label: 'True/False/Not Given', section: 'Reading', tip: 'Focus on the difference between "False" (the text says the opposite) and "Not Given" (the text simply doesn\u2019t say) — this single distinction accounts for most lost marks.' },
  { tag: 'matching-headings', label: 'Matching Headings', section: 'Reading', tip: 'Read each paragraph\u2019s first and last sentence before choosing a heading, and rule out options that only match one small detail.' },
  { tag: 'map-labeling', label: 'Map & Plan Labelling', section: 'Listening', tip: 'Preview the map before the audio starts and actively track directional language like "opposite," "adjacent to," and "next to."' },
  { tag: 'note-completion', label: 'Note & Form Completion', section: 'Listening', tip: 'Predict the word type — a number, a date, a name — for each gap before you listen. It narrows down exactly what to listen for.' },
  { tag: 'multiple-choice', label: 'Multiple Choice', section: 'Listening', tip: 'Watch for paraphrasing: the correct option rarely repeats the exact words used in the recording.' },
  { tag: 'summary-completion', label: 'Summary Completion', section: 'Reading', tip: 'Skim the summary first to understand its overall topic, then hunt for matching information in the passage.' },
];

// Shared class strings for JS-rendered elements (material cards, badges).
// Kept as full literal strings — Tailwind's CDN build only picks up
// classes it can see written out in full, so these are never built by
// concatenating color/shade fragments.
const CARD_BASE_CLASSES = 'group relative flex flex-col overflow-hidden rounded-2xl border border-line bg-surface shadow-sm transition-all duration-300 hover:-translate-y-1 hover:scale-[1.02] hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2 focus-visible:ring-offset-paper cursor-pointer';
const CARD_SOON_CLASSES = 'opacity-75 saturate-[0.55] hover:translate-y-0 hover:scale-100 hover:shadow-sm cursor-default';
const BADGE_BASE_CLASSES = 'inline-flex items-center gap-1 rounded-full px-2.5 py-1 font-display text-[11px] font-bold';
const DIFFICULTY_CLASSES = {
  Easy: BADGE_BASE_CLASSES + ' bg-emerald-50 text-emerald-700',
  Medium: BADGE_BASE_CLASSES + ' bg-sky-50 text-sky-700',
  Hard: BADGE_BASE_CLASSES + ' bg-rose-50 text-rose-700',
};

const ICON_LOCK = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-3 w-3"><rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg>';
const ICON_UNLOCKED = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.25" stroke-linecap="round" stroke-linejoin="round" class="h-3 w-3"><path d="M5 13l4 4L19 7"/></svg>';
const ICON_CLOCK = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-3 w-3"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.5 2"/></svg>';

const SECTION_ICONS = {
  Reading: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" class="h-4 w-4"><path d="M4 5.5C4 4.67 4.67 4 5.5 4H11a1 1 0 0 1 1 1v15a1 1 0 0 0-1-1H5.5A1.5 1.5 0 0 1 4 17.5V5.5Z"/><path d="M20 5.5c0-.83-.67-1.5-1.5-1.5H13a1 1 0 0 0-1 1v15a1 1 0 0 1 1-1h5.5a1.5 1.5 0 0 0 1.5-1.5V5.5Z"/></svg>',
  Listening: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" class="h-4 w-4"><path d="M4 13v-1a8 8 0 0 1 16 0v1"/><rect x="3" y="13" width="4" height="6" rx="1.5"/><rect x="17" y="13" width="4" height="6" rx="1.5"/></svg>',
  Writing: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" class="h-4 w-4"><path d="M4 20l1-4L16 5l3 3L8 19l-4 1Z"/><path d="M14 7l3 3"/></svg>',
  Speaking: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" class="h-4 w-4"><rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0"/><path d="M12 18v3"/><path d="M9 21h6"/></svg>',
};

const PLAN_LABELS = { free: 'Free plan', pro: 'Pro plan', vip: 'VIP plan' };

/* ---------------------------------------------------------------------- *
 * 2. STATE
 * ---------------------------------------------------------------------- */

const state = {
  materials: [],
  user: null,
  filters: { section: 'all', difficulty: 'all', query: '' },
  isAdminAuthed: false,
  editingMaterialId: null,
  currentPage: 'dashboard',
  openModalId: null,
};

/* ---------------------------------------------------------------------- *
 * 3. PERSISTENCE (localStorage acts as the mock database)
 * ---------------------------------------------------------------------- */

function loadMaterials() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.MATERIALS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (err) {
    console.warn('Could not read materials from localStorage — using defaults.', err);
  }
  const seed = DEFAULT_MATERIALS.map((m) => ({ ...m, tags: [...m.tags] }));
  localStorage.setItem(STORAGE_KEYS.MATERIALS, JSON.stringify(seed));
  return seed;
}

function saveMaterials() {
  try {
    localStorage.setItem(STORAGE_KEYS.MATERIALS, JSON.stringify(state.materials));
  } catch (err) {
    console.error('Failed to save materials to localStorage.', err);
    showToast('Changes could not be saved (storage error).', 'error');
  }
}

function loadUser() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.USER);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.plan && parsed.scores) return parsed;
    }
  } catch (err) {
    console.warn('Could not read user data from localStorage — using defaults.', err);
  }
  const seed = { ...DEFAULT_USER, scores: { ...DEFAULT_USER.scores } };
  localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(seed));
  return seed;
}

function saveUser() {
  try {
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(state.user));
  } catch (err) {
    console.error('Failed to save user data to localStorage.', err);
  }
}

/* ---------------------------------------------------------------------- *
 * 4. INIT & NAVIGATION
 * ---------------------------------------------------------------------- */

function init() {
  state.materials = loadMaterials();
  state.user = loadUser();

  renderScoreTracker();
  renderMaterialsGrid();
  renderAdminTable();
  updatePlanBadge();
  renderPricingButtons();
  attachEventListeners();

  // Play the signature highlighter-swipe once the dashboard first paints.
  replayHighlightAnimation('overall-band-value');
}

function showPage(pageName) {
  if (pageName === 'admin' && !state.isAdminAuthed) {
    openAdminLoginModal();
    return;
  }
  document.querySelectorAll('.page').forEach((el) => el.classList.add('hidden'));
  const target = document.getElementById(`page-${pageName}`);
  if (!target) return;
  target.classList.remove('hidden');
  state.currentPage = pageName;
  updateNavActiveStates(pageName);
  closeMobileMenu();
  window.scrollTo({ top: 0, behavior: 'smooth' });

  if (pageName === 'admin') renderAdminTable();
  if (pageName === 'pricing') renderPricingButtons();
  if (pageName === 'dashboard') replayHighlightAnimation('overall-band-value');
}

function updateNavActiveStates(pageName) {
  document.querySelectorAll('[data-nav]').forEach((link) => {
    link.classList.toggle('nav-link-active', link.dataset.nav === pageName);
  });
}

function toggleMobileMenu() {
  const menu = document.getElementById('mobile-menu');
  const btn = document.querySelector('[data-action="toggle-mobile-menu"]');
  const nowHidden = menu.classList.toggle('hidden');
  if (btn) btn.setAttribute('aria-expanded', String(!nowHidden));
}

function closeMobileMenu() {
  document.getElementById('mobile-menu').classList.add('hidden');
  const btn = document.querySelector('[data-action="toggle-mobile-menu"]');
  if (btn) btn.setAttribute('aria-expanded', 'false');
}

/* ---------------------------------------------------------------------- *
 * 5. SCORE TRACKER
 * ---------------------------------------------------------------------- */

// IELTS rounds the average of the four skill scores to the nearest half
// band, with exact .25 / .75 midpoints always rounding UP. Scaling by 2
// and using Math.round (which rounds .5 up) reproduces that rule exactly,
// including for the eighth-band fractions an odd number of half-scores
// can produce (e.g. 8.0 + 7.0 + 6.0 + 6.5 = 27.5 → 6.875 → rounds to 7.0).
function computeOverallBand(scores) {
  const average = (scores.listening + scores.reading + scores.writing + scores.speaking) / 4;
  return Math.round(average * 2) / 2;
}

function bandDescriptor(band) {
  const rounded = Math.round(band);
  const table = {
    9: 'Expert user', 8: 'Very good user', 7: 'Good user',
    6: 'Competent user', 5: 'Modest user', 4: 'Limited user',
  };
  return table[rounded] || (rounded > 9 ? table[9] : table[4]);
}

function renderScoreTracker() {
  const { listening, reading, writing, speaking } = state.user.scores;
  const overall = computeOverallBand(state.user.scores);

  document.getElementById('overall-band-value').textContent = overall.toFixed(1);
  document.getElementById('overall-band-descriptor').textContent =
    `Band ${overall.toFixed(1)} \u00B7 ${bandDescriptor(overall)}`;

  const skills = { listening, reading, writing, speaking };
  Object.keys(skills).forEach((key) => {
    const value = skills[key];
    const valueEl = document.getElementById(`val-${key}`);
    const barEl = document.getElementById(`bar-${key}`);
    if (valueEl) valueEl.textContent = value.toFixed(1);
    if (barEl) barEl.style.width = `${Math.min(100, (value / 9) * 100)}%`;
  });
}

// Restarts a CSS animation on an element (used for the highlighter stroke)
// by removing the animating class, forcing reflow, then re-adding it.
function replayHighlightAnimation(elementId) {
  const el = document.getElementById(elementId);
  if (!el) return;
  el.classList.remove('hl-stroke-animate');
  void el.offsetWidth; // force reflow so the animation restarts
  el.classList.add('hl-stroke-animate');
}

/* ---------------------------------------------------------------------- *
 * 6. MATERIAL GRID & FILTERING
 * ---------------------------------------------------------------------- */

function isComingSoon(material) {
  return material.section === 'Writing' || material.section === 'Speaking';
}

function getFilteredMaterials() {
  const { section, difficulty, query } = state.filters;
  const q = query.trim().toLowerCase();
  return state.materials.filter((m) => {
    const matchesSection = section === 'all' || m.section.toLowerCase() === section;
    const matchesDifficulty = difficulty === 'all' || m.difficulty.toLowerCase() === difficulty;
    const matchesQuery = !q || m.title.toLowerCase().includes(q) || m.tags.some((t) => t.toLowerCase().includes(q));
    return matchesSection && matchesDifficulty && matchesQuery;
  });
}

function tierBadgeHTML(material) {
  if (isComingSoon(material)) {
    return `<span class="${BADGE_BASE_CLASSES} bg-ink text-paper">${ICON_CLOCK}Soon</span>`;
  }
  if (material.tier === 'Free') {
    return `<span class="${BADGE_BASE_CLASSES} border border-ink/15 bg-surface text-ink">Free</span>`;
  }
  const unlocked = state.user.plan !== 'free';
  return `<span class="${BADGE_BASE_CLASSES} bg-marker text-ink">${unlocked ? ICON_UNLOCKED : ICON_LOCK}Premium</span>`;
}

function createMaterialCardHTML(material) {
  const soon = isComingSoon(material);
  const cardClasses = CARD_BASE_CLASSES + (soon ? ' ' + CARD_SOON_CLASSES : '');
  const difficultyClasses = DIFFICULTY_CLASSES[material.difficulty] || DIFFICULTY_CLASSES.Medium;
  const tagsPreview = material.tags.slice(0, 2).map((t) => humanizeTag(t)).join(' \u00B7 ');

  return `
    <article id="material-${material.id}" class="${cardClasses}" data-action="open-material" data-id="${material.id}" role="button" tabindex="0" aria-label="${escapeHTML(material.title)}">
      <div class="flex items-start justify-between gap-2 p-5 pb-3">
        <span class="flex items-center gap-1.5 font-display text-xs font-bold uppercase tracking-wide text-ink/50">
          ${SECTION_ICONS[material.section] || ''} ${escapeHTML(material.section)}
        </span>
        ${tierBadgeHTML(material)}
      </div>
      <div class="flex-1 px-5 pb-4">
        <h3 class="font-display text-base font-bold leading-snug text-ink">${escapeHTML(material.title)}</h3>
        <p class="mt-1.5 line-clamp-2 font-sans text-sm text-ink/65">${escapeHTML(material.description || '')}</p>
        ${tagsPreview ? `<p class="mt-2 font-sans text-xs text-ink/45">${escapeHTML(tagsPreview)}</p>` : ''}
      </div>
      <div class="flex items-center justify-between border-t border-line px-5 py-3">
        <span class="${difficultyClasses}">${escapeHTML(material.difficulty)}</span>
      </div>
    </article>
  `;
}

function renderMaterialsGrid() {
  const filtered = getFilteredMaterials();
  const grid = document.getElementById('materials-grid');
  const empty = document.getElementById('materials-empty');
  const countEl = document.getElementById('filter-results-count');
  const total = state.materials.length;

  countEl.textContent = filtered.length === total
    ? 'Showing all materials'
    : `Showing ${filtered.length} of ${total} materials`;

  if (filtered.length === 0) {
    grid.innerHTML = '';
    grid.classList.add('hidden');
    empty.classList.remove('hidden');
    empty.classList.add('flex');
    return;
  }
  empty.classList.add('hidden');
  empty.classList.remove('flex');
  grid.classList.remove('hidden');
  grid.innerHTML = filtered.map(createMaterialCardHTML).join('');
}

function handleFilterChange() {
  state.filters.section = document.getElementById('filter-section').value;
  state.filters.difficulty = document.getElementById('filter-difficulty').value;
  state.filters.query = document.getElementById('filter-search').value;
  renderMaterialsGrid();
}

function clearFilters() {
  state.filters = { section: 'all', difficulty: 'all', query: '' };
  syncFilterControlsFromState();
  renderMaterialsGrid();
}

function syncFilterControlsFromState() {
  document.getElementById('filter-section').value = state.filters.section;
  document.getElementById('filter-difficulty').value = state.filters.difficulty;
  document.getElementById('filter-search').value = state.filters.query;
}

/* ---------------------------------------------------------------------- *
 * 7. MATERIAL DETAIL / PAYWALL
 * ---------------------------------------------------------------------- */

function handleMaterialCardClick(id) {
  const material = state.materials.find((m) => m.id === id);
  if (!material) return;

  if (isComingSoon(material)) {
    showToast(`${material.section} practice launches soon.`, 'info');
    return;
  }
  if (material.tier === 'Premium' && state.user.plan === 'free') {
    openPaywallModal(material);
    return;
  }
  openMaterialModal(material);
}

function openMaterialModal(material) {
  const difficultyClasses = DIFFICULTY_CLASSES[material.difficulty] || DIFFICULTY_CLASSES.Medium;
  const tagsHTML = material.tags.map((t) =>
    `<span class="${BADGE_BASE_CLASSES} border border-ink/15 bg-surface text-ink/70">${escapeHTML(humanizeTag(t))}</span>`
  ).join('');

  document.getElementById('modal-material-content').innerHTML = `
    <div class="flex items-center gap-2 pr-8">
      <span class="flex items-center gap-1.5 font-display text-xs font-bold uppercase tracking-wide text-ink/50">
        ${SECTION_ICONS[material.section] || ''} ${escapeHTML(material.section)}
      </span>
      ${tierBadgeHTML(material)}
    </div>
    <h2 class="mt-3 font-display text-xl font-bold text-ink">${escapeHTML(material.title)}</h2>
    <p class="mt-2 font-sans text-sm text-ink/70">${escapeHTML(material.description || '')}</p>
    <div class="mt-4 flex flex-wrap items-center gap-2">
      <span class="${difficultyClasses}">${escapeHTML(material.difficulty)}</span>
      ${tagsHTML}
    </div>
    <button type="button" data-action="start-practice" data-id="${material.id}" class="btn-primary mt-6 w-full">Start practice</button>
  `;
  openModal('modal-material');
}

function openPaywallModal(material) {
  const otherPremiumCount = state.materials.filter((m) => m.tier === 'Premium' && !isComingSoon(m) && m.id !== material.id).length;
  document.getElementById('paywall-modal-body').textContent =
    `"${material.title}" is part of our premium library. Choose Pro or VIP to unlock it${otherPremiumCount > 0 ? ` and ${otherPremiumCount} other premium materials` : ''}.`;
  openModal('modal-paywall');
}

/* ---------------------------------------------------------------------- *
 * 8. AI ANALYZER
 * ---------------------------------------------------------------------- */

function openAIAnalyzerModal() {
  setAnalyzerModalState('intro');
  openModal('modal-ai-analyzer');
}

function setAnalyzerModalState(stateName) {
  ['intro', 'loading', 'result'].forEach((name) => {
    const el = document.getElementById(`analyzer-state-${name}`);
    if (!el) return;
    el.classList.toggle('hidden', name !== stateName);
    el.classList.toggle('flex', name === 'loading' && name === stateName);
  });
}

function runAIAnalysis() {
  setAnalyzerModalState('loading');
  setTimeout(() => {
    const weakPoint = WEAK_POINTS[Math.floor(Math.random() * WEAK_POINTS.length)];
    const recommended = state.materials
      .filter((m) => !isComingSoon(m) && m.tags.includes(weakPoint.tag))
      .slice(0, 3);
    renderAnalysisResult(weakPoint, recommended);
    setAnalyzerModalState('result');
    replayHighlightAnimation('analyzer-weak-label');
  }, 1100);
}

function renderAnalysisResult(weakPoint, recommended) {
  document.getElementById('analyzer-weak-label').textContent = weakPoint.label;
  document.getElementById('analyzer-weak-section').textContent = `${weakPoint.section} skill`;
  document.getElementById('analyzer-weak-tip').textContent = weakPoint.tip;

  const list = document.getElementById('analyzer-recommendations');
  if (recommended.length === 0) {
    list.innerHTML = `<p class="font-sans text-sm text-ink/55">No matching materials yet — check back after an admin adds some.</p>`;
    return;
  }
  list.innerHTML = recommended.map((m) => `
    <div class="flex items-center justify-between gap-3 rounded-xl border border-line bg-paper/40 px-4 py-3">
      <div class="min-w-0">
        <p class="truncate font-display text-sm font-bold text-ink">${escapeHTML(m.title)}</p>
        <p class="mt-0.5 font-sans text-xs text-ink/55">${escapeHTML(m.section)} \u00B7 ${escapeHTML(m.difficulty)} \u00B7 ${escapeHTML(m.tier)}</p>
      </div>
      <button type="button" data-action="view-recommended" data-id="${m.id}" class="btn-secondary shrink-0 !px-3 !py-1.5 !text-xs">View</button>
    </div>
  `).join('');
}

function viewRecommendedMaterial(id) {
  const material = state.materials.find((m) => m.id === id);
  closeAllModals();
  showPage('dashboard');
  if (material) {
    state.filters = { section: material.section.toLowerCase(), difficulty: 'all', query: '' };
    syncFilterControlsFromState();
    renderMaterialsGrid();
    setTimeout(() => highlightMaterialCard(id), 60);
  }
}

function highlightMaterialCard(id) {
  const card = document.getElementById(`material-${id}`);
  if (!card) return;
  card.scrollIntoView({ behavior: 'smooth', block: 'center' });
  card.classList.add('ring-4', 'ring-marker');
  setTimeout(() => card.classList.remove('ring-4', 'ring-marker'), 2200);
}

/* ---------------------------------------------------------------------- *
 * 9. PRICING / SUBSCRIPTIONS
 * ---------------------------------------------------------------------- */

function subscribeToPlan(planId) {
  if (!PLAN_LABELS[planId] || state.user.plan === planId) return;
  state.user.plan = planId;
  saveUser();
  updatePlanBadge();
  renderPricingButtons();
  renderMaterialsGrid(); // premium badges reflect the new unlocked state
  showToast(`${PLAN_LABELS[planId]} selected.`, 'success');
}

function updatePlanBadge() {
  const label = PLAN_LABELS[state.user.plan] || PLAN_LABELS.free;
  document.getElementById('plan-badge').textContent = label;
  document.getElementById('plan-badge-mobile').textContent = label;
}

function renderPricingButtons() {
  document.querySelectorAll('[data-plan]').forEach((btn) => {
    const plan = btn.dataset.plan;
    const isCurrent = state.user.plan === plan;
    btn.disabled = isCurrent;
    btn.textContent = isCurrent ? 'Current plan' : btn.dataset.defaultLabel;
    btn.classList.toggle('opacity-60', isCurrent);
    btn.classList.toggle('cursor-not-allowed', isCurrent);
  });
}

/* ---------------------------------------------------------------------- *
 * 10. ADMIN (auth + CRUD)
 * ---------------------------------------------------------------------- */

function openAdminLoginModal() {
  const form = document.getElementById('admin-login-form');
  form.reset();
  document.getElementById('admin-login-error').classList.add('hidden');
  openModal('modal-admin-login');
  setTimeout(() => document.getElementById('admin-password-input')?.focus(), 50);
}

function handleAdminLoginSubmit(event) {
  event.preventDefault();
  const input = document.getElementById('admin-password-input');
  if (input.value === ADMIN_PASSWORD) {
    state.isAdminAuthed = true;
    closeModal('modal-admin-login');
    showPage('admin');
    showToast('Signed in as admin.', 'success');
  } else {
    document.getElementById('admin-login-error').classList.remove('hidden');
    input.value = '';
    input.focus();
  }
}

function adminLogout() {
  state.isAdminAuthed = false;
  cancelEditMaterial();
  showPage('dashboard');
  showToast('Signed out of admin.', 'info');
}

function renderAdminTable() {
  const tbody = document.getElementById('admin-materials-tbody');
  if (!tbody) return;

  if (state.materials.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" class="px-5 py-8 text-center text-ink/50">No materials yet — add one above.</td></tr>`;
  } else {
    tbody.innerHTML = state.materials.map((m) => `
      <tr class="border-b border-line last:border-0">
        <td class="max-w-xs truncate px-5 py-3 font-semibold text-ink">${escapeHTML(m.title)}</td>
        <td class="px-5 py-3">${escapeHTML(m.section)}</td>
        <td class="px-5 py-3">${escapeHTML(m.difficulty)}</td>
        <td class="px-5 py-3">
          <span class="${BADGE_BASE_CLASSES} ${m.tier === 'Premium' ? 'bg-marker text-ink' : 'border border-ink/15 bg-surface text-ink'}">${escapeHTML(m.tier)}</span>
        </td>
        <td class="max-w-[16rem] truncate px-5 py-3 text-ink/55">${escapeHTML(m.tags.join(', '))}</td>
        <td class="px-5 py-3 text-right">
          <button type="button" data-action="edit-material" data-id="${m.id}" class="font-display text-xs font-bold text-ink/70 hover:text-ink">Edit</button>
          <span class="mx-1.5 text-ink/20">|</span>
          <button type="button" data-action="delete-material" data-id="${m.id}" class="font-display text-xs font-bold text-rose-600 hover:text-rose-700">Delete</button>
        </td>
      </tr>
    `).join('');
  }
  document.getElementById('admin-materials-count').textContent = `${state.materials.length} total material${state.materials.length === 1 ? '' : 's'}`;
}

function handleAdminFormSubmit(event) {
  event.preventDefault();
  const form = event.target;
  const fd = new FormData(form);

  const title = (fd.get('title') || '').toString().trim();
  const section = fd.get('section');
  const difficulty = fd.get('difficulty');
  const tier = fd.get('tier');
  const description = (fd.get('description') || '').toString().trim();
  const tags = (fd.get('tags') || '').toString()
    .split(',')
    .map((t) => t.trim().toLowerCase().replace(/\s+/g, '-'))
    .filter(Boolean);

  if (!title || !section || !difficulty || !tier) {
    showToast('Fill in the title, section, difficulty, and access fields.', 'error');
    return;
  }

  if (state.editingMaterialId) {
    const idx = state.materials.findIndex((m) => m.id === state.editingMaterialId);
    if (idx !== -1) {
      state.materials[idx] = { ...state.materials[idx], title, section, difficulty, tier, description, tags };
      showToast('Material updated.', 'success');
    }
  } else {
    state.materials.push({ id: generateId(), title, section, difficulty, tier, description, tags });
    showToast('Material added.', 'success');
  }

  saveMaterials();
  renderAdminTable();
  renderMaterialsGrid();
  cancelEditMaterial();
}

function startEditMaterial(id) {
  const material = state.materials.find((m) => m.id === id);
  if (!material) return;

  state.editingMaterialId = id;
  const form = document.getElementById('admin-material-form');
  form.title.value = material.title;
  form.section.value = material.section;
  form.difficulty.value = material.difficulty;
  form.description.value = material.description || '';
  form.tags.value = material.tags.join(', ');
  const tierInput = form.querySelector(`input[name="tier"][value="${material.tier}"]`);
  if (tierInput) tierInput.checked = true;

  document.getElementById('admin-form-heading').textContent = `Edit material: ${material.title}`;
  document.getElementById('admin-form-submit-btn').textContent = 'Save changes';
  document.getElementById('admin-form-cancel-btn').classList.remove('hidden');
  form.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function cancelEditMaterial() {
  state.editingMaterialId = null;
  const form = document.getElementById('admin-material-form');
  if (form) form.reset();
  document.getElementById('admin-form-heading').textContent = 'Add new material';
  document.getElementById('admin-form-submit-btn').textContent = 'Add material';
  document.getElementById('admin-form-cancel-btn').classList.add('hidden');
}

function deleteMaterial(id) {
  const material = state.materials.find((m) => m.id === id);
  if (!material) return;
  const confirmed = window.confirm(`Delete "${material.title}"? This can't be undone.`);
  if (!confirmed) return;

  state.materials = state.materials.filter((m) => m.id !== id);
  saveMaterials();
  renderAdminTable();
  renderMaterialsGrid();
  showToast('Material deleted.', 'success');
  if (state.editingMaterialId === id) cancelEditMaterial();
}

function resetDemoData() {
  const confirmed = window.confirm('Reset materials and your plan back to the defaults? This can\u2019t be undone.');
  if (!confirmed) return;

  localStorage.removeItem(STORAGE_KEYS.MATERIALS);
  localStorage.removeItem(STORAGE_KEYS.USER);
  state.materials = loadMaterials();
  state.user = loadUser();
  state.filters = { section: 'all', difficulty: 'all', query: '' };
  cancelEditMaterial();

  syncFilterControlsFromState();
  renderScoreTracker();
  renderMaterialsGrid();
  renderAdminTable();
  updatePlanBadge();
  renderPricingButtons();
  showToast('Demo data reset.', 'success');
}

/* ---------------------------------------------------------------------- *
 * 11. MODAL / TOAST HELPERS
 * ---------------------------------------------------------------------- */

function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (!modal) return;
  modal.classList.remove('hidden');
  modal.classList.add('flex');
  document.body.classList.add('overflow-hidden');
  state.openModalId = modalId;
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (!modal) return;
  modal.classList.add('hidden');
  modal.classList.remove('flex');
  document.body.classList.remove('overflow-hidden');
  if (state.openModalId === modalId) state.openModalId = null;
}

function closeAllModals() {
  document.querySelectorAll('[data-modal]').forEach((modal) => {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
  });
  document.body.classList.remove('overflow-hidden');
  state.openModalId = null;
}

function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  if (!container) return;
  const colors = { success: 'bg-emerald-600', error: 'bg-rose-600', info: 'bg-ink' };
  const toast = document.createElement('div');
  toast.className = `toast pointer-events-auto mb-2 max-w-xs cursor-pointer rounded-xl px-4 py-3 font-sans text-sm font-semibold text-paper shadow-lg animate-slideUp ${colors[type] || colors.info}`;
  toast.textContent = message;
  toast.addEventListener('click', () => toast.remove());
  container.appendChild(toast);
  setTimeout(() => {
    toast.style.transition = 'opacity 300ms, transform 300ms';
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(6px)';
    setTimeout(() => toast.remove(), 320);
  }, 3200);
}

/* ---------------------------------------------------------------------- *
 * 12. EVENT WIRING
 * ---------------------------------------------------------------------- */

function attachEventListeners() {
  document.addEventListener('click', handleDelegatedClick);
  document.addEventListener('keydown', handleGlobalKeydown);

  document.querySelectorAll('[data-modal]').forEach((modal) => {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal(modal.id);
    });
  });

  document.getElementById('filter-section').addEventListener('change', handleFilterChange);
  document.getElementById('filter-difficulty').addEventListener('change', handleFilterChange);
  document.getElementById('filter-search').addEventListener('input', handleFilterChange);

  document.getElementById('admin-login-form').addEventListener('submit', handleAdminLoginSubmit);
  document.getElementById('admin-material-form').addEventListener('submit', handleAdminFormSubmit);
}

function handleDelegatedClick(event) {
  const el = event.target.closest('[data-action]');
  if (!el) return;
  const action = el.dataset.action;
  const id = el.dataset.id;

  switch (action) {
    case 'show-page':
      showPage(el.dataset.page);
      break;
    case 'toggle-mobile-menu':
      toggleMobileMenu();
      break;
    case 'open-material':
      handleMaterialCardClick(id);
      break;
    case 'start-practice': {
      const material = state.materials.find((m) => m.id === id);
      closeModal('modal-material');
      showToast(material ? `Practice for "${material.title}" isn\u2019t wired up yet — this is a UI demo.` : 'Practice isn\u2019t wired up yet.', 'info');
      break;
    }
    case 'goto-pricing':
      closeAllModals();
      showPage('pricing');
      break;
    case 'close-modal': {
      const modal = el.closest('[data-modal]');
      if (modal) closeModal(modal.id);
      break;
    }
    case 'open-ai-analyzer':
      openAIAnalyzerModal();
      break;
    case 'run-analysis':
      runAIAnalysis();
      break;
    case 'view-recommended':
      viewRecommendedMaterial(id);
      break;
    case 'clear-filters':
      clearFilters();
      break;
    case 'subscribe':
      subscribeToPlan(el.dataset.plan);
      break;
    case 'open-admin-login':
      state.isAdminAuthed ? showPage('admin') : openAdminLoginModal();
      break;
    case 'admin-logout':
      adminLogout();
      break;
    case 'edit-material':
      startEditMaterial(id);
      break;
    case 'delete-material':
      deleteMaterial(id);
      break;
    case 'cancel-edit':
      cancelEditMaterial();
      break;
    case 'reset-demo-data':
      resetDemoData();
      break;
    default:
      break;
  }
}

function handleGlobalKeydown(event) {
  if (event.key === 'Escape' && state.openModalId) {
    closeModal(state.openModalId);
  }
  if ((event.key === 'Enter' || event.key === ' ') && event.target.matches('[data-action="open-material"]')) {
    event.preventDefault();
    event.target.click();
  }
}

/* ---------------------------------------------------------------------- *
 * 13. SMALL UTILITIES
 * ---------------------------------------------------------------------- */

function humanizeTag(tag) {
  return TAG_LABELS[tag] || tag;
}

function generateId() {
  return 'm-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 7);
}

// Escapes text for safe insertion into innerHTML strings (admin-entered
// titles/tags/descriptions included).
function escapeHTML(str) {
  const div = document.createElement('div');
  div.textContent = String(str);
  return div.innerHTML;
}

document.addEventListener('DOMContentLoaded', init);
