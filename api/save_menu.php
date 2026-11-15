<?php
/**
 * MedDiet Pro — API: Guardado y Recuperación de Menús Semanales en MySQL
 * Soporta:
 * - POST /api/save_menu.php { action: "save", menu_name: "...", season: "...", diners: 2 }
 * - POST /api/save_menu.php { action: "load", menu_id: 1 }
 * - POST /api/save_menu.php { action: "delete", menu_id: 1 }
 */

declare(strict_types=1);

require_once __DIR__ . '/../config/db.php';

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    sendJsonResponse(['ok' => true]);
}

try {
    $pdo = getDbConnection();
    $rawBody = file_get_contents('php://input');
    $input = json_decode($rawBody ?: '{}', true) ?? [];
    $action = $input['action'] ?? 'save';

    if ($action === 'save') {
        $menuName = trim((string)($input['menu_name'] ?? ''));
        if ($menuName === '') {
            sendJsonResponse(['ok' => false, 'error' => 'Por favor, indica un nombre descriptivo para guardar el menú semanal.'], 400);
        }

        $season = strtolower(trim((string)($input['season'] ?? 'primavera')));
        $diners = max(1, min(12, (int)($input['diners'] ?? 2)));

        if (isset($input['plan']) && is_array($input['plan'])) {
            $planMap = $input['plan'];
            $rIds = [];
            foreach ($planMap as $dayMeals) {
                if (is_array($dayMeals)) {
                    if (isset($dayMeals['comida'])) $rIds[] = (int)$dayMeals['comida'];
                    if (isset($dayMeals['cena'])) $rIds[] = (int)$dayMeals['cena'];
                }
            }
            $totalMealsKcal = 0;
            if (count($rIds) > 0) {
                $placeholders = implode(',', array_fill(0, count($rIds), '?'));
                $stmtK = $pdo->prepare("SELECT SUM(kcal) FROM recipes WHERE id IN ($placeholders)");
                $stmtK->execute($rIds);
                $totalMealsKcal = (int)$stmtK->fetchColumn();
            }
            $avgDailyKcal = (int)round(($totalMealsKcal / 7) + 690);
        } else {
            $wpStmt = $pdo->query("
                SELECT wp.day_of_week, wp.meal_type, wp.recipe_id, r.kcal
                FROM weekly_plans wp
                INNER JOIN recipes r ON wp.recipe_id = r.id
            ");
            $rows = $wpStmt->fetchAll();

            $planMap = [];
            $totalMealsKcal = 0;
            foreach ($rows as $r) {
                $d = $r['day_of_week'];
                $m = $r['meal_type'];
                if (!isset($planMap[$d])) {
                    $planMap[$d] = [];
                }
                $planMap[$d][$m] = (int)$r['recipe_id'];
                $totalMealsKcal += (int)$r['kcal'];
            }
            $avgDailyKcal = (int)round(($totalMealsKcal / 7) + 690);
        }

        $ins = $pdo->prepare("
            INSERT INTO saved_menus (menu_name, season, diners, plan_json, avg_daily_kcal)
            VALUES (:name, :season, :diners, :json, :kcal)
        ");
        $ins->execute([
            ':name'   => $menuName,
            ':season' => $season,
            ':diners' => $diners,
            ':json'   => json_encode($planMap, JSON_UNESCAPED_UNICODE),
            ':kcal'   => $avgDailyKcal
        ]);

        sendJsonResponse([
            'ok' => true,
            'saved_id' => (int)$pdo->lastInsertId(),
            'message' => 'Menú semanal guardado en MySQL correctamente.'
        ]);
    }

    if ($action === 'load') {
        $menuId = (int)($input['menu_id'] ?? 0);
        $stmt = $pdo->prepare("SELECT * FROM saved_menus WHERE id = :id LIMIT 1");
        $stmt->execute([':id' => $menuId]);
        $saved = $stmt->fetch();

        if (!$saved) {
            sendJsonResponse(['ok' => false, 'error' => 'Menú guardado no encontrado.'], 404);
        }

        $planMap = json_decode((string)$saved['plan_json'], true) ?? [];
        $upd = $pdo->prepare("UPDATE weekly_plans SET recipe_id = :rid, is_locked = :lck WHERE day_of_week = :day AND meal_type = :meal");

        foreach ($planMap as $day => $meals) {
            foreach ($meals as $mealType => $rid) {
                $upd->execute([
                    ':rid'  => (int)$rid,
                    ':lck'  => 0,
                    ':day'  => $day,
                    ':meal' => $mealType
                ]);
            }
        }

        sendJsonResponse([
            'ok' => true,
            'season' => $saved['season'],
            'diners' => (int)$saved['diners'],
            'menu_name' => $saved['menu_name'],
            'message' => 'Menú "' . $saved['menu_name'] . '" cargado en el planificador.'
        ]);
    }

    if ($action === 'delete') {
        $menuId = (int)($input['menu_id'] ?? 0);
        $del = $pdo->prepare("DELETE FROM saved_menus WHERE id = :id");
        $del->execute([':id' => $menuId]);
        sendJsonResponse(['ok' => true, 'message' => 'Menú eliminado.']);
    }

    sendJsonResponse(['ok' => false, 'error' => 'Acción no soportada.'], 400);
} catch (Throwable $e) {
    sendJsonResponse(['ok' => false, 'error' => $e->getMessage()], 500);
}
