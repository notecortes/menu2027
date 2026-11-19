/**
 * MedDiet Pro — Controlador SPA Principal en Vanilla JavaScript (ES6+)
 * Conecta con los endpoints PHP (/api/*.php) en servidor Apache/Docker (puerto 6666)
 * y dispone de sincronización relacional instantánea para entorno sin servidor PHP.
 * Catálogo: 200 recetas mediterráneas españolas hipocalóricas verificadas (0% marisco, 0% bacalao, 0% rape).
 */

import {
  RECIPES_DB,
  INGREDIENTS_DB,
  DEFAULT_WEEKLY_PLAN,
  DEFAULT_USER_PREFERENCES,
  DEFAULT_SAVED_MENUS,
  DAYS_ORDER,
  DAY_LABELS,
  CATEGORY_LABELS,
  AISLES_ORDER,
  formatGastronomicAmount,
  sortRecipesList,
  evaluateWeeklyPlan,
  calculateClinicalTargets,
  getCompatibleAlternatives,
  generateSeasonalWeeklyPlan,
  aggregateShoppingList,
  generateBatchCookingPlan,
  searchRecipesByFridgeIngredients
} from './engine.js';

const STORAGE_KEYS = {
  THEME: 'meddiet_theme_v1',
  SEASON: 'meddiet_season_v1',
  DINERS: 'meddiet_diners_v1',
  PLAN: 'meddiet_weekly_plan_v2',
  PREFS: 'meddiet_user_prefs_v2',
  FAVORITES: 'meddiet_favorites_v2',
  SAVED_MENUS: 'meddiet_saved_menus_v1',
  CHECKED_ITEMS: 'meddiet_checked_shopping_v1',
  LOCKED_SLOTS: 'meddiet_locked_slots_v1',
  CUSTOM_SHOPPING: 'meddiet_custom_shopping_v1',
  CLINICAL_PROFILE: 'meddiet_clinical_profile_v1',
  FRIDGE_INGREDIENTS: 'meddiet_fridge_ingredients_v1'
};

// Ingredientes básicos de despensa que suelen tenerse en casa
const PANTRY_BASIC_INGREDIENT_IDS = new Set([9, 11, 46, 47]);

const state = {
  theme: localStorage.getItem(STORAGE_KEYS.THEME) || 'light',
  activeView: 'planner', // 'planner' | 'catalog' | 'fridge' | 'shopping' | 'batch'
  season: localStorage.getItem(STORAGE_KEYS.SEASON) || 'primavera',
  diners: Math.max(1, Math.min(12, parseInt(localStorage.getItem(STORAGE_KEYS.DINERS) || '2', 10))),
  selectedMobileDay: 'lunes',
  catalogCategoryFilter: 'all',
  catalogSortBy: 'recommended',
  catalogSearchQuery: '',
  alternativesSortBy: 'recommended',
  alternativesSearchQuery: '',
  activeAlternativeSlot: null, // { day, mealType }
  preferences: loadStoredPreferences(),
  favorites: loadStoredFavorites(),
  lockedSlots: loadStoredLockedSlots(),
  customShoppingItems: loadStoredCustomShopping(),
  hidePantryBasics: false,
  clinicalProfile: loadStoredClinicalProfile(),
  fridgeIngredients: loadStoredFridgeIngredients(),
  fridgeIgnorePantry: true,
  fridgeMealSlotFilter: 'all',
  fridgeSeasonFilter: 'all',
  slottingFridgeRecipeId: null,
  planMap: null,
  savedMenus: loadStoredSavedMenus(),
  checkedIngredients: loadCheckedIngredients(),
  phpBackendAvailable: null,
  activePdfMode: 'fridge-landscape', // 'fridge-landscape' | 'recipes-booklet'
  // Borrador temporal dentro del modal de preferencias
  draftPrefs: null,
  // Estado para Modo Cocina y Temporizador
  cookingRecipe: null,
  cookingStepIndex: 0,
  timerRemainingSec: 0,
  timerIntervalId: null,
  timerRunning: false
};

state.planMap = loadStoredPlan(state.preferences);

function loadStoredPreferences() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PREFS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') {
        return {
          arroz_cubana_day: parsed.arroz_cubana_day || 'viernes',
          legume_days: Array.isArray(parsed.legume_days) ? parsed.legume_days : ['martes', 'jueves'],
          fish_nights: Array.isArray(parsed.fish_nights) ? parsed.fish_nights : ['martes', 'jueves'],
          wanted_keywords: typeof parsed.wanted_keywords === 'string' ? parsed.wanted_keywords : '',
          excluded_keywords: typeof parsed.excluded_keywords === 'string' ? parsed.excluded_keywords : ''
        };
      }
    }
  } catch (_) {
    // fallback
  }
  return structuredClone(DEFAULT_USER_PREFERENCES);
}

function savePreferencesToStorage() {
  localStorage.setItem(STORAGE_KEYS.PREFS, JSON.stringify(state.preferences));
}

function loadStoredFavorites() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.FAVORITES);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed.map(Number).filter(n => n >= 1 && n <= 200);
      }
    }
  } catch (_) {
    // fallback
  }
  return [1, 2, 11, 21, 32];
}

function saveFavoritesToStorage() {
  localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(state.favorites));
}

function isFavoriteRecipe(recipeId) {
  return state.favorites.includes(Number(recipeId));
}

function toggleFavoriteRecipe(recipeId) {
  const id = Number(recipeId);
  const idx = state.favorites.indexOf(id);
  const recipe = RECIPES_DB.find(r => r.id === id);
  if (idx >= 0) {
    state.favorites.splice(idx, 1);
    saveFavoritesToStorage();
    if (recipe) showToast(`"${recipe.name}" quitado de tus favoritas.`);
  } else {
    state.favorites.push(id);
    saveFavoritesToStorage();
    if (recipe) showToast(`★ "${recipe.name}" añadido a tus comidas favoritas.`);
  }
  renderPlannerView();
  renderCatalogView();
  if (state.activeAlternativeSlot) {
    renderAlternativesModalContent();
  }
}

function loadStoredPlan(prefs) {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PLAN);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.lunes && parsed.viernes) {
        const arrozDay = prefs?.arroz_cubana_day ?? 'viernes';
        if (arrozDay !== 'ninguno' && DAYS_ORDER.includes(arrozDay)) {
          parsed[arrozDay].comida = 1;
        }
        return parsed;
      }
    }
  } catch (_) {
    // fallback
  }
  return structuredClone(DEFAULT_WEEKLY_PLAN);
}

function savePlanToStorage() {
  const arrozDay = state.preferences.arroz_cubana_day;
  if (arrozDay !== 'ninguno' && DAYS_ORDER.includes(arrozDay)) {
    state.planMap[arrozDay].comida = 1;
  }
  localStorage.setItem(STORAGE_KEYS.PLAN, JSON.stringify(state.planMap));
}

function loadStoredSavedMenus() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SAVED_MENUS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (_) {
    // fallback
  }
  return structuredClone(DEFAULT_SAVED_MENUS);
}

function saveMenusToStorage() {
  localStorage.setItem(STORAGE_KEYS.SAVED_MENUS, JSON.stringify(state.savedMenus));
}

function loadCheckedIngredients() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CHECKED_ITEMS);
    if (raw) return JSON.parse(raw) || {};
  } catch (_) {
    // fallback
  }
  return {};
}

function saveCheckedIngredients() {
  localStorage.setItem(STORAGE_KEYS.CHECKED_ITEMS, JSON.stringify(state.checkedIngredients));
}

function loadStoredFridgeIngredients() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.FRIDGE_INGREDIENTS);
    if (raw) {
      const arr = JSON.parse(raw);
      if (Array.isArray(arr) && arr.length > 0) return new Set(arr);
    }
  } catch (_) {}
  // Ingredientes habituales predeterminados para inspirar: Huevos (8), Tomate (6), Calabacín (13)
  return new Set([8, 6, 13]);
}

function saveFridgeIngredients() {
  localStorage.setItem(STORAGE_KEYS.FRIDGE_INGREDIENTS, JSON.stringify(Array.from(state.fridgeIngredients)));
}

function loadStoredLockedSlots() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.LOCKED_SLOTS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') return parsed;
    }
  } catch (_) {}
  return {};
}

function saveLockedSlots() {
  localStorage.setItem(STORAGE_KEYS.LOCKED_SLOTS, JSON.stringify(state.lockedSlots));
}

function toggleSlotLock(day, mealType) {
  const arrozDay = state.preferences.arroz_cubana_day;
  if (arrozDay !== 'ninguno' && day === arrozDay && mealType === 'comida') {
    showToast(`El Arroz a la cubana del ${DAY_LABELS[day]} ya está fijado por regla semanal.`);
    return;
  }
  const key = `${day}_${mealType}`;
  if (state.lockedSlots[key]) {
    delete state.lockedSlots[key];
    saveLockedSlots();
    renderPlannerView();
    showToast(`🔓 Desbloqueado ${DAY_LABELS[day]} (${mealType}).`);
  } else {
    const currentRecipeId = Number(state.planMap[day]?.[mealType] || 0);
    if (currentRecipeId > 0) {
      state.lockedSlots[key] = currentRecipeId;
      saveLockedSlots();
      renderPlannerView();
      const rec = RECIPES_DB.find(r => r.id === currentRecipeId);
      showToast(`🔒 Fijado "${rec?.name || 'Plato'}" en ${DAY_LABELS[day]} (${mealType}). No cambiará al regenerar semana.`);
    }
  }
}

function loadStoredCustomShopping() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CUSTOM_SHOPPING);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (_) {}
  return [];
}

function saveCustomShopping() {
  localStorage.setItem(STORAGE_KEYS.CUSTOM_SHOPPING, JSON.stringify(state.customShoppingItems));
}

function loadStoredClinicalProfile() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CLINICAL_PROFILE);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') return parsed;
    }
  } catch (_) {}
  return {
    sex: 'female',
    age: 42,
    weight_kg: 74,
    height_cm: 166,
    activity_factor: 1.375,
    deficit_kcal: 450
  };
}

function saveClinicalProfile() {
  localStorage.setItem(STORAGE_KEYS.CLINICAL_PROFILE, JSON.stringify(state.clinicalProfile));
}

/**
 * Intenta consultar el backend PHP (/api/*.php) cuando corre bajo Apache/PHP (Docker 6666 o cPanel).
 */
async function apiFetch(endpoint, options = {}) {
  if (state.phpBackendAvailable === false) {
    return null;
  }
  try {
    const res = await fetch(endpoint, {
      headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
      ...options
    });
    const contentType = res.headers.get('content-type') || '';
    if (!res.ok || !contentType.includes('application/json')) {
      state.phpBackendAvailable = false;
      return null;
    }
    const data = await res.json();
    if (data && typeof data.ok === 'boolean') {
      state.phpBackendAvailable = true;
      return data;
    }
    state.phpBackendAvailable = false;
    return null;
  } catch (_) {
    state.phpBackendAvailable = false;
    return null;
  }
}

function showToast(message) {
  const toastEl = document.getElementById('app-toast');
  if (!toastEl) return;
  toastEl.textContent = message;
  toastEl.classList.add('is-visible');
  clearTimeout(toastEl._hideTimer);
  toastEl._hideTimer = setTimeout(() => {
    toastEl.classList.remove('is-visible');
  }, 3200);
}

/**
 * Normaliza y resuelve la ruta de las imágenes de recetas.
 * Garantiza compatibilidad tanto en la raíz de un dominio como en subdirectorios
 * de hosting compartido (ej: https://ncoge.com/mio/menu/), eliminando barras
 * iniciales que forzarían la resolución errónea desde la raíz del dominio del servidor.
 *
 * @param {string} relPath - Ruta relativa o URL remota de la imagen
 * @returns {string} Ruta relativa utilizable por el elemento <img>
 */
function resolveImagePath(relPath) {
  if (!relPath || typeof relPath !== 'string') {
    return 'assets/img/verduras.jpg';
  }
  const clean = relPath.trim();
  if (clean.startsWith('http://') || clean.startsWith('https://') || clean.startsWith('data:')) {
    return clean;
  }
  // Si la ruta comienza con una barra diagonal (/), la quitamos para que
  // el navegador la resuelva de forma relativa al directorio actual (ej. /mio/menu/)
  const withoutLeadingSlash = clean.replace(/^\/+/, '');
  return withoutLeadingSlash || 'assets/img/verduras.jpg';
}

function applyTheme(theme) {
  state.theme = theme === 'dark' ? 'dark' : 'light';
  document.documentElement.setAttribute('data-theme', state.theme);
  localStorage.setItem(STORAGE_KEYS.THEME, state.theme);

  const toggleBtn = document.getElementById('theme-toggle-btn');
  if (toggleBtn) {
    toggleBtn.setAttribute(
      'aria-label',
      state.theme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'
    );
    toggleBtn.textContent = state.theme === 'dark' ? 'Modo Claro' : 'Modo Oscuro';
  }
}

function switchView(viewName) {
  state.activeView = viewName;

  document.querySelectorAll('.view-section').forEach(sec => {
    sec.classList.toggle('is-active', sec.id === `view-${viewName}`);
  });

  document.querySelectorAll('[data-nav-view]').forEach(btn => {
    const isMatch = btn.getAttribute('data-nav-view') === viewName;
    btn.classList.toggle('is-active', isMatch);
    btn.setAttribute('aria-current', isMatch ? 'page' : 'false');
  });

  if (viewName === 'planner') {
    renderPlannerView();
  } else if (viewName === 'catalog') {
    renderCatalogView();
  } else if (viewName === 'fridge') {
    renderFridgeView();
  } else if (viewName === 'shopping') {
    renderShoppingListView();
  } else if (viewName === 'batch') {
    renderBatchCookingView();
  }
}

async function syncInitialData() {
  const hasCustomStoredPlan = Boolean(localStorage.getItem(STORAGE_KEYS.PLAN));
  const apiData = await apiFetch(`api/get_menu.php?season=${encodeURIComponent(state.season)}&diners=${state.diners}`);
  if (apiData && apiData.ok && apiData.days && !hasCustomStoredPlan) {
    for (const day of DAYS_ORDER) {
      if (apiData.days[day]?.comida && apiData.days[day]?.cena) {
        state.planMap[day] = {
          comida: Number(apiData.days[day].comida.recipe_id),
          cena: Number(apiData.days[day].cena.recipe_id)
        };
      }
    }
    if (Array.isArray(apiData.saved_menus) && apiData.saved_menus.length > 0) {
      state.savedMenus = apiData.saved_menus;
    }
    savePlanToStorage();
  }
  renderAll();
}

function renderAll() {
  updateControlsUI();
  renderPlannerView();
  renderCatalogView();
  renderShoppingListView();
  renderBatchCookingView();
  renderHiddenPrintContainers();
}

function updateControlsUI() {
  const dinersValEl = document.getElementById('diners-count-display');
  if (dinersValEl) {
    dinersValEl.textContent = `${state.diners}`;
  }
  const decBtn = document.getElementById('diners-dec-btn');
  const incBtn = document.getElementById('diners-inc-btn');
  if (decBtn) decBtn.disabled = state.diners <= 1;
  if (incBtn) incBtn.disabled = state.diners >= 12;

  document.querySelectorAll('[data-season-btn]').forEach(btn => {
    const s = btn.getAttribute('data-season-btn');
    btn.classList.toggle('is-active', s === state.season);
    btn.setAttribute('aria-pressed', s === state.season ? 'true' : 'false');
  });
}

/**
 * Renderiza la vista principal del Planificador Semanal (7 días, 14 tomas) + auditoría nutricional.
 */
function renderPlannerView() {
  const evaluation = evaluateWeeklyPlan(state.planMap, state.preferences);
  const { days, compliance } = evaluation;
  const prefs = state.preferences;

  // Actualizar barra de resumen de preferencias
  const prefSummaryEl = document.getElementById('active-preferences-summary');
  if (prefSummaryEl) {
    const arrozTxt = prefs.arroz_cubana_day === 'ninguno'
      ? 'Libre'
      : DAY_LABELS[prefs.arroz_cubana_day] || 'Viernes';
    const legTxt = prefs.legume_days.length
      ? prefs.legume_days.map(d => DAY_LABELS[d]).join(', ')
      : 'Ninguno';
    const fishTxt = prefs.fish_nights.length
      ? prefs.fish_nights.map(d => DAY_LABELS[d]).join(', ')
      : 'Ninguno';
    const wantedNote = prefs.wanted_keywords.trim()
      ? ` · Priorizando: ${escapeHtml(prefs.wanted_keywords.trim())}`
      : '';
    const excludedNote = prefs.excluded_keywords.trim()
      ? ` · Evitando: ${escapeHtml(prefs.excluded_keywords.trim())}`
      : '';

    prefSummaryEl.innerHTML = `
      <strong>Distribución personalizada:</strong>
      Arroz a la cubana (${arrozTxt}) ·
      Legumbres (${legTxt}) ·
      Pescado (${fishTxt}) ·
      ★ ${state.favorites.length} favoritas${wantedNote}${excludedNote}
    `;
  }

  // Actualizar métricas de cumplimiento clínico
  const avgKcalEl = document.getElementById('metric-avg-kcal');
  const legumeEl = document.getElementById('metric-legumes');
  const legumeSubEl = document.getElementById('metric-legumes-sub');
  const fishEl = document.getElementById('metric-fish');
  const fishSubEl = document.getElementById('metric-fish-sub');
  const fridayEl = document.getElementById('metric-friday');
  const fridaySubEl = document.getElementById('metric-friday-sub');
  const exclusionsEl = document.getElementById('metric-exclusions');

  if (avgKcalEl) avgKcalEl.textContent = `${compliance.avg_daily_kcal} kcal / día`;
  if (legumeEl) legumeEl.textContent = `${compliance.legume_lunches} de ${prefs.legume_days.length} comidas`;
  if (legumeSubEl) {
    legumeSubEl.textContent = prefs.legume_days.length
      ? prefs.legume_days.map(d => DAY_LABELS[d]).join(' y ')
      : 'Configurable por comensal';
  }
  if (fishEl) fishEl.textContent = `${compliance.fish_dinners} de ${prefs.fish_nights.length} cenas`;
  if (fishSubEl) {
    fishSubEl.textContent = prefs.fish_nights.length
      ? prefs.fish_nights.map(d => DAY_LABELS[d]).join(' y ')
      : 'Pescados permitidos';
  }
  if (fridayEl) {
    fridayEl.textContent = prefs.arroz_cubana_day === 'ninguno'
      ? 'Día libre (sin fijar)'
      : `${DAY_LABELS[prefs.arroz_cubana_day]} mediodía`;
  }
  if (fridaySubEl) {
    fridaySubEl.textContent = compliance.friday_cubana_locked
      ? 'Arroz a la cubana ligero activo'
      : 'Configurable en preferencias';
  }
  if (exclusionsEl) {
    exclusionsEl.textContent = `200 Recetas · ${compliance.unique_recipes_count}/14 únicas`;
  }

  // Renderizar pestañas de día para móvil
  const mobileStrip = document.getElementById('mobile-day-tabs');
  if (mobileStrip) {
    mobileStrip.innerHTML = DAYS_ORDER.map(day => `
      <button
        type="button"
        class="mobile-day-tab ${state.selectedMobileDay === day ? 'is-active' : ''}"
        data-mobile-day="${day}"
      >
        ${DAY_LABELS[day]}
      </button>
    `).join('');
  }

  // Renderizar cuadrícula de 7 columnas (Lunes a Domingo)
  const gridEl = document.getElementById('weekly-planner-grid');
  if (!gridEl) return;

  gridEl.innerHTML = DAYS_ORDER.map(day => {
    const dayData = days[day];
    const hiddenMobileClass = state.selectedMobileDay !== day ? 'is-hidden-mobile' : '';

    return `
      <article class="day-column ${hiddenMobileClass}" data-day-col="${day}">
        <header class="day-header">
          <h2 class="day-name">${DAY_LABELS[day]}</h2>
          <span class="day-kcal tabular-nums" title="Incluye desayuno y tentempié hipocalórico pautado (+690 kcal)">${dayData.daily_kcal} kcal</span>
        </header>
        ${renderMealSlotHTML(day, 'comida', dayData.comida)}
        ${renderMealSlotHTML(day, 'cena', dayData.cena)}
      </article>
    `;
  }).join('');

  renderHiddenPrintContainers();
}

function renderMealSlotHTML(day, mealType, recipe) {
  const arrozDay = state.preferences.arroz_cubana_day;
  const isFixedCubanaSlot = arrozDay !== 'ninguno' && day === arrozDay && mealType === 'comida';
  const isUserLocked = Boolean(state.lockedSlots[`${day}_${mealType}`]);
  const mealLabel = mealType === 'comida' ? 'Comida' : 'Cena';
  const isFav = isFavoriteRecipe(recipe.id);

  const shortCategoryMap = {
    arroz_fijo: 'Arroz Cubana',
    legumbre: 'Legumbres',
    pescado: 'Pescado',
    ave_carne_magra: 'Ave / Magro',
    verdura_huevo: 'Huerta / Huevo'
  };

  let ruleNotice = '';
  if (isFixedCubanaSlot) {
    ruleNotice = `<span class="slot-rule-tag is-fixed-friday">Fijo ${DAY_LABELS[day]}</span>`;
  } else if (isUserLocked) {
    ruleNotice = `<span class="slot-rule-tag is-fixed-friday">🔒 Fijado</span>`;
  } else if (mealType === 'comida' && recipe.category === 'legumbre') {
    ruleNotice = `<span class="slot-rule-tag">Legumbre</span>`;
  } else if (mealType === 'cena' && recipe.category === 'pescado') {
    ruleNotice = `<span class="slot-rule-tag">Pescado</span>`;
  } else {
    ruleNotice = `<span class="slot-meta-line">${shortCategoryMap[recipe.category] || 'Mediterráneo'}</span>`;
  }

  return `
    <div class="meal-slot" data-slot="${day}-${mealType}">
      <div>
        <div class="slot-kicker">
          <span class="slot-type-label">${mealLabel}</span>
          ${ruleNotice}
        </div>
        <div class="slot-thumb-wrap">
          ${!isFixedCubanaSlot ? `
            <button
              type="button"
              class="fav-star-btn fav-star-overlay ${isUserLocked ? 'is-fav' : ''}"
              style="left: 6px; right: auto; font-size: 0.78rem;"
              data-toggle-lock="${day}:${mealType}"
              aria-label="${isUserLocked ? 'Desbloquear plato de' : 'Fijar con candado plato de'} ${DAY_LABELS[day]} ${mealType}"
              title="${isUserLocked ? 'Plato fijado (no cambiará al generar nueva semana). Clic para desbloquear' : 'Fijar este plato para que no cambie al generar nueva semana'}"
            >
              ${isUserLocked ? '🔒' : '🔓'}
            </button>
          ` : ''}
          <button
            type="button"
            class="fav-star-btn fav-star-overlay ${isFav ? 'is-fav' : ''}"
            data-toggle-favorite="${recipe.id}"
            aria-label="${isFav ? 'Quitar de favoritos' : 'Añadir a favoritos'} ${escapeHtml(recipe.name)}"
            title="${isFav ? 'Quitar de favoritos' : 'Guardar en favoritos'}"
          >
            ${isFav ? '★' : '☆'}
          </button>
          <button
            type="button"
            class="slot-thumb-btn"
            data-open-recipe="${recipe.id}"
            aria-label="Ver ficha completa de ${escapeHtml(recipe.name)}"
            style="height: 100%;"
          >
            <img
              src="${resolveImagePath(recipe.image_url)}"
              alt="${escapeHtml(recipe.name)}"
              loading="lazy"
              referrerpolicy="no-referrer"
              onerror="this.onerror=null;this.src='assets/img/verduras.jpg';"
            />
          </button>
        </div>
        <button
          type="button"
          class="slot-thumb-btn"
          data-open-recipe="${recipe.id}"
        >
          <h3 class="slot-recipe-title">${escapeHtml(recipe.name)}</h3>
        </button>
        <p class="slot-meta-line tabular-nums">
          ${recipe.kcal} kcal · ${recipe.prep_minutes}m · ★${recipe.rating || '4.8'}
        </p>
      </div>

      <div class="slot-actions">
        <button
          type="button"
          class="slot-btn"
          data-quick-swap="${day}:${mealType}"
          aria-label="Cambiar plato de ${DAY_LABELS[day]} ${mealType}"
        >
          Cambiar
        </button>
        <button
          type="button"
          class="slot-btn"
          data-open-alternatives="${day}:${mealType}"
          aria-label="Ver todas las opciones para ${DAY_LABELS[day]} ${mealType}"
        >
          Opciones
        </button>
      </div>
    </div>
  `;
}

/**
 * Cambio rápido aleatorio compatible ("Swap Engine") garantizando 0 repeticiones en la semana.
 */
async function handleQuickSwap(day, mealType) {
  const arrozDay = state.preferences.arroz_cubana_day;
  if (arrozDay !== 'ninguno' && day === arrozDay && mealType === 'comida') {
    showToast(`El ${DAY_LABELS[day]} a mediodía tiene fijado el Arroz a la cubana. Puedes cambiar el día en "Configurar Días y Gustos".`);
    return;
  }
  if (state.lockedSlots[`${day}_${mealType}`]) {
    showToast(`🔒 Este plato está fijado con candado. Pulsa primero 🔓 sobre la foto si deseas cambiarlo.`);
    return;
  }

  const compat = getCompatibleAlternatives(
    day,
    mealType,
    state.planMap,
    state.season,
    state.preferences,
    state.favorites,
    state.alternativesSortBy
  );
  const pool = compat.alternatives.filter(r => r.id !== compat.current_recipe_id);
  if (pool.length === 0) return;

  const preferredPool = pool.filter(r => r.matches_season === 1 || r.matches_wanted === 1);
  const targetPool = preferredPool.length > 0 ? preferredPool : pool;
  const chosen = targetPool[Math.floor(Math.random() * Math.min(12, targetPool.length))];

  state.planMap[day][mealType] = chosen.id;
  savePlanToStorage();

  await apiFetch('api/swap_recipe.php', {
    method: 'POST',
    body: JSON.stringify({
      action: 'apply_swap',
      day,
      meal: mealType,
      recipe_id: chosen.id,
      season: state.season
    })
  });

  renderPlannerView();
  renderShoppingListView();
  renderBatchCookingView();
  showToast(`${DAY_LABELS[day]} (${mealType}): cambiado a "${chosen.name}"`);
}

/**
 * Abre el modal con TODAS las alternativas compatibles que NO estén repetidas en la semana.
 */
function openAlternativesModal(day, mealType) {
  state.activeAlternativeSlot = { day, mealType };
  state.alternativesSearchQuery = '';
  const searchInput = document.getElementById('alternatives-search-input');
  if (searchInput) searchInput.value = '';

  const modal = document.getElementById('alternatives-modal');
  if (!modal) return;

  renderAlternativesModalContent();
  modal.classList.add('is-open');
}

function renderAlternativesModalContent() {
  if (!state.activeAlternativeSlot) return;
  const { day, mealType } = state.activeAlternativeSlot;

  const compat = getCompatibleAlternatives(
    day,
    mealType,
    state.planMap,
    state.season,
    state.preferences,
    state.favorites,
    state.alternativesSortBy
  );

  const titleEl = document.getElementById('alternatives-modal-title');
  const subEl = document.getElementById('alternatives-modal-subtitle');
  const bodyEl = document.getElementById('alternatives-modal-list');
  if (!bodyEl) return;

  // Actualizar chips de ordenación activos
  document.querySelectorAll('[data-alt-sort]').forEach(btn => {
    btn.classList.toggle('is-active', btn.getAttribute('data-alt-sort') === state.alternativesSortBy);
  });

  const q = state.alternativesSearchQuery.trim().toLowerCase();
  const filteredAlts = compat.alternatives.filter(r => {
    if (!q) return true;
    return (
      r.name.toLowerCase().includes(q) ||
      r.cooking_method.toLowerCase().includes(q) ||
      r.chef_tip.toLowerCase().includes(q)
    );
  });

  const catExplain =
    compat.required_category === 'arroz_fijo'
      ? `Este hueco corresponde al día elegido para el Arroz a la cubana (${DAY_LABELS[day]}). También puedes elegir cualquiera de los ${filteredAlts.length} platos no repetidos o cambiar el día del Arroz en Configurar Días.`
      : compat.required_category === 'legumbre'
        ? `Mostrando los ${filteredAlts.length} platos de Legumbres disponibles que NO están repetidos en tu semana.`
        : compat.required_category === 'pescado'
          ? `Mostrando los ${filteredAlts.length} Pescados permitidos (0% marisco, bacalao ni rape) no repetidos en tu semana.`
          : `Mostrando los ${filteredAlts.length} platos compatibles de Aves/Carnes magras y Huerta/Huevos que NO están repetidos en tu semana.`;

  if (titleEl) {
    titleEl.textContent = `Opciones para el ${DAY_LABELS[day]} (${mealType === 'comida' ? 'Comida' : 'Cena'}) — ${filteredAlts.length} platos disponibles`;
  }
  if (subEl) {
    subEl.textContent = catExplain;
  }

  if (filteredAlts.length === 0) {
    bodyEl.innerHTML = `
      <div class="aisle-block" style="padding: 1.5rem; text-align: center;">
        <p class="slot-meta-line">No hay platos que coincidan con la búsqueda "${escapeHtml(q)}".</p>
      </div>
    `;
    return;
  }

  bodyEl.innerHTML = `
    <div class="catalog-grid">
      ${filteredAlts.map(r => {
        const isCurrent = r.id === compat.current_recipe_id;
        const isFav = isFavoriteRecipe(r.id);
        const seasonTag = r.matches_season ? `Ideal en ${capitalize(state.season)}` : 'Todo el año';
        return `
          <article class="recipe-card">
            <div class="recipe-card-media" style="position: relative;">
              <button
                type="button"
                class="fav-star-btn"
                style="position: absolute; top: 8px; right: 8px; z-index: 3;"
                data-toggle-favorite="${r.id}"
                aria-label="Favorito ${escapeHtml(r.name)}"
              >
                ${isFav ? '★' : '☆'}
              </button>
              <img src="${resolveImagePath(r.image_url)}" alt="${escapeHtml(r.name)}" loading="lazy" referrerpolicy="no-referrer" onerror="this.onerror=null;this.src='assets/img/verduras.jpg';" />
            </div>
            <div class="recipe-card-body">
              <p class="recipe-card-kicker tabular-nums">
                ★ ${r.rating || 4.8} · ${r.difficulty || 'Fácil'} · ${r.prep_minutes} min · ${r.kcal} kcal
              </p>
              <h3 class="recipe-card-title">${escapeHtml(r.name)}</h3>
              <p class="slot-meta-line">${CATEGORY_LABELS[r.category]} · ${seasonTag}</p>
              <p class="recipe-card-tip">${escapeHtml(r.chef_tip)}</p>
            </div>
            <div class="recipe-card-footer">
              <button type="button" class="btn-ghost" data-open-recipe="${r.id}">
                Ver receta
              </button>
              <button
                type="button"
                class="btn-primary"
                data-select-alternative="${day}:${mealType}:${r.id}"
                ${isCurrent ? 'disabled' : ''}
              >
                ${isCurrent ? 'Plato actual' : 'Elegir este plato'}
              </button>
            </div>
          </article>
        `;
      }).join('')}
    </div>
  `;
}

async function applyAlternativeSelection(day, mealType, recipeId) {
  const numericId = Number(recipeId);
  // Si el usuario reemplaza el plato del día que tenía asignado el Arroz a la cubana por otro plato distinto de 1, actualizamos la preferencia automáticamente
  if (
    state.preferences.arroz_cubana_day === day &&
    mealType === 'comida' &&
    numericId !== 1
  ) {
    state.preferences.arroz_cubana_day = 'ninguno';
    savePreferencesToStorage();
  }
  state.planMap[day][mealType] = numericId;
  savePlanToStorage();

  await apiFetch('api/swap_recipe.php', {
    method: 'POST',
    body: JSON.stringify({
      action: 'apply_swap',
      day,
      meal: mealType,
      recipe_id: numericId,
      season: state.season
    })
  });

  closeAllModals();
  renderPlannerView();
  renderShoppingListView();
  renderBatchCookingView();

  const chosen = RECIPES_DB.find(r => r.id === numericId);
  if (chosen) {
    showToast(`Seleccionado "${chosen.name}" para el ${DAY_LABELS[day]}.`);
  }
}

/**
 * Abre el Configurador de Días (Arroz a la cubana, Legumbres, Pescado) y Gustos (Quiero / No quiero).
 */
function openPreferencesModal() {
  state.draftPrefs = structuredClone(state.preferences);
  const modal = document.getElementById('preferences-modal');
  if (!modal) return;
  renderPreferencesModalBody();
  modal.classList.add('is-open');
}

function renderPreferencesModalBody() {
  const bodyEl = document.getElementById('preferences-modal-body');
  if (!bodyEl || !state.draftPrefs) return;

  const draft = state.draftPrefs;
  const arrozOptions = [...DAYS_ORDER, 'ninguno'];

  bodyEl.innerHTML = `
    <div class="pref-section">
      <h3 class="pref-section-title">1. Día para el "Arroz blanco a la cubana (versión ligera)" (Mediodía)</h3>
      <p class="pref-section-desc">
        Por tradición se coloca el Viernes al mediodía, pero puedes moverlo al día de la semana que prefieras o dejarlo libre.
      </p>
      <div class="day-chips-row">
        ${arrozOptions.map(d => {
          const isSel = draft.arroz_cubana_day === d;
          const label = d === 'ninguno' ? 'Ningún día fijo' : DAY_LABELS[d];
          return `
            <button
              type="button"
              class="day-chip-btn ${isSel ? 'is-selected-terracotta' : ''}"
              data-pref-arroz-day="${d}"
            >
              ${label}
            </button>
          `;
        }).join('')}
      </div>
    </div>

    <div class="pref-section">
      <h3 class="pref-section-title">2. Días de Legumbres para Comer (Mediodía) — Seleccionados: ${draft.legume_days.length}</h3>
      <p class="pref-section-desc">
        Haz clic en los días en que quieres comer legumbres (recomendado: 2 días por semana, ej. Martes y Jueves, o Lunes y Miércoles).
      </p>
      <div class="day-chips-row">
        ${DAYS_ORDER.map(d => {
          const isSel = draft.legume_days.includes(d);
          return `
            <button
              type="button"
              class="day-chip-btn ${isSel ? 'is-selected' : ''}"
              data-pref-legume-day="${d}"
            >
              ${DAY_LABELS[d]} ${isSel ? '✓' : ''}
            </button>
          `;
        }).join('')}
      </div>
    </div>

    <div class="pref-section">
      <h3 class="pref-section-title">3. Noches de Pescado Permitido para Cenar — Seleccionadas: ${draft.fish_nights.length}</h3>
      <p class="pref-section-desc">
        Elige qué noches quieres cenar pescado blanco o azul permitido (0% marisco, 0% bacalao, 0% rape).
      </p>
      <div class="day-chips-row">
        ${DAYS_ORDER.map(d => {
          const isSel = draft.fish_nights.includes(d);
          return `
            <button
              type="button"
              class="day-chip-btn ${isSel ? 'is-selected' : ''}"
              data-pref-fish-night="${d}"
            >
              ${DAY_LABELS[d]} ${isSel ? '✓' : ''}
            </button>
          `;
        }).join('')}
      </div>
    </div>

    <div class="pref-input-grid">
      <div class="pref-section">
        <label for="pref-wanted-input" class="pref-section-title">4. Cosas que SÍ quieres priorizar en la semana</label>
        <p class="pref-section-desc">Separa por comas ingredientes o platos que te apetezcan (ej. gazpacho, salmón, garbanzos, tortilla).</p>
        <textarea
          id="pref-wanted-input"
          class="pref-textarea"
          placeholder="Ej. salmorejo, lubina, lentejas, calabacín..."
        >${escapeHtml(draft.wanted_keywords)}</textarea>
      </div>

      <div class="pref-section">
        <label for="pref-excluded-input" class="pref-section-title">5. Cosas que NO quieres ver esta semana</label>
        <p class="pref-section-desc">Además de marisco, bacalao y rape (siempre excluidos), indica ingredientes a evitar esta semana (ej. conejo, brócoli, atún).</p>
        <textarea
          id="pref-excluded-input"
          class="pref-textarea"
          placeholder="Ej. conejo, alcachofa, sardinas..."
        >${escapeHtml(draft.excluded_keywords)}</textarea>
      </div>
    </div>

    <div style="display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; gap: 0.75rem; padding-top: 0.5rem;">
      <button type="button" class="btn-ghost" id="reset-default-prefs-btn">
        Restaurar distribución clásica (Viernes Arroz · Mar/Jue Legumbres y Pescado)
      </button>
      <div style="display: flex; flex-wrap: wrap; gap: 0.65rem;">
        <button type="button" class="btn-secondary" id="save-prefs-only-btn">
          Guardar Preferencias
        </button>
        <button type="button" class="btn-primary" id="save-prefs-and-regenerate-btn">
          Aplicar y Generar Semana a Medida
        </button>
      </div>
    </div>
  `;
}

function captureDraftPrefInputs() {
  if (!state.draftPrefs) return;
  const wantedEl = document.getElementById('pref-wanted-input');
  const excludedEl = document.getElementById('pref-excluded-input');
  if (wantedEl) state.draftPrefs.wanted_keywords = wantedEl.value.trim();
  if (excludedEl) state.draftPrefs.excluded_keywords = excludedEl.value.trim();
}

async function applyPreferences(shouldRegenerateWeek) {
  captureDraftPrefInputs();
  if (!state.draftPrefs) return;

  // Si el día elegido para el Arroz a la cubana coincide con un día de legumbres a mediodía, quitamos ese día de legumbres para no colisionar
  if (state.draftPrefs.arroz_cubana_day !== 'ninguno') {
    state.draftPrefs.legume_days = state.draftPrefs.legume_days.filter(
      d => d !== state.draftPrefs.arroz_cubana_day
    );
  }

  state.preferences = structuredClone(state.draftPrefs);
  savePreferencesToStorage();

  if (shouldRegenerateWeek) {
    state.planMap = generateSeasonalWeeklyPlan(
      state.season,
      state.preferences,
      state.favorites,
      new Set(state.favorites),
      state.lockedSlots
    );
  } else if (
    state.preferences.arroz_cubana_day !== 'ninguno' &&
    DAYS_ORDER.includes(state.preferences.arroz_cubana_day)
  ) {
    state.planMap[state.preferences.arroz_cubana_day].comida = 1;
  }

  savePlanToStorage();

  await apiFetch('api/swap_recipe.php', {
    method: 'POST',
    body: JSON.stringify({
      action: 'sync_plan',
      plan: state.planMap,
      arroz_cubana_day: state.preferences.arroz_cubana_day
    })
  });

  closeAllModals();
  renderAll();
  showToast(
    shouldRegenerateWeek
      ? 'Semana regenerada con tus días de legumbres, pescado, arroz a la cubana y gustos.'
      : 'Preferencias semanales guardadas.'
  );
}

/**
 * Abre la Ficha Completa de Receta (Modal Dinámico) con ingredientes escalados a state.diners.
 */
function openRecipeDetailModal(recipeId) {
  const numericId = Number(recipeId);
  const recipe = RECIPES_DB.find(r => r.id === numericId);
  if (!recipe) return;

  const ingById = new Map(INGREDIENTS_DB.map(i => [i.id, i]));
  const modal = document.getElementById('recipe-detail-modal');
  const titleEl = document.getElementById('recipe-modal-title');
  const bodyEl = document.getElementById('recipe-modal-body');

  if (!modal || !bodyEl) return;

  const isFav = isFavoriteRecipe(recipe.id);

  if (titleEl) {
    titleEl.textContent = recipe.name;
  }

  const scaledIngredientsHTML = recipe.ingredients.map(ri => {
    const ing = ingById.get(ri.ingredient_id);
    if (!ing) return '';
    const scaled = formatGastronomicAmount(ri.amount_per_diner * state.diners, ing.unit, ing.rounding_step);
    return `
      <li class="ing-row">
        <div>
          <strong>${escapeHtml(ing.name)}</strong>
          ${ri.notes ? `<span class="slot-meta-line"> · ${escapeHtml(ri.notes)}</span>` : ''}
        </div>
        <span class="tabular-nums"><strong>${scaled} ${escapeHtml(ing.unit)}</strong></span>
      </li>
    `;
  }).join('');

  const stepsHTML = recipe.steps.map(step => {
    const mins = Math.round(step.timer_seconds / 60);
    return `
      <li class="step-item">
        <div class="step-top">
          <span class="step-index">Paso 0${step.step_number}</span>
          ${step.timer_seconds > 0 ? `<span class="slot-meta-line tabular-nums">Tiempo estimado: ${mins} min (${step.timer_seconds}s)</span>` : ''}
        </div>
        <p>${escapeHtml(step.instruction)}</p>
      </li>
    `;
  }).join('');

  bodyEl.innerHTML = `
    <div class="recipe-hero-split">
      <div class="recipe-hero-img-wrap">
        <img src="${resolveImagePath(recipe.image_url)}" alt="${escapeHtml(recipe.name)}" referrerpolicy="no-referrer" onerror="this.onerror=null;this.src='assets/img/verduras.jpg';" />
      </div>
      <div class="recipe-macros-panel">
        <div>
          <p class="slot-meta-line" style="margin-bottom: 0.65rem;">
            ${CATEGORY_LABELS[recipe.category]} · ${escapeHtml(recipe.cooking_method)} · Dificultad: <strong>${recipe.difficulty || 'Fácil'}</strong> · ★ ${recipe.rating || 4.8}
          </p>
          <div class="macros-grid">
            <div class="macro-item">
              <div class="macro-label">Energía por comensal</div>
              <div class="macro-val tabular-nums">${recipe.kcal} kcal</div>
            </div>
            <div class="macro-item">
              <div class="macro-label">Proteína magra</div>
              <div class="macro-val tabular-nums">${recipe.protein_g} g</div>
            </div>
            <div class="macro-item">
              <div class="macro-label">Hidratos complejos</div>
              <div class="macro-val tabular-nums">${recipe.carbs_g} g</div>
            </div>
            <div class="macro-item">
              <div class="macro-label">Tiempo activo</div>
              <div class="macro-val tabular-nums">${recipe.prep_minutes} min</div>
            </div>
          </div>
        </div>

        <div class="chef-tip-box">
          <div class="chef-tip-title">Truco Hipocalórico del Chef</div>
          <p class="chef-tip-text">${escapeHtml(recipe.chef_tip)}</p>
        </div>

        <div class="recipe-source-badge">
          <div>
            <span class="slot-meta-line" style="display: block; font-size: 0.72rem; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-muted); font-weight: 700;">Fuente y Aval Gastronómico:</span>
            <strong style="color: var(--text-primary); font-size: 0.88rem;">${escapeHtml(recipe.source_name || 'Fundación Dieta Mediterránea')}</strong>
          </div>
          ${recipe.source_url ? `
            <a href="${recipe.source_url}" target="_blank" rel="noopener noreferrer" class="btn-secondary" style="font-size: 0.78rem; padding: 0.35rem 0.65rem;" title="Consultar receta original en ${escapeHtml(recipe.source_name)}">
              Ver en fuente original ↗
            </a>
          ` : ''}
        </div>

        <div style="margin-top: 0.65rem; padding: 0.55rem 0.8rem; background: var(--bg-canvas); border: 1px dashed var(--border-hairline); border-radius: var(--radius-sm); font-size: 0.82rem;">
          <strong>💡 Sugerencia de Servicio:</strong> ${escapeHtml(recipe.serving_tip || 'Servir templado o recién preparado.')}
        </div>

        <div style="margin-top: 0.45rem; margin-bottom: 0.75rem; font-size: 0.78rem; color: var(--text-muted);">
          🛡️ <strong>Alérgenos e información clínica:</strong> ${escapeHtml(recipe.allergens || 'Sin gluten')}
        </div>

        <div style="display: flex; flex-wrap: wrap; gap: 0.65rem;">
          <button type="button" class="btn-primary" data-start-cooking="${recipe.id}">
            Abrir Modo Cocina (Temporizador)
          </button>
          <button type="button" class="btn-secondary" data-toggle-favorite="${recipe.id}">
            ${isFav ? '★ En tus Favoritas' : '☆ Guardar en Favoritas'}
          </button>
          <a
            href="${recipe.youtube_url}"
            target="_blank"
            rel="noopener noreferrer"
            class="btn-secondary"
          >
            Ver Videorreceta
          </a>
        </div>
      </div>
    </div>

    <div class="recipe-columns">
      <section>
        <h3 class="aisle-title" style="margin-bottom: 0.6rem;">
          Ingredientes exactos para <span class="tabular-nums">${state.diners}</span> ${state.diners === 1 ? 'comensal' : 'comensales'}
        </h3>
        <ul class="ing-list">
          ${scaledIngredientsHTML}
        </ul>
      </section>

      <section>
        <h3 class="aisle-title" style="margin-bottom: 0.6rem;">
          Elaboración paso a paso
        </h3>
        <ol class="steps-list">
          ${stepsHTML}
        </ol>
      </section>
    </div>
  `;

  modal.classList.add('is-open');
}

/**
 * MODO COCINA (Pantalla Completa + Temporizadores con aviso sonoro Web Audio API).
 */
function startCookingMode(recipeId) {
  const recipe = RECIPES_DB.find(r => r.id === Number(recipeId));
  if (!recipe || !recipe.steps.length) return;

  stopActiveTimer();
  state.cookingRecipe = recipe;
  state.cookingStepIndex = 0;
  state.timerRemainingSec = recipe.steps[0].timer_seconds || 60;

  closeAllModals();
  const modal = document.getElementById('cooking-mode-modal');
  if (modal) {
    modal.classList.add('is-open');
    renderCookingModeStep();
  }
}

function renderCookingModeStep() {
  const recipe = state.cookingRecipe;
  if (!recipe) return;

  const step = recipe.steps[state.cookingStepIndex];
  const titleEl = document.getElementById('cooking-modal-title');
  const bodyEl = document.getElementById('cooking-modal-body');

  if (titleEl) {
    titleEl.textContent = `Modo Cocina · ${recipe.name}`;
  }
  if (!bodyEl) return;

  const formattedTime = formatSecondsMMSS(state.timerRemainingSec);

  bodyEl.innerHTML = `
    <div class="cooking-mode-stage">
      <p class="slot-rule-tag">
        Paso ${state.cookingStepIndex + 1} de ${recipe.steps.length} · Para ${state.diners} ${state.diners === 1 ? 'comensal' : 'comensales'}
      </p>
      <p class="cooking-step-Instruction">${escapeHtml(step.instruction)}</p>

      <div class="timer-display tabular-nums" id="cooking-timer-readout">${formattedTime}</div>

      <div style="display: flex; flex-wrap: wrap; gap: 0.65rem; justify-content: center;">
        <button type="button" class="btn-primary" id="cooking-timer-toggle-btn">
          ${state.timerRunning ? 'Pausar temporizador' : 'Iniciar temporizador'}
        </button>
        <button type="button" class="btn-secondary" id="cooking-timer-reset-btn">
          Reiniciar paso (${Math.round(step.timer_seconds / 60)} min)
        </button>
      </div>

      <div class="chef-tip-box" style="max-width: 620px; text-align: left;">
        <div class="chef-tip-title">Consejo de Batch Cooking y Conservación</div>
        <p class="chef-tip-text">${escapeHtml(recipe.batch_prep_tip)}</p>
      </div>

      <div style="display: flex; justify-content: space-between; width: 100%; max-width: 620px; padding-top: 0.75rem; border-top: 1px solid var(--border-hairline);">
        <button
          type="button"
          class="btn-secondary"
          id="cooking-prev-step-btn"
          ${state.cookingStepIndex === 0 ? 'disabled' : ''}
        >
          Paso anterior
        </button>
        <button
          type="button"
          class="btn-primary"
          id="cooking-next-step-btn"
        >
          ${state.cookingStepIndex < recipe.steps.length - 1 ? 'Siguiente paso' : 'Finalizar receta'}
        </button>
      </div>
    </div>
  `;
}

function toggleCookingTimer() {
  if (state.timerRunning) {
    stopActiveTimer();
    renderCookingModeStep();
    return;
  }

  state.timerRunning = true;
  renderCookingModeStep();

  state.timerIntervalId = setInterval(() => {
    if (state.timerRemainingSec > 0) {
      state.timerRemainingSec -= 1;
      const readout = document.getElementById('cooking-timer-readout');
      if (readout) {
        readout.textContent = formatSecondsMMSS(state.timerRemainingSec);
      }
    } else {
      stopActiveTimer();
      playKitchenChime();
      showToast('¡Tiempo del paso completado!');
      renderCookingModeStep();
    }
  }, 1000);
}

function stopActiveTimer() {
  if (state.timerIntervalId) {
    clearInterval(state.timerIntervalId);
    state.timerIntervalId = null;
  }
  state.timerRunning = false;
}

function playKitchenChime() {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const now = ctx.currentTime;

    [523.25, 659.25, 783.99].forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.16);
      gain.gain.setValueAtTime(0.15, now + idx * 0.16);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.16 + 0.35);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + idx * 0.16);
      osc.stop(now + idx * 0.16 + 0.36);
    });
  } catch (_) {
    // Web Audio no disponible
  }
}

function formatSecondsMMSS(totalSec) {
  const mins = Math.floor(totalSec / 60);
  const secs = totalSec % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

/**
 * Renderiza el Catálogo Completo de 200 Recetas Españolas ("Recetario") con ordenación por Facilidad, Tiempo y Buenas (★).
 */
function renderCatalogView() {
  const gridEl = document.getElementById('catalog-recipes-grid');
  const countEl = document.getElementById('catalog-count-label');
  if (!gridEl) return;

  const q = state.catalogSearchQuery.trim().toLowerCase();
  const cat = state.catalogCategoryFilter;
  const favSet = new Set(state.favorites.map(Number));

  document.querySelectorAll('[data-catalog-sort]').forEach(btn => {
    btn.classList.toggle('is-active', btn.getAttribute('data-catalog-sort') === state.catalogSortBy);
  });

  const filtered = RECIPES_DB.filter(r => {
    const matchCat =
      cat === 'all'
        ? true
        : cat === 'favorites'
          ? favSet.has(r.id)
          : r.category === cat;
    const matchQuery =
      q === '' ||
      r.name.toLowerCase().includes(q) ||
      r.cooking_method.toLowerCase().includes(q) ||
      r.chef_tip.toLowerCase().includes(q);
    return matchCat && matchQuery;
  });

  const sorted = sortRecipesList(filtered, state.catalogSortBy, state.season, favSet);

  if (countEl) {
    countEl.textContent = `${sorted.length} de 200 recetas verificadas`;
  }

  if (sorted.length === 0) {
    gridEl.innerHTML = `
      <div class="aisle-block" style="grid-column: 1 / -1; padding: 2rem; text-align: center;">
        <h3 class="aisle-title">No se encontraron recetas con ese filtro</h3>
        <p class="slot-meta-line" style="margin: 0.5rem 0 1rem;">Prueba otra palabra clave o muestra todas las 200 recetas mediterráneas.</p>
        <button type="button" class="btn-secondary" id="reset-catalog-filters-btn">Mostrar las 200 recetas</button>
      </div>
    `;
    return;
  }

  gridEl.innerHTML = sorted.map(r => {
    const isFav = favSet.has(r.id);
    return `
      <article class="recipe-card">
        <div class="recipe-card-media" style="position: relative;">
          <button
            type="button"
            class="fav-star-btn ${isFav ? 'is-fav' : ''}"
            style="position: absolute; top: 8px; right: 8px; z-index: 3;"
            data-toggle-favorite="${r.id}"
            aria-label="${isFav ? 'Quitar de favoritos' : 'Añadir a favoritos'} ${escapeHtml(r.name)}"
          >
            ${isFav ? '★' : '☆'}
          </button>
          <img src="${resolveImagePath(r.image_url)}" alt="${escapeHtml(r.name)}" loading="lazy" referrerpolicy="no-referrer" onerror="this.onerror=null;this.src='assets/img/verduras.jpg';" />
        </div>
        <div class="recipe-card-body">
          <p class="recipe-card-kicker tabular-nums">
            ★ ${r.rating || 4.8} · ${r.difficulty || 'Fácil'} · ${r.prep_minutes} min · ${r.kcal} kcal
          </p>
          <h3 class="recipe-card-title">${escapeHtml(r.name)}</h3>
          <p class="slot-meta-line">${CATEGORY_LABELS[r.category]} · ${r.protein_g}g prot</p>
          <p class="recipe-card-tip">${escapeHtml(r.chef_tip)}</p>
        </div>
        <div class="recipe-card-footer">
          <span class="slot-meta-line">${escapeHtml(r.cooking_method)}</span>
          <button type="button" class="btn-secondary" data-open-recipe="${r.id}">
            Ficha e Ingredientes
          </button>
        </div>
      </article>
    `;
  }).join('');
}

/**
 * Renderiza la vista interactiva "¿Qué tengo en la nevera?" (Buscador de Aprovechamiento).
 * Permite seleccionar ingredientes rápidos o buscar en el catálogo, calcula las coincidencias
 * exactas y permite asignar la receta resultante a cualquier hueco del menú semanal.
 */
function renderFridgeView() {
  const container = document.getElementById('view-fridge');
  if (!container) return;

  const proteinChipsEl = document.getElementById('fridge-protein-chips');
  const veggieChipsEl = document.getElementById('fridge-veggie-chips');
  const grainChipsEl = document.getElementById('fridge-grain-chips');
  const datalistEl = document.getElementById('fridge-ingredients-datalist');
  const selectedTagsEl = document.getElementById('fridge-selected-tags');
  const resultsGridEl = document.getElementById('fridge-results-grid');
  const resultsTitleEl = document.getElementById('fridge-results-title');
  const resultsCountEl = document.getElementById('fridge-results-count');
  const ignorePantryCb = document.getElementById('fridge-ignore-pantry-checkbox');
  const slotFilterEl = document.getElementById('fridge-slot-filter');
  const seasonFilterEl = document.getElementById('fridge-season-filter');

  if (ignorePantryCb) ignorePantryCb.checked = state.fridgeIgnorePantry;
  if (slotFilterEl) slotFilterEl.value = state.fridgeMealSlotFilter;
  if (seasonFilterEl) seasonFilterEl.value = state.fridgeSeasonFilter;

  // Llenar datalist si está vacío
  if (datalistEl && datalistEl.children.length === 0) {
    datalistEl.innerHTML = INGREDIENTS_DB.map(ing => `<option value="${escapeHtml(ing.name)}"></option>`).join('');
  }

  // Grupos rápidos de ingredientes habituales
  const PROTEIN_IDS = [39, 8, 30, 33, 40, 38, 44, 45]; // Pollo, Huevo, Merluza, Salmón, Pavo, Atún, Jamón, Requesón
  const VEGGIE_IDS = [6, 13, 10, 11, 15, 16, 12, 20, 17, 23, 14, 25, 21, 19, 24, 22]; // Tomate, Calabacín, Cebolla, Ajo, Pimientos, Zanahoria, Patata, etc.
  const GRAIN_IDS = [1, 2, 3, 4, 5, 48]; // Arroz, Lentejas, Garbanzos, Alubias, Tomate triturado, Piquillos

  const ingMap = new Map(INGREDIENTS_DB.map(i => [i.id, i]));

  const renderChipGroup = (ids, targetEl) => {
    if (!targetEl) return;
    targetEl.innerHTML = ids.map(id => {
      const ing = ingMap.get(id);
      if (!ing) return '';
      const isSelected = state.fridgeIngredients.has(id);
      return `
        <button
          type="button"
          class="fridge-chip ${isSelected ? 'is-active' : ''}"
          data-toggle-fridge-id="${id}"
          aria-pressed="${isSelected}"
        >
          <span>${isSelected ? '✓ ' : '+ '}</span>
          <span>${escapeHtml(ing.name.split(' (')[0].split(' - ')[0])}</span>
        </button>
      `;
    }).join('');
  };

  renderChipGroup(PROTEIN_IDS, proteinChipsEl);
  renderChipGroup(VEGGIE_IDS, veggieChipsEl);
  renderChipGroup(GRAIN_IDS, grainChipsEl);

  // Renderizar etiquetas seleccionadas
  if (selectedTagsEl) {
    const selectedArr = Array.from(state.fridgeIngredients);
    if (selectedArr.length === 0) {
      selectedTagsEl.innerHTML = '<span class="slot-meta-line" style="font-style: italic;">Ninguno seleccionado. Pulsa sobre los botones de arriba o escribe para añadir lo que tienes en el frigorífico.</span>';
    } else {
      selectedTagsEl.innerHTML = selectedArr.map(id => {
        const ing = ingMap.get(id);
        const name = ing ? ing.name.split(' (')[0] : `Ingrediente #${id}`;
        return `
          <span class="fridge-selected-tag">
            ${escapeHtml(name)}
            <button type="button" data-remove-fridge-id="${id}" aria-label="Eliminar ${escapeHtml(name)}">✕</button>
          </span>
        `;
      }).join('');
    }
  }

  // Ejecutar búsqueda con engine.js
  const results = searchRecipesByFridgeIngredients({
    ingredientIds: Array.from(state.fridgeIngredients),
    ignorePantryBasics: state.fridgeIgnorePantry,
    mealSlot: state.fridgeMealSlotFilter,
    season: state.fridgeSeasonFilter,
    recipes: RECIPES_DB,
    ingredients: INGREDIENTS_DB
  });

  const fullMatchesCount = results.filter(r => r.canCookNow).length;

  if (resultsCountEl) {
    resultsCountEl.textContent = `${results.length} recetas (${fullMatchesCount} listas para cocinar ya)`;
  }
  if (resultsTitleEl) {
    resultsTitleEl.textContent = fullMatchesCount > 0
      ? `¡Tienes ${fullMatchesCount} receta(s) 100% listas para cocinar sin comprar nada!`
      : 'Recetas mediterráneas recomendadas según tus ingredientes';
  }

  if (!resultsGridEl) return;

  if (results.length === 0) {
    resultsGridEl.innerHTML = `
      <div class="empty-state-card" style="grid-column: 1 / -1; padding: 2.5rem 1.5rem; text-align: center; background: var(--bg-surface); border: 1px dashed var(--border-hairline); border-radius: var(--radius-md);">
        <p style="font-size: 1.1rem; font-weight: 600; color: var(--text-primary); margin-bottom: 0.5rem;">
          No hay recetas que coincidan con la combinación seleccionada
        </p>
        <p class="slot-meta-line" style="max-width: 520px; margin: 0 auto 1.25rem;">
          Prueba a seleccionar ingredientes adicionales comunes (como huevos, tomate, calabacín o pechuga de pollo) o asegúrate de que la casilla de básicos de despensa esté marcada.
        </p>
      </div>
    `;
    return;
  }

  resultsGridEl.innerHTML = results.map(item => {
    const r = item.recipe;
    const isFav = isFavoriteRecipe(r.id);

    // Badges de ingredientes disponibles vs faltantes
    const matchedPills = item.matchedIngredients.map(mi => `<span class="fridge-match-pill" title="Disponible en nevera">✓ ${escapeHtml(mi.name.split(' (')[0])}</span>`).join('');
    const missingPills = item.missingIngredients.map(mi => `<span class="fridge-missing-pill" title="Te falta este ingrediente">✕ Falta: ${escapeHtml(mi.name.split(' (')[0])}</span>`).join('');

    return `
      <article class="recipe-card" data-recipe-id="${r.id}" style="display: flex; flex-direction: column;">
        <div class="recipe-card-media" style="position: relative;">
          <button
            type="button"
            class="fav-star-btn ${isFav ? 'is-fav' : ''}"
            style="position: absolute; top: 8px; right: 8px; z-index: 3;"
            data-toggle-favorite="${r.id}"
            aria-label="${isFav ? 'Quitar de favoritos' : 'Añadir a favoritos'} ${escapeHtml(r.name)}"
          >
            ${isFav ? '★' : '☆'}
          </button>
          <img src="${resolveImagePath(r.image_url)}" alt="${escapeHtml(r.name)}" loading="lazy" referrerpolicy="no-referrer" onerror="this.onerror=null;this.src='assets/img/verduras.jpg';" />
          <div style="position: absolute; bottom: 8px; left: 8px; z-index: 3;">
            ${item.canCookNow
              ? `<span class="fridge-badge is-full">🟢 100% ¡Cocínala ya!</span>`
              : `<span class="fridge-badge is-partial">🟡 ${item.matchPercentage}% de ingredientes</span>`
            }
          </div>
        </div>

        <div class="recipe-card-body" style="flex: 1;">
          <p class="recipe-card-kicker tabular-nums">
            ★ ${r.rating || 4.8} · ${r.difficulty || 'Fácil'} · ${r.prep_minutes} min · ${r.kcal} kcal
          </p>
          <h3 class="recipe-card-title">${escapeHtml(r.name)}</h3>
          <p class="slot-meta-line" style="font-size: 0.76rem; color: var(--text-muted); margin-bottom: 0.45rem;">
            🏛️ Fuente: ${escapeHtml(r.source_name || 'Fundación Dieta Mediterránea')}
          </p>

          <div style="margin-top: 0.5rem; margin-bottom: 0.5rem;">
            ${matchedPills}
            ${missingPills}
          </div>

          <p class="recipe-card-tip">${escapeHtml(r.chef_tip)}</p>
        </div>

        <div class="recipe-card-footer" style="display: flex; flex-direction: column; gap: 0.45rem;">
          <button
            type="button"
            class="btn-primary"
            style="width: 100%;"
            data-open-recipe="${r.id}"
          >
            Ver Ficha y Elaboración
          </button>
          <button
            type="button"
            class="btn-secondary"
            style="width: 100%; font-size: 0.78rem;"
            data-slot-fridge-recipe="${r.id}"
          >
            📅 Añadir a mi Menú Semanal
          </button>
        </div>
      </article>
    `;
  }).join('');
}

/**
 * Abre el modal para colocar una receta recomendada de la nevera en el plan semanal.
 */
function openFridgeSlotModal(recipeId) {
  const modal = document.getElementById('fridge-slot-modal');
  const bodyEl = document.getElementById('fridge-slot-modal-body');
  const subTitleEl = document.getElementById('fridge-slot-modal-subtitle');
  if (!modal || !bodyEl) return;

  const recipe = RECIPES_DB.find(r => r.id === Number(recipeId));
  if (!recipe) return;

  state.slottingFridgeRecipeId = recipe.id;

  if (subTitleEl) {
    subTitleEl.textContent = `Selecciona en qué día y momento deseas colocar "${recipe.name}".`;
  }

  const byId = new Map(RECIPES_DB.map(r => [r.id, r]));

  const slotsHTML = DAYS_ORDER.map(day => {
    const currentLunchId = state.planMap[day]?.comida;
    const currentDinnerId = state.planMap[day]?.cena;
    const lunchRecipe = byId.get(Number(currentLunchId));
    const dinnerRecipe = byId.get(Number(currentDinnerId));

    const isLunchAllowed = recipe.meal_slot === 'both' || recipe.meal_slot === 'lunch';
    const isDinnerAllowed = recipe.meal_slot === 'both' || recipe.meal_slot === 'dinner';

    return `
      <div style="background: var(--bg-surface); border: 1px solid var(--border-hairline); border-radius: var(--radius-sm); padding: 0.75rem 0.9rem;">
        <div style="font-weight: 700; color: var(--accent-primary); margin-bottom: 0.5rem; font-size: 0.9rem;">${DAY_LABELS[day]}</div>
        <div style="display: flex; flex-direction: column; gap: 0.5rem;">
          <div style="display: flex; align-items: center; justify-content: space-between; gap: 0.5rem;">
            <div style="font-size: 0.82rem; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; flex: 1;">
              <span class="slot-meta-line">Comida:</span> <strong>${escapeHtml(lunchRecipe?.name || 'Vacío')}</strong>
            </div>
            ${isLunchAllowed ? `
              <button
                type="button"
                class="btn-secondary"
                style="padding: 0.25rem 0.55rem; font-size: 0.78rem;"
                data-confirm-fridge-slot="true"
                data-day="${day}"
                data-meal="comida"
              >
                Asignar comida
              </button>
            ` : `<span class="slot-meta-line" style="font-size: 0.72rem;">No apto comida</span>`}
          </div>

          <div style="display: flex; align-items: center; justify-content: space-between; gap: 0.5rem;">
            <div style="font-size: 0.82rem; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; flex: 1;">
              <span class="slot-meta-line">Cena:</span> <strong>${escapeHtml(dinnerRecipe?.name || 'Vacío')}</strong>
            </div>
            ${isDinnerAllowed ? `
              <button
                type="button"
                class="btn-secondary"
                style="padding: 0.25rem 0.55rem; font-size: 0.78rem;"
                data-confirm-fridge-slot="true"
                data-day="${day}"
                data-meal="cena"
              >
                Asignar cena
              </button>
            ` : `<span class="slot-meta-line" style="font-size: 0.72rem;">No apto cena</span>`}
          </div>
        </div>
      </div>
    `;
  }).join('');

  bodyEl.innerHTML = `
    <div style="display: flex; flex-direction: column; gap: 0.65rem; max-height: 65vh; overflow-y: auto;">
      <p class="slot-meta-line">
        Plato seleccionado: <strong>${escapeHtml(recipe.name)}</strong> (${recipe.kcal} kcal · ${recipe.prep_minutes} min).
      </p>
      <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 0.65rem;">
        ${slotsHTML}
      </div>
    </div>
  `;

  modal.classList.add('is-open');
}

/**
 * Confirma y aplica la receta de la nevera al plan semanal.
 */
async function handleConfirmFridgeSlot(day, mealType, recipeId) {
  const modal = document.getElementById('fridge-slot-modal');
  if (modal) modal.classList.remove('is-open');

  const recipe = RECIPES_DB.find(r => r.id === Number(recipeId));
  if (!recipe) return;

  if (!state.planMap[day]) {
    state.planMap[day] = {};
  }
  state.planMap[day][mealType] = Number(recipe.id);
  savePlanToStorage();

  await apiFetch('api/swap_recipe.php', {
    method: 'POST',
    body: JSON.stringify({
      day,
      meal_type: mealType,
      new_recipe_id: recipe.id
    })
  });

  renderAll();
  showToast(`¡"${recipe.name}" asignado con éxito a ${DAY_LABELS[day]} (${mealType})!`);
}

/**
 * Renderiza la Lista de la Compra Exacta, Compacta y Agrupada por Pasillos + Extras y Filtro de Despensa.
 */
function renderShoppingListView() {
  const containerEl = document.getElementById('shopping-aisles-grid');
  const summaryEl = document.getElementById('shopping-summary-meta');
  const pantryBtn = document.getElementById('toggle-pantry-basics-btn');
  if (!containerEl) return;

  if (pantryBtn) {
    pantryBtn.setAttribute('aria-pressed', state.hidePantryBasics ? 'true' : 'false');
    pantryBtn.textContent = state.hidePantryBasics
      ? 'Mostrar básicos de despensa (Sal, AOVE, Ajo)'
      : 'Ocultar básicos de despensa (Sal, AOVE, Ajo)';
  }

  const aggregated = aggregateShoppingList(state.planMap, state.diners, RECIPES_DB, INGREDIENTS_DB, state.preferences);
  let visibleTotal = 0;
  let checkedCount = 0;

  const aislesHTML = AISLES_ORDER.map(aisle => {
    const rawItems = aggregated.aisles[aisle] || [];
    const items = state.hidePantryBasics
      ? rawItems.filter(it => !PANTRY_BASIC_INGREDIENT_IDS.has(it.ingredient_id))
      : rawItems;

    if (items.length === 0) return '';

    items.forEach(item => {
      visibleTotal++;
      if (state.checkedIngredients[item.ingredient_id]) {
        checkedCount++;
      }
    });

    return `
      <section class="aisle-block">
        <header class="aisle-header">
          <h3 class="aisle-title">${aisle}</h3>
          <span class="aisle-count tabular-nums">${items.length} ítems</span>
        </header>
        <ul class="shopping-list-items">
          ${items.map(item => {
            const isChecked = Boolean(state.checkedIngredients[item.ingredient_id]);
            return `
              <li
                class="shopping-item ${isChecked ? 'is-checked' : ''}"
                data-toggle-ingredient="${item.ingredient_id}"
              >
                <div class="shopping-item-left">
                  <input
                    type="checkbox"
                    class="shopping-checkbox"
                    aria-label="Marcar ${escapeHtml(item.name)}"
                    ${isChecked ? 'checked' : ''}
                  />
                  <div>
                    <div class="shopping-item-name">${escapeHtml(item.name)}</div>
                    <div class="shopping-item-sub">Usado en ${item.used_in_meals} ${item.used_in_meals === 1 ? 'comida' : 'comidas'}</div>
                  </div>
                </div>
                <span class="shopping-item-qty tabular-nums">${item.total_amount} ${escapeHtml(item.unit)}</span>
              </li>
            `;
          }).join('')}
        </ul>
      </section>
    `;
  }).join('');

  let customBlockHTML = '';
  if (state.customShoppingItems.length > 0) {
    state.customShoppingItems.forEach(ci => {
      visibleTotal++;
      if (ci.checked) checkedCount++;
    });

    customBlockHTML = `
      <section class="aisle-block" style="border-color: var(--accent-olive);">
        <header class="aisle-header">
          <h3 class="aisle-title">Artículos Propios / Desayuno y Hogar</h3>
          <span class="aisle-count tabular-nums">${state.customShoppingItems.length} extras</span>
        </header>
        <ul class="shopping-list-items">
          ${state.customShoppingItems.map(ci => `
            <li
              class="shopping-item ${ci.checked ? 'is-checked' : ''}"
              data-toggle-custom-shopping="${ci.id}"
            >
              <div class="shopping-item-left">
                <input
                  type="checkbox"
                  class="shopping-checkbox"
                  aria-label="Marcar ${escapeHtml(ci.name)}"
                  ${ci.checked ? 'checked' : ''}
                />
                <div>
                  <div class="shopping-item-name">${escapeHtml(ci.name)}</div>
                  <div class="shopping-item-sub">Añadido manualmente</div>
                </div>
              </div>
              <button
                type="button"
                class="btn-ghost"
                style="padding: 0.2rem 0.5rem; font-size: 0.75rem;"
                data-delete-custom-shopping="${ci.id}"
                aria-label="Eliminar ${escapeHtml(ci.name)}"
              >
                Quitar
              </button>
            </li>
          `).join('')}
        </ul>
      </section>
    `;
  }

  if (summaryEl) {
    const pantryNote = state.hidePantryBasics ? ' (básicos de despensa ocultos)' : '';
    summaryEl.textContent = `${visibleTotal} artículos para ${state.diners} ${state.diners === 1 ? 'comensal' : 'comensales'}${pantryNote} · ${checkedCount} completados`;
  }

  containerEl.innerHTML = customBlockHTML + aislesHTML;
}

function handleAddCustomShoppingItem(event) {
  event.preventDefault();
  const inputEl = document.getElementById('custom-shopping-input');
  if (!inputEl) return;
  const text = inputEl.value.trim();
  if (!text) {
    showToast('Escribe el nombre del artículo que quieres añadir a tu lista.');
    return;
  }
  state.customShoppingItems.unshift({
    id: String(Date.now()),
    name: text,
    checked: false
  });
  saveCustomShopping();
  inputEl.value = '';
  renderShoppingListView();
  showToast(`Añadido "${text}" a tu lista de la compra.`);
}

async function copyShoppingListForWhatsApp() {
  const aggregated = aggregateShoppingList(state.planMap, state.diners, RECIPES_DB, INGREDIENTS_DB, state.preferences);
  const lines = [
    `*LISTA DE LA COMPRA — MEDDIET PRO*`,
    `Estación: ${capitalize(state.season)} · Comensales: ${state.diners}`,
    `--------------------------------`
  ];

  if (state.customShoppingItems.length > 0) {
    lines.push(`\n*ARTÍCULOS PROPIOS / EXTRAS*`);
    for (const ci of state.customShoppingItems) {
      const checkMark = ci.checked ? '[x]' : '[ ]';
      lines.push(`${checkMark} ${ci.name}`);
    }
  }

  for (const aisle of AISLES_ORDER) {
    const rawItems = aggregated.aisles[aisle] || [];
    const items = state.hidePantryBasics
      ? rawItems.filter(it => !PANTRY_BASIC_INGREDIENT_IDS.has(it.ingredient_id))
      : rawItems;
    if (!items.length) continue;
    lines.push(`\n*${aisle.toUpperCase()}*`);
    for (const item of items) {
      const checkMark = state.checkedIngredients[item.ingredient_id] ? '[x]' : '[ ]';
      lines.push(`${checkMark} ${item.name}: *${item.total_amount} ${item.unit}*`);
    }
  }

  const text = lines.join('\n');
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text);
    }
    showToast('Lista de la compra copiada en formato WhatsApp.');
  } catch (_) {
    showToast('Lista generada lista para compartir.');
  }
}

/**
 * Renderiza el Asistente Dominical de Batch Cooking.
 */
function renderBatchCookingView() {
  const containerEl = document.getElementById('batch-cooking-timeline');
  if (!containerEl) return;

  const steps = generateBatchCookingPlan(state.planMap, state.diners);

  containerEl.innerHTML = steps.map(s => `
    <article class="batch-step-card">
      <div class="batch-step-header">
        <span class="batch-step-number">${escapeHtml(s.phase)}</span>
        <span class="batch-step-duration tabular-nums">${escapeHtml(s.duration)}</span>
      </div>
      <h3 class="batch-step-title">${escapeHtml(s.title)}</h3>
      <p class="batch-step-desc">${escapeHtml(s.description)}</p>
      <p class="slot-meta-line" style="padding-top: 0.45rem; border-top: 1px solid var(--border-hairline);">
        <strong>Platos adelantados:</strong> ${escapeHtml(s.related_dishes)}
      </p>
    </article>
  `).join('');
}

/**
 * ============================================================================
 * GENERADORES DE PDF PARA IMPRIMIR:
 * 1) PDF Calendario Semanal en Folio Apaisado para poner en la Nevera (A4 Landscape)
 * 2) PDF Cuaderno de Comidas y Recetas Detalladas Paso a Paso (A4 Portrait)
 * ============================================================================
 */
function buildFridgeLandscapeHTML() {
  const evaluation = evaluateWeeklyPlan(state.planMap, state.preferences);
  const { days, compliance } = evaluation;

  return `
    <div style="font-family: 'Plus Jakarta Sans', sans-serif; color: #1C231D;">
      <div style="display: flex; justify-content: space-between; align-items: flex-end; border-bottom: 2px solid #3A5F32; padding-bottom: 0.5rem; margin-bottom: 0.75rem;">
        <div>
          <h2 style="font-family: 'Fraunces', Georgia, serif; font-size: 1.35rem; margin: 0; color: #1C231D;">
            MedDiet Pro — Calendario Semanal de Comidas (Nevera · Folio Apaisado)
          </h2>
          <p style="font-size: 0.78rem; color: #4E584F; margin: 0.15rem 0 0;">
            Estación: <strong>${capitalize(state.season)}</strong> · Raciones calculadas para: <strong>${state.diners} ${state.diners === 1 ? 'comensal' : 'comensales'}</strong> · Exclusiones: <strong>0% Marisco, 0% Bacalao, 0% Rape</strong>
          </p>
        </div>
        <div style="text-align: right; font-size: 0.76rem; color: #3A5F32; font-weight: 700;">
          Media diaria: ${compliance.avg_daily_kcal} kcal/día<br/>
          ${compliance.legume_lunches} Legumbres · ${compliance.fish_dinners} Pescados · 0 Repeticiones
        </div>
      </div>

      <table class="fridge-calendar-table">
        <thead>
          <tr>
            ${DAYS_ORDER.map(d => `
              <th>
                <div style="display: flex; justify-content: space-between; align-items: baseline;">
                  <span>${DAY_LABELS[d]}</span>
                  <span style="font-size: 0.68rem; font-weight: 600; color: #4E584F;">${days[d].daily_kcal} kcal</span>
                </div>
              </th>
            `).join('')}
          </tr>
        </thead>
        <tbody>
          <tr>
            ${DAYS_ORDER.map(d => {
              const r = days[d].comida;
              return `
                <td>
                  <span class="fridge-slot-type">Comida (Mediodía) · ${CATEGORY_LABELS[r.category]}</span>
                  <div class="fridge-slot-name">${escapeHtml(r.name)}</div>
                  <div class="fridge-slot-meta">${r.kcal} kcal · ${r.protein_g}g P · ${r.prep_minutes} min · ${escapeHtml(r.difficulty || 'Fácil')}</div>
                </td>
              `;
            }).join('')}
          </tr>
          <tr>
            ${DAYS_ORDER.map(d => {
              const r = days[d].cena;
              return `
                <td>
                  <span class="fridge-slot-type">Cena (Noche) · ${CATEGORY_LABELS[r.category]}</span>
                  <div class="fridge-slot-name">${escapeHtml(r.name)}</div>
                  <div class="fridge-slot-meta">${r.kcal} kcal · ${r.protein_g}g P · ${r.prep_minutes} min · ${escapeHtml(r.difficulty || 'Fácil')}</div>
                </td>
              `;
            }).join('')}
          </tr>
        </tbody>
      </table>

      <p style="font-size: 0.72rem; color: #4E584F; margin-top: 0.55rem;">
        * Pauta hipocalórica mediterránea: incluye desayuno y tentempié saludable (+690 kcal/día). Cocciones con AOVE medido (máx. 10 ml por toma).
      </p>
    </div>
  `;
}

function buildRecipesBookletHTML() {
  const evaluation = evaluateWeeklyPlan(state.planMap, state.preferences);
  const { days } = evaluation;
  const ingById = new Map(INGREDIENTS_DB.map(i => [i.id, i]));

  const slotsHTML = [];
  for (const day of DAYS_ORDER) {
    for (const mealType of ['comida', 'cena']) {
      const recipe = days[day][mealType];
      const mealName = mealType === 'comida' ? 'Comida (Mediodía)' : 'Cena (Noche)';

      const ingsList = recipe.ingredients.map(ri => {
        const ing = ingById.get(ri.ingredient_id);
        if (!ing) return '';
        const scaled = formatGastronomicAmount(ri.amount_per_diner * state.diners, ing.unit, ing.rounding_step);
        return `<li><strong>${escapeHtml(ing.name)}:</strong> ${scaled} ${escapeHtml(ing.unit)} ${ri.notes ? `<em>(${escapeHtml(ri.notes)})</em>` : ''}</li>`;
      }).join('');

      const stepsList = recipe.steps.map(st => {
        const mins = Math.round((st.timer_seconds || 60) / 60);
        return `<li><strong>Paso ${st.step_number} (${mins} min):</strong> ${escapeHtml(st.instruction)}</li>`;
      }).join('');

      slotsHTML.push(`
        <article class="booklet-recipe-sheet">
          <div class="booklet-recipe-header">
            <div>
              <span style="font-size: 0.72rem; font-weight: 700; text-transform: uppercase; color: #3A5F32;">
                ${DAY_LABELS[day]} · ${mealName} · ${CATEGORY_LABELS[recipe.category]}
              </span>
              <h3 style="font-family: 'Fraunces', Georgia, serif; font-size: 1.05rem; margin: 0.1rem 0 0; color: #1C231D;">
                ${escapeHtml(recipe.name)}
              </h3>
            </div>
            <div style="font-family: 'JetBrains Mono', monospace; font-size: 0.74rem; color: #4E584F;">
              ${recipe.kcal} kcal · ${recipe.protein_g}g Prot · ${recipe.carbs_g}g HC · ${recipe.fat_g}g Grasa · ${recipe.prep_minutes} min · ★${recipe.rating || 4.8}
            </div>
          </div>

          <div class="booklet-cols">
            <div>
              <strong style="font-size: 0.78rem; display: block; margin-bottom: 0.3rem;">
                Ingredientes exactos (${state.diners} ${state.diners === 1 ? 'comensal' : 'comensales'}):
              </strong>
              <ul style="padding-left: 1.1rem; margin: 0; line-height: 1.45;">
                ${ingsList}
              </ul>
            </div>
            <div>
              <strong style="font-size: 0.78rem; display: block; margin-bottom: 0.3rem;">
                Elaboración paso a paso (${escapeHtml(recipe.cooking_method)}):
              </strong>
              <ol style="padding-left: 1.1rem; margin: 0 0 0.45rem; line-height: 1.45;">
                ${stepsList}
              </ol>
              <p style="font-size: 0.74rem; background: #F2EEE6; padding: 0.35rem 0.55rem; border-radius: 4px; margin: 0;">
                <strong>Truco Hipocalórico:</strong> ${escapeHtml(recipe.chef_tip)}
              </p>
            </div>
          </div>
        </article>
      `);
    }
  }

  return `
    <div style="font-family: 'Plus Jakarta Sans', sans-serif; color: #1C231D;">
      <div style="margin-bottom: 1.25rem;">
        ${buildFridgeLandscapeHTML()}
      </div>
      <h2 style="font-family: 'Fraunces', Georgia, serif; font-size: 1.25rem; border-bottom: 2px solid #3A5F32; padding-bottom: 0.4rem; margin: 1.25rem 0 0.85rem; color: #1C231D;">
        Recetario Detallado Paso a Paso de la Semana (14 Comidas y Cenas)
      </h2>
      ${slotsHTML.join('')}
    </div>
  `;
}

function renderHiddenPrintContainers() {
  const fridgeEl = document.getElementById('printable-fridge-sheet');
  const bookletEl = document.getElementById('printable-recipes-booklet');
  if (fridgeEl) fridgeEl.innerHTML = buildFridgeLandscapeHTML();
  if (bookletEl) bookletEl.innerHTML = buildRecipesBookletHTML();
}

function setPagePrintOrientationCSS(isLandscape) {
  let styleEl = document.getElementById('dynamic-page-orientation');
  if (!styleEl) {
    styleEl = document.createElement('style');
    styleEl.id = 'dynamic-page-orientation';
    document.head.appendChild(styleEl);
  }
  styleEl.textContent = isLandscape
    ? '@media print { @page { size: A4 landscape; margin: 8mm; } }'
    : '@media print { @page { size: A4 portrait; margin: 10mm; } }';
}

function openPdfPreviewModal(mode) {
  state.activePdfMode = mode;
  renderHiddenPrintContainers();

  const modal = document.getElementById('pdf-preview-modal');
  const titleEl = document.getElementById('pdf-modal-title');
  const subEl = document.getElementById('pdf-modal-subtitle');
  const bodyEl = document.getElementById('pdf-preview-modal-body');
  if (!modal || !bodyEl) return;

  const isLandscape = mode === 'fridge-landscape';
  setPagePrintOrientationCSS(isLandscape);
  document.body.setAttribute('data-print-mode', mode);

  if (titleEl) {
    titleEl.textContent = isLandscape
      ? 'PDF 1: Calendario Semanal en Folio Apaisado para la Nevera (A4 Horizontal)'
      : 'PDF 2: Calendario + 14 Recetas Detalladas Paso a Paso para Imprimir (A4 Vertical)';
  }
  if (subEl) {
    subEl.textContent = isLandscape
      ? 'Formato apaisado optimizado en 1 folio horizontal con las 14 comidas, calorías y tiempos para pegar en la puerta de la nevera.'
      : `Incluye el cuadro resumen semanal + las 14 fichas de recetas completas paso a paso con ingredientes calculados para ${state.diners} ${state.diners === 1 ? 'comensal' : 'comensales'}.`;
  }

  bodyEl.innerHTML = `
    <div class="pdf-preview-frame">
      ${isLandscape ? buildFridgeLandscapeHTML() : buildRecipesBookletHTML()}
    </div>
  `;

  modal.classList.add('is-open');
}

function triggerBrowserPdfPrint() {
  const isLandscape = state.activePdfMode === 'fridge-landscape';
  setPagePrintOrientationCSS(isLandscape);
  document.body.setAttribute('data-print-mode', state.activePdfMode);
  renderHiddenPrintContainers();
  window.print();
}

function downloadStandalonePrintableDocument() {
  const isLandscape = state.activePdfMode === 'fridge-landscape';
  const contentHTML = isLandscape ? buildFridgeLandscapeHTML() : buildRecipesBookletHTML();
  const fileName = isLandscape
    ? `meddiet-calendario-nevera-apaisado-${state.season}.html`
    : `meddiet-recetario-semanal-paso-a-paso-${state.season}.html`;

  const standaloneHTML = `<!doctype html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <title>${isLandscape ? 'Calendario Semanal Nevera (Apaisado) — MedDiet Pro' : 'Menú y Recetas Paso a Paso — MedDiet Pro'}</title>
  <style>
    @page { size: A4 ${isLandscape ? 'landscape' : 'portrait'}; margin: ${isLandscape ? '8mm' : '10mm'}; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #1C231D; background: #FFFFFF; margin: 0; padding: 12px; }
    .no-print-bar { background: #EBF1E8; border: 1px solid #3A5F32; padding: 10px 14px; border-radius: 6px; margin-bottom: 14px; display: flex; justify-content: space-between; align-items: center; }
    .print-btn { background: #3A5F32; color: #fff; border: none; padding: 8px 16px; border-radius: 4px; font-weight: 700; cursor: pointer; }
    .fridge-calendar-table { width: 100%; border-collapse: collapse; table-layout: fixed; font-size: 11px; }
    .fridge-calendar-table th, .fridge-calendar-table td { border: 1px solid #999; padding: 6px; vertical-align: top; text-align: left; }
    .fridge-calendar-table th { background-color: #EBF1E8; font-size: 12px; }
    .fridge-slot-type { font-size: 9.5px; font-weight: 700; text-transform: uppercase; color: #3A5F32; display: block; margin-bottom: 2px; }
    .fridge-slot-name { font-weight: 700; font-size: 11.5px; margin-bottom: 3px; }
    .fridge-slot-meta { font-family: monospace; font-size: 9.5px; color: #4E584F; }
    .booklet-recipe-sheet { border: 1px solid #999; border-radius: 6px; padding: 10px 12px; margin-bottom: 10px; page-break-inside: avoid; break-inside: avoid; }
    .booklet-recipe-header { border-bottom: 1px solid #ddd; padding-bottom: 4px; margin-bottom: 6px; display: flex; justify-content: space-between; align-items: baseline; }
    .booklet-cols { display: grid; grid-template-columns: 1fr 1.45fr; gap: 12px; font-size: 11.5px; }
    @media print { .no-print-bar { display: none !important; } body { padding: 0; } }
  </style>
</head>
<body>
  <div class="no-print-bar">
    <span><strong>Documento listo para imprimir o guardar como PDF (${isLandscape ? 'Folio A4 Apaisado / Horizontal' : 'Folio A4 Vertical Paso a Paso'})</strong></span>
    <button class="print-btn" onclick="window.print()">Imprimir / Guardar como PDF</button>
  </div>
  ${contentHTML}
</body>
</html>`;

  const blob = new Blob([standaloneHTML], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
  showToast(`Descargado "${fileName}" listo para imprimir o guardar en PDF.`);
}

/**
 * ============================================================================
 * CENTRO DE BACKUPS (EXPORTAR / IMPORTAR JSON COMPLETO) Y GESTIÓN DE FAVORITOS
 * ============================================================================
 */
function buildBackupPayload() {
  return {
    app: 'MedDiet Pro',
    version: '3.0',
    exported_at: new Date().toISOString(),
    season: state.season,
    diners: state.diners,
    preferences: state.preferences,
    favorites: state.favorites,
    locked_slots: state.lockedSlots,
    custom_shopping_items: state.customShoppingItems,
    clinical_profile: state.clinicalProfile,
    weekly_plan: state.planMap,
    saved_menus: state.savedMenus,
    checked_ingredients: state.checkedIngredients
  };
}

function openBackupModal() {
  const modal = document.getElementById('backup-modal');
  if (!modal) return;
  renderBackupModalBody();
  modal.classList.add('is-open');
}

function renderBackupModalBody() {
  const bodyEl = document.getElementById('backup-modal-body');
  if (!bodyEl) return;

  const favRecipes = RECIPES_DB.filter(r => state.favorites.includes(r.id));
  const payloadStr = JSON.stringify(buildBackupPayload(), null, 2);

  bodyEl.innerHTML = `
    <div class="pref-input-grid">
      <div class="pref-section">
        <h3 class="pref-section-title">Exportar Copia de Seguridad Completa (.JSON)</h3>
        <p class="pref-section-desc">
          Descarga en un archivo ligero todas tus opciones de días, tus ${state.favorites.length} comidas favoritas, la semana actual y tus ${state.savedMenus.length} menús semanales guardados.
        </p>
        <div style="display: flex; flex-wrap: wrap; gap: 0.5rem; margin-top: 0.35rem;">
          <button type="button" class="btn-primary" id="download-backup-json-btn">
            Descargar Archivo Backup (.json)
          </button>
          <button type="button" class="btn-secondary" id="copy-backup-json-btn">
            Copiar JSON al Portapapeles
          </button>
        </div>
        <textarea
          readonly
          class="pref-textarea tabular-nums"
          style="margin-top: 0.5rem; font-size: 0.74rem; min-height: 110px;"
          aria-label="Contenido JSON de la copia de seguridad"
        >${escapeHtml(payloadStr)}</textarea>
      </div>

      <div class="pref-section">
        <h3 class="pref-section-title">Restaurar / Importar Backup desde Archivo o Texto</h3>
        <p class="pref-section-desc">
          Selecciona un archivo <code>.json</code> exportado previamente o pega el contenido para recuperar tus opciones, favoritos y menús en cualquier dispositivo.
        </p>
        <div style="display: flex; flex-wrap: wrap; gap: 0.5rem; align-items: center;">
          <label class="btn-secondary" style="cursor: pointer;">
            Seleccionar archivo .JSON
            <input type="file" id="import-backup-file-input" accept=".json,application/json" style="display: none;" />
          </label>
        </div>
        <textarea
          id="import-backup-text-input"
          class="pref-textarea tabular-nums"
          style="margin-top: 0.5rem; font-size: 0.74rem; min-height: 82px;"
          placeholder="O pega aquí el código JSON de tu copia de seguridad..."
        ></textarea>
        <div>
          <button type="button" class="btn-primary" id="restore-backup-text-btn">
            Restaurar Copia de Seguridad
          </button>
        </div>
      </div>
    </div>

    <div class="pref-section">
      <h3 class="pref-section-title">Tus Platos Favoritos Guardados (★ ${favRecipes.length})</h3>
      <p class="pref-section-desc">
        Los platos marcados con ★ tienen prioridad al generar nuevas semanas y al ordenar opciones.
      </p>
      ${favRecipes.length === 0 ? `
        <p class="slot-meta-line">Aún no has marcado platos favoritos. Pulsa el icono ☆ en cualquier receta para añadirla.</p>
      ` : `
        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 0.65rem; margin-top: 0.35rem;">
          ${favRecipes.map(r => `
            <div style="background: var(--bg-surface); border: 1px solid var(--border-hairline); border-radius: var(--radius-sm); padding: 0.65rem 0.8rem; display: flex; justify-content: space-between; align-items: center; gap: 0.5rem;">
              <div>
                <strong style="font-size: 0.84rem; display: block;">${escapeHtml(r.name)}</strong>
                <span class="slot-meta-line tabular-nums">${CATEGORY_LABELS[r.category]} · ${r.kcal} kcal · ${r.prep_minutes}m</span>
              </div>
              <div style="display: flex; gap: 0.35rem;">
                <button type="button" class="btn-ghost" data-open-recipe="${r.id}">Ver</button>
                <button type="button" class="fav-star-btn is-fav" data-toggle-favorite="${r.id}" title="Quitar de favoritos">★</button>
              </div>
            </div>
          `).join('')}
        </div>
      `}
    </div>
  `;

  const fileInput = document.getElementById('import-backup-file-input');
  if (fileInput) {
    fileInput.addEventListener('change', handleBackupFileUpload);
  }
}

function downloadBackupJsonFile() {
  const payload = JSON.stringify(buildBackupPayload(), null, 2);
  const dateStr = new Date().toISOString().slice(0, 10);
  const blob = new Blob([payload], { type: 'application/json;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `meddiet-pro-backup-${dateStr}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
  showToast('Copia de seguridad (.json) descargada correctamente.');
}

async function copyBackupJsonToClipboard() {
  const payload = JSON.stringify(buildBackupPayload(), null, 2);
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(payload);
    }
    showToast('Backup JSON copiado al portapapeles.');
  } catch (_) {
    showToast('Copia lista en el cuadro de texto.');
  }
}

function restoreFromBackupObject(data) {
  if (!data || typeof data !== 'object') {
    showToast('El archivo de backup no tiene un formato válido.');
    return;
  }

  if (data.season && ['primavera', 'verano', 'otono', 'invierno'].includes(data.season)) {
    state.season = data.season;
    localStorage.setItem(STORAGE_KEYS.SEASON, state.season);
  }
  if (data.diners) {
    state.diners = Math.max(1, Math.min(12, Number(data.diners) || 2));
    localStorage.setItem(STORAGE_KEYS.DINERS, String(state.diners));
  }
  if (data.preferences && typeof data.preferences === 'object') {
    state.preferences = {
      ...structuredClone(DEFAULT_USER_PREFERENCES),
      ...data.preferences
    };
    savePreferencesToStorage();
  }
  if (Array.isArray(data.favorites)) {
    state.favorites = data.favorites.map(Number).filter(n => n >= 1 && n <= 200);
    saveFavoritesToStorage();
  }
  if (data.weekly_plan && data.weekly_plan.lunes) {
    state.planMap = structuredClone(data.weekly_plan);
    savePlanToStorage();
  }
  if (Array.isArray(data.saved_menus)) {
    state.savedMenus = data.saved_menus;
    saveMenusToStorage();
  }
  if (data.checked_ingredients && typeof data.checked_ingredients === 'object') {
    state.checkedIngredients = data.checked_ingredients;
    saveCheckedIngredients();
  }
  if (data.locked_slots && typeof data.locked_slots === 'object') {
    state.lockedSlots = data.locked_slots;
    saveLockedSlots();
  }
  if (Array.isArray(data.custom_shopping_items)) {
    state.customShoppingItems = data.custom_shopping_items;
    saveCustomShopping();
  }
  if (data.clinical_profile && typeof data.clinical_profile === 'object') {
    state.clinicalProfile = { ...state.clinicalProfile, ...data.clinical_profile };
    saveClinicalProfile();
  }

  renderAll();
  renderBackupModalBody();
  showToast('¡Copia de seguridad restaurada con éxito!');
}

function handleBackupFileUpload(event) {
  const file = event.target?.files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const parsed = JSON.parse(String(reader.result || '{}'));
      restoreFromBackupObject(parsed);
    } catch (_) {
      showToast('Error al leer el archivo JSON de backup.');
    }
  };
  reader.readAsText(file);
}

/**
 * ============================================================================
 * MODAL 8: CALCULADORA CLÍNICA (MIFFLIN-ST JEOR / IMC) Y AUDITORÍA DE MACROS
 * ============================================================================
 */
function openClinicalCalculatorModal() {
  const modal = document.getElementById('clinical-calculator-modal');
  if (!modal) return;
  renderClinicalCalculatorBody();
  modal.classList.add('is-open');
}

function renderClinicalCalculatorBody() {
  const bodyEl = document.getElementById('clinical-modal-body');
  if (!bodyEl) return;

  const p = state.clinicalProfile;
  const clinical = calculateClinicalTargets(p);
  const evaluation = evaluateWeeklyPlan(state.planMap, state.preferences);
  const { compliance } = evaluation;

  bodyEl.innerHTML = `
    <div class="pref-input-grid">
      <div class="pref-section">
        <h3 class="pref-section-title">1. Tus Parámetros Antropométricos (Mifflin-St Jeor)</h3>
        <p class="pref-section-desc">
          Introduce tus datos para calcular tu Gasto Energético Total (GET), tu IMC y el déficit calórico clínico seguro recomendado por la SEEDO.
        </p>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 0.65rem; margin-top: 0.35rem;">
          <div>
            <label for="calc-sex-select" class="slot-meta-line" style="display:block; margin-bottom:0.25rem;"><strong>Sexo biológico</strong></label>
            <select id="calc-sex-select" class="search-input" style="width: 100%; min-width: 0;">
              <option value="female" ${p.sex === 'female' ? 'selected' : ''}>Mujer</option>
              <option value="male" ${p.sex === 'male' ? 'selected' : ''}>Hombre</option>
            </select>
          </div>
          <div>
            <label for="calc-age-input" class="slot-meta-line" style="display:block; margin-bottom:0.25rem;"><strong>Edad (años)</strong></label>
            <input type="number" id="calc-age-input" class="search-input tabular-nums" style="width: 100%; min-width: 0;" min="18" max="95" value="${p.age}" />
          </div>
          <div>
            <label for="calc-weight-input" class="slot-meta-line" style="display:block; margin-bottom:0.25rem;"><strong>Peso actual (kg)</strong></label>
            <input type="number" id="calc-weight-input" class="search-input tabular-nums" style="width: 100%; min-width: 0;" min="40" max="220" step="0.5" value="${p.weight_kg}" />
          </div>
          <div>
            <label for="calc-height-input" class="slot-meta-line" style="display:block; margin-bottom:0.25rem;"><strong>Altura (cm)</strong></label>
            <input type="number" id="calc-height-input" class="search-input tabular-nums" style="width: 100%; min-width: 0;" min="135" max="220" value="${p.height_cm}" />
          </div>
        </div>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 0.65rem; margin-top: 0.5rem;">
          <div>
            <label for="calc-activity-select" class="slot-meta-line" style="display:block; margin-bottom:0.25rem;"><strong>Actividad física semanal</strong></label>
            <select id="calc-activity-select" class="search-input" style="width: 100%; min-width: 0;">
              <option value="1.2" ${Number(p.activity_factor) === 1.2 ? 'selected' : ''}>Sedentario (oficina, pocos pasos)</option>
              <option value="1.375" ${Number(p.activity_factor) === 1.375 ? 'selected' : ''}>Ligera (caminar 1-3 días/sem)</option>
              <option value="1.55" ${Number(p.activity_factor) === 1.55 ? 'selected' : ''}>Moderada (deporte 3-5 días/sem)</option>
              <option value="1.725" ${Number(p.activity_factor) === 1.725 ? 'selected' : ''}>Intensa (entrenamiento 6 días/sem)</option>
            </select>
          </div>
          <div>
            <label for="calc-deficit-select" class="slot-meta-line" style="display:block; margin-bottom:0.25rem;"><strong>Déficit calórico objetivo</strong></label>
            <select id="calc-deficit-select" class="search-input" style="width: 100%; min-width: 0;">
              <option value="350" ${Number(p.deficit_kcal) === 350 ? 'selected' : ''}>Suave (-350 kcal/día · sin hambre)</option>
              <option value="450" ${Number(p.deficit_kcal) === 450 ? 'selected' : ''}>Clínico estándar (-450 kcal/día)</option>
              <option value="550" ${Number(p.deficit_kcal) === 550 ? 'selected' : ''}>Intensivo seguro (-550 kcal/día)</option>
            </select>
          </div>
        </div>

        <div style="margin-top: 0.65rem;">
          <button type="button" class="btn-primary" id="recalculate-clinical-btn">
            Calcular y Guardar Perfil Clínico
          </button>
        </div>
      </div>

      <div class="pref-section" style="border-color: var(--accent-olive);">
        <h3 class="pref-section-title">2. Diagnóstico Clínico y Pauta Recomendada</h3>
        <div class="macros-grid" style="margin-top: 0.25rem;">
          <div class="macro-item">
            <div class="macro-label">IMC (${escapeHtml(clinical.bmi_category)})</div>
            <div class="macro-val tabular-nums">${clinical.bmi} kg/m²</div>
          </div>
          <div class="macro-item">
            <div class="macro-label">Metabolismo Basal / Total</div>
            <div class="macro-val tabular-nums">${clinical.bmr_kcal} / ${clinical.tdee_kcal} kcal</div>
          </div>
          <div class="macro-item">
            <div class="macro-label">Objetivo Hipocalórico Pautado</div>
            <div class="macro-val tabular-nums" style="color: var(--accent-olive);">${clinical.target_kcal} kcal/día</div>
          </div>
          <div class="macro-item">
            <div class="macro-label">Pérdida Grasa / Agua Diaria</div>
            <div class="macro-val tabular-nums">-${clinical.estimated_weekly_loss_kg} kg/sem · ${clinical.recommended_water_liters} L</div>
          </div>
        </div>
        <p class="slot-meta-line" style="margin-top: 0.5rem;">
          Tu menú semanal actual promedia <strong>${compliance.avg_daily_kcal} kcal/día</strong> (diferencia de <strong>${compliance.avg_daily_kcal - clinical.target_kcal > 0 ? '+' : ''}${compliance.avg_daily_kcal - clinical.target_kcal} kcal</strong> respecto a tu objetivo calculado).
        </p>
      </div>
    </div>

    <div class="pref-section">
      <h3 class="pref-section-title">3. Auditoría de Macronutrientes de tu Menú Semanal Actual (Media Diaria)</h3>
      <p class="pref-section-desc">
        Distribución real calculada sumando tus 14 comidas/cenas planificadas + desayuno y tentempié mediterráneo pautado:
      </p>
      <div class="macros-grid" style="grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));">
        <div class="macro-item">
          <div class="macro-label">Proteínas Magras (Saciantes)</div>
          <div class="macro-val tabular-nums">${compliance.avg_daily_protein_g} g/día (${compliance.protein_pct}%)</div>
          <span class="slot-meta-line">Óptimo preservación muscular</span>
        </div>
        <div class="macro-item">
          <div class="macro-label">Hidratos Complejos (Bajo IG)</div>
          <div class="macro-val tabular-nums">${compliance.avg_daily_carbs_g} g/día (${compliance.carbs_pct}%)</div>
          <span class="slot-meta-line">Legumbres, huerta y grano entero</span>
        </div>
        <div class="macro-item">
          <div class="macro-label">Grasas Cardiosaludables (AOVE / Omega-3)</div>
          <div class="macro-val tabular-nums">${compliance.avg_daily_fat_g} g/día (${compliance.fat_pct}%)</div>
          <span class="slot-meta-line">Aceite de oliva virgen extra medido</span>
        </div>
      </div>
    </div>
  `;
}

function handleSaveClinicalCalculator() {
  const sex = document.getElementById('calc-sex-select')?.value || 'female';
  const age = Number(document.getElementById('calc-age-input')?.value || 42);
  const weightKg = Number(document.getElementById('calc-weight-input')?.value || 74);
  const heightCm = Number(document.getElementById('calc-height-input')?.value || 166);
  const activity = Number(document.getElementById('calc-activity-select')?.value || 1.375);
  const deficit = Number(document.getElementById('calc-deficit-select')?.value || 450);

  state.clinicalProfile = {
    sex: sex === 'male' ? 'male' : 'female',
    age: Math.max(18, Math.min(95, age)),
    weight_kg: Math.max(40, Math.min(220, weightKg)),
    height_cm: Math.max(135, Math.min(220, heightCm)),
    activity_factor: activity,
    deficit_kcal: deficit
  };
  saveClinicalProfile();
  renderClinicalCalculatorBody();
  const res = calculateClinicalTargets(state.clinicalProfile);
  showToast(`Perfil clínico actualizado: Objetivo ${res.target_kcal} kcal/día (-${res.estimated_weekly_loss_kg} kg/semana).`);
}

/**
 * Abre el modal de Guardado y Recuperación de Menús Semanales.
 */
function openSavedMenusModal() {
  const modal = document.getElementById('saved-menus-modal');
  if (!modal) return;
  renderSavedMenusList();
  modal.classList.add('is-open');
}

function renderSavedMenusList() {
  const listEl = document.getElementById('saved-menus-list');
  if (!listEl) return;

  if (!state.savedMenus.length) {
    listEl.innerHTML = `<p class="slot-meta-line">Aún no hay menús personalizados guardados.</p>`;
    return;
  }

  listEl.innerHTML = state.savedMenus.map(m => `
    <div class="step-item" style="flex-direction: row; align-items: center; justify-content: space-between; flex-wrap: wrap;">
      <div>
        <strong style="font-size: 0.94rem;">${escapeHtml(m.menu_name)}</strong>
        <p class="slot-meta-line tabular-nums">
          Estación: ${capitalize(m.season || 'primavera')} · ${m.diners || 2} comensales · Media: ${m.avg_daily_kcal || 1410} kcal/día
        </p>
      </div>
      <div style="display: flex; gap: 0.5rem;">
        <button type="button" class="btn-secondary" data-load-saved-menu="${m.id}">
          Cargar menú
        </button>
        <button type="button" class="btn-ghost" data-delete-saved-menu="${m.id}" aria-label="Eliminar ${escapeHtml(m.menu_name)}">
          Eliminar
        </button>
      </div>
    </div>
  `).join('');
}

async function handleSaveCurrentMenu(event) {
  event.preventDefault();
  const inputEl = document.getElementById('save-menu-name-input');
  const errorEl = document.getElementById('save-menu-error');
  if (!inputEl) return;

  const menuName = inputEl.value.trim();
  if (!menuName) {
    if (errorEl) {
      errorEl.textContent = 'Introduce un nombre descriptivo para guardar el menú semanal.';
      errorEl.style.display = 'block';
    }
    return;
  }
  if (errorEl) errorEl.style.display = 'none';

  const evalResult = evaluateWeeklyPlan(state.planMap, state.preferences);
  const newSaved = {
    id: Date.now(),
    menu_name: menuName,
    season: state.season,
    diners: state.diners,
    avg_daily_kcal: evalResult.compliance.avg_daily_kcal,
    created_at: new Date().toISOString().slice(0, 19).replace('T', ' '),
    preferences: structuredClone(state.preferences),
    plan_json: structuredClone(state.planMap)
  };

  state.savedMenus.unshift(newSaved);
  saveMenusToStorage();

  await apiFetch('api/save_menu.php', {
    method: 'POST',
    body: JSON.stringify({
      action: 'save',
      menu_name: menuName,
      season: state.season,
      diners: state.diners
    })
  });

  inputEl.value = '';
  renderSavedMenusList();
  showToast(`Menú "${menuName}" guardado correctamente.`);
}

async function handleLoadSavedMenu(menuId) {
  const numericId = Number(menuId);
  const found = state.savedMenus.find(m => Number(m.id) === numericId);
  if (!found) return;

  const planObj = typeof found.plan_json === 'string' ? JSON.parse(found.plan_json) : found.plan_json;
  if (planObj && planObj.lunes) {
    if (found.preferences) {
      state.preferences = {
        ...structuredClone(DEFAULT_USER_PREFERENCES),
        ...found.preferences
      };
      savePreferencesToStorage();
    }
    state.planMap = structuredClone(planObj);
    state.season = found.season || state.season;
    state.diners = Number(found.diners) || state.diners;
    savePlanToStorage();
    localStorage.setItem(STORAGE_KEYS.SEASON, state.season);
    localStorage.setItem(STORAGE_KEYS.DINERS, String(state.diners));
  }

  await apiFetch('api/save_menu.php', {
    method: 'POST',
    body: JSON.stringify({ action: 'load', menu_id: numericId })
  });

  closeAllModals();
  renderAll();
  showToast(`Menú "${found.menu_name}" cargado en el planificador.`);
}

async function handleDeleteSavedMenu(menuId) {
  const numericId = Number(menuId);
  state.savedMenus = state.savedMenus.filter(m => Number(m.id) !== numericId);
  saveMenusToStorage();

  await apiFetch('api/save_menu.php', {
    method: 'POST',
    body: JSON.stringify({ action: 'delete', menu_id: numericId })
  });

  renderSavedMenusList();
  showToast('Menú guardado eliminado.');
}

function closeAllModals() {
  stopActiveTimer();
  document.querySelectorAll('.modal-backdrop.is-open').forEach(m => {
    m.classList.remove('is-open');
  });
}

function capitalize(str) {
  if (!str) return '';
  if (str === 'otono') return 'Otoño';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function escapeHtml(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/**
 * Delegación global de eventos DOM.
 */
function setupEventListeners() {
  document.addEventListener('click', async e => {
    const target = e.target;
    if (!(target instanceof Element)) return;

    // 1. Estrella de Favorito (★)
    const favBtn = target.closest('[data-toggle-favorite]');
    if (favBtn) {
      e.stopPropagation();
      toggleFavoriteRecipe(favBtn.getAttribute('data-toggle-favorite'));
      if (document.getElementById('recipe-detail-modal')?.classList.contains('is-open')) {
        openRecipeDetailModal(favBtn.getAttribute('data-toggle-favorite'));
      }
      if (document.getElementById('backup-modal')?.classList.contains('is-open')) {
        renderBackupModalBody();
      }
      return;
    }

    // 1b. Candado de fijar plato individual (🔒 / 🔓)
    const lockBtn = target.closest('[data-toggle-lock]');
    if (lockBtn) {
      e.stopPropagation();
      const [day, meal] = (lockBtn.getAttribute('data-toggle-lock') || '').split(':');
      if (day && meal) toggleSlotLock(day, meal);
      return;
    }

    // 2. Navegación principal (Top Bar y Barra Inferior Móvil)
    const navBtn = target.closest('[data-nav-view]');
    if (navBtn) {
      const view = navBtn.getAttribute('data-nav-view');
      if (view) switchView(view);
      return;
    }

    // 3. Conmutador Modo Claro / Oscuro
    if (target.closest('#theme-toggle-btn')) {
      applyTheme(state.theme === 'dark' ? 'light' : 'dark');
      return;
    }

    // 4. Selector de Estación del Año
    const seasonBtn = target.closest('[data-season-btn]');
    if (seasonBtn) {
      const newSeason = seasonBtn.getAttribute('data-season-btn');
      if (newSeason && newSeason !== state.season) {
        state.season = newSeason;
        localStorage.setItem(STORAGE_KEYS.SEASON, state.season);
        state.planMap = generateSeasonalWeeklyPlan(
          state.season,
          state.preferences,
          state.favorites,
          new Set(state.favorites),
          state.lockedSlots
        );
        savePlanToStorage();

        await apiFetch('api/swap_recipe.php', {
          method: 'POST',
          body: JSON.stringify({
            action: 'regenerate_week',
            season: state.season,
            arroz_cubana_day: state.preferences.arroz_cubana_day,
            legume_days: state.preferences.legume_days,
            fish_nights: state.preferences.fish_nights
          })
        });

        renderAll();
        showToast(`Menú adaptado a productos de ${capitalize(state.season)} respetando tus platos fijados.`);
      }
      return;
    }

    // 5. Regenerar semana completa (respetando platos bloqueados con candado 🔒)
    if (target.closest('#regenerate-week-btn')) {
      state.planMap = generateSeasonalWeeklyPlan(
        state.season,
        state.preferences,
        state.favorites,
        new Set(state.favorites),
        state.lockedSlots
      );
      savePlanToStorage();
      await apiFetch('api/swap_recipe.php', {
        method: 'POST',
        body: JSON.stringify({
          action: 'regenerate_week',
          season: state.season,
          arroz_cubana_day: state.preferences.arroz_cubana_day,
          legume_days: state.preferences.legume_days,
          fish_nights: state.preferences.fish_nights
        })
      });
      renderAll();
      const lockedCount = Object.keys(state.lockedSlots).length;
      showToast(
        lockedCount > 0
          ? `Nueva semana generada manteniendo tus ${lockedCount} plato(s) fijado(s) con candado 🔒.`
          : `Nueva semana hipocalórica generada sin repeticiones (${capitalize(state.season)}).`
      );
      return;
    }

    // 6. Selector de Comensales (1 a 12)
    if (target.closest('#diners-dec-btn')) {
      if (state.diners > 1) {
        state.diners -= 1;
        localStorage.setItem(STORAGE_KEYS.DINERS, String(state.diners));
        renderAll();
        showToast(`Cantidades recalculadas para ${state.diners} ${state.diners === 1 ? 'comensal' : 'comensales'}.`);
      }
      return;
    }
    if (target.closest('#diners-inc-btn')) {
      if (state.diners < 12) {
        state.diners += 1;
        localStorage.setItem(STORAGE_KEYS.DINERS, String(state.diners));
        renderAll();
        showToast(`Cantidades recalculadas para ${state.diners} comensales.`);
      }
      return;
    }

    // 7. Selector de día en móvil
    const mobileDayBtn = target.closest('[data-mobile-day]');
    if (mobileDayBtn) {
      state.selectedMobileDay = mobileDayBtn.getAttribute('data-mobile-day') || 'lunes';
      renderPlannerView();
      return;
    }

    // 8. Cambio rápido de plato ("Cambiar")
    const quickSwapBtn = target.closest('[data-quick-swap]');
    if (quickSwapBtn) {
      const [day, meal] = (quickSwapBtn.getAttribute('data-quick-swap') || '').split(':');
      if (day && meal) await handleQuickSwap(day, meal);
      return;
    }

    // 9. Abrir modal de todas las alternativas ("Opciones")
    const altBtn = target.closest('[data-open-alternatives]');
    if (altBtn) {
      const [day, meal] = (altBtn.getAttribute('data-open-alternatives') || '').split(':');
      if (day && meal) openAlternativesModal(day, meal);
      return;
    }

    // 10. Ordenar dentro del modal de alternativas
    const altSortBtn = target.closest('[data-alt-sort]');
    if (altSortBtn) {
      state.alternativesSortBy = altSortBtn.getAttribute('data-alt-sort') || 'recommended';
      renderAlternativesModalContent();
      return;
    }

    // 11. Aplicar alternativa elegida en modal
    const selectAltBtn = target.closest('[data-select-alternative]');
    if (selectAltBtn) {
      const [day, meal, rid] = (selectAltBtn.getAttribute('data-select-alternative') || '').split(':');
      if (day && meal && rid) await applyAlternativeSelection(day, meal, rid);
      return;
    }

    // 12. Configurador de Días y Gustos
    if (target.closest('#open-preferences-btn')) {
      openPreferencesModal();
      return;
    }

    const prefArrozBtn = target.closest('[data-pref-arroz-day]');
    if (prefArrozBtn && state.draftPrefs) {
      captureDraftPrefInputs();
      state.draftPrefs.arroz_cubana_day = prefArrozBtn.getAttribute('data-pref-arroz-day') || 'viernes';
      renderPreferencesModalBody();
      return;
    }

    const prefLegBtn = target.closest('[data-pref-legume-day]');
    if (prefLegBtn && state.draftPrefs) {
      captureDraftPrefInputs();
      const day = prefLegBtn.getAttribute('data-pref-legume-day');
      if (day) {
        const idx = state.draftPrefs.legume_days.indexOf(day);
        if (idx >= 0) {
          state.draftPrefs.legume_days.splice(idx, 1);
        } else {
          state.draftPrefs.legume_days.push(day);
        }
        renderPreferencesModalBody();
      }
      return;
    }

    const prefFishBtn = target.closest('[data-pref-fish-night]');
    if (prefFishBtn && state.draftPrefs) {
      captureDraftPrefInputs();
      const day = prefFishBtn.getAttribute('data-pref-fish-night');
      if (day) {
        const idx = state.draftPrefs.fish_nights.indexOf(day);
        if (idx >= 0) {
          state.draftPrefs.fish_nights.splice(idx, 1);
        } else {
          state.draftPrefs.fish_nights.push(day);
        }
        renderPreferencesModalBody();
      }
      return;
    }

    if (target.closest('#reset-default-prefs-btn')) {
      state.draftPrefs = structuredClone(DEFAULT_USER_PREFERENCES);
      renderPreferencesModalBody();
      return;
    }

    if (target.closest('#save-prefs-only-btn')) {
      await applyPreferences(false);
      return;
    }

    if (target.closest('#save-prefs-and-regenerate-btn')) {
      await applyPreferences(true);
      return;
    }

    // 13. Generadores de PDF (Folio Apaisado Nevera y Recetario Paso a Paso)
    if (target.closest('#open-fridge-pdf-btn')) {
      openPdfPreviewModal('fridge-landscape');
      return;
    }
    if (target.closest('#open-booklet-pdf-btn')) {
      openPdfPreviewModal('recipes-booklet');
      return;
    }
    if (target.closest('#trigger-browser-pdf-print-btn')) {
      triggerBrowserPdfPrint();
      return;
    }
    if (target.closest('#download-standalone-pdf-html-btn')) {
      downloadStandalonePrintableDocument();
      return;
    }

    // 14. Centro de Backups y Favoritos
    if (target.closest('#open-backup-modal-btn')) {
      openBackupModal();
      return;
    }
    if (target.closest('#download-backup-json-btn')) {
      downloadBackupJsonFile();
      return;
    }
    if (target.closest('#copy-backup-json-btn')) {
      await copyBackupJsonToClipboard();
      return;
    }
    if (target.closest('#restore-backup-text-btn')) {
      const txtEl = document.getElementById('import-backup-text-input');
      const raw = txtEl?.value?.trim() || '';
      if (!raw) {
        showToast('Pega primero el contenido JSON o selecciona un archivo .json.');
        return;
      }
      try {
        restoreFromBackupObject(JSON.parse(raw));
      } catch (_) {
        showToast('El texto JSON introducido no es válido.');
      }
      return;
    }

    // 15. Abrir ficha completa de receta
    const openRecipeBtn = target.closest('[data-open-recipe]');
    if (openRecipeBtn) {
      const rid = openRecipeBtn.getAttribute('data-open-recipe');
      if (rid) openRecipeDetailModal(rid);
      return;
    }

    // 16. Iniciar Modo Cocina desde ficha de receta
    const startCookingBtn = target.closest('[data-start-cooking]');
    if (startCookingBtn) {
      const rid = startCookingBtn.getAttribute('data-start-cooking');
      if (rid) startCookingMode(rid);
      return;
    }

    // 17. Controles dentro de Modo Cocina
    if (target.closest('#cooking-timer-toggle-btn')) {
      toggleCookingTimer();
      return;
    }
    if (target.closest('#cooking-timer-reset-btn')) {
      stopActiveTimer();
      const step = state.cookingRecipe?.steps[state.cookingStepIndex];
      state.timerRemainingSec = step ? step.timer_seconds : 60;
      renderCookingModeStep();
      return;
    }
    if (target.closest('#cooking-prev-step-btn')) {
      if (state.cookingStepIndex > 0) {
        stopActiveTimer();
        state.cookingStepIndex -= 1;
        state.timerRemainingSec = state.cookingRecipe.steps[state.cookingStepIndex].timer_seconds || 60;
        renderCookingModeStep();
      }
      return;
    }
    if (target.closest('#cooking-next-step-btn')) {
      stopActiveTimer();
      if (state.cookingRecipe && state.cookingStepIndex < state.cookingRecipe.steps.length - 1) {
        state.cookingStepIndex += 1;
        state.timerRemainingSec = state.cookingRecipe.steps[state.cookingStepIndex].timer_seconds || 60;
        renderCookingModeStep();
      } else {
        closeAllModals();
        showToast('¡Enhorabuena! Plato terminado.');
      }
      return;
    }

    // 18. Filtros de categoría y ordenación en Recetario (200 recetas)
    const catFilterBtn = target.closest('[data-catalog-cat]');
    if (catFilterBtn) {
      state.catalogCategoryFilter = catFilterBtn.getAttribute('data-catalog-cat') || 'all';
      document.querySelectorAll('[data-catalog-cat]').forEach(b => {
        b.classList.toggle('is-active', b.getAttribute('data-catalog-cat') === state.catalogCategoryFilter);
      });
      renderCatalogView();
      return;
    }

    const catSortBtn = target.closest('[data-catalog-sort]');
    if (catSortBtn) {
      state.catalogSortBy = catSortBtn.getAttribute('data-catalog-sort') || 'recommended';
      renderCatalogView();
      return;
    }

    if (target.closest('#reset-catalog-filters-btn')) {
      state.catalogCategoryFilter = 'all';
      state.catalogSearchQuery = '';
      state.catalogSortBy = 'recommended';
      const searchInput = document.getElementById('catalog-search-input');
      if (searchInput) searchInput.value = '';
      document.querySelectorAll('[data-catalog-cat]').forEach(b => {
        b.classList.toggle('is-active', b.getAttribute('data-catalog-cat') === 'all');
      });
      renderCatalogView();
      return;
    }

    // 19. Checkboxes y controles en Lista de la Compra
    if (target.closest('#toggle-pantry-basics-btn')) {
      state.hidePantryBasics = !state.hidePantryBasics;
      renderShoppingListView();
      showToast(
        state.hidePantryBasics
          ? 'Básicos de despensa (AOVE, ajo, caldo, pimentón) ocultados de la vista.'
          : 'Mostrando todos los ingredientes de despensa.'
      );
      return;
    }

    const deleteCustomBtn = target.closest('[data-delete-custom-shopping]');
    if (deleteCustomBtn) {
      e.stopPropagation();
      const cid = deleteCustomBtn.getAttribute('data-delete-custom-shopping');
      state.customShoppingItems = state.customShoppingItems.filter(it => String(it.id) !== String(cid));
      saveCustomShopping();
      renderShoppingListView();
      return;
    }

    const customShoppingRow = target.closest('[data-toggle-custom-shopping]');
    if (customShoppingRow) {
      const cid = customShoppingRow.getAttribute('data-toggle-custom-shopping');
      const item = state.customShoppingItems.find(it => String(it.id) === String(cid));
      if (item) {
        item.checked = !item.checked;
        saveCustomShopping();
        renderShoppingListView();
      }
      return;
    }

    const shoppingRow = target.closest('[data-toggle-ingredient]');
    if (shoppingRow) {
      const ingId = shoppingRow.getAttribute('data-toggle-ingredient');
      if (ingId) {
        state.checkedIngredients[ingId] = !state.checkedIngredients[ingId];
        saveCheckedIngredients();
        renderShoppingListView();
      }
      return;
    }

    if (target.closest('#clear-checked-shopping-btn')) {
      state.checkedIngredients = {};
      state.customShoppingItems.forEach(it => { it.checked = false; });
      saveCheckedIngredients();
      saveCustomShopping();
      renderShoppingListView();
      showToast('Marcas de compra reiniciadas.');
      return;
    }

    if (target.closest('#copy-whatsapp-btn')) {
      await copyShoppingListForWhatsApp();
      return;
    }

    if (target.closest('#print-shopping-btn')) {
      document.body.removeAttribute('data-print-mode');
      setPagePrintOrientationCSS(false);
      window.print();
      return;
    }

    // 19b. Calculadora Clínica y Macros
    if (target.closest('#open-clinical-calc-btn')) {
      openClinicalCalculatorModal();
      return;
    }
    if (target.closest('#recalculate-clinical-btn')) {
      handleSaveClinicalCalculator();
      return;
    }

    // 20. Modal de Menús Guardados
    if (target.closest('#open-saved-menus-btn')) {
      openSavedMenusModal();
      return;
    }

    const loadMenuBtn = target.closest('[data-load-saved-menu]');
    if (loadMenuBtn) {
      await handleLoadSavedMenu(loadMenuBtn.getAttribute('data-load-saved-menu'));
      return;
    }

    const deleteMenuBtn = target.closest('[data-delete-saved-menu]');
    if (deleteMenuBtn) {
      await handleDeleteSavedMenu(deleteMenuBtn.getAttribute('data-delete-saved-menu'));
      return;
    }

    // 21. Eventos del Buscador de la Nevera
    const fridgeToggleChip = target.closest('[data-toggle-fridge-id]');
    if (fridgeToggleChip) {
      const id = Number(fridgeToggleChip.getAttribute('data-toggle-fridge-id'));
      if (id > 0) {
        if (state.fridgeIngredients.has(id)) {
          state.fridgeIngredients.delete(id);
        } else {
          state.fridgeIngredients.add(id);
        }
        saveFridgeIngredients();
        renderFridgeView();
      }
      return;
    }

    const removeFridgeTagBtn = target.closest('[data-remove-fridge-id]');
    if (removeFridgeTagBtn) {
      const id = Number(removeFridgeTagBtn.getAttribute('data-remove-fridge-id'));
      if (id > 0) {
        state.fridgeIngredients.delete(id);
        saveFridgeIngredients();
        renderFridgeView();
      }
      return;
    }

    if (target.closest('#fridge-clear-all-btn')) {
      state.fridgeIngredients.clear();
      saveFridgeIngredients();
      renderFridgeView();
      showToast('Nevera vaciada. Selecciona ingredientes para ver recetas.');
      return;
    }

    if (target.closest('#fridge-add-input-btn')) {
      const inputEl = document.getElementById('fridge-ingredient-search-input');
      if (inputEl && inputEl.value.trim()) {
        const val = inputEl.value.trim().toLowerCase();
        const found = INGREDIENTS_DB.find(i => i.name.toLowerCase() === val || i.name.toLowerCase().includes(val));
        if (found) {
          state.fridgeIngredients.add(found.id);
          saveFridgeIngredients();
          inputEl.value = '';
          renderFridgeView();
          showToast(`Añadido "${found.name}" a tu nevera.`);
        } else {
          showToast(`No se encontró el ingrediente "${inputEl.value.trim()}".`);
        }
      }
      return;
    }

    const slotFridgeBtn = target.closest('[data-slot-fridge-recipe]');
    if (slotFridgeBtn) {
      const rid = Number(slotFridgeBtn.getAttribute('data-slot-fridge-recipe'));
      if (rid > 0) {
        openFridgeSlotModal(rid);
      }
      return;
    }

    const confirmSlotBtn = target.closest('[data-confirm-fridge-slot]');
    if (confirmSlotBtn) {
      const day = confirmSlotBtn.getAttribute('data-day');
      const meal = confirmSlotBtn.getAttribute('data-meal');
      const rid = state.slottingFridgeRecipeId;
      if (day && meal && rid) {
        handleConfirmFridgeSlot(day, meal, rid);
      }
      return;
    }

    // 22. Cerrar modales al pulsar botón cerrar o fondo oscuro
    if (target.closest('[data-close-modal]') || target.classList.contains('modal-backdrop')) {
      closeAllModals();
    }
  });

  // Filtros y buscador del módulo Nevera
  const fridgeIgnorePantryCb = document.getElementById('fridge-ignore-pantry-checkbox');
  if (fridgeIgnorePantryCb) {
    fridgeIgnorePantryCb.addEventListener('change', e => {
      state.fridgeIgnorePantry = e.target.checked;
      renderFridgeView();
    });
  }

  const fridgeSlotFilter = document.getElementById('fridge-slot-filter');
  if (fridgeSlotFilter) {
    fridgeSlotFilter.addEventListener('change', e => {
      state.fridgeMealSlotFilter = e.target.value;
      renderFridgeView();
    });
  }

  const fridgeSeasonFilter = document.getElementById('fridge-season-filter');
  if (fridgeSeasonFilter) {
    fridgeSeasonFilter.addEventListener('change', e => {
      state.fridgeSeasonFilter = e.target.value;
      renderFridgeView();
    });
  }

  const fridgeSearchInput = document.getElementById('fridge-ingredient-search-input');
  if (fridgeSearchInput) {
    fridgeSearchInput.addEventListener('keydown', e => {
      if (e.key === 'Enter') {
        e.preventDefault();
        const addBtn = document.getElementById('fridge-add-input-btn');
        if (addBtn) addBtn.click();
      }
    });
  }

  // Buscador en vivo del Recetario (200 recetas)
  const searchInput = document.getElementById('catalog-search-input');
  if (searchInput) {
    searchInput.addEventListener('input', e => {
      state.catalogSearchQuery = e.target.value || '';
      renderCatalogView();
    });
  }

  // Buscador en vivo dentro del Modal de Alternativas
  const altSearchInput = document.getElementById('alternatives-search-input');
  if (altSearchInput) {
    altSearchInput.addEventListener('input', e => {
      state.alternativesSearchQuery = e.target.value || '';
      renderAlternativesModalContent();
    });
  }

  // Formulario de guardar menú semanal
  const saveMenuForm = document.getElementById('save-menu-form');
  if (saveMenuForm) {
    saveMenuForm.addEventListener('submit', handleSaveCurrentMenu);
  }

  // Formulario de añadir artículo personalizado a la lista de la compra
  const addCustomShoppingForm = document.getElementById('add-custom-shopping-form');
  if (addCustomShoppingForm) {
    addCustomShoppingForm.addEventListener('submit', handleAddCustomShoppingItem);
  }

  // Cerrar modales con tecla Escape
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      closeAllModals();
    }
  });
}

document.addEventListener('DOMContentLoaded', () => {
  applyTheme(state.theme);
  setupEventListeners();
  syncInitialData();

  // Registrar Service Worker para caché offline en supermercado / cocina (ruta relativa)
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  }
});
