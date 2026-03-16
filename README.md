# Pastelería La Fiesta - Análisis y Plan de Producto (SaaS B2B)

Este documento es una guía estratégica viva del proyecto. Sirve para evaluar la salud actual de la plataforma, plantear las preguntas correctas para su evolución, y definir las metas técnicas y de negocio a corto y mediano plazo.

---

## 1. El Diagnóstico (¿Qué necesitamos saber del proyecto actual?)

**El propósito principal:**
La plataforma es un SaaS B2B Multi-Tenant diseñado para la gestión operativa y estratégica de pastelerías ("La Fiesta"). Su valor reside en consolidar la captura de pedidos (manual e IA), control de caja, inventario, reportes financieros y gestión de sucursales en un solo lugar. **El propósito sigue intacto y es más relevante que nunca** ante la necesidad de los dueños de escalar de 1 a 100 sucursales sin perder el control.

**Estado de la arquitectura y el código:**
- **Backend:** Se ha migrado exitosamente hacia una **Clean Architecture** (`/src/controllers`, `/services`, `/models`, etc.). La lógica de negocio pesada (parseo de IA, flujos de pedidos) está en servicios, lo cual hace al backend altamente escalable y mantenible.
- **Frontend:** Refactorizado hacia un enfoque modular y basado en el ecosistema React (`/components/ui`, `/components/layout`, `/api`, `/hooks`). Existe un **Design System** robusto con soporte nativo para Modo Oscuro, eliminando el código "espagueti" visual.
- **Seguridad:** Se maneja a través de un RBAC estricto (Roles) y aislamiento Multi-Tenant robusto garantizado por middlewares.

**Rendimiento y cuellos de botella:**
- **Dependencias Externas:** El mayor cuello de botella potencial radica en la latencia de las peticiones a la API de OpenAI (parseo de pedidos por voz/texto) y la generación síncrona de PDFs de alta carga gráfica.
- **Base de Datos:** MySQL gestiona bien la carga actual, pero con el crecimiento de "Modo Chismoso" (Logs de Auditoría en vivo) y múltiples Tenants, las consultas históricas podrían ralentizarse si no se indexan correctamente o se archivan.

**Errores actuales (Bugs y Deuda Técnica):**
- **Estabilidad de WhatsApp:** La sesión de `whatsapp-web.js` puede ser inestable si la conexión del dispositivo principal falla. Requiere monitoreo y auto-reconexión robusta.
- **Manejo de Errores Frontend:** Algunos endpoints aún podrían no manejar correctamente los "Empty States" en la UI cuando falla la red.

---

## 2. Las Preguntas Clave (¿Qué información debemos pedir?)

### 🧑‍💼 Preguntas para los Usuarios (Dueños, Administradores, Cajeros):

1. **Misión Crítica:** *"¿Cuál es la función principal por la que usas esta aplicación?"*
   - _Propósito:_ Asegurar que la captura de pedidos (Folios) y el Cuadre de Caja jamás se rompan durante actualizaciones.
2. **Puntos de Fricción (UX):** *"¿Qué te frustra o te confunde al usarla?"*
   - _Propósito:_ Detectar si la interfaz de captura rápida es demasiado lenta en hora pico, o si los reportes financieros no son claros a simple vista.
3. **El "Botón Mágico" (Features):** *"Si pudieras agregarle un 'botón mágico' que hiciera algo nuevo, ¿qué haría?"*
   - _Posibles respuestas esperadas:_ "Sugerir promociones automáticas", "Avisarme en WhatsApp si hay un robo", "Predecir qué pasteles hornear mañana".

### 🛠️ Preguntas para el Equipo de Desarrollo (Revisión Técnica):

1. **Mantenimiento:** *"¿Qué parte del código da más problemas de mantenimiento o es más difícil de leer?"*
   - _Foco actual:_ Simplificar y refactorizar el `OrderWizardLayout` (el flujo de captura de pedido de 6 pasos) si se vuelve inmanejable.
2. **Documentación:** *"¿Están bien documentadas las herramientas que usamos?"*
   - _Foco actual:_ Existe Swagger para la API en `/api/docs` y un `DESIGN_SYSTEM.md` para el UI. Hay que mantenerlos al día al agregar endpoints del Dashboard Global.
3. **Obsolescencia:** *"¿Qué tecnologías o dependencias están obsoletas y necesitan actualización?"*
   - _Foco actual:_ Monitorear la compatibilidad de `puppeteer` y `whatsapp-web.js` con las últimas versiones de Node y los cambios en la API de Meta.

---

## 3. El Plan de Acción (Metas Claras y Medibles)

Para asegurar que la plataforma aporte valor real y soporte el crecimiento, las metas se dividen en tres pilares:

### 🧹 Metas de Refactorización y Calidad
1. **Consistencia Visual Total (Sprint 1.1):**
   - _Objetivo:_ Erradicar el 100% de los colores "hardcodeados" (ej. `bg-white`) en los componentes restantes y garantizar que el Dark Mode se vea perfecto en todas las pantallas.
2. **Cobertura de Pruebas E2E:**
   - _Objetivo:_ Automatizar las pruebas de los flujos críticos (Login → Crear Pedido → Cerrar Caja) usando Playwright en CI/CD para evitar regresiones.

### ⚡ Metas de Optimización y Rendimiento
1. **Procesamiento Asíncrono de Tareas Pesadas:**
   - _Objetivo:_ Mover la generación de PDFs y el envío masivo de correos/WhatsApp a una cola de trabajos en segundo plano (ej. Redis/BullMQ) para reducir el tiempo de respuesta de la API a menos de 500ms.
2. **Optimización de Base de Datos para el Dashboard:**
   - _Objetivo:_ Crear vistas materializadas o tablas de resumen pre-calculadas (CRON jobs nocturnos) para que el "Dashboard Global del Dueño" cargue en menos de 1 segundo incluso con años de historia.

### ✨ Metas de Nuevas Funcionalidades (Features Basadas en Valor)
1. **Dashboard Estratégico Multi-Sucursal (Visión de Águila):**
   - _Objetivo:_ Implementar un selector de sucursales en tiempo real y KPIs comparativos (Ventas Sucursal A vs B) exclusivo para el rol `OWNER`.
2. **Caja Fuerte (Control y Auditoría Estricta):**
   - _Objetivo:_ Flujo obligatorio de "Apertura y Cierre" ciego, forzando a los cajeros a ingresar el conteo físico antes de revelar el sobrante/faltante calculado por el sistema.
3. **CRM e Insights de IA:**
   - _Objetivo:_ Usar OpenAI no solo para capturar texto, sino para predecir demanda estacional y segmentar clientes VIP automáticamente.

> **Regla de oro del Proyecto:** Solo se agregarán funcionalidades que resuelvan un problema real operativo (ahorrar tiempo al cajero) o estratégico (proteger/aumentar el dinero del dueño), nunca por simple novedad tecnológica.
