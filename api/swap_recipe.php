<?php
/**
 * MedDiet Pro — API: Motor de Intercambio de Platos ("Swap Engine")
 * Soporta:
 * - GET  /api/swap_recipe.php?day=martes&meal=comida&season=primavera (Lista todas las alternativas compatibles no repetidas en la semana)
 * - POST /api/swap_recipe.php { action: "quick_swap" | "apply_swap" | "regenerate_week" | "sync_plan", ... }
 */

declare(strict_types=1);

require_once __DIR__ . '/../config/db.php';

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    sendJsonResponse(['ok' => true]);
}

try {
    $pdo = getDbConnection();

    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        $day = strtolower(trim((string)($_GET['day'] ?? 'lunes')));
        $meal = strtolower(trim((string)($_GET['meal'] ?? 'comida')));
        $season = strtolower(trim((string)($_GET['season'] ?? 'primavera')));
        $arrozDay = strtolower(trim((string)($_GET['arroz_day'] ?? 'viernes')));

        if ($arrozDay !== 'ninguno' && $day === $arrozDay && $meal === 'comida') {
            sendJsonResponse([
                'ok' => false,
                'locked' => true,
                'message' => 'Este día a mediodía está reservado a "Arroz blanco a la cubana (versión ligera)".'
            ], 400);
        }

        // Consultar qué receta y categoría ocupa actualmente ese hueco
        $currStmt = $pdo->prepare("
            SELECT wp.recipe_id, r.category, r.name
            FROM weekly_plans wp
            INNER JOIN recipes r ON wp.recipe_id = r.id
            WHERE wp.day_of_week = :day AND wp.meal_type = :meal
            LIMIT 1
        ");
        $currStmt->execute([':day' => $day, ':meal' => $meal]);
        $currentSlot = $currStmt->fetch();

        if (!$currentSlot) {
            sendJsonResponse(['ok' => false, 'error' => 'Hueco semanal no encontrado.'], 404);
        }

        // Obtener los IDs ya usados en el resto de la semana para evitar platos repetidos
        $usedStmt = $pdo->prepare("
            SELECT recipe_id
            FROM weekly_plans
            WHERE NOT (day_of_week = :day AND meal_type = :meal)
        ");
        $usedStmt->execute([':day' => $day, ':meal' => $meal]);
        $usedIds = array_map('intval', array_column($usedStmt->fetchAll(), 'recipe_id'));
        $excludeClause = count($usedIds) > 0 ? 'AND id NOT IN (' . implode(',', $usedIds) . ')' : '';

        $targetCategory = $currentSlot['category'];
        $slotFilter = ($meal === 'comida') ? "('lunch','both')" : "('dinner','both')";

        if (($meal === 'comida' && $targetCategory === 'legumbre') || ($meal === 'cena' && $targetCategory === 'pescado')) {
            $altSql = "
                SELECT id, slug, name, category, meal_slot, seasons, kcal, protein_g, carbs_g, fat_g, prep_minutes, cooking_method, image_url, chef_tip,
                       FIND_IN_SET(:season, seasons) AS matches_season
                FROM recipes
                WHERE category = :cat AND is_friday_fixed = 0 $excludeClause
                ORDER BY matches_season DESC, prep_minutes ASC, kcal ASC
            ";
            $altStmt = $pdo->prepare($altSql);
            $altStmt->execute([':season' => $season, ':cat' => $targetCategory]);
        } else {
            $altSql = "
                SELECT id, slug, name, category, meal_slot, seasons, kcal, protein_g, carbs_g, fat_g, prep_minutes, cooking_method, image_url, chef_tip,
                       FIND_IN_SET(:season, seasons) AS matches_season
                FROM recipes
                WHERE category IN ('ave_carne_magra', 'verdura_huevo')
                  AND meal_slot IN $slotFilter
                  AND is_friday_fixed = 0
                  $excludeClause
                ORDER BY matches_season DESC, prep_minutes ASC, kcal ASC
            ";
            $altStmt = $pdo->prepare($altSql);
            $altStmt->execute([':season' => $season]);
        }

        $alternatives = $altStmt->fetchAll();

        sendJsonResponse([
            'ok' => true,
            'day' => $day,
            'meal' => $meal,
            'season' => $season,
            'current_recipe_id' => (int)$currentSlot['recipe_id'],
            'required_category' => $targetCategory,
            'total_alternatives' => count($alternatives),
            'alternatives' => $alternatives
        ]);
    }

    // POST actions
    $rawBody = file_get_contents('php://input');
    $input = json_decode($rawBody ?: '{}', true) ?? [];
    $action = $input['action'] ?? 'quick_swap';
    $season = strtolower(trim((string)($input['season'] ?? 'primavera')));

    if ($action === 'apply_swap') {
        $day = strtolower(trim((string)($input['day'] ?? '')));
        $meal = strtolower(trim((string)($input['meal'] ?? '')));
        $newRecipeId = (int)($input['recipe_id'] ?? 0);

        $upd = $pdo->prepare("UPDATE weekly_plans SET recipe_id = :rid WHERE day_of_week = :day AND meal_type = :meal");
        $upd->execute([':rid' => $newRecipeId, ':day' => $day, ':meal' => $meal]);

        sendJsonResponse(['ok' => true, 'message' => 'Plato actualizado correctamente.', 'recipe_id' => $newRecipeId]);
    }

    if ($action === 'sync_plan' && isset($input['plan']) && is_array($input['plan'])) {
        $upd = $pdo->prepare("UPDATE weekly_plans SET recipe_id = :rid, is_locked = :lck WHERE day_of_week = :day AND meal_type = :meal");
        $arrozDay = strtolower(trim((string)($input['arroz_cubana_day'] ?? 'viernes')));
        foreach ($input['plan'] as $day => $meals) {
            if (!is_array($meals)) continue;
            if (isset($meals['comida'])) {
                $isLocked = ($day === $arrozDay && $arrozDay !== 'ninguno') ? 1 : 0;
                $upd->execute([':rid' => (int)$meals['comida'], ':lck' => $isLocked, ':day' => $day, ':meal' => 'comida']);
            }
            if (isset($meals['cena'])) {
                $upd->execute([':rid' => (int)$meals['cena'], ':lck' => 0, ':day' => $day, ':meal' => 'cena']);
            }
        }
        sendJsonResponse(['ok' => true, 'message' => 'Plan semanal sincronizado en base de datos.']);
    }

    if ($action === 'quick_swap') {
        $day = strtolower(trim((string)($input['day'] ?? '')));
        $meal = strtolower(trim((string)($input['meal'] ?? '')));

        $currStmt = $pdo->prepare("
            SELECT wp.recipe_id, r.category
            FROM weekly_plans wp
            INNER JOIN recipes r ON wp.recipe_id = r.id
            WHERE wp.day_of_week = :day AND wp.meal_type = :meal
        ");
        $currStmt->execute([':day' => $day, ':meal' => $meal]);
        $curr = $currStmt->fetch();

        if (!$curr) {
            sendJsonResponse(['ok' => false, 'error' => 'Hueco no válido.'], 404);
        }

        $usedStmt = $pdo->query("SELECT recipe_id FROM weekly_plans");
        $usedIds = array_map('intval', array_column($usedStmt->fetchAll(), 'recipe_id'));
        $excludeClause = count($usedIds) > 0 ? 'AND id NOT IN (' . implode(',', $usedIds) . ')' : '';

        $cat = $curr['category'];
        $currId = (int)$curr['recipe_id'];
        $slotFilter = ($meal === 'comida') ? "('lunch','both')" : "('dinner','both')";

        if (($meal === 'comida' && $cat === 'legumbre') || ($meal === 'cena' && $cat === 'pescado')) {
            $q = $pdo->prepare("
                SELECT id FROM recipes
                WHERE category = :cat AND is_friday_fixed = 0 $excludeClause
                ORDER BY FIND_IN_SET(:season, seasons) DESC, RAND()
                LIMIT 1
            ");
            $q->execute([':cat' => $cat, ':season' => $season]);
        } else {
            $q = $pdo->prepare("
                SELECT id FROM recipes
                WHERE category IN ('ave_carne_magra', 'verdura_huevo')
                  AND meal_slot IN $slotFilter
                  AND is_friday_fixed = 0
                  $excludeClause
                ORDER BY FIND_IN_SET(:season, seasons) DESC, RAND()
                LIMIT 1
            ");
            $q->execute([':season' => $season]);
        }

        $picked = $q->fetch();
        if ($picked) {
            $upd = $pdo->prepare("UPDATE weekly_plans SET recipe_id = :rid WHERE day_of_week = :day AND meal_type = :meal");
            $upd->execute([':rid' => (int)$picked['id'], ':day' => $day, ':meal' => $meal]);
        }

        sendJsonResponse(['ok' => true, 'new_recipe_id' => (int)($picked['id'] ?? $currId)]);
    }

    if ($action === 'regenerate_week') {
        $arrozDay = strtolower(trim((string)($input['arroz_cubana_day'] ?? 'viernes')));
        $chosenLegumeDays = isset($input['legume_days']) && is_array($input['legume_days'])
            ? $input['legume_days']
            : ['martes', 'jueves'];
        $chosenFishNights = isset($input['fish_nights']) && is_array($input['fish_nights'])
            ? $input['fish_nights']
            : ['martes', 'jueves'];

        $legStmt = $pdo->prepare("SELECT id FROM recipes WHERE category = 'legumbre' ORDER BY FIND_IN_SET(:s, seasons) DESC, RAND() LIMIT 7");
        $legStmt->execute([':s' => $season]);
        $legIds = array_column($legStmt->fetchAll(), 'id');

        $fishStmt = $pdo->prepare("SELECT id FROM recipes WHERE category = 'pescado' ORDER BY FIND_IN_SET(:s, seasons) DESC, RAND() LIMIT 7");
        $fishStmt->execute([':s' => $season]);
        $fishIds = array_column($fishStmt->fetchAll(), 'id');

        $lunchStmt = $pdo->prepare("SELECT id FROM recipes WHERE category IN ('ave_carne_magra','verdura_huevo') AND meal_slot IN ('lunch','both') AND is_friday_fixed = 0 ORDER BY FIND_IN_SET(:s, seasons) DESC, RAND() LIMIT 14");
        $lunchStmt->execute([':s' => $season]);
        $otherLunches = array_column($lunchStmt->fetchAll(), 'id');

        $dinnerStmt = $pdo->prepare("SELECT id FROM recipes WHERE category IN ('ave_carne_magra','verdura_huevo') AND meal_slot IN ('dinner','both') AND is_friday_fixed = 0 ORDER BY FIND_IN_SET(:s, seasons) DESC, RAND() LIMIT 14");
        $dinnerStmt->execute([':s' => $season]);
        $otherDinners = array_column($dinnerStmt->fetchAll(), 'id');

        $allDays = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo'];
        $upd = $pdo->prepare("UPDATE weekly_plans SET recipe_id = :rid, is_locked = :lck WHERE day_of_week = :day AND meal_type = :meal");

        $usedInWeek = ($arrozDay !== 'ninguno') ? [1 => true] : [];
        $pickNonRepeating = function (array $pool, int $fallback) use (&$usedInWeek): int {
            foreach ($pool as $cand) {
                $cid = (int)$cand;
                if (!isset($usedInWeek[$cid])) {
                    $usedInWeek[$cid] = true;
                    return $cid;
                }
            }
            return $fallback;
        };

        foreach ($allDays as $d) {
            if ($d === $arrozDay && $arrozDay !== 'ninguno') {
                $upd->execute([':rid' => 1, ':lck' => 1, ':day' => $d, ':meal' => 'comida']);
            } elseif (in_array($d, $chosenLegumeDays, true)) {
                $rid = $pickNonRepeating($legIds, 2);
                $upd->execute([':rid' => $rid, ':lck' => 0, ':day' => $d, ':meal' => 'comida']);
            } else {
                $rid = $pickNonRepeating($otherLunches, 21);
                $upd->execute([':rid' => $rid, ':lck' => 0, ':day' => $d, ':meal' => 'comida']);
            }

            if (in_array($d, $chosenFishNights, true)) {
                $rid = $pickNonRepeating($fishIds, 11);
                $upd->execute([':rid' => $rid, ':lck' => 0, ':day' => $d, ':meal' => 'cena']);
            } else {
                $rid = $pickNonRepeating($otherDinners, 32);
                $upd->execute([':rid' => $rid, ':lck' => 0, ':day' => $d, ':meal' => 'cena']);
            }
        }

        sendJsonResponse(['ok' => true, 'message' => 'Menú semanal regenerado sin platos repetidos.']);
    }

    sendJsonResponse(['ok' => false, 'error' => 'Acción no reconocida.'], 400);
} catch (Throwable $e) {
    sendJsonResponse(['ok' => false, 'error' => $e->getMessage()], 500);
}
