<?php
/**
 * MedDiet Pro — Enrutador Raíz para Docker y Hosting Compartido (cPanel / Plesk / Hostinger / LiteSpeed)
 *
 * Carga la interfaz web principal de forma nativa. Si en el servidor no se ha subido
 * la carpeta assets/ en la raíz pero sí existe public/assets/, ajusta automáticamente
 * las rutas relativas para evitar errores 404 en navegadores.
 */

declare(strict_types=1);

$hasRootAssets = is_dir(__DIR__ . '/assets');

if (!$hasRootAssets && is_dir(__DIR__ . '/public/assets')) {
    ob_start();
    require __DIR__ . '/public/index.php';
    $html = (string)ob_get_clean();
    $html = str_replace('href="assets/', 'href="public/assets/', $html);
    $html = str_replace('src="assets/', 'src="public/assets/', $html);
    echo $html;
} else {
    require_once __DIR__ . '/public/index.php';
}
