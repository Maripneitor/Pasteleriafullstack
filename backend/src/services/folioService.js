const { Op } = require('sequelize');
const Folio = require('../models/Folio');
const FolioComplemento = require('../models/FolioComplemento');
const CakeFlavor = require('../models/CakeFlavor');
const Filling = require('../models/Filling');
const FolioEditHistory = require('../models/FolioEditHistory');
const PdfTemplate = require('../models/PdfTemplate');

const pdfService = require('./pdfService');
const commissionService = require('./commissionService');
const auditService = require('./auditService');

// Helper: Compute Watermark
function computeWatermark(folio) {
    if (folio.estatus_folio === 'Cancelado') return 'CANCELADO';
    if (folio.estatus_pago === 'Pagado') return 'PAGADO';
    return 'PENDIENTE';
}

// Helper: Safe Number
const safeNum = (v) => {
    const n = parseFloat(String(v || 0).replace(/[^0-9.-]/g, ''));
    return isNaN(n) ? 0 : n;
};

// Helper: Generate Smart Folio ID
async function generateSmartFolio(fechaEntrega, telefono, tenantId) {
    const fecha = new Date(fechaEntrega); // Ensure Date object
    // Adjust for timezone if needed, assuming input is YYYY-MM-DD (UTC 00:00) or Local
    // If it's UTC 00:00, getUTCMonth/Day might work better if we want to be strict, 
    // but usually users treat YYYY-MM-DD as local date for event.
    // Let's use UTC parts to avoid shifting to previous day due to timezone offset

    const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    const dias = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

    // Using UTC methods to be safe with 'YYYY-MM-DD' strings
    const mesIndex = fecha.getUTCMonth();
    const diaIndex = fecha.getUTCDay();
    const diaNumero = fecha.getUTCDate().toString().padStart(2, '0');

    const mes = meses[mesIndex];
    const diaSemana = dias[diaIndex];

    const inicialMes = mes.charAt(0);
    const inicialDia = diaSemana.charAt(0);

    const ultimosTelefono = telefono ? String(telefono).replace(/\D/g, '').slice(-4) : '0000';

    let folioBase = `${inicialMes}${inicialDia}-${diaNumero}-${ultimosTelefono}`;
    let folioFinal = folioBase;
    let contador = 1;

    while (true) {
        const exists = await Folio.count({
            where: {
                folioNumber: folioFinal,
                tenantId
            }
        });
        if (exists === 0) break;
        folioFinal = `${folioBase}-${contador}`;
        contador++;
    }

    return folioFinal;
}

class FolioService {

    async listFolios(query, tenantFilter) {
        // ... existing list logic ...
        const q = (query.q || '').trim();
        const where = { ...tenantFilter };

        if (q) {
            where[Op.and] = [
                tenantFilter,
                {
                    [Op.or]: [
                        { folioNumber: { [Op.like]: `%${q}%` } },
                        { cliente_nombre: { [Op.like]: `%${q}%` } },
                        { cliente_telefono: { [Op.like]: `%${q}%` } },
                    ]
                }
            ];
        }

        return Folio.findAll({
            where,
            order: [['createdAt', 'DESC']],
        });
    }

    async getFolioById(id, tenantFilter, includeComplements = true) {
        const options = {
            where: { id, ...tenantFilter }
        };
        if (includeComplements) {
            options.include = [
                { association: 'complementosList' },
                { 
                    association: 'editHistory',
                    include: [{ association: 'editor', attributes: ['name', 'role'] }]
                }
            ];
        }
        return Folio.findOne(options);
    }

    async createFolio(folioData, user, tenantId) {
        // Validations
        if (!folioData.cliente_nombre || !folioData.cliente_telefono) {
            throw {
                status: 400,
                code: 'VALIDATION_ERROR',
                message: 'Datos incompletos',
                details: ['Falta: cliente_nombre y/o cliente_telefono']
            };
        }

        const required = ['fecha_entrega', 'hora_entrega'];
        for (const k of required) {
            if (!folioData[k]) throw {
                status: 400,
                code: 'VALIDATION_ERROR',
                message: 'Datos incompletos',
                details: [`Falta campo requerido: ${k}`]
            };
        }

        // GENERATE SMART FOLIO
        const folioNumber = await generateSmartFolio(folioData.fecha_entrega, folioData.cliente_telefono, tenantId);

        const costo_base = safeNum(folioData.costo_base);
        const costo_envio = safeNum(folioData.costo_envio);
        const anticipo = safeNum(folioData.anticipo);
        const total = folioData.total ? safeNum(folioData.total) : (costo_base + costo_envio);

        const estatus_pago = (folioData.estatus_pago) || (total - anticipo <= 0.01 ? 'Pagado' : 'Pendiente');

        // Resolving IDs to Names
        let resolvedSabores = Array.isArray(folioData.sabores_pan) ? folioData.sabores_pan : [];
        let resolvedRellenos = Array.isArray(folioData.rellenos) ? folioData.rellenos : [];
        const flavorIds = Array.isArray(folioData.flavorIds) ? folioData.flavorIds : [];
        const fillingIds = Array.isArray(folioData.fillingIds) ? folioData.fillingIds : [];

        if (flavorIds.length > 0) {
            const flavors = await CakeFlavor.findAll({ where: { id: flavorIds, tenantId: tenantId } });
            resolvedSabores = flavors.map(f => f.name);
        }

        if (fillingIds.length > 0) {
            const fillings = await Filling.findAll({ where: { id: fillingIds, tenantId: tenantId } });
            resolvedRellenos = fillings.map(f => f.name);
        }

        // Update Metadata
        if (typeof folioData.diseno_metadata !== 'object') folioData.diseno_metadata = {};
        folioData.diseno_metadata.flavorIds = flavorIds;
        folioData.diseno_metadata.fillingIds = fillingIds;

        // Complements Logic (Additionals)
        const complementsList = Array.isArray(folioData.complementsList) ? folioData.complementsList : [];
        let complementsTotal = 0;
        complementsList.forEach(c => {
            complementsTotal += safeNum(c.precio);
        });

        let finalTotal = total;
        if (!folioData.total) { // Recalculate if not explicit
            finalTotal = finalTotal + complementsTotal;
        }

        // 🚀 NEW: Auto-Register Client if requested
        if (folioData.registerClient && !folioData.clientId) {
            try {
                const Client = require('../models/client');
                // Check if already exists with same phone/tenant
                let client = await Client.findOne({ 
                    where: { phone: String(folioData.cliente_telefono).trim(), tenantId: tenantId } 
                });
                
                if (!client) {
                    client = await Client.create({
                        name: String(folioData.cliente_nombre).trim(),
                        phone: String(folioData.cliente_telefono).trim(),
                        phone2: folioData.cliente_telefono_extra ? String(folioData.cliente_telefono_extra).trim() : null,
                        tenantId: tenantId
                    });
                }
                folioData.clientId = client.id;
            } catch (err) {
                console.error('[AutoRegister] Failed to register client:', err);
            }
        }

        const row = await Folio.create({
            ...folioData,
            folioNumber: folioNumber,
            clientId: folioData.clientId || null,
            responsibleUserId: user?.id || null,
            tenantId: tenantId,

            cliente_nombre: String(folioData.cliente_nombre || '').trim(),
            cliente_telefono: String(folioData.cliente_telefono || '').trim(),
            cliente_telefono_extra: folioData.cliente_telefono_extra ? String(folioData.cliente_telefono_extra).trim() : null,

            fecha_entrega: folioData.fecha_entrega,
            hora_entrega: folioData.hora_entrega,
            ubicacion_entrega: folioData.ubicacion_entrega || 'En Sucursal',

            calle: folioData.calle || null,
            colonia: folioData.colonia || null,
            referencias: folioData.referencias || null,

            tipo_folio: folioData.tipo_folio || 'Normal',
            forma: folioData.forma || null,
            numero_personas: folioData.numero_personas ? safeNum(folioData.numero_personas) : null,

            sabores_pan: resolvedSabores,
            rellenos: resolvedRellenos,
            complementos: Array.isArray(folioData.complementos) ? folioData.complementos : [],

            descripcion_diseno: folioData.descripcion_diseno || null,
            imagen_referencia_url: folioData.imagen_referencia_url || null,
            diseno_metadata: folioData.diseno_metadata,

            costo_base, costo_envio, anticipo, total: finalTotal, estatus_pago,
            estatus_produccion: folioData.estatus_produccion || 'Pendiente',
            estatus_folio: folioData.estatus_folio || 'Activo',
        });

        // Create Complements (DB)
        if (complementsList.length > 0) {
            const complementsToCreate = complementsList.map(c => ({
                folioId: row.id,
                personas: safeNum(c.personas),
                forma: c.forma,
                sabor: c.sabor,
                relleno: c.relleno,
                precio: safeNum(c.precio),
                descripcion: c.descripcion
            }));
            await FolioComplemento.bulkCreate(complementsToCreate);
        }

        // Commission Logic
        try {
            const applyComm = folioData.aplicar_comision_cliente === true || folioData.aplicar_comision_cliente === 'true';
            await commissionService.createCommission({
                folioNumber: row.folioNumber,
                total: row.total,
                appliedToCustomer: applyComm,
                userId: user?.id
            });
        } catch (commError) {
            console.error(`[Commission] FAILED:`, commError);
        }

        auditService.log('CREATE', 'FOLIO', row.id, { folio: row.folioNumber }, user?.id);

        return row;
    }

    async updateFolio(id, data, tenantFilter, user = null) {
        const row = await this.getFolioById(id, tenantFilter, true);
        if (!row) throw { status: 404, message: 'Folio no encontrado (o sin acceso)' };
        
        const oldTotal = safeNum(row.total);
        const newTotal = data.total !== undefined ? safeNum(data.total) : oldTotal;

        if (Math.abs(newTotal - oldTotal) > 0.01) {
            auditService.log('PRICE_CHANGE', 'FOLIO', row.id, { 
                oldTotal, 
                newTotal, 
                folio: row.folioNumber,
                diff: newTotal - oldTotal
            }, user?.id);
        }

        await row.update(data);

        await FolioEditHistory.create({
            folioId: row.id,
            tenantId: row.tenantId,
            editorUserId: user?.id || 1,
            eventType: 'Manual Edit',
            changedFields: data
        });

        return row;
    }

    async cancelFolio(id, motivo, user, tenantFilter) {
        const row = await this.getFolioById(id, tenantFilter, true);
        if (!row) throw { status: 404, message: 'Folio no encontrado' };

        await row.update({
            estatus_folio: 'Cancelado',
            cancelado_en: new Date(),
            motivo_cancelacion: motivo || null,
        });

        auditService.log('CANCEL', 'FOLIO', row.id, { motivo }, user?.id);
        return row;
    }

    async deleteFolio(id, user, tenantFilter) {
        const row = await this.getFolioById(id, tenantFilter, true);
        if (!row) throw { status: 404, message: 'Folio no encontrado' };
        await row.destroy();
        auditService.log('DELETE', 'FOLIO', id, {}, user?.id);
    }

    async updateFolioStatus(id, status, tenantFilter) {
        const row = await this.getFolioById(id, tenantFilter, true);
        if (!row) throw { status: 404, message: 'Folio no encontrado' };
        await row.update({ estatus_produccion: status ?? row.estatus_produccion });
        return row;
    }

    async getDashboardStats(baseFilter, tenantFilter) {
        const todayMX = new Date().toLocaleString("en-CA", { timeZone: "America/Mexico_City" }).split(',')[0];
        
        // Yesterday date
        const yesterdayDate = new Date();
        yesterdayDate.setDate(yesterdayDate.getDate() - 1);
        const yesterdayMX = yesterdayDate.toLocaleString("en-CA", { timeZone: "America/Mexico_City" }).split(',')[0];

        const baseWhere = { ...baseFilter, estatus_folio: { [Op.ne]: 'Cancelado' } };

        const totalCount = await Folio.count({ where: baseWhere });
        const pendingCount = await Folio.count({ where: { ...baseWhere, estatus_produccion: 'Pendiente' } });
        const todayCount = await Folio.count({ where: { ...baseWhere, fecha_entrega: todayMX } });
        const sumTotal = await Folio.sum('total', { where: baseWhere }) || 0;
        const sumAnticipo = await Folio.sum('anticipo', { where: baseWhere }) || 0;

        // === OWNER KPIs ===
        // Today's sales (only paid/delivered today)
        const todaySales = await Folio.sum('total', { 
            where: { ...baseFilter, fecha_entrega: todayMX, estatus_folio: { [Op.ne]: 'Cancelado' } } 
        }) || 0;

        // Yesterday's sales for comparison
        const yesterdaySales = await Folio.sum('total', { 
            where: { ...baseFilter, fecha_entrega: yesterdayMX, estatus_folio: { [Op.ne]: 'Cancelado' } } 
        }) || 0;

        // Ticket promedio (avg order value for non-cancelled)
        const avgTicket = totalCount > 0 ? Math.round(sumTotal / totalCount) : 0;

        // Cancellation count & lost revenue
        const cancelledCount = await Folio.count({ where: { ...baseFilter, estatus_folio: 'Cancelado' } });
        const cancelledRevenue = await Folio.sum('total', { where: { ...baseFilter, estatus_folio: 'Cancelado' } }) || 0;

        // Overdue orders (delivery date passed, still pending/in-process)
        const overdueOrders = await Folio.findAll({
            where: {
                ...baseFilter,
                fecha_entrega: { [Op.lt]: todayMX },
                estatus_produccion: { [Op.in]: ['Pendiente', 'En Proceso'] },
                estatus_folio: { [Op.ne]: 'Cancelado' }
            },
            limit: 5,
            order: [['fecha_entrega', 'ASC']],
            raw: true
        });

        // Top products by revenue (group by tipo_folio)
        const topProducts = await Folio.findAll({
            where: baseWhere,
            attributes: [
                'tipo_folio',
                [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'count'],
                [require('sequelize').fn('SUM', require('sequelize').col('total')), 'revenue']
            ],
            group: ['tipo_folio'],
            order: [[require('sequelize').literal('revenue'), 'DESC']],
            raw: true,
            limit: 5
        });

        const recientes = await Folio.findAll({
            where: baseFilter,
            limit: 10,
            order: [['createdAt', 'DESC']]
        });

        // Popular flavors
        const allFolios = await Folio.findAll({ where: baseWhere, attributes: ['sabores_pan'], raw: true });
        const flavorMap = {};
        allFolios.forEach(f => {
            try {
                const sabores = typeof f.sabores_pan === 'string' ? JSON.parse(f.sabores_pan) : (f.sabores_pan || []);
                sabores.forEach(s => { flavorMap[s] = (flavorMap[s] || 0) + 1; });
            } catch(e) { /* skip */ }
        });
        const populares = Object.entries(flavorMap)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([name, value]) => ({ name, value }));

        // Recent audit actions (last 5 critical ones)
        let recentAudit = [];
        try {
            const AuditLog = require('../models').AuditLog;
            if (AuditLog) {
                recentAudit = await AuditLog.findAll({
                    where: { ...tenantFilter },
                    limit: 5,
                    order: [['createdAt', 'DESC']],
                    raw: true
                });
            }
        } catch(e) { /* audit log may not exist */ }

        // 🚀 Multi-Branch Stats for Owner Dashboard
        const Branch = require('../models/Branch');
        const { CashCut } = require('../models/CashModels');
        const DailySalesStats = require('../models').DailySalesStats;

        const branches = await Branch.findAll({ where: { ...tenantFilter, isActive: true }, raw: true });
        const branchStats = [];

        for (const branch of branches) {
            const cut = await CashCut.findOne({ where: { date: todayMX, branchId: branch.id, ...tenantFilter } });
            const isCashOpen = cut && cut.status === 'Open';
            const dailyStats = await DailySalesStats.findOne({ where: { date: todayMX, branchId: branch.id, ...tenantFilter } });
            const activeOrders = await Folio.count({
                where: {
                    branchId: branch.id,
                    estatus_produccion: { [Op.in]: ['Pendiente', 'En Proceso'] },
                    estatus_folio: { [Op.ne]: 'Cancelado' },
                    ...tenantFilter
                }
            });
            const overdueCount = await Folio.count({
                where: {
                    branchId: branch.id,
                    fecha_entrega: { [Op.lt]: todayMX },
                    estatus_produccion: { [Op.in]: ['Pendiente', 'En Proceso'] },
                    estatus_folio: { [Op.ne]: 'Cancelado' },
                    ...tenantFilter
                }
            });

            branchStats.push({
                id: branch.id,
                name: branch.name,
                cajaAbierta: !!isCashOpen,
                ventasHoy: dailyStats ? Number(dailyStats.totalSales) : 0,
                pedidosActivos: activeOrders,
                pedidosRetrasados: overdueCount
            });
        }

        // Order Status Counts for Doughnut Chart
        const listosCount = await Folio.count({ where: { ...baseWhere, estatus_produccion: 'Terminado' } });
        const enProcesoCount = await Folio.count({ where: { ...baseWhere, estatus_produccion: 'En Proceso' } });
        const pendientesCount = await Folio.count({ where: { ...baseWhere, estatus_produccion: 'Pendiente' } });
        const overdueCountMaster = await Folio.count({
            where: {
                ...baseFilter,
                fecha_entrega: { [Op.lt]: todayMX },
                estatus_produccion: { [Op.in]: ['Pendiente', 'En Proceso'] },
                estatus_folio: { [Op.ne]: 'Cancelado' }
            }
        });

        return {
            metrics: {
                totalOrders: totalCount,
                pendingOrders: pendingCount,
                todayOrders: todayCount,
                totalSales: Number(sumTotal),
                totalAdvance: Number(sumAnticipo),
                // Owner KPIs
                todaySales: Number(todaySales),
                yesterdaySales: Number(yesterdaySales),
                avgTicket,
                cancelledCount,
                cancelledRevenue: Number(cancelledRevenue),
                // Status Chart Data
                statusCounts: {
                    listos: listosCount,
                    enProceso: enProcesoCount + pendientesCount, // Grouping both as 'En preparación'
                    retrasados: overdueCountMaster
                }
            },
            branchStats,
            overdueOrders,
            topProducts,
            recientes,
            populares,
            recentAudit
        };
    }

    async getCalendarEvents(start, end, tenantFilter) {
        const where = { ...tenantFilter };
        if (start && end) {
            where.fecha_entrega = { [Op.between]: [start, end] };
        }
        const rows = await Folio.findAll({
            where,
            order: [['fecha_entrega', 'ASC'], ['hora_entrega', 'ASC']],
        });

        return rows.map(f => {
            const total = Number(f.total || 0);
            const anticipo = Number(f.anticipo || 0);
            const resta = total - anticipo;
            const isPaid = resta <= 0.05; // Buffer for rounding
            const isCancelled = f.estatus_folio === 'Cancelado';
            
            // Color logic: Red (Cancelled) > Green (Paid) > Yellow/Orange (Debt)
            let color = '#f59e0b'; // Default Orange (Debt)
            if (isCancelled) color = '#ef4444'; // Red
            else if (isPaid) color = '#10b981'; // Green

            const timeStr = f.hora_entrega || '00:00';
            const isoDateTime = `${f.fecha_entrega}T${timeStr}`;

            return {
                id: String(f.id),
                title: `${f.folioNumber || ''} • ${f.cliente_nombre}`,
                start: isoDateTime,
                allDay: !f.hora_entrega,
                backgroundColor: color,
                borderColor: color,
                // Extended Props for Modals
                extendedProps: {
                    id: f.id,
                    folioNumber: f.folioNumber,
                    cliente_nombre: f.cliente_nombre,
                    hora_entrega: f.hora_entrega,
                    estatus_pago: f.estatus_pago,
                    estatus_folio: f.estatus_folio,
                    estatus_produccion: f.estatus_produccion,
                    sabores_pan: f.sabores_pan,
                    rellenos: f.rellenos,
                    total: total,
                    anticipo: anticipo,
                    resta: resta,
                    isPaid,
                    isCancelled,
                    tipo_folio: f.tipo_folio
                }
            };
        });
    }

    // --- PDF GENERATION FOR INDIVIDUAL FOLIO ---
    async generateFolioPdf(id, tenantFilter, user, type = 'folio') {
        const folio = await this.getFolioById(id, tenantFilter, true);
        if (!folio) throw { status: 404, message: 'Folio no encontrado' };

        const { renderPdf } = require('./pdfRenderer');
        const f = folio.toJSON();

        // Template Selection
        const templateName = type === 'comanda' ? 'comanda' : 'folioTemplate';

        // Helper to get color by day
        const getDayColor = (dateStr) => {
            const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
            const colorMap = {
                'Lunes': { bg: '#0d6efd', text: '#ffffff' },
                'Martes': { bg: '#6f42c1', text: '#ffffff' },
                'Miércoles': { bg: '#fd7e14', text: '#ffffff' },
                'Jueves': { bg: '#198754', text: '#ffffff' },
                'Viernes': { bg: '#d63384', text: '#ffffff' },
                'Sábado': { bg: '#ffc107', text: '#000000' },
                'Domingo': { bg: '#adb5bd', text: '#000000' }
            };
            const d = new Date(dateStr);
            const dayName = days[d.getUTCDay()];
            return colorMap[dayName] || { bg: '#f8f9fa', text: '#000000' };
        };

        const colors = getDayColor(f.fecha_entrega);

        const folioData = {
            folioNumber: f.folioNumber,
            dayColor: colors.bg,
            textColor: colors.text,
            formattedDeliveryDate: f.fecha_entrega,
            formattedDeliveryTime: f.hora_entrega,
            client: {
                name: f.cliente_nombre || 'Cliente',
                phone: f.cliente_telefono || '',
                phone2: f.cliente_telefono_extra || ''
            },
            deliveryLocation: f.ubicacion_entrega || 'En Sucursal',
            persons: f.numero_personas || 0,
            shape: f.forma || 'Redondo',
            folioType: f.tipo_folio || 'Normal',
            cakeFlavor: Array.isArray(f.sabores_pan) ? f.sabores_pan.join(', ') : (f.sabores_pan || ''),
            filling: Array.isArray(f.rellenos) ? f.rellenos.join(', ') : (f.rellenos || ''),
            hasExtraHeight: f.altura_extra === 'Sí',
            total: f.total || 0,
            deliveryCost: f.costo_envio || 0,
            advancePayment: f.anticipo || 0,
            balance: (parseFloat(f.total || 0) - parseFloat(f.anticipo || 0)),
            designDescription: f.descripcion_diseno || '',
            dedication: f.dedicatoria || '',
            complements: f.complementos || [],
            additional: [],
            accessories: f.accesorios || '',
            isPaid: f.estatus_pago === 'Pagado',
            status: f.estatus_folio,
            imageUrls: f.imagen_referencia_url ? [f.imagen_referencia_url] : [],
            diseno_metadata: f.diseno_metadata || {}
        };

        const buffer = await renderPdf({
            templateName: templateName,
            data: {
                folio: folioData,
                watermark: computeWatermark(f),
                // Compatibility for comanda template which might expect 'qrCode' or specific structure
                qrCode: await require('qrcode').toDataURL(String(f.folioNumber))
            },
            branding: {}
        });

        return { buffer, filename: `${f.folioNumber}.pdf` };
    }

    // --- DAILY REPORTS ---
    async generateDaySummaryPdfs(date, tenantFilter) {
        if (!date) throw { status: 400, message: 'Fecha requerida' };

        const folios = await Folio.findAll({
            where: { fecha_entrega: date, ...tenantFilter, estatus_folio: { [Op.ne]: 'Cancelado' } },
            order: [['hora_entrega', 'ASC']],
            include: [{ association: 'complementosList' }] // For labels/tiers
        });

        const { renderPdf } = require('./pdfRenderer');

        // 1. Data for Orders (Comandas)
        const foliosData = folios.map(f => {
            const json = f.toJSON();

            // Calculate additional costs if needed
            const additionalCost = 0; // Or sum complements

            return {
                folio: json.folioNumber, // Template uses 'folio' not 'folioNumber'
                horaEntrega: json.hora_entrega, // Template uses 'horaEntrega'
                direccion: json.ubicacion_entrega, // Template uses 'direccion'
                cliente: {
                    nombre: json.cliente_nombre,
                    telefono: json.cliente_telefono,
                    telefono2: json.cliente_telefono_extra
                },
                costo: {
                    pastel: Number(json.total) - Number(json.costo_envio) - additionalCost,
                    envio: Number(json.costo_envio),
                    adicionales: additionalCost,
                    total: Number(json.total),
                    anticipo: Number(json.anticipo)
                }
            };
        });

        const comandasBuffer = await renderPdf({
            templateName: 'ordersTemplate',
            data: { folios: foliosData, date: date, fecha: date },
            options: { format: 'A4', printBackground: true }
        });

        // 2. Data for Labels (Etiquetas)
        const labelsData = [];
        folios.forEach(f => {
            const json = f.toJSON();
            // Main Label
            labelsData.push({
                folio: json.folioNumber,
                horaEntrega: json.hora_entrega,
                forma: json.forma || 'Normal',
                personas: (json.numero_personas || '') + 'p',
                esComplemento: false,
                clientName: json.cliente_nombre
            });

            // Tiers (from diseno_metadata or complementosList?)
            // Assuming complementosList is "Tiers" or "Extra Cakes" as per my previous DTO mapping logic
            // Or if tiers are in JSON
            const tiers = json.diseno_metadata?.tiers || [];
            if (Array.isArray(tiers)) {
                tiers.forEach((t, i) => {
                    labelsData.push({
                        folio: `${json.folioNumber}-P${i + 1}`,
                        horaEntrega: json.hora_entrega,
                        forma: 'Piso ' + (i + 1),
                        personas: (t.personas || t.persons || '') + 'p',
                        esComplemento: false
                    });
                });
            }

            // Complements
            if (json.complementosList && json.complementosList.length > 0) {
                json.complementosList.forEach((c, i) => {
                    labelsData.push({
                        folio: `${json.folioNumber}-C${i + 1}`,
                        horaEntrega: json.hora_entrega,
                        forma: 'Comp.',
                        personas: (c.personas || '') + 'p',
                        esComplemento: true
                    });
                });
            }
        });

        const etiquetasBuffer = await renderPdf({
            templateName: 'labelsTemplate',
            data: { etiquetas: labelsData, date: date, fecha: date },
            // Labels might use specific size or A4 grid? Template handles grid.
            options: { format: 'A4', printBackground: true }
        });

        return { comandasBuffer, etiquetasBuffer };
    }

    async generateLabelPdf(id, tenantFilter) {
        const folio = await this.getFolioById(id, tenantFilter, true);
        if (!folio) throw { status: 404, message: 'Folio no encontrado' };

        const json = folio.toJSON();
        const { renderPdf } = require('./pdfRenderer');

        // Prepare data for labels (Main + Tiers + Complements)
        const labelsData = [];

        // Main Label
        labelsData.push({
            folio: json.folioNumber,
            horaEntrega: json.hora_entrega,
            forma: json.forma || 'Normal',
            personas: (json.numero_personas || '') + 'p',
            esComplemento: false,
            clientName: json.cliente_nombre
        });

        // Tiers
        const tiers = json.diseno_metadata?.tiers || [];
        if (Array.isArray(tiers)) {
            tiers.forEach((t, i) => {
                labelsData.push({
                    folio: `${json.folioNumber}-P${i + 1}`,
                    horaEntrega: json.hora_entrega,
                    forma: 'Piso ' + (i + 1),
                    personas: (t.personas || t.persons || '') + 'p',
                    esComplemento: false
                });
            });
        }

        // Complements
        if (json.complementosList && json.complementosList.length > 0) {
            json.complementosList.forEach((c, i) => {
                labelsData.push({
                    folio: `${json.folioNumber}-C${i + 1}`,
                    horaEntrega: json.hora_entrega,
                    forma: 'Comp.',
                    personas: (c.personas || '') + 'p',
                    esComplemento: true
                });
            });
        }

        const buffer = await renderPdf({
            templateName: 'labelsTemplate',
            data: { etiquetas: labelsData, date: json.fecha_entrega, fecha: json.fecha_entrega },
            options: { format: 'A4', printBackground: true }
        });

        return { buffer, filename: `etiquetas-${json.folioNumber}.pdf` };
    }
}

module.exports = new FolioService();
