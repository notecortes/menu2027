<?php
/**
 * MedDiet Pro — API: Buscador de Recetas por Ingredientes de Nevera
 * Endpoint: GET /api/search_by_ingredients.php?ingredients=8,10,13&ignore_pantry=1&meal_slot=all&season=primavera
 */

declare(strict_types=1);

require_once __DIR__ . '/../config/db.php';

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    sendJsonResponse(['ok' => true]);
}

try {
    $pdo = getDbConnection();

    $rawIngredients = trim((string)($_GET['ingredients'] ?? ''));
    $selectedIds = [];
    if ($rawIngredients !== '') {
        foreach (explode(',', $rawIngredients) as $idStr) {
            $val = (int)trim($idStr);
            if ($val > 0) {
                $selectedIds[] = $val;
            }
        }
    }

    if (empty($selectedIds)) {
        sendJsonResponse([
            'ok' => true,
            'total' => 0,
            'results' => []
        ]);
    }

    $ignorePantry = isset($_GET['ignore_pantry']) ? (int)$_GET['ignore_pantry'] === 1 : true;
    $mealSlot = strtolower(trim((string)($_GET['meal_slot'] ?? 'all')));
    $season = strtolower(trim((string)($_GET['season'] ?? 'all')));

    // Ingredientes básicos de despensa mediterránea (AOVE, Ajo, Caldo verduras, Pimentón)
    $pantryBasicIds = [9, 11, 46, 47];

    // Consultar todas las recetas e ingredientes
    $sql = "
        SELECT 
            r.id AS recipe_id,
            r.slug,
            r.name AS recipe_name,
            r.category,
            r.meal_slot,
            r.seasons,
            r.kcal,
            r.protein_g,
            r.carbs_g,
            r.fat_g,
            r.prep_minutes,
            r.cooking_method,
            r.image_url,
            r.youtube_url,
            r.chef_tip,
            r.batch_prep_tip,
            ri.ingredient_id,
            ri.amount_per_diner,
            i.name AS ingredient_name,
            i.unit,
            i.aisle
        FROM recipes r
        INNER JOIN recipe_ingredients ri ON r.id = ri.recipe_id
        INNER JOIN ingredients i ON ri.ingredient_id = i.id
        WHERE 1=1
    ";

    $params = [];
    if ($mealSlot !== 'all' && in_array($mealSlot, ['lunch', 'dinner'], true)) {
        $sql .= " AND (r.meal_slot = 'both' OR r.meal_slot = :slot)";
        $params[':slot'] = $mealSlot;
    }

    if ($season !== 'all' && in_array($season, ['primavera', 'verano', 'otono', 'invierno'], true)) {
        $sql .= " AND FIND_IN_SET(:season, r.seasons) > 0";
        $params[':season'] = $season;
    }

    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $rows = $stmt->fetchAll();

    // Agrupar por receta
    $grouped = [];
    foreach ($rows as $row) {
        $rid = (int)$row['recipe_id'];
        if (!isset($grouped[$rid])) {
            $grouped[$rid] = [
                'id' => $rid,
                'slug' => $row['slug'],
                'name' => $row['recipe_name'],
                'category' => $row['category'],
                'meal_slot' => $row['meal_slot'],
                'seasons' => $row['seasons'],
                'kcal' => (int)$row['kcal'],
                'protein_g' => (int)$row['protein_g'],
                'carbs_g' => (int)$row['carbs_g'],
                'fat_g' => (int)$row['fat_g'],
                'prep_minutes' => (int)$row['prep_minutes'],
                'cooking_method' => $row['cooking_method'],
                'image_url' => $row['image_url'],
                'youtube_url' => $row['youtube_url'],
                'chef_tip' => $row['chef_tip'],
                'batch_prep_tip' => $row['batch_prep_tip'],
                'ingredients' => []
            ];
        }

        $grouped[$rid]['ingredients'][] = [
            'ingredient_id' => (int)$row['ingredient_id'],
            'name' => $row['ingredient_name'],
            'unit' => $row['unit'],
            'aisle' => $row['aisle'],
            'amount_per_diner' => (float)$row['amount_per_diner']
        ];
    }

    $selectedSet = array_flip($selectedIds);
    $pantrySet = array_flip($pantryBasicIds);

    $results = [];
    foreach ($grouped as $recipe) {
        $matched = [];
        $missing = [];
        $pantry = [];
        $fridgeHits = 0;

        foreach ($recipe['ingredients'] as $ing) {
            $iid = $ing['ingredient_id'];
            $isInFridge = isset($selectedSet[$iid]);
            $isPantry = isset($pantrySet[$iid]);

            if ($isInFridge) {
                $fridgeHits++;
                $matched[] = $ing;
            } elseif ($isPantry && $ignorePantry) {
                $pantry[] = $ing;
                $matched[] = $ing;
            } else {
                $missing[] = $ing;
            }
        }

        if ($fridgeHits === 0) {
            continue;
        }

        $totalReq = count($recipe['ingredients']);
        $matchPct = $totalReq > 0 ? (int)round((count($matched) / $totalReq) * 100) : 0;
        $canCookNow = count($missing) === 0;

        $results[] = [
            'recipe' => $recipe,
            'canCookNow' => $canCookNow,
            'matchPercentage' => $matchPct,
            'fridgeHitsCount' => $fridgeHits,
            'matchedCount' => count($matched),
            'missingCount' => count($missing),
            'totalRequired' => $totalReq,
            'matchedIngredients' => $matched,
            'missingIngredients' => $missing,
            'pantryIngredients' => $pantry
        ];
    }

    // Ordenar resultados: 100% primero, menor faltantes, mayor aciertos nevera, mayor %
    usort($results, function ($a, $b) {
        if ($a['canCookNow'] !== $b['canCookNow']) {
            return $a['canCookNow'] ? -1 : 1;
        }
        if ($a['missingCount'] !== $b['missingCount']) {
            return $a['missingCount'] - $b['missingCount'];
        }
        if ($b['fridgeHitsCount'] !== $a['fridgeHitsCount']) {
            return $b['fridgeHitsCount'] - $a['fridgeHitsCount'];
        }
        return $b['matchPercentage'] - $a['matchPercentage'];
    });

    sendJsonResponse([
        'ok' => true,
        'total' => count($results),
        'results' => $results
    ]);
} catch (Throwable $e) {
    handleApiException($e, 'Error al buscar recetas por ingredientes');
}
