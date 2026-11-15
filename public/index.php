<?php
/**
 * MedDiet Pro — Punto de Entrada Principal (LAMP + Vanilla JS ES6+)
 * 100% compatible con servidores compartidos (cPanel, Plesk, Hostinger, Raiola) y Docker (puerto 6666).
 */
declare(strict_types=1);
?><!doctype html>
<html lang="es" data-theme="light">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>MedDiet Pro — Planificador Mediterráneo Hipocalórico (200 Recetas)</title>
    <meta name="description" content="Aplicación web profesional (LAMP + Vanilla JS ES6+) con 200 recetas mediterráneas españolas hipocalóricas verificadas, personalización de días, generador de PDF apaisado para nevera y recetario paso a paso, favoritos y copias de seguridad." />
    <meta property="og:title" content="MedDiet Pro — Planificador Mediterráneo Hipocalórico (200 Recetas)" />
    <meta property="og:description" content="Aplicación web profesional (LAMP + Vanilla JS ES6+) con 200 recetas mediterráneas españolas hipocalóricas verificadas, personalización de días, generador de PDF apaisado para nevera y recetario paso a paso, favoritos y copias de seguridad." />
    <meta property="og:type" content="website" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="theme-color" content="#3A5F32" />
    <link rel="manifest" href="manifest.webmanifest" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,600;9..144,700&family=JetBrains+Mono:wght@500;700&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />
    <link rel="stylesheet" href="assets/css/styles.css" />
  </head>
  <body>
    <header class="top-header">
      <div class="top-header-inner">
        <button type="button" class="brand-wordmark" data-nav-view="planner">
          MedDiet Pro
        </button>

        <nav class="primary-nav" aria-label="Navegación principal">
          <button type="button" class="nav-link is-active" data-nav-view="planner" aria-current="page">
            Planificador
          </button>
          <button type="button" class="nav-link" data-nav-view="catalog">
            Recetario (200)
          </button>
          <button type="button" class="nav-link" data-nav-view="shopping">
            Lista de la Compra
          </button>
          <button type="button" class="nav-link" data-nav-view="batch">
            Batch Cooking
          </button>
        </nav>

        <div class="header-actions">
          <button type="button" class="btn-secondary" id="theme-toggle-btn" aria-label="Cambiar a modo oscuro">
            Modo Oscuro
          </button>
          <button type="button" class="btn-primary" id="open-saved-menus-btn">
            Guardar Menú
          </button>
        </div>
      </div>
    </header>

    <main class="workspace-container">
      <section class="hero-workspace-bar" aria-label="Configuración del plan semanal">
        <div class="workspace-title-block">
          <p class="workspace-kicker">Nutrición Clínica Española · 200 Recetas Verificadas · Déficit Calórico Saludable (1.350 – 1.600 kcal/día)</p>
          <h1>Planificación Semanal Mediterránea Hipocalórica</h1>
          <p class="workspace-subtitle">
            200 recetas caseras tradicionales de España (&lt; 35 min), sin platos repetidos en la semana, con días configurables para legumbres, pescado y arroz a la cubana, PDF apaisado de nevera y 0% marisco, bacalao ni rape.
          </p>
        </div>

        <div class="controls-cluster">
          <div class="segmented-group" role="group" aria-label="Estación del año">
            <button type="button" class="seg-btn is-active" data-season-btn="primavera" aria-pressed="true">Primavera</button>
            <button type="button" class="seg-btn" data-season-btn="verano" aria-pressed="false">Verano</button>
            <button type="button" class="seg-btn" data-season-btn="otono" aria-pressed="false">Otoño</button>
            <button type="button" class="seg-btn" data-season-btn="invierno" aria-pressed="false">Invierno</button>
          </div>

          <div class="diners-stepper" role="group" aria-label="Número de comensales">
            <span class="diners-label">Comensales:</span>
            <button type="button" class="stepper-btn" id="diners-dec-btn" aria-label="Reducir comensales">−</button>
            <span class="diners-count tabular-nums" id="diners-count-display">2</span>
            <button type="button" class="stepper-btn" id="diners-inc-btn" aria-label="Aumentar comensales">+</button>
          </div>

          <button type="button" class="btn-secondary" id="regenerate-week-btn">
            Generar Nueva Semana
          </button>
        </div>
      </section>

      <section id="view-planner" class="view-section is-active" aria-label="Calendario semanal">
        <div class="planner-utility-bar" aria-label="Herramientas de personalización, impresión PDF y copias de seguridad">
          <div class="utility-summary-text" id="active-preferences-summary">
            <strong>Distribución activa:</strong> Arroz a la cubana (Viernes) · Legumbres (Martes, Jueves) · Pescado (Martes, Jueves) · 0 repeticiones semanales
          </div>
          <div class="utility-actions-group">
            <button type="button" class="btn-secondary" id="open-preferences-btn">
              Configurar Días y Gustos
            </button>
            <button type="button" class="btn-secondary" id="open-clinical-calc-btn">
              Calculadora Clínica y Macros
            </button>
            <button type="button" class="btn-secondary" id="open-fridge-pdf-btn">
              PDF Calendario Nevera (Apaisado)
            </button>
            <button type="button" class="btn-secondary" id="open-booklet-pdf-btn">
              PDF Recetas Paso a Paso
            </button>
            <button type="button" class="btn-secondary" id="open-backup-modal-btn">
              Backups y Favoritos
            </button>
          </div>
        </div>

        <div class="nutrition-summary-strip" aria-label="Resumen de reglas nutricionales">
          <div class="metric-cell">
            <span class="metric-title">Balance Diario Medio</span>
            <span class="metric-value tabular-nums" id="metric-avg-kcal">1415 kcal / día</span>
            <span class="metric-sub">Objetivo hipocalórico pautado</span>
          </div>
          <div class="metric-cell">
            <span class="metric-title">Cuota de Legumbres</span>
            <span class="metric-value tabular-nums" id="metric-legumes">2 de 2 comidas</span>
            <span class="metric-sub" id="metric-legumes-sub">Martes y Jueves (mediodía)</span>
          </div>
          <div class="metric-cell">
            <span class="metric-title">Cuota de Pescado</span>
            <span class="metric-value tabular-nums" id="metric-fish">2 de 2 cenas</span>
            <span class="metric-sub" id="metric-fish-sub">Martes y Jueves (noche)</span>
          </div>
          <div class="metric-cell">
            <span class="metric-title">Arroz a la Cubana Ligero</span>
            <span class="metric-value" id="metric-friday">Viernes mediodía</span>
            <span class="metric-sub" id="metric-friday-sub">Día configurable por comensal</span>
          </div>
          <div class="metric-cell">
            <span class="metric-title">Catálogo y Exclusiones</span>
            <span class="metric-value" id="metric-exclusions">200 Recetas · 0% Marisco</span>
            <span class="metric-sub">Sin bacalao, sin rape, sin repetición</span>
          </div>
        </div>

        <div class="mobile-day-strip" id="mobile-day-tabs" aria-label="Seleccionar día de la semana"></div>
        <div class="weekly-grid" id="weekly-planner-grid"></div>
      </section>

      <section id="view-catalog" class="view-section" aria-label="Catálogo de 200 recetas españolas">
        <div class="section-toolbar">
          <div class="segmented-group" role="group" aria-label="Filtrar por categoría gastronómica" style="flex-wrap: wrap;">
            <button type="button" class="seg-btn is-active" data-catalog-cat="all">Todas (200)</button>
            <button type="button" class="seg-btn" data-catalog-cat="legumbre">Legumbres (44)</button>
            <button type="button" class="seg-btn" data-catalog-cat="pescado">Pescados Permitidos (50)</button>
            <button type="button" class="seg-btn" data-catalog-cat="ave_carne_magra">Aves y Carnes Magras (52)</button>
            <button type="button" class="seg-btn" data-catalog-cat="verdura_huevo">Huerta y Huevos (53)</button>
            <button type="button" class="seg-btn" data-catalog-cat="favorites">★ Mis Favoritas</button>
          </div>

          <div style="display: flex; align-items: center; gap: 0.75rem; flex-wrap: wrap;">
            <span class="slot-meta-line tabular-nums" id="catalog-count-label">200 recetas verificadas</span>
            <label for="catalog-search-input" class="slot-meta-line" style="position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0,0,0,0);">Buscar receta</label>
            <input
              type="search"
              id="catalog-search-input"
              class="search-input"
              placeholder="Buscar lentejas, merluza, pisto, pavo, gazpacho..."
            />
          </div>
        </div>

        <div class="sort-bar" aria-label="Ordenar recetas del catálogo">
          <span class="slot-meta-line"><strong>Ordenar las 200 recetas por:</strong></span>
          <div class="sort-options-group">
            <button type="button" class="sort-chip is-active" data-catalog-sort="recommended">Recomendadas</button>
            <button type="button" class="sort-chip" data-catalog-sort="rating">Más buenas (★ Valoración)</button>
            <button type="button" class="sort-chip" data-catalog-sort="easiest">Más fáciles</button>
            <button type="button" class="sort-chip" data-catalog-sort="fastest">Menos tiempo (rápidas)</button>
            <button type="button" class="sort-chip" data-catalog-sort="kcal">Menos calorías</button>
          </div>
        </div>

        <div class="catalog-grid" id="catalog-recipes-grid"></div>
      </section>

      <section id="view-shopping" class="view-section" aria-label="Lista de la compra semanal">
        <div class="section-toolbar">
          <div>
            <h2 class="aisle-title" style="font-size: 1.25rem;">Lista de la Compra Unificada por Pasillos</h2>
            <p class="slot-meta-line tabular-nums" id="shopping-summary-meta">
              Calculando suma exacta de las 14 comidas semanales...
            </p>
          </div>

          <div style="display: flex; flex-wrap: wrap; gap: 0.6rem;">
            <button type="button" class="btn-secondary" id="toggle-pantry-basics-btn" aria-pressed="false">
              Ocultar básicos de despensa (Sal, AOVE, Ajo)
            </button>
            <button type="button" class="btn-primary" id="copy-whatsapp-btn">
              Copiar lista para WhatsApp
            </button>
            <button type="button" class="btn-secondary" id="print-shopping-btn">
              Imprimir Lista
            </button>
            <button type="button" class="btn-ghost" id="clear-checked-shopping-btn">
              Desmarcar todo
            </button>
          </div>
        </div>

        <form id="add-custom-shopping-form" class="sort-bar" style="margin-bottom: 1.15rem; gap: 0.65rem;" aria-label="Añadir artículo personalizado a la lista de la compra">
          <label for="custom-shopping-input" class="slot-meta-line"><strong>Añadir extra o producto de desayuno/hogar:</strong></label>
          <div style="display: flex; flex-wrap: wrap; gap: 0.5rem; flex: 1;">
            <input
              type="text"
              id="custom-shopping-input"
              class="search-input"
              style="flex: 1; min-width: 220px;"
              placeholder="Ej. Yogur natural 0%, Fruta de temporada, Café en grano, Papel de horno..."
            />
            <button type="submit" class="btn-secondary">
              + Añadir a mi compra
            </button>
          </div>
        </form>

        <div class="shopping-grid" id="shopping-aisles-grid"></div>
      </section>

      <section id="view-batch" class="view-section" aria-label="Asistente de Batch Cooking Dominical">
        <div class="section-toolbar">
          <div>
            <h2 class="aisle-title" style="font-size: 1.25rem;">Plan Dominical de Batch Cooking (60 – 90 min)</h2>
            <p class="slot-meta-line">
              Secuencia optimizada de fuegos y horno generada dinámicamente a partir de los 14 platos de tu semana actual.
            </p>
          </div>
        </div>

        <div class="batch-timeline" id="batch-cooking-timeline"></div>
      </section>
    </main>

    <section id="printable-fridge-sheet" class="print-only-sheet" aria-hidden="true"></section>
    <section id="printable-recipes-booklet" class="print-only-sheet" aria-hidden="true"></section>

    <nav class="mobile-bottom-nav" aria-label="Navegación móvil">
      <button type="button" class="mobile-nav-btn is-active" data-nav-view="planner">
        <span>Planificador</span>
      </button>
      <button type="button" class="mobile-nav-btn" data-nav-view="catalog">
        <span>Recetario</span>
      </button>
      <button type="button" class="mobile-nav-btn" data-nav-view="shopping">
        <span>Compra</span>
      </button>
      <button type="button" class="mobile-nav-btn" data-nav-view="batch">
        <span>Batch Cooking</span>
      </button>
    </nav>

    <div class="modal-backdrop" id="recipe-detail-modal" role="dialog" aria-modal="true" aria-labelledby="recipe-modal-title">
      <div class="modal-dialog">
        <header class="modal-header">
          <h2 class="modal-title" id="recipe-modal-title">Ficha de Receta</h2>
          <button type="button" class="btn-secondary" data-close-modal="true" aria-label="Cerrar ficha de receta">
            Cerrar
          </button>
        </header>
        <div class="modal-body" id="recipe-modal-body"></div>
      </div>
    </div>

    <div class="modal-backdrop" id="alternatives-modal" role="dialog" aria-modal="true" aria-labelledby="alternatives-modal-title">
      <div class="modal-dialog is-wide">
        <header class="modal-header">
          <div>
            <h2 class="modal-title" id="alternatives-modal-title">Alternativas Compatibles</h2>
            <p class="slot-meta-line" id="alternatives-modal-subtitle"></p>
          </div>
          <button type="button" class="btn-secondary" data-close-modal="true" aria-label="Cerrar alternativas">
            Cerrar
          </button>
        </header>
        <div class="modal-body">
          <div class="sort-bar" style="margin-bottom: 0;">
            <div class="sort-options-group">
              <span class="slot-meta-line" style="margin-right: 0.3rem;"><strong>Ordenar por:</strong></span>
              <button type="button" class="sort-chip is-active" data-alt-sort="recommended">Recomendadas</button>
              <button type="button" class="sort-chip" data-alt-sort="rating">Más buenas ★</button>
              <button type="button" class="sort-chip" data-alt-sort="easiest">Más fáciles</button>
              <button type="button" class="sort-chip" data-alt-sort="fastest">Menos tiempo</button>
              <button type="button" class="sort-chip" data-alt-sort="kcal">Menos kcal</button>
            </div>
            <input
              type="search"
              id="alternatives-search-input"
              class="search-input"
              style="min-width: 220px; padding: 0.4rem 0.75rem; font-size: 0.82rem;"
              placeholder="Filtrar plato o ingrediente..."
            />
          </div>
          <div id="alternatives-modal-list"></div>
        </div>
      </div>
    </div>

    <div class="modal-backdrop" id="cooking-mode-modal" role="dialog" aria-modal="true" aria-labelledby="cooking-modal-title">
      <div class="modal-dialog">
        <header class="modal-header">
          <h2 class="modal-title" id="cooking-modal-title">Modo Cocina Paso a Paso</h2>
          <button type="button" class="btn-secondary" data-close-modal="true" aria-label="Salir del modo cocina">
            Salir
          </button>
        </header>
        <div class="modal-body" id="cooking-modal-body"></div>
      </div>
    </div>

    <div class="modal-backdrop" id="saved-menus-modal" role="dialog" aria-modal="true" aria-labelledby="saved-menus-modal-title">
      <div class="modal-dialog">
        <header class="modal-header">
          <div>
            <h2 class="modal-title" id="saved-menus-modal-title">Menús Semanales Guardados</h2>
            <p class="slot-meta-line">Guarda tu planificación actual en MySQL / navegador o recupera un menú anterior con un clic.</p>
          </div>
          <button type="button" class="btn-secondary" data-close-modal="true" aria-label="Cerrar ventana de menús guardados">
            Cerrar
          </button>
        </header>
        <div class="modal-body">
          <form id="save-menu-form" style="display: flex; flex-direction: column; gap: 0.65rem;">
            <label for="save-menu-name-input" class="aisle-title" style="font-size: 0.92rem;">
              Guardar el menú de esta semana con nombre personalizado:
            </label>
            <div style="display: flex; gap: 0.65rem; flex-wrap: wrap;">
              <input
                type="text"
                id="save-menu-name-input"
                class="search-input"
                style="flex: 1;"
                placeholder="Ej. Semana Definición Primavera (-0,8 kg)"
              />
              <button type="submit" class="btn-primary">
                Guardar en Base de Datos
              </button>
            </div>
            <p id="save-menu-error" class="slot-rule-tag is-fixed-friday" style="display: none;"></p>
          </form>

          <div>
            <h3 class="aisle-title" style="margin-bottom: 0.65rem;">Biblioteca de Menús Guardados</h3>
            <div class="steps-list" id="saved-menus-list"></div>
          </div>
        </div>
      </div>
    </div>

    <div class="modal-backdrop" id="preferences-modal" role="dialog" aria-modal="true" aria-labelledby="preferences-modal-title">
      <div class="modal-dialog is-wide">
        <header class="modal-header">
          <div>
            <h2 class="modal-title" id="preferences-modal-title">Configurar Días de la Semana y Preferencias</h2>
            <p class="slot-meta-line">Elige qué días quieres tomar el Arroz a la cubana, las Legumbres y el Pescado, e indica ingredientes deseados o a evitar.</p>
          </div>
          <button type="button" class="btn-secondary" data-close-modal="true" aria-label="Cerrar configuración">
            Cerrar
          </button>
        </header>
        <div class="modal-body" id="preferences-modal-body"></div>
      </div>
    </div>

    <div class="modal-backdrop" id="pdf-preview-modal" role="dialog" aria-modal="true" aria-labelledby="pdf-modal-title">
      <div class="modal-dialog is-wide" style="max-width: 1120px;">
        <header class="modal-header">
          <div>
            <h2 class="modal-title" id="pdf-modal-title">Generador de PDF Listo para Imprimir</h2>
            <p class="slot-meta-line" id="pdf-modal-subtitle"></p>
          </div>
          <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
            <button type="button" class="btn-primary" id="trigger-browser-pdf-print-btn">
              Imprimir / Guardar PDF ahora
            </button>
            <button type="button" class="btn-secondary" id="download-standalone-pdf-html-btn">
              Descargar Documento Imprimible
            </button>
            <button type="button" class="btn-secondary" data-close-modal="true" aria-label="Cerrar vista previa PDF">
              Cerrar
            </button>
          </div>
        </header>
        <div class="modal-body" id="pdf-preview-modal-body"></div>
      </div>
    </div>

    <div class="modal-backdrop" id="backup-modal" role="dialog" aria-modal="true" aria-labelledby="backup-modal-title">
      <div class="modal-dialog is-wide">
        <header class="modal-header">
          <div>
            <h2 class="modal-title" id="backup-modal-title">Backups, Restauración y Platos Favoritos</h2>
            <p class="slot-meta-line">Exporta o importa una copia de seguridad completa con tus opciones, comidas favoritas y menús semanales generados.</p>
          </div>
          <button type="button" class="btn-secondary" data-close-modal="true" aria-label="Cerrar centro de backups">
            Cerrar
          </button>
        </header>
        <div class="modal-body" id="backup-modal-body"></div>
      </div>
    </div>

    <div class="modal-backdrop" id="clinical-calculator-modal" role="dialog" aria-modal="true" aria-labelledby="clinical-modal-title">
      <div class="modal-dialog is-wide">
        <header class="modal-header">
          <div>
            <h2 class="modal-title" id="clinical-modal-title">Calculadora Clínica de Déficit Calórico, IMC y Macronutrientes</h2>
            <p class="slot-meta-line">Ecuación clínica de Mifflin-St Jeor + criterios SEEDO/OMS y auditoría en vivo de proteínas, hidratos y grasas de tu semana.</p>
          </div>
          <button type="button" class="btn-secondary" data-close-modal="true" aria-label="Cerrar calculadora clínica">
            Cerrar
          </button>
        </header>
        <div class="modal-body" id="clinical-modal-body"></div>
      </div>
    </div>

    <div id="app-toast" class="toast-banner" role="status" aria-live="polite"></div>

    <script type="module" src="assets/js/app.js"></script>
  </body>
</html>
