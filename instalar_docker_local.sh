#!/usr/bin/env bash
# ============================================================================
# MedDiet Pro — Script de Arranque Rápido en Local (Docker Puerto 5566)
# Restaura automáticamente Dockerfile y .htaccess si el exportador ZIP de
# AI Studio omitió archivos sin extensión o empezados por punto.
# ============================================================================
set -e

if [ ! -f "Dockerfile" ] && [ -f "Dockerfile.txt" ]; then
  cp Dockerfile.txt Dockerfile
  echo "[OK] Dockerfile restaurado desde Dockerfile.txt"
fi

if [ ! -f ".htaccess" ] && [ -f "htaccess.conf" ]; then
  cp htaccess.conf .htaccess
  echo "[OK] .htaccess restaurado desde htaccess.conf"
fi

echo "Levantando MedDiet Pro en Docker (Apache + PHP 8.2 + MariaDB 10.6 + phpMyAdmin)..."
docker compose up -d --build
echo ""
echo "=================================================================="
echo " MedDiet Pro disponible en: http://localhost:5566"
echo " phpMyAdmin disponible en:  http://localhost:5567"
echo "=================================================================="
