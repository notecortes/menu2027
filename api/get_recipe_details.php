<?php
/**
 * MedDiet Pro — API: Ficha Completa de Receta e Ingredientes Escalados o Catálogo Completo
 * Endpoints:
 * - GET /api/get_recipe_details.php?id=1&diners=4
 * - GET /api/get_recipe_details.php?catalog=1&season=primavera
 */

declare(strict_types=1);

require_once __DIR__ . '/../config/db.php';

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    sendJsonResponse(['ok' => true]);
}

/**
 * Redondeo gastronómico lógico según la unidad y paso de redondeo del ingrediente.
 */
function formatGastronomicAmount(float $rawAmount, string $unit, float $step): float
{
    if ($unit === 'ud' || $unit === 'diente') {
        return round($rawAmount * 2) / 2;
    }
    if ($rawAmount <= 15) {
        return round($rawAmount, 1);
    }
    $effectiveStep = $step > 0 ? $step : 5.0;
    return round($rawAmount / $effectiveStep) * $effectiveStep;
}

try {
    $pdo = getDbConnection();
    $diners = isset($_GET['diners']) ? max(1, min(12, (int)$_GET['diners'])) : 2;

    if (isset($_GET['catalog']) && (int)$_GET['catalog'] === 1) {
        $season = isset($_GET['season']) ? strtolower(trim((string)$_GET['season'])) : '';
        $category = isset($_GET['category']) ? strtolower(trim((string)$_GET['category'])) : '';

        $sql = "SELECT * FROM recipes WHERE 1=1";
        $params = [];

        if ($season !== '' && in_array($season, ['primavera', 'verano', 'otono', 'invierno'], true)) {
            $sql .= " AND FIND_IN_SET(:season, seasons) > 0";
            $params[':season'] = $season;
        }
        if ($category !== '' && $category !== 'all') {
            $sql .= " AND category = :cat";
            $params[':cat'] = $category;
        }

        $sql .= " ORDER BY is_friday_fixed DESC, category ASC, name ASC";
        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);

        sendJsonResponse([
            'ok' => true,
            'total' => $stmt->rowCount(),
            'recipes' => $stmt->fetchAll()
        ]);
    }

    $recipeId = isset($_GET['id']) ? (int)$_GET['id'] : 1;

    $rStmt = $pdo->prepare("SELECT * FROM recipes WHERE id = :id LIMIT 1");
    $rStmt->execute([':id' => $recipeId]);
    $recipe = $rStmt->fetch();

    if (!$recipe) {
        sendJsonResponse(['ok' => false, 'error' => 'Receta no encontrada.'], 404);
    }

    // Ingredientes escalados al número de comensales
    $iStmt = $pdo->prepare("
        SELECT 
            i.id AS ingredient_id,
            i.name,
            i.aisle,
            i.unit,
            i.rounding_step,
            ri.amount_per_diner,
            ri.notes
        FROM recipe_ingredients ri
        INNER JOIN ingredients i ON ri.ingredient_id = i.id
        WHERE ri.recipe_id = :id
        ORDER BY i.aisle ASC, i.name ASC
    ");
    $iStmt->execute([':id' => $recipeId]);
    $rawIngredients = $iStmt->fetchAll();

    $scaledIngredients = [];
    foreach ($rawIngredients as $ing) {
        $rawTotal = (float)$ing['amount_per_diner'] * $diners;
        $rounded = formatGastronomicAmount($rawTotal, (string)$ing['unit'], (float)$ing['rounding_step']);
        $scaledIngredients[] = [
            'ingredient_id' => (int)$ing['ingredient_id'],
            'name' => $ing['name'],
            'aisle' => $ing['aisle'],
            'unit' => $ing['unit'],
            'amount_per_diner' => (float)$ing['amount_per_diner'],
            'scaled_amount' => $rounded,
            'notes' => $ing['notes']
        ];
    }

    // Pasos de preparación con temporizadores
    $sStmt = $pdo->prepare("
        SELECT step_number, instruction, timer_seconds
        FROM recipe_steps
        WHERE recipe_id = :id
        ORDER BY step_number ASC
    ");
    $sStmt->execute([':id' => $recipeId]);
    $steps = $sStmt->fetchAll();

    sendJsonResponse([
        'ok' => true,
        'diners' => $diners,
        'recipe' => $recipe,
        'ingredients' => $scaledIngredients,
        'steps' => $steps
    ]);
} catch (Throwable $e) {
    sendJsonResponse(['ok' => false, 'error' => $e->getMessage()], 500);
}
