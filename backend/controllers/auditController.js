const AuditLog = require('../models/AuditLog');
const { Op } = require('sequelize');
const { User, Tenant, Branch, DailySalesStats, Folio } = require('../models');

exports.getAuditLogs = async (req, res) => {
    try {
        const { entity, action, limit = 50 } = req.query;
        const where = {};
        if (req.user.role !== 'SUPER_ADMIN') {
            where.tenantId = req.user.tenantId;
        }
        if (entity) where.entity = entity;
        if (action) where.action = action;

        const logs = await AuditLog.findAll({
            where,
            limit: Number(limit),
            order: [['createdAt', 'DESC']],
            include: [
                { model: User, as: 'actor', attributes: ['username', 'email'] },
                { model: Tenant, as: 'tenant', attributes: ['businessName'] }
            ]
        });

        res.json(logs);
    } catch (e) {
        console.error("Audit fetch error:", e);
        res.status(500).json({ message: 'Error fetching logs' });
    }
};

exports.getMonitorDashboard = async (req, res) => {
    try {
        const isSuper = req.user.role === 'SUPER_ADMIN';
        const tenantId = req.user.tenantId;

        // 1. Logs Recientes (El Chisme en Tiempo Real)
        const recentLogs = await AuditLog.findAll({
            where: isSuper ? {} : { tenantId },
            limit: 20,
            order: [['createdAt', 'DESC']],
            include: [
                { model: User, as: 'actor', attributes: ['username', 'email'] },
                { model: Tenant, as: 'tenant', attributes: ['businessName'] }
            ]
        });

        // 2. Stats de Ventas (Quién va ganando)
        const salesStats = await DailySalesStats.findAll({
            where: isSuper ? {} : { tenantId },
            limit: 10,
            order: [['date', 'DESC']],
            include: [{ model: Branch, as: 'branch', attributes: ['name'] }]
        });

        // 3. Últimos 5 Pedidos (Movimientos críticos)
        const latestOrders = await Folio.findAll({
            where: isSuper ? {} : { tenantId },
            limit: 5,
            order: [['createdAt', 'DESC']],
            attributes: ['id', 'folioNumber', 'cliente_nombre', 'total', 'status']
        });

        res.json({
            recentLogs,
            salesStats,
            latestOrders,
            isSuper
        });
    } catch (e) {
        console.error("Monitor error:", e);
        res.status(500).json({ message: 'Error en Modo Chismoso' });
    }
};
