# PLAN DE ACCIÓN COMPLETO Y DEFINITIVO

## Transformación del Sistema de Gestión Pastelera en un Ecosistema Inteligente

---

## TABLA DE CONTENIDOS

1. [Filosofía General](#filosofía-general)
2. [FASE 1: IMPRESCINDIBLE - Base del Control](#fase-1-imprescindible---base-del-control)
   - [A. Dueño: Operación y Confianza](#a-dueño-operación-y-confianza)
   - [B. Super Admin: Soporte y Configuración](#b-super-admin-soporte-y-configuración)
3. [FASE 2: ESTRATÉGICO - IA y Visión de Negocio](#fase-2-estratégico---ia-y-visión-de-negocio)
   - [A. IA para Dueño: Asistente de Negocio](#a-ia-para-dueño-asistente-de-negocio)
   - [B. IA para Super Admin: Socio Estratégico](#b-ia-para-super-admin-socio-estratégico)
   - [C. Visión Estratégica del Dueño](#c-visión-estratégica-del-dueño)
4. [FASE 3: EXPANSIÓN - Nuevos Módulos](#fase-3-expansión---nuevos-módulos)
5. [ANEXO: Checklist de Verificación](#anexo-checklist-de-verificación)

---

## FILOSOFÍA GENERAL

**Dueño:** Necesita un **Tablero de Control y herramientas de decisión** (marketing, rentabilidad, personal).

**Super Admin:** Necesita una **Consola de Administración y configuración** (soporte, infraestructura, multi-tenant).

**La IA Central:** Debe actuar como el "cerebro" que conecta todos los módulos y anticipa necesidades.

---

# FASE 1: IMPRESCINDIBLE - BASE DEL CONTROL

## (CORTO PLAZO: 1-3 MESES)

---

### A. DUEÑO: OPERACIÓN Y CONFIANZA

#### 1. PESTAÑA DUEÑO (VISTA PRINCIPAL)

| #   | Elemento                            | Descripción                                                                         | Prioridad |
| --- | ----------------------------------- | ----------------------------------------------------------------------------------- | --------- |
| 1.1 | Métricas Financieras en Tiempo Real | Reemplazar indicadores superfluos por: Ventas Hoy vs. Ayer, Ticket Promedio         | 🔴 ALTA   |
| 1.2 | Alertas de Pérdidas/Retrasos        | Sección de "Incidencias Críticas": pedidos no entregados, devoluciones              | 🔴 ALTA   |
| 1.3 | Selector de Sucursales              | Comparativa entre pastelerías sin cerrar sesión                                     | 🟡 MEDIA  |
| 1.4 | Top Ventas por Categoría            | Saber qué deja más margen (pasteles personalizados vs panadería)                    | 🟡 MEDIA  |
| 1.5 | Botones de Acción Rápidas           | Cambiar "Nuevo Folio" por "Generar Reporte", "Ver Inventario", "Gestionar Personal" | 🟢 BAJA   |
| 1.6 | Cola de Trabajo Visual              | Gráfico de dona/barras: 10 listos, 5 preparación, 2 retrasados                      | 🟡 MEDIA  |

#### 2. CAJA Y CORTES (PANTALLA CRÍTICA)

| #   | Elemento                         | Descripción                                                                     | Prioridad |
| --- | -------------------------------- | ------------------------------------------------------------------------------- | --------- |
| 2.1 | Desglose de Métodos de Pago      | Balance final separado: Efectivo, Tarjeta, Transferencia                        | 🔴 ALTA   |
| 2.2 | Apertura/Cierre de Caja          | Declarar fondo inicial y monto final del turno                                  | 🔴 ALTA   |
| 2.3 | Retiros de Efectivo              | Botón para registrar gastos (pago proveedores, compras) con restador automático | 🔴 ALTA   |
| 2.4 | Arqueo de Caja                   | Función donde ingresan conteo físico y sistema calcula sobrante/faltante        | 🔴 ALTA   |
| 2.5 | Columnas en Tabla de Movimientos | Añadir "Estado" (Completado/Cancelado) y "Usuario" (quién hizo el movimiento)   | 🟡 MEDIA  |
| 2.6 | Balance Final Dinámico           | Rojo si hay pérdidas, naranja si es menor a lo esperado                         | 🟡 MEDIA  |
| 2.7 | Filtros Avanzados                | Botones "Hoy", "Ayer", "Esta Semana" además del selector de fecha               | 🟢 BAJA   |
| 2.8 | Exportación a Excel/PDF          | Botón visible para contadores                                                   | 🟢 BAJA   |
| 2.9 | Ojo de Seguridad 👁️              | Icono para ocultar montos sensibles de clientes cerca                           | 🟡 MEDIA  |

#### 3. MODO CHISMOSO (AUDITORÍA)

| #   | Elemento                 | Descripción                                                                                    | Prioridad |
| --- | ------------------------ | ---------------------------------------------------------------------------------------------- | --------- |
| 3.1 | Log de Actividad Crítica | Mostrar: "[Usuario] borró Folio #", "[Usuario] cambió precio", "[Usuario] aplicó descuento X%" | 🔴 ALTA   |
| 3.2 | Radar de Anomalías       | Cuadro que resalte: "Empleado aplicó 10 descuentos hoy (promedio: 2)"                          | 🔴 ALTA   |
| 3.3 | Geolocalización/IP       | Saber desde dónde se conectan (Sucursal Norte - IP: 192...)                                    | 🔴 ALTA   |
| 3.4 | Alerta de Caja Abierta   | Si se abre muchas veces sin ventas, lanza alerta en radar                                      | 🟡 MEDIA  |
| 3.5 | Streaming de Actividad   | Feed tipo Twitter que corre en tiempo real                                                     | 🟢 BAJA   |
| 3.6 | Comparativa de Velocidad | Tiempo por sucursal desde dictado hasta pago                                                   | 🟢 BAJA   |
| 3.7 | Filtros de Gravedad      | Botones: Info (azul), Advertencia (amarillo), Crítico (rojo)                                   | 🟡 MEDIA  |
| 3.8 | Botón de Pánico          | Cerrar TODAS las sesiones activas ante hackeo                                                  | 🟡 MEDIA  |

#### 4. EQUIPO DE TRABAJO (GESTIÓN DE PERSONAL)

| #   | Elemento                    | Descripción                                                        | Prioridad |
| --- | --------------------------- | ------------------------------------------------------------------ | --------- |
| 4.1 | Horarios y Turnos           | Campo para Matutino/Vespertino                                     | 🟡 MEDIA  |
| 4.2 | Botón "Suspender"           | En lugar de borrar, desactivar temporalmente (vacaciones/sanción)  | 🔴 ALTA   |
| 4.3 | Registro de Última Conexión | Saber si empleados abren sistema a tiempo                          | 🔴 ALTA   |
| 4.4 | Super Admins Bloqueados     | Dueño NO puede editar accesos del personal técnico                 | 🔴 ALTA   |
| 4.5 | Buscador y Filtros          | Por Rol o Estatus para equipos grandes                             | 🟢 BAJA   |
| 4.6 | Columna de Permisos Rápidos | Iconos: 💰 (caja), 📅 (calendario) para ver permisos de un vistazo | 🟡 MEDIA  |

#### 5. DIRECTORIO DE CLIENTES

| #   | Elemento                    | Descripción                                                 | Prioridad |
| --- | --------------------------- | ----------------------------------------------------------- | --------- |
| 5.1 | Etiquetas de Segmentación   | "VIP", "Frecuente", "Nuevo" automáticas                     | 🔴 ALTA   |
| 5.2 | Historial de Compras Rápido | Botón para ver qué pidió antes ("Siempre pide tres leches") | 🔴 ALTA   |
| 5.3 | Fecha de Cumpleaños         | IA avisa: "Mañana es cumple de Mario, ¿enviamos cupón?"     | 🔴 ALTA   |
| 5.4 | Total Gastado               | Indicador de cuánto ha dejado en el negocio                 | 🔴 ALTA   |
| 5.5 | Botón WhatsApp Directo      | Contactar con un clic desde el sistema                      | 🟡 MEDIA  |
| 5.6 | Tarjetas Enriquecidas       | Iconos pequeños para correo/teléfono                        | 🟢 BAJA   |
| 5.7 | Buscador Inteligente        | Por nombre, correo, teléfono o último producto comprado     | 🟡 MEDIA  |
| 5.8 | Filtros de Ordenamiento     | "Más recientes", "Alfabético", "Los que más compran"        | 🟢 BAJA   |

#### 6. CATÁLOGO DE SABORES

| #   | Elemento                     | Descripción                                                                  | Prioridad |
| --- | ---------------------------- | ---------------------------------------------------------------------------- | --------- |
| 6.1 | Gestión de Inventario Rápida | Toggle "Agotado" que se refleja en tiempo real en toma de pedidos y WhatsApp | 🔴 ALTA   |
| 6.2 | Precios y Costos             | Mostrar precio base o indicador de "Costo Extra"                             | 🔴 ALTA   |
| 6.3 | Imágenes de Referencia       | Icono cámara 📷 para foto real del pastel cortado                            | 🟡 MEDIA  |
| 6.4 | Alérgenos                    | Etiquetas con iconos: Nueces, Gluten, Lácteos                                | 🔴 ALTA   |
| 6.5 | Sabores de Temporada         | Opción "Edición Limitada" que aparezca primero                               | 🟡 MEDIA  |
| 6.6 | Popularidad                  | Indicador de estrellas ⭐ o "Top Ventas" basado en estadísticas reales       | 🟡 MEDIA  |
| 6.7 | Buscador Interno             | Para catálogos grandes (>50 sabores)                                         | 🟢 BAJA   |
| 6.8 | Botón "Duplicar"             | Crear variantes rápido (ej. "Chocolate con licor" desde "Chocolate")         | 🟢 BAJA   |

#### 7. CATÁLOGOS Y PRECIOS (PRODUCTOS)

| #   | Elemento               | Descripción                                                         | Prioridad |
| --- | ---------------------- | ------------------------------------------------------------------- | --------- |
| 7.1 | Gestión de Stock       | Columna para productos de vitrina (cupcakes, pasteles individuales) | 🔴 ALTA   |
| 7.2 | Diferenciador de Plazo | "Bajo Pedido" vs "Entrega Inmediata" para WhatsApp                  | 🔴 ALTA   |
| 7.3 | Costo vs Precio        | Mostrar % de ganancia/margen                                        | 🔴 ALTA   |
| 7.4 | Fotos del Producto     | Miniatura al lado del nombre                                        | 🟡 MEDIA  |
| 7.5 | Precios por Temporada  | Programar cambios (ej. +10% en Día de Madres)                       | 🟡 MEDIA  |
| 7.6 | Combos y Paquetes      | Pestaña para crear ofertas especiales                               | 🟢 BAJA   |
| 7.7 | Eliminar Columna Vacía | Quitar "Descripción" si no se usa, dar espacio a precios            | 🟢 BAJA   |
| 7.8 | Contadores en Pestañas | Ej. "Productos (5)" en cada pestaña superior                        | 🟢 BAJA   |

#### 8. REPORTES Y ESTADÍSTICAS

| #   | Elemento                       | Descripción                                                                   | Prioridad |
| --- | ------------------------------ | ----------------------------------------------------------------------------- | --------- |
| 8.1 | Gráficos Rápidos               | Tarjetas: Ventas del Día ($), Pedidos Entregados, Diferencia vs Ayer (%)      | 🔴 ALTA   |
| 8.2 | Filtros de Período             | "Este Mes", "Últimos 30 días", "Rango Personalizado"                          | 🔴 ALTA   |
| 8.3 | Botón "Enviar por WhatsApp"    | Resumen del corte directo al celular                                          | 🟡 MEDIA  |
| 8.4 | Desglose de Formas de Pago     | Efectivo/Tarjeta/Transferencia para arqueo                                    | 🔴 ALTA   |
| 8.5 | Reporte de Más Vendidos        | Productos y sabores que más dinero generaron                                  | 🔴 ALTA   |
| 8.6 | Reporte de Merma/Cancelaciones | Pérdidas por pasteles no recogidos o errores                                  | 🔴 ALTA   |
| 8.7 | Comparativa entre Sucursales   | Qué vende más y por qué                                                       | 🟡 MEDIA  |
| 8.8 | Optimizar Espacio Blanco       | Mover info estática a icono de ayuda (?) y usar espacio para dashboard previo | 🟢 BAJA   |

#### 9. COMISIONES

| #   | Elemento                      | Descripción                                                               | Prioridad |
| --- | ----------------------------- | ------------------------------------------------------------------------- | --------- |
| 9.1 | Tabla de Resultados Inmediata | Nombre, Total Ventas, % Comisión, Monto a Pagar ($)                       | 🔴 ALTA   |
| 9.2 | Desglose por Pedido           | Click en empleado para ver qué folios generaron comisión                  | 🔴 ALTA   |
| 9.3 | Estado de Pago                | Columna "Estatus": Pendiente / Pagado                                     | 🔴 ALTA   |
| 9.4 | Configuración de Reglas       | Botón "Ajustar Porcentajes" (por venta total, producto específico, metas) | 🔴 ALTA   |
| 9.5 | Ranking de Vendedores         | Top 3 visual de más productivos                                           | 🟡 MEDIA  |
| 9.6 | Filtro por Sucursal           | Comparar eficiencia de equipos                                            | 🟡 MEDIA  |
| 9.7 | Resumen General               | "Total comisiones por pagar: $X,XXX" arriba de la pantalla                | 🟢 BAJA   |
| 9.8 | Botón Excel                   | Además de PDF, para que dueño haga sus propias cuentas                    | 🟢 BAJA   |

#### 10. BALANCE GENERAL

| #    | Elemento                    | Descripción                                                      | Prioridad |
| ---- | --------------------------- | ---------------------------------------------------------------- | --------- |
| 10.1 | Comparativa Porcentual      | "⬆️ 5% más que mes pasado" o "⬇️ 2% debajo objetivo"             | 🔴 ALTA   |
| 10.2 | Desglose de Egresos         | "Gastos Operativos" clickeable para ver renta, luz, reparaciones | 🔴 ALTA   |
| 10.3 | Punto de Equilibrio         | Indicador de cuánto falta vender para cubrir egresos             | 🔴 ALTA   |
| 10.4 | Gráfico de Pastel (Dona)    | % de ingreso a insumos vs gastos operativos                      | 🟡 MEDIA  |
| 10.5 | Filtros de Tiempo Reales    | Balance Mensual/Anual para impuestos                             | 🔴 ALTA   |
| 10.6 | Proyección de Flujo de Caja | "Para próxima semana necesitas $5,000 en caja"                   | 🟡 MEDIA  |
| 10.7 | Colores de Alerta           | Rojo vibrante si el balance neto es negativo                     | 🔴 ALTA   |
| 10.8 | Vista Previa sin Descargar  | Que el reporte se vea en pantalla antes de PDF                   | 🟢 BAJA   |

#### 11. LIMPIEZA TÉCNICA INMEDIATA (UX/UI)

| #    | Elemento                 | Descripción                                   | Prioridad |
| ---- | ------------------------ | --------------------------------------------- | --------- |
| 11.1 | Corrección de Caracteres | Arreglar "Mi PastelerÂa" (error UTF-8)        | 🔴 ALTA   |
| 11.2 | Instrucciones con Iconos | En WhatsApp, iconos del menú para no técnicos | 🟡 MEDIA  |
| 11.3 | Botón "Volver" visible   | En todas las pantallas de detalle             | 🟢 BAJA   |

---

### B. SUPER ADMIN: SOPORTE Y CONFIGURACIÓN

#### 12. GESTIÓN DE DUEÑOS (TENANTS) - VISTA GLOBAL

| #    | Elemento                       | Descripción                                                   | Prioridad |
| ---- | ------------------------------ | ------------------------------------------------------------- | --------- |
| 12.1 | Gestión de Planes/Límites      | Cambiar sucursales/usuarios permitidos (ej. "2/24" a "3/24")  | 🔴 ALTA   |
| 12.2 | Estatus de Pago                | Indicador visual verde/rojo de mensualidad pagada             | 🔴 ALTA   |
| 12.3 | Botón "Loguearse como"         | Entrar al sistema del dueño para soporte sin contraseña       | 🔴 ALTA   |
| 12.4 | Botón "Suspender Tenant"       | Bloquear acceso por falta de pago o fin de contrato           | 🔴 ALTA   |
| 12.5 | Predicción de Abandono (IA)    | "Pastelería HQ sin pedidos en 10 días, riesgo de cancelación" | 🟡 MEDIA  |
| 12.6 | Sugerencia de Ventas (IA)      | "Mi Pastelería alcanzó límite de 1 sucursal. Sugiere Premium" | 🟡 MEDIA  |
| 12.7 | Visualización de Consumo       | Barras de progreso tipo "2/24" para identificar upgrades      | 🟢 BAJA   |
| 12.8 | Acceso Directo a Configuración | Engranaje ⚙️ junto al nombre de cada pastelería               | 🟢 BAJA   |

#### 13. DETALLE DEL TENANT (PASTELERÍA HQ)

| #    | Elemento                       | Descripción                                                          | Prioridad |
| ---- | ------------------------------ | -------------------------------------------------------------------- | --------- |
| 13.1 | Estado de Suscripción          | Facturación/Pagos: plan contratado, vencimiento, facturas pendientes | 🔴 ALTA   |
| 13.2 | Métricas de Uso Real           | "Pedidos este mes: 450/1000 permitidos"                              | 🔴 ALTA   |
| 13.3 | Botones de Acción Crítica      | Suspender Servicio, Resetear Configuración, Login as Owner           | 🔴 ALTA   |
| 13.4 | Sucursales Clickeables         | Ir a inventario/ventas específicas de esa sede                       | 🟡 MEDIA  |
| 13.5 | Acciones en Usuarios           | Columna con lápiz ✏️ y basurero 🗑️ para desactivar admins            | 🔴 ALTA   |
| 13.6 | Barra de Límite de Usuarios    | Similar a la de sucursales (2/24)                                    | 🟡 MEDIA  |
| 13.7 | Health Score (IA)              | Etiqueta "Cliente Saludable" o "Cliente en Riesgo"                   | 🟡 MEDIA  |
| 13.8 | Predicción de Crecimiento (IA) | "Necesitará más capacidad en 3 meses por ritmo de creación"          | 🟢 BAJA   |
| 13.9 | Botón "Volver" visible         | Para saltar rápido entre clientes                                    | 🟢 BAJA   |

#### 14. CONECTAR WHATSAPP (CONFIGURACIÓN TÉCNICA)

| #    | Elemento                          | Descripción                                                    | Prioridad |
| ---- | --------------------------------- | -------------------------------------------------------------- | --------- |
| 14.1 | Indicador de Estado Real          | Check Verde ✅ "Conectado como: +52 55..." tras escanear QR    | 🔴 ALTA   |
| 14.2 | Botón "Cerrar Sesión/Desvincular" | Cambiar teléfono de la pastelería                              | 🔴 ALTA   |
| 14.3 | Alertas de Desconexión            | Banner: "Teléfono perdió conexión, pedidos no entran"          | 🔴 ALTA   |
| 14.4 | Prueba de Conexión                | Botón "Enviar mensaje de prueba"                               | 🟡 MEDIA  |
| 14.5 | Logs de API                       | Consola/historial de errores (ej. "Error 401: Token expirado") | 🔴 ALTA   |
| 14.6 | Versión de la API                 | Mostrar versión o ID del servidor para mantenimiento           | 🟡 MEDIA  |
| 14.7 | Aviso de Seguridad                | "Nadie del equipo pedirá tu código de verificación"            | 🟢 BAJA   |
| 14.8 | Modo Entrenamiento (Dueño)        | Probar respuestas del bot antes de producción                  | 🟡 MEDIA  |

#### 15. EQUIPO DE TRABAJO (VISTA SUPER ADMIN)

| #    | Elemento                     | Descripción                                                 | Prioridad |
| ---- | ---------------------------- | ----------------------------------------------------------- | --------- |
| 15.1 | Log de Auditoría por Usuario | Ver qué movimientos ha hecho cada usuario                   | 🔴 ALTA   |
| 15.2 | Reset de Contraseña          | Botón para generar clave temporal                           | 🔴 ALTA   |
| 15.3 | Asignación de Sucursales     | Mover empleados entre sucursales con un clic                | 🟡 MEDIA  |
| 15.4 | Confirmación de Borrado      | "¿Seguro? Esta acción es irreversible" o mejor "Desactivar" | 🔴 ALTA   |

#### 16. CLIENTES (VISTA SUPER ADMIN)

| #    | Elemento                      | Descripción                                                          | Prioridad |
| ---- | ----------------------------- | -------------------------------------------------------------------- | --------- |
| 16.1 | Unificador de Duplicados (IA) | Detectar si "Mario" y "Mario Efrain" son el mismo y sugerir combinar | 🔴 ALTA   |
| 16.2 | Importar/Exportar             | Subir lista masiva desde Excel o descargar respaldos                 | 🔴 ALTA   |
| 16.3 | Logs de Privacidad            | Registro de quién consultó/editó datos del cliente                   | 🔴 ALTA   |

#### 17. PRODUCTOS Y SABORES (VISTA SUPER ADMIN)

| #    | Elemento                       | Descripción                                                             | Prioridad |
| ---- | ------------------------------ | ----------------------------------------------------------------------- | --------- |
| 17.1 | Categorías Personalizables     | Crear "Coberturas", "Decoraciones", "Tamaños"                           | 🟡 MEDIA  |
| 17.2 | Ordenamiento Drag & Drop       | Decidir qué sabores aparecen primero                                    | 🟢 BAJA   |
| 17.3 | Campos Requeridos por Producto | Configurar info obligatoria al vender (ej. sabor pan y relleno sí o no) | 🔴 ALTA   |
| 17.4 | Historial de Cambios de Precio | Registro de quién y cuándo cambió precios                               | 🔴 ALTA   |

#### 18. COMISIONES (VISTA SUPER ADMIN)

| #    | Elemento                        | Descripción                                                          | Prioridad |
| ---- | ------------------------------- | -------------------------------------------------------------------- | --------- |
| 18.1 | Cálculo Automático de Impuestos | Configurar fórmula para comisiones libres o gravadas                 | 🔴 ALTA   |
| 18.2 | Bloqueo de Periodos             | Una vez pagadas, los datos no se pueden editar (integridad contable) | 🔴 ALTA   |

#### 19. BALANCE GENERAL (VISTA SUPER ADMIN)

| #    | Elemento                | Descripción                                                               | Prioridad |
| ---- | ----------------------- | ------------------------------------------------------------------------- | --------- |
| 19.1 | Botón de "Conciliar"    | Verificar que datos del sistema coinciden con estados de cuenta bancarios | 🔴 ALTA   |
| 19.2 | Exportación a Excel/CSV | Datos en crudo para contador externo                                      | 🔴 ALTA   |

#### 20. REPORTES (VISTA SUPER ADMIN)

| #    | Elemento                   | Descripción                                                         | Prioridad |
| ---- | -------------------------- | ------------------------------------------------------------------- | --------- |
| 20.1 | Log de Generación          | Saber quién descargó qué reporte y a qué hora                       | 🔴 ALTA   |
| 20.2 | Estado de la Base de Datos | Indicador que asegure que todos los folios del día están procesados | 🔴 ALTA   |

#### 21. MODO CHISMOSO (VISTA SUPER ADMIN)

| #    | Elemento        | Descripción                                                                           | Prioridad |
| ---- | --------------- | ------------------------------------------------------------------------------------- | --------- |
| 21.1 | Uso de Recursos | Indicador de latencia/carga del servidor                                              | 🟡 MEDIA  |
| 21.2 | Nivel de Acceso | Poder subir de PARCIAL a TOTAL para ver contraseñas encriptadas/tokens en emergencias | 🔴 ALTA   |

---

# FASE 2: ESTRATÉGICO - IA Y VISIÓN DE NEGOCIO

## (MEDIANO PLAZO: 4-8 MESES)

---

### A. IA PARA DUEÑO: ASISTENTE DE NEGOCIO

#### 22. IA EN DASHBOARD PRINCIPAL

| #    | Funcionalidad            | Descripción                                                                  |
| ---- | ------------------------ | ---------------------------------------------------------------------------- |
| 22.1 | Predicciones             | "Se acerca Día de Madres, compra 30% más fresas basado en ventas año pasado" |
| 22.2 | Análisis de Rentabilidad | "Sabor Vainilla Real subió de costo, considera ajustar precio"               |
| 22.3 | Resumen de Desempeño     | "El equipo hoy trabajó 15% más rápido de lo habitual"                        |

#### 23. IA EN CAJA

| #    | Funcionalidad               | Descripción                                                        |
| ---- | --------------------------- | ------------------------------------------------------------------ |
| 23.1 | Detección de Anomalías      | "Egreso inusual de $500 sin factura adjunta a las 3 PM, ¿revisar?" |
| 23.2 | Pronóstico de Efectivo      | "Para pedidos de mañana, recomienda fondo de caja de $1,000"       |
| 23.3 | Resumen de Ventas al Cierre | "Hoy fue buen día, ventas +10% por pasteles de temporada"          |

#### 24. IA EN CLIENTES

| #    | Funcionalidad        | Descripción                                                                     |
| ---- | -------------------- | ------------------------------------------------------------------------------- |
| 24.1 | Predicción de Fuga   | "Cliente Mario no compra en 3 meses (compraba cada 30 días). ¿Contactarlo?"     |
| 24.2 | Sugerencia de Pedido | Al abrir perfil: "Basado en historial, hoy probable que pida Galletas de Avena" |

#### 25. IA EN SABORES (CHEF EJECUTIVO)

| #    | Funcionalidad          | Descripción                                                                         |
| ---- | ---------------------- | ----------------------------------------------------------------------------------- |
| 25.1 | Sugerencia de Precios  | "Costo de mantequilla subió 15%, ajusta precio de Tres Leches para mantener margen" |
| 25.2 | Análisis de Inventario | "Red Velvet no se vendió en 30 días, considera promoción o darlo de baja"           |

#### 26. IA EN PRODUCTOS (ANALISTA DE MERCADO)

| #    | Funcionalidad                   | Descripción                                                          |
| ---- | ------------------------------- | -------------------------------------------------------------------- |
| 26.1 | Sugerencia de Precios Dinámicos | "Competidores subieron Cupcake a $30. Tienes margen para subir $5"   |
| 26.2 | Alerta de Baja Rotación         | "Pastel 30 Personas no se vendió este mes. ¿Crear cupón automático?" |

#### 27. IA EN REPORTES (ANALISTA FINANCIERO)

| #    | Funcionalidad              | Descripción                                                                                            |
| ---- | -------------------------- | ------------------------------------------------------------------------------------------------------ |
| 27.1 | Resumen Ejecutivo en Texto | "Hoy ventas +12%. Producto estrella: Pastel 10 personas. Tuviste 2 cancelaciones por falta de insumos" |
| 27.2 | Proyección                 | "Próximo fin de semana: 20 pedidos según tendencia. ¿Preparar más base de vainilla?"                   |

#### 28. IA EN COMISIONES (GESTOR DE INCENTIVOS)

| #    | Funcionalidad         | Descripción                                                            |
| ---- | --------------------- | ---------------------------------------------------------------------- |
| 28.1 | Sugerencia de Metas   | "Empleado Mario está a $500 de su bono mensual. ¿Enviar recordatorio?" |
| 28.2 | Análisis de Desempeño | "Tasa de conversión de pedidos dictados bajó 5%. Sugiere capacitación" |

#### 29. IA EN BALANCE GENERAL (DIRECTOR FINANCIERO)

| #    | Funcionalidad              | Descripción                                                                          |
| ---- | -------------------------- | ------------------------------------------------------------------------------------ |
| 29.1 | Detección de Fugas         | "Gastos en insumos +20% pero ventas +5%. Revisa desperdicio o proveedor"             |
| 29.2 | Recomendación de Inversión | "Balance positivo constante. Buen momento para contratar pastelero o abrir sucursal" |

#### 30. IA EN WHATSAPP

| #    | Funcionalidad      | Descripción                                                                           |
| ---- | ------------------ | ------------------------------------------------------------------------------------- |
| 30.1 | Modo Entrenamiento | Dueño chatea con su bot para ver respuestas a preguntas difíciles antes de producción |

---

### B. IA PARA SUPER ADMIN: SOCIO ESTRATÉGICO

#### 31. IA EN GESTIÓN DE DUEÑOS (TENANTS)

| #    | Funcionalidad                    | Descripción                                                                     |
| ---- | -------------------------------- | ------------------------------------------------------------------------------- |
| 31.1 | Predicción de Abandono (Churn)   | "Pastelería HQ sin pedidos en 10 días, riesgo de cancelación. ¿Enviar soporte?" |
| 31.2 | Sugerencia de Ventas (Upselling) | "Mi Pastelería alcanzó límite de 1 sucursal. Sugiere plan Premium para 2da"     |

#### 32. IA EN DETALLE DEL TENANT

| #    | Funcionalidad             | Descripción                                                               |
| ---- | ------------------------- | ------------------------------------------------------------------------- |
| 32.1 | Health Score              | "Cliente Saludable" o "Cliente en Riesgo" según uso del sistema           |
| 32.2 | Predicción de Crecimiento | "En 3 meses necesitará más capacidad por ritmo de creación de sucursales" |

#### 33. IA EN CLIENTES

| #    | Funcionalidad            | Descripción                                     |
| ---- | ------------------------ | ----------------------------------------------- |
| 33.1 | Unificador de Duplicados | Detectar y sugerir combinar perfiles duplicados |

---

### C. VISIÓN ESTRATÉGICA DEL DUEÑO

#### 34. DASHBOARD REDISEÑADO

| #    | Elemento                 | Descripción                                               |
| ---- | ------------------------ | --------------------------------------------------------- |
| 34.1 | Métricas Financieras     | Ventas Hoy vs Ayer, Ticket Promedio                       |
| 34.2 | Alertas de Incidencias   | Pedidos no entregados, devoluciones                       |
| 34.3 | Selector de Sucursales   | Comparativa sin cerrar sesión                             |
| 34.4 | Top Ventas por Categoría | Qué deja más margen                                       |
| 34.5 | Botones de Gestión       | "Generar Reporte", "Ver Inventario", "Gestionar Personal" |
| 34.6 | Cola de Trabajo Visual   | Gráfico: 10 listos, 5 preparación, 2 retrasados           |

#### 35. CATÁLOGO DE SABORES COMO HERRAMIENTA DE VENTAS

| #    | Elemento                 | Descripción                                  |
| ---- | ------------------------ | -------------------------------------------- |
| 35.1 | Toggle "Agotado"         | Reflejo en tiempo real en pedidos y WhatsApp |
| 35.2 | Indicador de Costo Extra | Precio base visible                          |
| 35.3 | Fotos de Referencia      | Para empleados nuevos                        |
| 35.4 | Etiquetas de Alérgenos   | Nueces, Gluten, Lácteos                      |
| 35.5 | Sabores de Temporada     | "Edición Limitada" prioritario               |
| 35.6 | Popularidad              | Estrellas o "Top Ventas"                     |

#### 36. CATÁLOGO DE PRODUCTOS PROFESIONALIZADO

| #    | Elemento               | Descripción                          |
| ---- | ---------------------- | ------------------------------------ |
| 36.1 | Columna de Stock       | Para productos de vitrina            |
| 36.2 | Diferenciador de Plazo | "Bajo Pedido" vs "Entrega Inmediata" |
| 36.3 | Margen de Ganancia     | % de utilidad visible                |
| 36.4 | Fotos                  | Miniaturas                           |
| 36.5 | Precios por Temporada  | Programación de cambios              |
| 36.6 | Combos y Paquetes      | Creación de ofertas                  |

#### 37. COMISIONES COMO HERRAMIENTA DE RH

| #    | Elemento                | Descripción                       |
| ---- | ----------------------- | --------------------------------- |
| 37.1 | Tabla de Resultados     | Empleado, Ventas, %, Monto        |
| 37.2 | Desglose por Pedido     | Ver folios que generaron comisión |
| 37.3 | Estado de Pago          | Pendiente/Pagado                  |
| 37.4 | Configuración de Reglas | Porcentajes por producto/meta     |
| 37.5 | Ranking de Vendedores   | Top 3 visual                      |
| 37.6 | Filtro por Sucursal     | Comparar equipos                  |

---

# FASE 3: EXPANSIÓN - NUEVOS MÓDULOS

## (LARGO PLAZO: 9-12 MESES)

---

### 38. MÓDULO DE PRODUCCIÓN (VISTA DE COCINA)

_Diseñado para tablet en pared de cocina con botones grandes_

| #    | Elemento                    | Descripción                                                                       |
| ---- | --------------------------- | --------------------------------------------------------------------------------- |
| 38.1 | Tarjetas de Pedido (Kanban) | Folio #, Producto, Sabor/Relleno, Hora Entrega (rojo si urge), Notas ("Sin nuez") |
| 38.2 | Botones de Estado Rápidos   | [🔥 En Horno], [🎨 Decorando], [✅ Listo]                                         |
| 38.3 | IA de Producción            | "Sugerencia: 5 pasteles de chocolate hoy. Hornea 5 bases juntas para ahorrar gas" |
| 38.4 | Cronómetro Visual           | Tiempo del pedido en fase actual                                                  |

### 39. MÓDULO DE LOGÍSTICA Y RUTAS (VISTA DE DESPACHO)

_Para encargado de entregas o repartidor_

| #    | Elemento               | Descripción                                                                              |
| ---- | ---------------------- | ---------------------------------------------------------------------------------------- |
| 39.1 | Mapa Interactivo       | Pines de colores según urgencia (Google Maps)                                            |
| 39.2 | Agrupador de Rutas     | [🛣️ Generar Ruta Optimizada]. IA: "Pedidos #10, #15, #18 en zona Norte. Salida: 4:00 PM" |
| 39.3 | Estatus del Repartidor | Repartidor, Pedidos en curso, Ubicación GPS, Hora estimada regreso                       |
| 39.4 | Botón WhatsApp Cliente | "Tu pedido va en camino, llega en 15 min"                                                |

### 40. MÓDULO DE FIDELIZACIÓN (LOYALTY)

_Integrado en Clientes y Nuevo Folio_

| #    | Elemento                   | Descripción                                                                              |
| ---- | -------------------------- | ---------------------------------------------------------------------------------------- |
| 40.1 | Billetera Virtual          | "Puntos Acumulados: 450 (Equivalentes a $45.00 MXN)"                                     |
| 40.2 | Niveles de Cliente         | Medallas Bronce, Plata, Oro según gasto anual                                            |
| 40.3 | IA de Marketing Automática | "Hoy enviamos 5 cupones 'Te extrañamos' a clientes inactivos. Probabilidad retorno: 40%" |
| 40.4 | Canje de Puntos            | Botón [💳 Pagar con Puntos] en pantalla de pago                                          |

### 41. CAPA DE SISTEMA (EXCLUSIVO SUPER ADMIN)

| #    | Elemento                 | Descripción                                                           |
| ---- | ------------------------ | --------------------------------------------------------------------- |
| 41.1 | Centro de Notificaciones | Reglas configurables: [Si Venta > $2000] → [Enviar WhatsApp al Dueño] |
| 41.2 | Monitor de Salud (Logs)  | Semáforo: Verde (OK), Amarillo (Lento), Rojo (Caído)                  |
| 41.3 | Historial de Errores     | "01:45 AM - Error conexión API WhatsApp - Reintentando..."            |
| 41.4 | Consumo de Recursos      | Gráficos CPU/Memoria por tenant                                       |

---

# ANEXO: CHECKLIST DE VERIFICACIÓN

## FASE 1 COMPLETA (95 ELEMENTOS)

- [ ] 1. Pestaña Dueño (6)
- [ ] 2. Caja y Cortes (9)
- [ ] 3. Modo Chismoso (8)
- [ ] 4. Equipo de Trabajo (6)
- [ ] 5. Directorio Clientes (8)
- [ ] 6. Catálogo Sabores (8)
- [ ] 7. Catálogos y Precios (8)
- [ ] 8. Reportes (8)
- [ ] 9. Comisiones (8)
- [ ] 10. Balance General (8)
- [ ] 11. Limpieza Técnica (3)
- [ ] 12. Gestión de Dueños (8)
- [ ] 13. Detalle Tenant (9)
- [ ] 14. WhatsApp (8)
- [ ] 15. Equipo SA (4)
- [ ] 16. Clientes SA (3)
- [ ] 17. Productos SA (4)
- [ ] 18. Comisiones SA (2)
- [ ] 19. Balance SA (2)
- [ ] 20. Reportes SA (2)
- [ ] 21. Modo Chismoso SA (2)

## FASE 2 COMPLETA (37 ELEMENTOS)

- [ ] 22. IA Dashboard (3)
- [ ] 23. IA Caja (3)
- [ ] 24. IA Clientes (2)
- [ ] 25. IA Sabores (2)
- [ ] 26. IA Productos (2)
- [ ] 27. IA Reportes (2)
- [ ] 28. IA Comisiones (2)
- [ ] 29. IA Balance (2)
- [ ] 30. IA WhatsApp (1)
- [ ] 31. IA Tenants (2)
- [ ] 32. IA Detalle Tenant (2)
- [ ] 33. IA Clientes SA (1)
- [ ] 34. Dashboard Estratégico (6)
- [ ] 35. Sabores Ventas (6)
- [ ] 36. Productos RH (6)
- [ ] 37. Comisiones RH (6)

## FASE 3 COMPLETA (18 ELEMENTOS)

- [ ] 38. Producción (4)
- [ ] 39. Logística (4)
- [ ] 40. Fidelización (4)
- [ ] 41. Capa Sistema (4)

## TOTAL GENERAL: 150 ELEMENTOS

✅ **COBERTURA: 100% DE TUS NOTAS ORIGINALES**

---

Este plan incluye **absolutamente todo** lo que mencionaste, organizado por prioridad, con descripciones claras y un checklist final para seguimiento. ¿Necesitas que profundice en algún módulo específico o que cree un roadmap temporal con hitos?
