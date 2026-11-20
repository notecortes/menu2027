<?php
/**
 * MedDiet Pro — API: Lista de la Compra Exacta, Compacta y Agrupada por Pasillos
 * Consulta SQL optimizada: SUM(ri.amount_per_diner * :diners) GROUP BY i.id
 * Endpoint: GET /api/get_shopping_list.php?diners=2
 */

declare(strict_types=1);

require_once __DIR__ . '/../config/db.php';

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    sendJsonResponse(['ok' => true]);
}

function roundShoppingQuantity(float $amount, string $unit, float $step): float
{
    if ($unit === 'ud' || $unit === 'diente') {
        return ceil($amount);
    }
    $effectiveStep = $step > 0 ? $step : 5.0;
    return ceil($amount / $effectiveStep) * $effectiveStep;
}

try {
    $pdo = getDbConnection();
    $diners = isset($_GET['diners']) ? max(1, min(12, (int)$_GET['diners'])) : 2;

    $sql = "
        SELECT 
            i.id AS ingredient_id,
            i.name,
            i.aisle,
            i.unit,
            i.rounding_step,
            SUM(ri.amount_per_diner * :diners) AS raw_total_amount,
            COUNT(DISTINCT wp.id) AS used_in_meals,
            GROUP_CONCAT(DISTINCT r.name SEPARATOR ' · ') AS recipes_using
        FROM weekly_plans wp
        INNER JOIN recipes r ON wp.recipe_id = r.id
        INNER JOIN recipe_ingredients ri ON r.id = ri.recipe_id
        INNER JOIN ingredients i ON ri.ingredient_id = i.id
        GROUP BY i.id, i.name, i.aisle, i.unit, i.rounding_step
        ORDER BY FIELD(i.aisle, 
            'Frutas y Verduras',
            'Pescadería',
            'Carnicería y Aves',
            'Legumbres y Arroces',
            'Huevos y Lácteos',
            'Despensa'
        ), i.name ASC
    ";

    $stmt = $pdo->prepare($sql);
    $stmt->execute([':diners' => $diners]);
    $rows = $stmt->fetchAll();

    $grouped = [
        'Frutas y Verduras'   => [],
        'Pescadería'          => [],
        'Carnicería y Aves'   => [],
        'Legumbres y Arroces' => [],
        'Huevos y Lácteos'    => [],
        'Despensa'            => []
    ];

    $totalItems = 0;
    foreach ($rows as $row) {
        $aisle = $row['aisle'];
        $rounded = roundShoppingQuantity(
            (float)$row['raw_total_amount'],
            (string)$row['unit'],
            (float)$row['rounding_step']
        );

        $item = [
            'ingredient_id'  => (int)$row['ingredient_id'],
            'name'           => $row['name'],
            'aisle'          => $aisle,
            'unit'           => $row['unit'],
            'total_amount'   => $rounded,
            'used_in_meals'  => (int)$row['used_in_meals'],
            'recipes_using'  => $row['recipes_using']
        ];

        $grouped[$aisle][] = $item;
        $totalItems++;
    }

    sendJsonResponse([
        'ok' => true,
        'diners' => $diners,
        'total_items' => $totalItems,
        'aisles' => $grouped
    ]);
} catch (Throwable $e) {
    handleApiException($e, 'Error al generar la lista de la compra');
}
