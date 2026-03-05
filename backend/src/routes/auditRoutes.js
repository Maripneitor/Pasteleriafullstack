const express = require('express');
const router = express.Router();
const auditController = require('../controllers/auditController');
const authMiddleware = require('../middlewaress/authMiddleware');
const roleMiddleware = require('../middlewaress/roleMiddleware');

// Solo admin/superadmin
router.get('/', authMiddleware, roleMiddleware(['ADMIN', 'Administrador', 'SUPER_ADMIN', 'OWNER']), auditController.getAuditLogs);
router.get('/monitor', authMiddleware, roleMiddleware(['SUPER_ADMIN', 'OWNER', 'ADMIN']), auditController.getMonitorDashboard);

module.exports = router;
