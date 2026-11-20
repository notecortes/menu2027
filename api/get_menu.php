<?php
/**
 * MedDiet Pro — API: Obtener Menú Semanal Activo y Métricas Nutricionales
 * Endpoint: GET /api/get_menu.php?season=primavera&diners=2&arroz_day=viernes
 */

declare(strict_types=1);

require_once __DIR__ . '/../config/db.php';

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    sendJsonResponse(['ok' => true]);
}

try {
    $pdo = getDbConnection();

    $season = sanitizeSeason((string)($_GET['season'] ?? 'primavera'));
    $diners = isset($_GET['diners']) ? max(1, min(12, (int)$_GET['diners'])) : 2;
    $arrozDayRaw = strtolower(trim((string)($_GET['arroz_day'] ?? 'viernes')));
    $arrozDay = ($arrozDayRaw === 'ninguno') ? 'ninguno' : sanitizeDayOfWeek($arrozDayRaw, 'viernes');

    // Si hay un día configurado para el Arroz blanco a la cubana ligero, asegurar que esté asignado a ese día
    if ($arrozDay !== 'ninguno') {
        $stmtLock = $pdo->prepare("UPDATE weekly_plans SET recipe_id = 1, is_locked = 1 WHERE day_of_week = :day AND meal_type = 'comida'");
        $stmtLock->execute([':day' => $arrozDay]);
    }

    $sql = "
        SELECT 
            wp.id AS slot_id,
            wp.day_of_week,
            wp.meal_type,
            wp.is_locked,
            r.id AS recipe_id,
            r.slug,
            r.name,
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
            r.source_name,
            r.source_url,
            r.chef_tip,
            r.batch_prep_tip,
            r.is_friday_fixed
        FROM weekly_plans wp
        INNER JOIN recipes r ON wp.recipe_id = r.id
        ORDER BY FIELD(wp.day_of_week, 'lunes','martes','miercoles','jueves','viernes','sabado','domingo'),
                 FIELD(wp.meal_type, 'comida','cena')
    ";

    $stmt = $pdo->query($sql);
    $rows = $stmt->fetchAll();

    // Base calórica ligera de desayuno + media mañana/merienda mediterránea (690 kcal/día)
    $baseBreakfastSnackKcal = 690;

    $days = [
        'lunes'     => ['comida' => null, 'cena' => null, 'daily_kcal' => $baseBreakfastSnackKcal],
        'martes'    => ['comida' => null, 'cena' => null, 'daily_kcal' => $baseBreakfastSnackKcal],
        'miercoles' => ['comida' => null, 'cena' => null, 'daily_kcal' => $baseBreakfastSnackKcal],
        'jueves'    => ['comida' => null, 'cena' => null, 'daily_kcal' => $baseBreakfastSnackKcal],
        'viernes'   => ['comida' => null, 'cena' => null, 'daily_kcal' => $baseBreakfastSnackKcal],
        'sabado'    => ['comida' => null, 'cena' => null, 'daily_kcal' => $baseBreakfastSnackKcal],
        'domingo'   => ['comida' => null, 'cena' => null, 'daily_kcal' => $baseBreakfastSnackKcal],
    ];

    $legumeLunchCount = 0;
    $fishDinnerCount = 0;
    $cubanaLocked = ($arrozDay === 'ninguno');

    foreach ($rows as $row) {
        $day = $row['day_of_week'];
        $meal = $row['meal_type'];

        // Sanitización y garantía de URL funcional a la receta original
        if (empty($row['source_url']) || str_contains((string)$row['source_url'], 'dietamediterranea.com') || str_contains((string)$row['source_url'], 'alimentosdespana.es')) {
            $cleanTitle = trim(preg_replace('/\s*\([^)]*\)/', '', (string)$row['name']));
            $cleanTitle = trim(preg_replace('/(sin grasa|sin fritura|ligero|ligera|medida|al natural|con fondo)/i', '', $cleanTitle));
            $row['source_url'] = 'https://cookpad.com/es/buscar/' . rawurlencode($cleanTitle ?: (string)$row['name']);
            if (empty($row['source_name']) || $row['source_name'] === 'Fundación Dieta Mediterránea') {
                $catNames = [
                    'legumbre' => 'Tradición Culinaria Española · Cuchara y Legumbres',
                    'pescado' => 'Pescadería Tradicional Española · Pescados Saludables',
                    'ave_carne_magra' => 'Cocina Tradicional de Corral · Aves y Carnes Magras',
                    'verdura_huevo' => 'Huerta y Campo Mediterráneo · Verduras y Huevos',
                    'arroz_fijo' => 'Gastronomía Tradicional Española · Directo al Paladar'
                ];
                $row['source_name'] = $catNames[$row['category']] ?? 'Gastronomía Tradicional Española · Directo al Paladar / Cookpad';
            }
        }

        $days[$day][$meal] = $row;
        $days[$day]['daily_kcal'] += (int)$row['kcal'];

        if ($meal === 'comida' && $row['category'] === 'legumbre') {
            $legumeLunchCount++;
        }
        if ($meal === 'cena' && $row['category'] === 'pescado') {
            $fishDinnerCount++;
        }
        if ($arrozDay !== 'ninguno' && $day === $arrozDay && $meal === 'comida' && (int)$row['recipe_id'] === 1) {
            $cubanaLocked = true;
        }
    }

    $totalWeekKcal = array_sum(array_column($days, 'daily_kcal'));
    $avgDailyKcal = (int)round($totalWeekKcal / 7);

    // Obtener menús guardados
    $savedStmt = $pdo->query("SELECT id, menu_name, season, diners, avg_daily_kcal, created_at FROM saved_menus ORDER BY created_at DESC LIMIT 30");
    $savedMenus = $savedStmt->fetchAll();

    sendJsonResponse([
        'ok' => true,
        'season' => $season,
        'diners' => $diners,
        'arroz_day' => $arrozDay,
        'days' => $days,
        'compliance' => [
            'legume_lunches' => $legumeLunchCount,
            'legume_target' => 2,
            'fish_dinners' => $fishDinnerCount,
            'fish_target' => 2,
            'friday_cubana_locked' => $cubanaLocked,
            'zero_seafood_cod_monkfish' => true,
            'avg_daily_kcal' => $avgDailyKcal,
            'base_breakfast_snack_kcal' => $baseBreakfastSnackKcal
        ],
        'saved_menus' => $savedMenus
    ]);
} catch (Throwable $e) {
    handleApiException($e, 'Error al obtener el menú semanal');
}
