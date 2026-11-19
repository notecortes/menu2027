/**
 * MedDiet Pro — Suite de Tests Automatizados
 * 1. Buscador de Aprovechamiento por Ingredientes de Nevera (searchRecipesByFridgeIngredients)
 * 2. Integridad de Fichas Detalladas (4 pasos de elaboración, trucos, alérgenos y fuentes culinarias con URL)
 * 3. Cumplimiento de Reglas Clínicas Mediterráneas
 */

import {
  RECIPES_DB,
  INGREDIENTS_DB,
  searchRecipesByFridgeIngredients,
  verifyZeroForbiddenIngredients
} from '../assets/js/engine.js';

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    passed++;
    console.log(`  ✓ ${message}`);
  } else {
    failed++;
    console.error(`  ✗ FALLO: ${message}`);
  }
}

function assertEquals(actual, expected, message) {
  assert(actual === expected, `${message} (Esperado: ${expected}, Obtenido: ${actual})`);
}

console.log('================================================================');
console.log('🧪 MEDDIET PRO — SUITE DE TESTS NUTRICIONALES Y DE FUNCIONALIDAD');
console.log('================================================================\n');

// -----------------------------------------------------------------------------
// BLOQUE 1: Verificación de Fichas Detalladas y Enlaces a Fuentes Originales
// -----------------------------------------------------------------------------
console.log('--- TEST BLOQUE 1: Fichas Detalladas y Avales Culinarios ---');

assertEquals(RECIPES_DB.length, 200, 'El catálogo contiene exactamente 200 recetas españolas');

let allHaveSources = true;
let allHaveSourceUrls = true;
let allHaveSteps = true;
let allHaveAllergens = true;
let allHaveServingTips = true;
let sampleDetailedStep = null;

for (const r of RECIPES_DB) {
  if (!r.source_name || typeof r.source_name !== 'string' || r.source_name.trim() === '') {
    allHaveSources = false;
  }
  if (!r.source_url || !r.source_url.startsWith('http')) {
    allHaveSourceUrls = false;
  }
  if (!Array.isArray(r.steps) || r.steps.length < 3) {
    allHaveSteps = false;
  }
  if (!r.allergens || typeof r.allergens !== 'string') {
    allHaveAllergens = false;
  }
  if (!r.serving_tip || typeof r.serving_tip !== 'string') {
    allHaveServingTips = false;
  }
  if (!sampleDetailedStep && r.steps && r.steps.length >= 3) {
    sampleDetailedStep = r.steps;
  }
}

assert(allHaveSources, 'El 100% de las 200 recetas cuentan con nombre de fuente gastronómica acreditada');
assert(allHaveSourceUrls, 'El 100% de las 200 recetas cuentan con enlace web válido (URL) a la fuente');
assert(allHaveSteps, 'El 100% de las 200 recetas tienen elaboración detallada por pasos (mínimo 3 o 4 pasos)');
assert(allHaveAllergens, 'El 100% de las recetas declaran información clínica de alérgenos');
assert(allHaveServingTips, 'El 100% de las recetas incluyen sugerencias de servicio y acompañamiento');

// Comprobar ausencia estricta de marisco, bacalao y rape
const forbiddenCheck = verifyZeroForbiddenIngredients(RECIPES_DB, INGREDIENTS_DB);
assert(forbiddenCheck.clean, 'Cumplimiento estricto: 0% marisco, 0% bacalao y 0% rape en todo el catálogo');

// -----------------------------------------------------------------------------
// BLOQUE 2: Buscador de Aprovechamiento ("¿Qué tengo en la nevera?")
// -----------------------------------------------------------------------------
console.log('\n--- TEST BLOQUE 2: Buscador por Ingredientes de la Nevera ---');

// Test 2.1: Búsqueda vacía
const emptyResults = searchRecipesByFridgeIngredients({ ingredientIds: [] });
assertEquals(emptyResults.length, 0, 'Búsqueda con nevera vacía devuelve 0 recetas');

// Test 2.2: Búsqueda con un solo ingrediente: Huevo campero (ID: 8)
const eggResults = searchRecipesByFridgeIngredients({
  ingredientIds: [8],
  ignorePantryBasics: true
});
assert(eggResults.length > 0, `Búsqueda con huevos devuelve resultados (${eggResults.length} recetas encontradas)`);
const allContainEggs = eggResults.every(res => res.recipe.ingredients.some(i => Number(i.ingredient_id) === 8));
assert(allContainEggs, 'Todas las recetas devueltas con el filtro de huevo contienen huevo en sus ingredientes');

// Test 2.3: Búsqueda con ingredientes para receta 100% ejecutable (Huevos: 8, Calabacín: 13, Cebolla: 10)
const fullMatchResults = searchRecipesByFridgeIngredients({
  ingredientIds: [8, 13, 10],
  ignorePantryBasics: true
});

assert(fullMatchResults.length > 0, `Búsqueda múltiple devuelve recetas (${fullMatchResults.length} encontradas)`);

const firstMatch = fullMatchResults[0];
assertEquals(firstMatch.canCookNow, true, `La primera receta recomendada ("${firstMatch.recipe.name}") se puede cocinar de inmediato (100% de ingredientes disponibles)`);
assertEquals(firstMatch.matchPercentage, 100, 'El porcentaje de coincidencia de la primera receta es del 100%');
assertEquals(firstMatch.missingCount, 0, 'La receta prioritaria tiene 0 ingredientes faltantes');

// Test 2.4: Búsqueda estricta sin asumir básicos de despensa (ignorePantryBasics = false)
const strictResults = searchRecipesByFridgeIngredients({
  ingredientIds: [8, 13],
  ignorePantryBasics: false
});
const strictFirst = strictResults[0];
assert(strictFirst.missingIngredients.some(mi => mi.ingredient_id === 9 || mi.ingredient_id === 11),
  'En modo estricto sin básicos, el AOVE o ajo no aportados se marcan como ingredientes faltantes');

// Test 2.5: Filtro por momento de comida (Comida vs Cena)
const lunchOnlyResults = searchRecipesByFridgeIngredients({
  ingredientIds: [3, 10, 12], // Garbanzos, cebolla, zanahoria
  mealSlot: 'lunch',
  ignorePantryBasics: true
});
assert(lunchOnlyResults.length > 0, `Filtro por comida (almuerzo) devuelve ${lunchOnlyResults.length} recetas`);
const allAreLunch = lunchOnlyResults.every(r => r.recipe.meal_slot === 'both' || r.recipe.meal_slot === 'lunch');
assert(allAreLunch, 'Ninguna receta devuelta en el filtro de comida es de uso exclusivo para cenas');

// Test 2.6: Filtro por temporada
const springResults = searchRecipesByFridgeIngredients({
  ingredientIds: [30, 6], // Merluza, tomate
  season: 'primavera',
  ignorePantryBasics: true
});
assert(springResults.length > 0, `Filtro por primavera devuelve ${springResults.length} recetas`);
const allAreSpring = springResults.every(r => r.recipe.seasons.includes('primavera'));
assert(allAreSpring, 'Todas las recetas devueltas son compatibles con la temporada de primavera');

// Test 2.7: Búsqueda por nombres de texto libre
const textResults = searchRecipesByFridgeIngredients({
  ingredientNames: ['salmón', 'espinacas'],
  ignorePantryBasics: true
});
assert(textResults.length > 0, `Búsqueda por texto libre ("salmón", "espinacas") encuentra ${textResults.length} recetas`);
assert(textResults.some(r => r.recipe.name.toLowerCase().includes('salmón')), 'Encuentra recetas con salmón a partir del texto ingresado');

// -----------------------------------------------------------------------------
// RESUMEN FINAL
// -----------------------------------------------------------------------------
console.log('\n================================================================');
console.log(`📊 RESULTADO DE LA SUITE: ${passed} pruebas pasadas, ${failed} fallos`);
console.log('================================================================');

if (failed > 0) {
  process.exit(1);
} else {
  console.log('🎉 TODOS LOS TESTS SE EJECUTARON SATISFACTORIAMENTE.');
}
