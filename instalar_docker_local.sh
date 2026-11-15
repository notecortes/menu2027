#!/usr/bin/env bash
# ============================================================================
# MedDiet Pro — Script de Preparación Local y Arranque en Docker (Puerto 6666)
# Restaura automáticamente Dockerfile, .htaccess y .gitignore si se descargaron
# desde el botón superior de AI Studio (que filtra ficheros sin extensión/ocultos).
# ============================================================================
set -e

echo "==> Comprobando archivos de configuración LAMP, Docker y Git..."

if [ ! -f "Dockerfile" ] && [ -f "Dockerfile.txt" ]; then
  cp Dockerfile.txt Dockerfile
  echo "  [OK] Restaurado Dockerfile desde Dockerfile.txt"
fi

if [ ! -f ".htaccess" ] && [ -f "htaccess.conf" ]; then
  cp htaccess.conf .htaccess
  echo "  [OK] Restaurado .htaccess desde htaccess.conf"
fi

if [ ! -f ".gitignore" ] && [ -f "gitignore.txt" ]; then
  cp gitignore.txt .gitignore
  echo "  [OK] Restaurado .gitignore desde gitignore.txt"
fi

echo "==> Levantando contenedores Docker (Web en puerto 6666, phpMyAdmin en 6667)..."
docker compose up -d --build

echo ""
echo "============================================================================"
echo "  MedDiet Pro está corriendo en:  http://localhost:6666"
echo "  phpMyAdmin disponible en:       http://localhost:6667"
echo "============================================================================"
