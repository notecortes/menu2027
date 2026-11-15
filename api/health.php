<?php
/**
 * MedDiet Pro — API: Diagnóstico de Salud, Seguridad y Optimización en Hosting Compartido / Docker
 * Endpoint: GET /api/health.php
 */

declare(strict_types=1);

require_once __DIR__ . '/../config/db.php';

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    sendJsonResponse(['ok' => true]);
}

$checks = [
    'php_version'       => PHP_VERSION,
    'php_8_compatible'  => version_compare(PHP_VERSION, '8.0.0', '>='),
    'pdo_mysql_loaded'  => extension_loaded('pdo_mysql'),
    'json_loaded'       => extension_loaded('json'),
    'mbstring_loaded'   => extension_loaded('mbstring'),
    'zlib_gzip_loaded'  => extension_loaded('zlib'),
    'environment'       => IS_PRODUCTION_HOSTING ? 'shared_hosting' : 'docker_local',
    'db_connected'      => false,
    'recipes_count'     => 0,
    'ingredients_count' => 0
];

try {
    $pdo = getDbConnection();
    $checks['db_connected'] = true;
    $checks['recipes_count'] = (int)$pdo->query("SELECT COUNT(*) FROM recipes")->fetchColumn();
    $checks['ingredients_count'] = (int)$pdo->query("SELECT COUNT(*) FROM ingredients")->fetchColumn();
} catch (Throwable $e) {
    $checks['db_connected'] = false;
    $checks['db_note'] = 'Modo híbrido activo (Motor Vanilla ES6+ en cliente con 200 recetas)';
}

sendJsonResponse([
    'ok' => true,
    'app' => 'MedDiet Pro',
    'status' => 'healthy',
    'checks' => $checks
]);
