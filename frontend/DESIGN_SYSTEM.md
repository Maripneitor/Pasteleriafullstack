# La Fiesta - Design System

## Principios
* **Consistencia:** Usar siempre los tokens definidos, NUNCA colores hardcodeados.
* **Accesibilidad:** Contraste AA, focus visible.
* **Tematización:** Soporte nativo para Light y Dark mode mediante variables CSS.
* **Regla de oro:** Prohibido usar `bg-white`, `bg-gray-*`, `text-gray-*`. Usar siempre tokens semánticos (`bg-surface`, `text-text-main`, etc.).

## Tokens (Tailwind)
* **Fondos:** `bg-app` (fondo general), `bg-surface` (tarjetas, modales, header, sidebar).
* **Bordes:** `border-border`.
* **Texto:** `text-text-main` (principal), `text-text-muted` (secundario).
* **Marca:** `text-brand-primary`, `bg-brand-primary` (Rosa), `text-brand-secondary` (Violeta).
* **Semánticos:** `text-semantic-success` (Éxito/Verde), `text-semantic-warning` (Alerta/Naranja), `text-semantic-error` (Error/Rojo), `text-semantic-info` (Info/Azul).

## Componentes Base (`frontend/src/components/ui/`)
* `Button`: Variantes (primary, secondary, destructive, ghost, outline) y tamaños.
* `Card`: Contenedor base con padding y estilos surface.
* `Table`: Tablas de datos consistentes.
* `Badge`: Etiquetas de estado (success, warning, error, info).
* `EmptyState`: Para listas o resultados vacíos (con icono y CTA opcional).
* `Skeleton`: Para estados de carga (loading) evitando pantallas blancas.
* `KpiCard`: Tarjetas de métricas con botón (👁️) para ocultar montos sensibles (pensado para el rol de Dueño).
