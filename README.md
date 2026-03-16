# La Fiesta - Sistema Integral de Pastelería (SaaS Multi-Sucursal)

## 1. Descripción/Contexto

**¿Qué es?**
La Fiesta es una plataforma SaaS (Software as a Service) B2B multi-tenant diseñada específicamente para la gestión operativa y estratégica de pastelerías, permitiendo la administración centralizada de múltiples sucursales bajo una misma cuenta de cliente (Tenant).

**¿Por qué existe y qué problema resuelve?**
Las pastelerías enfrentan un desafío único: manejan pedidos personalizados complejos (textos, decoraciones, alergias), un inventario mixto (stock en vitrina vs. bajo pedido) y flujos de caja dinámicos (anticipos y liquidaciones). Este sistema resuelve la fragmentación de la información (usar Excel, libretas y WhatsApp por separado) unificando la captura de pedidos (asistida por IA), el control estricto de caja, la comunicación con clientes y la visualización de métricas financieras clave en un solo "tablero de mando".

### Estado Actual (Lo que ya tienes)

*   **Funcionalidades existentes:**
    *   Gestión de Usuarios y Roles estricta (Super Admin, Dueño, Admin, Empleado).
    *   Arquitectura Multi-Tenant (aislamiento de datos por pastelería).
    *   Captura de pedidos asistida por Inteligencia Artificial (AI Order Parsing).
    *   Gestión de Catálogos (Sabores, Productos, Precios de Temporada).
    *   Integración con WhatsApp para notificaciones automatizadas.
    *   Generación de reportes PDF y tickets.
    *   Control básico de Caja y Cortes diarios.
*   **Tecnologías actuales:**
    *   **Backend:** Node.js, Express, Sequelize ORM, MySQL (Estructurado bajo Clean Architecture).
    *   **Frontend:** React (Vite), Tailwind CSS, Design System propio con soporte nativo para Claro/Oscuro.
    *   **Servicios Externos:** OpenAI API, WhatsApp Web JS.
*   **Limitaciones conocidas:**
    *   La sincronización de WhatsApp requiere escaneo de QR manual y puede desconectarse.
    *   Dependencia de latencia externa para el análisis de texto de la IA.
    *   Inconsistencias visuales (deuda técnica UI) en algunas vistas heredadas antes de la implementación del Design System estricto.

### Objetivos del Nuevo Requerimiento

El objetivo de esta fase es **normalizar y estandarizar el Frontend** bajo un Design System inquebrantable, asegurando 100% de consistencia visual (Dark/Light mode) y eliminar cualquier ambigüedad de UX. Además, se busca **potenciar la vista del Dueño** para convertirla en una herramienta puramente estratégica (tableros financieros, insights predictivos de IA, control de riesgos) separándola claramente de las herramientas de configuración global que solo competen al Super Admin.

---

## 2. Especificación de Requerimientos

### 2.1 Orden de Vistas, Roles y Propósitos

El sistema divide su navegación basada estrictamente en el rol del usuario conectado.

| Vista / Pantalla | Rol Principal (Visibilidad) | Propósito y Funcionamiento |
| :--- | :--- | :--- |
| **Tablero Dueño (Dashboard)** | Dueño, Admin | **Vista Estratégica.** Muestra métricas financieras clave en tiempo real (Ventas vs Ayer, Ticket Promedio), alertas de pérdidas, y comparativas multi-sucursal. *No es para operar, es para decidir.* |
| **Caja y Cortes** | Empleado, Admin, Dueño | **Control y Seguridad.** Registro de ingresos/egresos, desglose por método de pago. El flujo exige arqueo ciego (capturar físico antes de ver cálculo) y resalta faltantes en rojo. |
| **Reportes y Estadísticas** | Dueño, Admin | **Análisis de Rendimiento.** Tableros interactivos (no solo PDF) con filtros de fecha. Exportación a Excel y envíos automáticos por WhatsApp del corte diario. |
| **Comisiones** | Dueño, Admin | **Nómina/Incentivos.** Tabla en vivo de comisiones por empleado/folio. Estados de pago (Pendiente/Pagado) basados en reglas configurables de la sucursal. |
| **Modo Chismoso (Auditoría)** | Dueño, Super Admin | **Seguridad y Trazabilidad.** Log crítico en tiempo real de anomalías (ej. "Caja abierta fuera de horario", "Pedido eliminado"). Permite cerrar sesiones remotamente (Botón Pánico). |
| **Equipo de Trabajo** | Dueño, Admin | **Gestión de Personal.** Ver turnos, última conexión. Opciones de "Suspender" (nunca borrar). |
| **Directorio / Clientes (CRM)** | Dueño, Admin, Empleado | **Retención de Clientes.** Historial de compras, segmentación automática (VIP, Frecuente), alertas de cumpleaños y botón rápido para WhatsApp. |
| **Catálogo de Sabores/Precios**| Dueño, Admin | **Gestión Comercial.** Control de stock (vitrina), reglas de pedidos (tiempo de entrega), márgenes de ganancia y configuración de temporadas. Buscador interno rápido. |
| **Configuración WhatsApp** | Dueño (Básico), Super Admin (Técnico) | **Canal de Comunicación.** Dueño configura respuestas, horas y mensajes de bienvenida. Super Admin ve logs técnicos y reconecta la API. |
| **Gestión de Tenants (Global)**| Super Admin | **Administración SaaS.** Alta de nuevas pastelerías (clientes), facturación del software, métricas de uso global, reseteo de dueños. *Invisible para Dueños.* |
| **Captura de Pedido (Wizard)** | Empleado, Admin | **Operación Core.** Flujo guiado de 6 pasos para tomar un pedido. Incluye panel de IA para pegar texto largo de WhatsApp y autocompletar el formulario. |

### 2.2 Requerimientos Funcionales (RF)

*   **RF01:** El sistema debe permitir al rol Dueño visualizar las métricas financieras (Ventas, Ticket Promedio) consolidadas de todas sus sucursales asignadas en la vista "Tablero Dueño".
*   **RF02:** El sistema debe requerir que el Cajero (Empleado) introduzca el monto físico contado en caja *antes* de que el sistema revele el sobrante o faltante calculado ("Arqueo Ciego").
*   **RF03:** El sistema debe ocultar mediante un botón (icono de 👁️) todos los montos sensibles en el Tablero Dueño y Caja.
*   **RF04:** El sistema no debe permitir la eliminación física de registros de empleados, catálogos o clientes; en su lugar, debe cambiar su estado a "Desactivado/Suspendido".
*   **RF05:** El sistema debe generar alertas visuales (badges rojos/naranjas) en la tabla de Balance General cuando se detecten flujos de caja negativos o faltantes.
*   **RF06:** La IA (Insights) debe procesar el historial de ventas y proveer al Dueño al menos una recomendación mensual accionable (ej. "Sugerencia de subida de precio por aumento en costo de insumos").

### 2.3 Requerimientos No Funcionales (RNF)

*   **RNF01 (Consistencia UI):** Todos los componentes visuales (Botones, Tablas, Inputs, Modales) deben ser instanciados desde el Design System central (`/src/components/ui/`) sin permitir estilos "hardcodeados" en línea.
*   **RNF02 (Accesibilidad):** Toda la interfaz debe cumplir con un ratio de contraste mínimo AA, asegurando textos legibles tanto en Modo Claro como en Modo Oscuro.
*   **RNF03 (Seguridad):** Las vistas marcadas como exclusivas para "Dueño" o "Super Admin" deben validar el token JWT y los permisos RBAC tanto en el Frontend (protección de rutas) como en el Backend (middlewares `checkRole` y `tenantScope`).
*   **RNF04 (Rendimiento):** Las consultas de "Reportes y Estadísticas" que abarquen más de 30 días deben resolverse en menos de 2 segundos.
*   **RNF05 (Theming):** El cambio entre Modo Claro y Oscuro debe aplicarse instantáneamente en toda la aplicación sin requerir recargar la página, utilizando tokens CSS o Tailwind de manera semántica.

---

## 3. Información Técnica Adicional

**Entregables Esperados:**
1.  **Matriz de Auditoría UX/UI:** Documento detallando problemas visuales y de flujo por cada pantalla listada.
2.  **Design System Completo:** Archivo `DESIGN_SYSTEM.md` actualizado con reglas de uso de componentes, tokens de color (Light/Dark) y espaciado.
3.  **Refactorización de Pantallas:** Código actualizado en React (`/src/pages/`) utilizando los componentes normalizados.
4.  **Implementación de "Business Insights":** Módulo funcional en el Tablero del Dueño consumiendo el endpoint de sugerencias predictivas.

**Restricciones:**
*   No se debe alterar el esquema base de la base de datos (MySQL) sin una justificación de rendimiento crítica.
*   La refactorización del frontend debe mantener la compatibilidad con las rutas de la API actual.
*   Cualquier componente nuevo debe escribirse usando Functional Components y React Hooks (ej. `useState`, `useContext`).

**Historias de Usuario (Ejemplos):**
*   *Como Dueño de pastelería con 3 sucursales*, necesito ver un resumen comparativo de las ventas de hoy al abrir la aplicación desde mi celular, para saber inmediatamente qué sucursal necesita atención.
*   *Como Cajera en turno de cierre*, necesito registrar rápidamente los gastos del día (ej. compra de agua) y hacer el corte ciego, para poder entregar la caja cuadrada sin errores de cálculo mental.
*   *Como Super Administrador*, necesito ver qué dueño se conectó por última vez y si su suscripción está activa, para gestionar la cobranza del software.

---

## 4. Consejos para la Redacción (Buenas Prácticas Aplicadas)

*   **Claridad y Consistencia:** Se han definido claramente los nombres de las vistas y los roles. Se utiliza terminología unificada (ej. "Tenant" para referirse a la cuenta de la pastelería).
*   **Trazabilidad:** Los RF y RNF están numerados para poder ser referenciados fácilmente en commits (`git commit -m "feat(caja): implementa arqueo ciego ref RF02"`) o tarjetas de Jira/Trello.
*   **Formato Markdown:** El documento está estructurado con encabezados claros, listas para viñetas, tablas para facilitar la lectura de los roles y jerarquía visual.
